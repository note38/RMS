export type RequestCategory = "Repair" | "CCTV" | "Internet";

export interface RequestPrintItem {
  id: number;
  seriesNo: string;
  category: RequestCategory;
  requestingOffice: string;
  requestedBy: string;
  date: string;
  isApproved: boolean;
  createdBy: {
    name: string | null;
    email: string;
  };
  approvedBy?: {
    name: string | null;
    email: string;
  } | null;
  details: Record<string, string | null | undefined>;
  technicianFindings?: string | null;
  technicianRecommendation?: string | null;
}

