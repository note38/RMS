"use server";

import { prisma } from "@/lib/prisma";
import { getOrSyncUser, isAdminOrSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateRepairSeriesNo(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RR-${year}-${randomNum}`;
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

export async function createRepairRequest(formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized: Please sign in.");

  const requestingOffice = (formData.get("requestingOffice") as string) || "";
  const requestedBy     = (formData.get("requestedBy")     as string) || dbUser.name || "";
  const natureOfRepair  = (formData.get("natureOfRepair")  as string) || "";
  const actionType      = (formData.get("actionType")      as string) || "";
  const equipmentType   = (formData.get("equipmentType")   as string) || "";
  const brandName       = (formData.get("brandName")       as string) || "";
  const modelNo         = (formData.get("modelNo")         as string) || "";
  const serialNo        = (formData.get("serialNo")        as string) || "";
  const propertyNo      = (formData.get("propertyNo")      as string) || "";
  const preInspection   = (formData.get("preInspection")   as string) || "";
  // technicianName is stored in preRecommendation field for admin users
  const technicianName  = (formData.get("technicianName")  as string) || "";

  const seriesNo = generateRepairSeriesNo();

  // Auto-approve when admin or superadmin submits; also record technician name
  const approvedById = isAdminOrSuperAdmin(dbUser) ? dbUser.id : null;

  const created = await prisma.repairRequest.create({
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

  await logAudit("CREATE", "RepairRequest", created.id, dbUser.id, { seriesNo });
  revalidatePath("/request-form");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update (by owner or admin)
// ---------------------------------------------------------------------------

export async function updateRepairRequest(id: number, formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized");

  const item = await prisma.repairRequest.findUnique({ where: { id } });
  if (!item || (item.createdById !== dbUser.id && !isAdminOrSuperAdmin(dbUser)))
    throw new Error("Unauthorized");
  if (item.approvedById && !isAdminOrSuperAdmin(dbUser))
    throw new Error("Cannot edit approved request");

  await prisma.repairRequest.update({
    where: { id },
    data: {
      requestingOffice: formData.get("requestingOffice") as string,
      requestedBy:      formData.get("requestedBy")      as string,
      natureOfRepair:   formData.get("natureOfRepair")   as string,
      actionType:       formData.get("actionType")       as string,
      equipmentType:    formData.get("equipmentType")    as string,
      brandName:        formData.get("brandName")        as string,
      modelNo:          formData.get("modelNo")          as string,
      serialNo:         formData.get("serialNo")         as string,
      propertyNo:       formData.get("propertyNo")       as string,
      preInspection:   (formData.get("preInspection")   as string) || null,
    },
  });

  await logAudit("UPDATE", "RepairRequest", id, dbUser.id);
  revalidatePath("/request-form");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update technician fields (admin only)
// ---------------------------------------------------------------------------

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

  await logAudit("UPDATE_TECH_FIELDS", "RepairRequest", id, dbUser.id, {
    technicianFindings,
    technicianRecommendation,
  });
  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  return { success: true };
}
