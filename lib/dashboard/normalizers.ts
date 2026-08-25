import type { SystemRequest } from "@/components/admin/admin-requests/types";

/**
 * `SystemRequest.date` is a locale-formatted display string (e.g. via
 * toLocaleDateString()), which isn't safe to re-parse for sorting - its
 * format varies by locale/runtime. Each normalizer also returns a numeric
 * `sortTimestamp` (from the original createdAt) so callers can sort
 * correctly and then discard it.
 */
export interface NormalizedRequest {
  request: SystemRequest;
  sortTimestamp: number;
}

interface UserRef {
  id: number;
  name: string | null;
  email: string;
}

function toUserRef(user: UserRef | null | undefined) {
  return user ? { id: user.id, name: user.name, email: user.email } : null;
}

interface RepairRequestRecord {
  id: number;
  seriesNo: string;
  requestingOffice: string;
  requestedBy: string | null;
  createdAt: Date;
  approvedById: number | null;
  createdBy: UserRef;
  approvedBy: UserRef | null;
  technicianFindings: string | null;
  technicianRecommendation: string | null;
  equipmentType: string | null;
  brandName: string | null;
  modelNo: string | null;
  serialNo: string | null;
  propertyNo: string | null;
  natureOfRepair: string | null;
  actionType: string | null;
  preInspection: string | null;
  preRecommendation: string | null;
}

export function normalizeRepair(item: RepairRequestRecord): NormalizedRequest {
  const request: SystemRequest = {
    id: item.id,
    seriesNo: item.seriesNo,
    category: "Repair",
    requestingOffice: item.requestingOffice,
    requestedBy: item.requestedBy || item.createdBy.name || item.createdBy.email,
    date: new Date(item.createdAt).toLocaleDateString(),
    isApproved: Boolean(item.approvedById),
    createdBy: toUserRef(item.createdBy)!,
    approvedBy: toUserRef(item.approvedBy),
    technicianFindings: item.technicianFindings,
    technicianRecommendation: item.technicianRecommendation,
    details: {
      "Requested By": item.requestedBy,
      "Equipment Type": item.equipmentType,
      "Brand Name": item.brandName,
      "Model Number": item.modelNo,
      "Serial Number": item.serialNo,
      "Property Number": item.propertyNo,
      "Nature of Repair": item.natureOfRepair,
      "Action Type": item.actionType,
      "Action Type Requested": item.actionType,
      "Pre-Inspection": item.preInspection,
      "Pre Inspection": item.preInspection,
      "Pre-Recommendation": item.preRecommendation,
      "Pre Recommendation": item.preRecommendation,
      Technician: item.preRecommendation, // repurposed field
      Findings: item.technicianFindings,
      "Technician Findings": item.technicianFindings,
      Recommendation: item.technicianRecommendation,
      "Technician Recommendation": item.technicianRecommendation,
    },

  };

  return { request, sortTimestamp: new Date(item.createdAt).getTime() };
}

interface CctvRequestRecord {
  id: number;
  seriesNo: string;
  requestingOffice: string | null;
  address: string | null;
  requestedBy: string | null;
  requestingParty: string | null;
  createdAt: Date;
  approvedById: number | null;
  createdBy: UserRef;
  approvedBy: UserRef | null;
  requestType: string | null;
  location: string | null;
  purpose: string | null;
  dateOfFootage: string | null;
  timeOfFootage: string | null;
  requirements: string | null;
  availabilityStatus: string | null;
}

export function normalizeCctv(item: CctvRequestRecord): NormalizedRequest {
  const request: SystemRequest = {
    id: item.id,
    seriesNo: item.seriesNo,
    category: "CCTV",
    requestingOffice: item.requestingOffice || item.address || "N/A",
    requestedBy: item.requestedBy || item.requestingParty || item.createdBy.name || item.createdBy.email,
    date: new Date(item.createdAt).toLocaleDateString(),
    isApproved: Boolean(item.approvedById),
    createdBy: toUserRef(item.createdBy)!,
    approvedBy: toUserRef(item.approvedBy),
    requestType: item.requestType,
    location: item.location,
    requestingParty: item.requestingParty,
    address: item.address,
    purpose: item.purpose,
    dateOfFootage: item.dateOfFootage,
    timeOfFootage: item.timeOfFootage,
    requirements: item.requirements,
    availabilityStatus: item.availabilityStatus,
    details: {
      "Nature of Request": item.requestType || "Playback Viewing Only",
      Location: item.location,
      "Requesting Party": item.requestingParty,
      "Address / Agency": item.address,
      Purpose: item.purpose,
      "Date of Footage": item.dateOfFootage,
      "Time of Footage": item.timeOfFootage,
      Requirements: item.requirements,
      "Availability Status": item.availabilityStatus,
    },
  };

  return { request, sortTimestamp: new Date(item.createdAt).getTime() };
}

interface InternetRequestRecord {
  id: number;
  seriesNo: string;
  requestingOffice: string;
  requestedBy: string | null;
  createdAt: Date;
  approvedById: number | null;
  createdBy: UserRef;
  approvedBy: UserRef | null;
  location: string | null;
  natureOfRepair: string | null;
  purpose: string | null;
}

export function normalizeInternet(item: InternetRequestRecord): NormalizedRequest {
  const request: SystemRequest = {
    id: item.id,
    seriesNo: item.seriesNo,
    category: "Internet",
    requestingOffice: item.requestingOffice,
    requestedBy: item.requestedBy || item.createdBy.name || item.createdBy.email,
    date: new Date(item.createdAt).toLocaleDateString(),
    isApproved: Boolean(item.approvedById),
    createdBy: toUserRef(item.createdBy)!,
    approvedBy: toUserRef(item.approvedBy),
    details: {
      "Requested By": item.requestedBy,
      Location: item.location,
      "Nature of Request": item.natureOfRepair,
      Purpose: item.purpose,
    },
  };

  return { request, sortTimestamp: new Date(item.createdAt).getTime() };
}
