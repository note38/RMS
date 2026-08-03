"use server";

import { prisma } from "@/lib/prisma";
import { getOrSyncUser, isAdminOrSuperAdmin, isSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Role } from "@/app/generated/prisma/enums";

function generateSeriesNo(prefix: string): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomNum}`;
}

export async function createRepairRequest(formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized: Please sign in.");

  const requestingOffice = (formData.get("requestingOffice") as string) || "";
  const requestedBy     = (formData.get("requestedBy") as string) || dbUser.name || "";
  const natureOfRepair  = (formData.get("natureOfRepair") as string) || "";
  const actionType      = (formData.get("actionType") as string) || "";
  const equipmentType   = (formData.get("equipmentType") as string) || "";
  const brandName       = (formData.get("brandName") as string) || "";
  const modelNo         = (formData.get("modelNo") as string) || "";
  const serialNo        = (formData.get("serialNo") as string) || "";
  const propertyNo      = (formData.get("propertyNo") as string) || "";
  const preInspection   = (formData.get("preInspection") as string) || "";
  // technicianName is stored in preRecommendation field for admin users
  const technicianName  = (formData.get("technicianName") as string) || "";

  const seriesNo = generateSeriesNo("RR");

  // Auto-approve when admin or superadmin submits; also record technician name
  const approvedById = isAdminOrSuperAdmin(dbUser) ? dbUser.id : null;

  await prisma.repairRequest.create({
    data: {
      seriesNo,
      requestingOffice,
      requestedBy,
      natureOfRepair,
      actionType,
      equipmentType,
      brandName,
      modelNo,
      serialNo,
      propertyNo,
      preInspection:     preInspection  || null,
      preRecommendation: technicianName || null, // reused to hold technician name
      createdById:  dbUser.id,
      approvedById,
    },
  });

  revalidatePath("/request-form");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createCctvRequest(formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized: Please sign in.");

  const requestingOffice   = (formData.get("requestingOffice") as string) || "";
  const location           = (formData.get("location") as string) || "";
  const requestingParty    = (formData.get("requestingParty") as string) || "";
  const address            = (formData.get("address") as string) || "";
  const purpose            = (formData.get("purpose") as string) || "";
  const dateOfFootage      = (formData.get("dateOfFootage") as string) || "";
  const timeOfFootage      = (formData.get("timeOfFootage") as string) || "";
  const requestedBy        = requestingParty || dbUser.name || "";
  const requestType        = (formData.get("requestType") as string) || "Playback Viewing Only";
  const requirements       = (formData.get("requirements") as string) || null;
  const availabilityStatus = (formData.get("availabilityStatus") as string) || null;

  const seriesNo = generateSeriesNo("CV");

  const approvedById = isAdminOrSuperAdmin(dbUser) ? dbUser.id : null;

  await prisma.cctvRequest.create({
    data: {
      seriesNo,
      requestType,
      requestingOffice,
      location,
      requestingParty,
      address,
      purpose,
      dateOfFootage: dateOfFootage || null,
      timeOfFootage: timeOfFootage || null,
      requestedBy,
      requirements,
      availabilityStatus,
      createdById:  dbUser.id,
      approvedById,
    },
  });

  revalidatePath("/request-form");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Update CCTV request fields (Admin only) */
export async function updateCctvFields(
  id: number,
  data: {
    requestType?: string;
    requestingOffice?: string;
    location?: string;
    requestingParty?: string;
    address?: string;
    purpose?: string;
    dateOfFootage?: string;
    timeOfFootage?: string;
    requirements?: string;
    availabilityStatus?: string;
  }
) {
  const dbUser = await getOrSyncUser();
  if (!dbUser || !isAdminOrSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Admin privileges required.");
  }

  await prisma.cctvRequest.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  revalidatePath("/request-form");
  return { success: true };
}

export async function createInternetRequest(formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized: Please sign in.");

  const natureOfRepair   = (formData.get("natureOfRepair") as string) || "";
  const requestingOffice = (formData.get("requestingOffice") as string) || "";
  const location         = (formData.get("location") as string) || "";
  const purpose          = (formData.get("purpose") as string) || "";
  const requestedBy      = (formData.get("requestedBy") as string) || dbUser.name || "";

  const seriesNo = generateSeriesNo("IN");

  const approvedById = isAdminOrSuperAdmin(dbUser) ? dbUser.id : null;

  await prisma.internetRequest.create({
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

  revalidatePath("/request-form");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleRequestApproval(
  type: "repair" | "cctv" | "internet",
  id: number
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
    await prisma.cctvRequest.update({
      where: { id },
      data: { approvedById: item.approvedById ? null : dbUser.id },
    });
  } else if (type === "internet") {
    const item = await prisma.internetRequest.findUnique({ where: { id } });
    if (!item) throw new Error("Request not found.");
    await prisma.internetRequest.update({
      where: { id },
      data: { approvedById: item.approvedById ? null : dbUser.id },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  revalidatePath("/request-form");
  return { success: true };
}

export async function deleteRequest(
  type: "repair" | "cctv" | "internet",
  id: number
) {
  const dbUser = await getOrSyncUser();
  if (!dbUser || !isAdminOrSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Admin privileges required.");
  }

  if (type === "repair") {
    await prisma.repairRequest.delete({ where: { id } });
  } else if (type === "cctv") {
    await prisma.cctvRequest.delete({ where: { id } });
  } else if (type === "internet") {
    await prisma.internetRequest.delete({ where: { id } });
  }

  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  revalidatePath("/request-form");
  return { success: true };
}

export async function updateUserName(userId: number, firstName: string, lastName: string) {
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

/** Update technician findings and recommendation on a repair request. */
export async function updateRepairTechnicianFields(
  id: number,
  technicianFindings: string,
  technicianRecommendation: string
) {
  const dbUser = await getOrSyncUser();
  if (!dbUser || !isAdminOrSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Admin privileges required.");
  }

  await prisma.repairRequest.update({
    where: { id },
    data: {
      technicianFindings:       technicianFindings       || null,
      technicianRecommendation: technicianRecommendation || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  return { success: true };
}

/** Promote an existing user to ADMIN, or create a placeholder (Super Admin only). */
export async function createAdminUser(email: string, name: string) {
  const dbUser = await getOrSyncUser();
  if (!dbUser || !isSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Super Admin privileges required.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: Role.ADMIN } });
  } else {
    await prisma.user.create({
      data: {
        clerkId: `pending-${Date.now()}`,
        email,
        name: name || email,
        role: Role.ADMIN,
      },
    });
  }

  revalidatePath("/super-admin");
  return { success: true };
}

/** Demote an admin user back to REQUESTER (Super Admin only). */
export async function deleteAdminUser(userId: number) {
  const dbUser = await getOrSyncUser();
  if (!dbUser || !isSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Super Admin privileges required.");
  }
  if (userId === dbUser.id) {
    throw new Error("You cannot demote yourself.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.REQUESTER },
  });

  revalidatePath("/super-admin");
  return { success: true };
}
