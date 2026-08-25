"use server";

import { prisma } from "@/lib/prisma";
import { getOrSyncUser, isAdminOrSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateCctvSeriesNo(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CV-${year}-${randomNum}`;
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

export async function createCctvRequest(formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized: Please sign in.");

  const requestingOffice   = (formData.get("requestingOffice")   as string) || "";
  const location           = (formData.get("location")           as string) || "";
  const requestingParty    = (formData.get("requestingParty")    as string) || "";
  const address            = (formData.get("address")            as string) || "";
  const purpose            = (formData.get("purpose")            as string) || "";
  const dateOfFootage      = (formData.get("dateOfFootage")      as string) || "";
  const timeOfFootage      = (formData.get("timeOfFootage")      as string) || "";
  const requestedBy        = requestingParty || dbUser.name || "";
  const requestType        = (formData.get("requestType")        as string) || "Playback Viewing Only";
  const requirements       = (formData.get("requirements")       as string) || null;
  const availabilityStatus = (formData.get("availabilityStatus") as string) || null;

  const seriesNo = generateCctvSeriesNo();
  const approvedById = isAdminOrSuperAdmin(dbUser) ? dbUser.id : null;

  const created = await prisma.cctvRequest.create({
    data: {
      seriesNo,
      requestType,
      requestingOffice,
      location,
      requestingParty,
      address,
      purpose,
      dateOfFootage:    dateOfFootage || null,
      timeOfFootage:    timeOfFootage || null,
      requestedBy,
      requirements,
      availabilityStatus,
      createdById:  dbUser.id,
      approvedById,
    },
  });

  await logAudit("CREATE", "CctvRequest", created.id, dbUser.id, { seriesNo });
  revalidatePath("/request-form");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update (by owner or admin)
// ---------------------------------------------------------------------------

export async function updateCctvRequest(id: number, formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized");

  const item = await prisma.cctvRequest.findUnique({ where: { id } });
  if (!item || (item.createdById !== dbUser.id && !isAdminOrSuperAdmin(dbUser)))
    throw new Error("Unauthorized");
  if (item.approvedById && !isAdminOrSuperAdmin(dbUser))
    throw new Error("Cannot edit approved request");

  await prisma.cctvRequest.update({
    where: { id },
    data: {
      requestingOffice: formData.get("requestingOffice") as string,
      location:         formData.get("location")         as string,
      requestingParty:  formData.get("requestingParty")  as string,
      address:          formData.get("address")          as string,
      purpose:          formData.get("purpose")          as string,
      dateOfFootage:   (formData.get("dateOfFootage")   as string) || null,
      timeOfFootage:   (formData.get("timeOfFootage")   as string) || null,
      requestType:      formData.get("requestType")      as string,
      requirements:    (formData.get("requirements")    as string) || null,
    },
  });

  await logAudit("UPDATE", "CctvRequest", id, dbUser.id);
  revalidatePath("/request-form");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update admin-only fields
// ---------------------------------------------------------------------------

export async function updateCctvFields(
  id: number,
  data: {
    requestType?:        string;
    requestingOffice?:   string;
    location?:           string;
    requestingParty?:    string;
    address?:            string;
    purpose?:            string;
    dateOfFootage?:      string;
    timeOfFootage?:      string;
    requirements?:       string;
    availabilityStatus?: string;
  }
) {
  const dbUser = await getOrSyncUser();
  if (!dbUser || !isAdminOrSuperAdmin(dbUser)) {
    throw new Error("Unauthorized: Admin privileges required.");
  }

  await prisma.cctvRequest.update({ where: { id }, data });

  await logAudit("UPDATE", "CctvRequest", id, dbUser.id, data);
  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  revalidatePath("/request-form");
  return { success: true };
}
