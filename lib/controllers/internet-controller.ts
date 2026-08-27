"use server";

import { prisma } from "@/lib/prisma";
import { getOrSyncUser, isAdminOrSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateInternetSeriesNo(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `IN-${year}-${randomNum}`;
}

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
// Create
// ---------------------------------------------------------------------------

export async function createInternetRequest(formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized: Please sign in.");

  const natureOfRepair   = (formData.get("natureOfRepair")   as string) || "";
  const requestingOffice = (formData.get("requestingOffice") as string) || "";
  const location         = (formData.get("location")         as string) || "";
  const purpose          = (formData.get("purpose")          as string) || "";
  const requestedBy      = (formData.get("requestedBy")      as string) || dbUser.name || "";

  const seriesNo = generateInternetSeriesNo();
  const approvedById = isAdminOrSuperAdmin(dbUser) ? dbUser.id : null;

  const created = await prisma.internetRequest.create({
    data: {
      seriesNo,
      natureOfRepair,
      requestingOffice,
      location,
      purpose,
      requestedBy,
      createdById:  dbUser.id,
      approvedById,
    },
  });

  await logAudit("CREATE", "InternetRequest", created.id, dbUser.id, { seriesNo });
  revalidatePath("/request-form");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update (by owner or admin)
// ---------------------------------------------------------------------------

export async function updateInternetRequest(id: number, formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized");

  const item = await prisma.internetRequest.findUnique({ where: { id } });
  if (!item || (item.createdById !== dbUser.id && !isAdminOrSuperAdmin(dbUser)))
    throw new Error("Unauthorized");
  if (item.approvedById && !isAdminOrSuperAdmin(dbUser))
    throw new Error("Cannot edit approved request");

  await prisma.internetRequest.update({
    where: { id },
    data: {
      natureOfRepair:   formData.get("natureOfRepair")   as string,
      requestingOffice: formData.get("requestingOffice") as string,
      location:         formData.get("location")         as string,
      purpose:          formData.get("purpose")          as string,
      requestedBy:      formData.get("requestedBy")      as string,
    },
  });

  await logAudit("UPDATE", "InternetRequest", id, dbUser.id);
  revalidatePath("/request-form");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update admin-only fields
// ---------------------------------------------------------------------------

export async function updateInternetFields(
  id: number,
  data: {
    natureOfRepair?: string;
    requestingOffice?: string;
    location?: string;
    purpose?: string;
    requestedBy?: string;
  }
) {
  const dbUser = await getOrSyncUser();
  if (!dbUser || !isAdminOrSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Admin privileges required.");
  }

  await prisma.internetRequest.update({ where: { id }, data });

  await logAudit("UPDATE", "InternetRequest", id, dbUser.id, data);
  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  revalidatePath("/request-form");
  return { success: true };
}
