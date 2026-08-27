"use server";

import * as repairController from "@/lib/controllers/repair-controller";
import * as cctvController from "@/lib/controllers/cctv-controller";
import * as internetController from "@/lib/controllers/internet-controller";
import * as userController from "@/lib/controllers/user-controller";

// Repair request actions
export async function createRepairRequest(formData: FormData) {
  return repairController.createRepairRequest(formData);
}

export async function updateRepairRequest(id: number, formData: FormData) {
  return repairController.updateRepairRequest(id, formData);
}

export async function updateRepairTechnicianFields(
  id: number,
  technicianFindings: string,
  technicianRecommendation: string
) {
  return repairController.updateRepairTechnicianFields(
    id,
    technicianFindings,
    technicianRecommendation
  );
}

// CCTV request actions
export async function createCctvRequest(formData: FormData) {
  return cctvController.createCctvRequest(formData);
}

export async function updateCctvRequest(id: number, formData: FormData) {
  return cctvController.updateCctvRequest(id, formData);
}

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
  return cctvController.updateCctvFields(id, data);
}

// Internet request actions
export async function createInternetRequest(formData: FormData) {
  return internetController.createInternetRequest(formData);
}

export async function updateInternetRequest(id: number, formData: FormData) {
  return internetController.updateInternetRequest(id, formData);
}

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
  return internetController.updateInternetFields(id, data);
}

// User / admin management actions
export async function toggleRequestApproval(
  type: "repair" | "cctv" | "internet",
  id: number,
  availabilityStatus?: string
) {
  return userController.toggleRequestApproval(type, id, availabilityStatus);
}

export async function deleteRequest(
  type: "repair" | "cctv" | "internet",
  id: number
) {
  return userController.deleteRequest(type, id);
}

export async function updateUserName(
  userId: number,
  firstName: string,
  lastName: string
) {
  return userController.updateUserName(userId, firstName, lastName);
}

export async function createAdminUser(email: string, name: string) {
  return userController.createAdminUser(email, name);
}

export async function deleteAdminUser(userId: number) {
  return userController.deleteAdminUser(userId);
}
