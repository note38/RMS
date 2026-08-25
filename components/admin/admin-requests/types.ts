export type RequestCategory = "Repair" | "CCTV" | "Internet";
export type CategoryFilter = "ALL" | RequestCategory;
export type StatusFilter = "ALL" | "PENDING" | "APPROVED";

export interface SystemRequest {
  id: number;
  seriesNo: string;
  category: RequestCategory;
  requestingOffice: string;
  requestedBy: string;
  date: string;
  isApproved: boolean;
  createdBy: {
    id: number;
    name: string | null;
    email: string;
  };
  approvedBy?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  details: Record<string, string | null | undefined>;
  // Technician fields (Repair only)
  technicianFindings?: string | null;
  technicianRecommendation?: string | null;
  // CCTV specific fields
  requestType?: string | null;
  location?: string | null;
  requestingParty?: string | null;
  address?: string | null;
  purpose?: string | null;
  dateOfFootage?: string | null;
  timeOfFootage?: string | null;
  requirements?: string | null;
  availabilityStatus?: string | null;
}

export function categoryToTypeKey(category: RequestCategory): "repair" | "cctv" | "internet" {
  return category === "Repair" ? "repair" : category === "CCTV" ? "cctv" : "internet";
}
