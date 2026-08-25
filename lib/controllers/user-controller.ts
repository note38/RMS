"use server";

import { prisma } from "@/lib/prisma";
import { getOrSyncUser, isAdminOrSuperAdmin, isSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Role } from "@/app/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function logAudit(
  action: string,
  entityType: string,
  entityId: number,
  userId: number,
  details?: unknown
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    console.error("Audit Log Error:", err);
  }
}

// ---------------------------------------------------------------------------
// Toggle approval (admin only)
// ---------------------------------------------------------------------------

export async function toggleRequestApproval(
  type: "repair" | "cctv" | "internet",
  id: number,
  availabilityStatus?: string
) {
  const dbUser = await getOrSyncUser();
  if (!dbUser || !isAdminOrSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Admin privileges required.");
  }

  if (type === "repair") {
    const item = await prisma.repairRequest.findUnique({ where: { id } });
    if (!item) throw new Error("Request not found.");
    await prisma.repairRequest.update({
      where: { id },
      data: { approvedById: item.approvedById ? null : dbUser.id },
    });
  } else if (type === "cctv") {
    const item = await prisma.cctvRequest.findUnique({ where: { id } });
    if (!item) throw new Error("Request not found.");
    const data: Record<string, unknown> = {
      approvedById: item.approvedById ? null : dbUser.id,
    };
    if (availabilityStatus !== undefined && !item.approvedById) {
      data.availabilityStatus = availabilityStatus;
    }
    await prisma.cctvRequest.update({ where: { id }, data });
  } else if (type === "internet") {
    const item = await prisma.internetRequest.findUnique({ where: { id } });
    if (!item) throw new Error("Request not found.");
    await prisma.internetRequest.update({
      where: { id },
      data: { approvedById: item.approvedById ? null : dbUser.id },
    });
  }

  await logAudit("TOGGLE_APPROVAL", type, id, dbUser.id);
  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  revalidatePath("/request-form");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete request (owner before approval, or admin anytime)
// ---------------------------------------------------------------------------

export async function deleteRequest(
  type: "repair" | "cctv" | "internet",
  id: number
) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized");
  const isAdmin = isAdminOrSuperAdmin(dbUser);

  if (type === "repair") {
    const item = await prisma.repairRequest.findUnique({ where: { id } });
    if (!item) throw new Error("Not found");
    if (!isAdmin && (item.createdById !== dbUser.id || item.approvedById))
      throw new Error("Unauthorized to delete");
    await prisma.repairRequest.delete({ where: { id } });
  } else if (type === "cctv") {
    const item = await prisma.cctvRequest.findUnique({ where: { id } });
    if (!item) throw new Error("Not found");
    if (!isAdmin && (item.createdById !== dbUser.id || item.approvedById))
      throw new Error("Unauthorized to delete");
    await prisma.cctvRequest.delete({ where: { id } });
  } else if (type === "internet") {
    const item = await prisma.internetRequest.findUnique({ where: { id } });
    if (!item) throw new Error("Not found");
    if (!isAdmin && (item.createdById !== dbUser.id || item.approvedById))
      throw new Error("Unauthorized to delete");
    await prisma.internetRequest.delete({ where: { id } });
  }

  await logAudit("DELETE", type, id, dbUser.id);
  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  revalidatePath("/request-form");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update user display name (admin only)
// ---------------------------------------------------------------------------

export async function updateUserName(
  userId: number,
  firstName: string,
  lastName: string
) {
  const dbUser = await getOrSyncUser();
  if (!dbUser || !isAdminOrSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Admin privileges required.");
  }
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  await prisma.user.update({ where: { id: userId }, data: { name: fullName } });
  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Promote to ADMIN (super admin only)
// ---------------------------------------------------------------------------

export async function createAdminUser(email: string, name: string) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) {
    // Distinguish DB-down from not-authenticated
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new Error("Service unavailable: Database is unreachable. Please check your connection and try again.");
    }
    throw new Error("Unauthorized: Super Admin privileges required.");
  }
  if (!isSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Super Admin privileges required.");
  }

  let resultUser;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    resultUser = await prisma.user.update({ where: { email }, data: { role: Role.ADMIN } });
  } else {
    resultUser = await prisma.user.create({
      data: {
        clerkId: `pending-${Date.now()}`,
        email,
        name: name || email,
        role: Role.ADMIN,
      },
    });
  }

  await logAudit("PROMOTE_ADMIN", "user", resultUser.id, dbUser.id, {
    targetName: resultUser.name,
    targetEmail: resultUser.email,
  });
  revalidatePath("/super-admin");
  return {
    success: true,
    user: {
      id: resultUser.id,
      email: resultUser.email,
      name: resultUser.name,
      role: resultUser.role as string,
    },
    actor: { name: dbUser.name, email: dbUser.email },
  };
}

// ---------------------------------------------------------------------------
// Demote ADMIN back to REQUESTER (super admin only)
// ---------------------------------------------------------------------------

export async function deleteAdminUser(userId: number) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) {
    // Distinguish DB-down from not-authenticated
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new Error("Service unavailable: Database is unreachable. Please check your connection and try again.");
    }
    throw new Error("Unauthorized: Super Admin privileges required.");
  }
  if (!isSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Super Admin privileges required.");
  }
  if (userId === dbUser.id) {
    throw new Error("You cannot demote yourself.");
  }

  // Look up the target user before demoting (for audit details)
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.REQUESTER },
  });

  await logAudit("DEMOTE_ADMIN", "user", userId, dbUser.id, {
    targetName: targetUser?.name,
    targetEmail: targetUser?.email,
  });

  revalidatePath("/super-admin");
  return {
    success: true,
    actor: { name: dbUser.name, email: dbUser.email },
    target: { name: targetUser?.name ?? null, email: targetUser?.email ?? "" },
  };
}
