import type { SystemRequest } from "@/components/admin/admin-requests/types";

/**
 * Normalizes request object into flat key-value object for tabular file export
 */
export function formatRequestForExport(req: SystemRequest) {
  return {
    "Series No": req.seriesNo || `REQ-${req.id}`,
    Category: req.category,
    "Requesting Office": req.requestingOffice || "N/A",
    "Requested By": req.requestedBy || req.createdBy?.name || "N/A",
    Status: req.isApproved ? "Approved" : "Pending",
    "Date Created": req.date ? new Date(req.date).toLocaleDateString() : "N/A",
    "Created By Email": req.createdBy?.email || "N/A",
    "Approved By": req.approvedBy ? (req.approvedBy.name || req.approvedBy.email) : "N/A",
    "Technician Findings": req.technicianFindings || "N/A",
    "Technician Recommendation": req.technicianRecommendation || "N/A",
    "Footage Date": req.dateOfFootage || "N/A",
    "Footage Time": req.timeOfFootage || "N/A",
    "Purpose": req.purpose || "N/A",
    "Location": req.location || "N/A",
    "Availability Status": req.availabilityStatus || "N/A",
  };
}

/**
 * Triggers a browser file download from Blob content
 */
export function downloadFile(content: BlobPart[], filename: string, mimeType: string) {
  const blob = new Blob(content, { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts array of objects into standard CSV string
 */
export function convertToCsv(data: Record<string, any>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header line
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

  // Data lines
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      const strVal = val === null || val === undefined ? "" : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

/**
 * Export System Requests to CSV file
 */
export function exportToCsv(requests: SystemRequest[], filename = "system_requests_export.csv") {
  if (requests.length === 0) return;
  const formattedData = requests.map(formatRequestForExport);
  const csvString = convertToCsv(formattedData);
  downloadFile([csvString], filename, "text/csv;charset=utf-8;");
}

/**
 * Export System Requests to Excel-compatible CSV file (with UTF-8 BOM)
 */
export function exportToExcel(requests: SystemRequest[], filename = "system_requests_export.csv") {
  if (requests.length === 0) return;
  const formattedData = requests.map(formatRequestForExport);
  const csvString = convertToCsv(formattedData);
  // Add UTF-8 BOM so Microsoft Excel renders characters and columns properly
  const bom = "\uFEFF";
  downloadFile([bom + csvString], filename, "text/csv;charset=utf-8;");
}

/**
 * Export System Requests to JSON file
 */
export function exportToJson(requests: SystemRequest[], filename = "system_requests_export.json") {
  if (requests.length === 0) return;
  const jsonString = JSON.stringify(requests, null, 2);
  downloadFile([jsonString], filename, "application/json");
}
