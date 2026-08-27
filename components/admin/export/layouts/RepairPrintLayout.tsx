import { DocumentLetterhead } from "../DocumentLetterhead";
import { RequestSummaryGrid } from "../RequestSummaryGrid";
import { RepairSignatureBlock } from "../signatures/RepairSignatureBlock";
import { REPAIR_KEYS } from "../constants";
import type { RequestPrintItem } from "../types";

interface RepairPrintLayoutProps {
  item: RequestPrintItem;
  copyLabel?: string;
}

export function RepairPrintLayout({ item, copyLabel }: RepairPrintLayoutProps) {
  const requestedByName = item.requestedBy || item.createdBy.name || "N/A";
  const technicianName = item.approvedBy?.name || item.approvedBy?.email || null;
  const details = item.details || {};

  // Extract technician & inspection notes from details
  const preInspection =
    details["Pre-Inspection"] || details["Pre Inspection"] || details.preInspection;
  const preRecommendation =
    details["Pre-Recommendation"] || details["Pre Recommendation"] || details.preRecommendation || details.Technician;
  const technicianFindings =
    details["Technician Findings"] || details["Findings"] || details.technicianFindings || item.technicianFindings;
  const technicianRecommendation =
    details["Technician Recommendation"] || details["Recommendation"] || details.technicianRecommendation || item.technicianRecommendation;
  const postInspection =
    details["Post-Inspection"] || details["Post Inspection"] || details.postInspection;

  const hasInspectionData =
    Boolean(preInspection) ||
    Boolean(preRecommendation) ||
    Boolean(technicianFindings) ||
    Boolean(technicianRecommendation) ||
    Boolean(postInspection);

  const getDetailValue = (key: string) => {
    if (details[key]) return details[key];
    if (key === "Action Type Requested") {
      return details["Action Type Requested"] || details["Action Type"] || details.actionType || "—";
    }
    if (key === "Equipment Type") {
      return details["Equipment Type"] || details.equipmentType || "—";
    }
    if (key === "Nature of Repair") {
      return details["Nature of Repair"] || details.natureOfRepair || "—";
    }
    return "—";
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Letterhead Header */}
      <DocumentLetterhead seriesNo={item.seriesNo} date={item.date} category="Repair" copyLabel={copyLabel} />

      {/* Summary Grid */}
      <RequestSummaryGrid
        requestingOffice={item.requestingOffice}
        requestedBy={requestedByName}
        submittedByEmail={item.createdBy.email}
        isApproved={item.isApproved}
      />

      {/* Equipment Specifications Grid */}
      <div className="space-y-2 mt-4 print:mt-3">
        <h4 className="text-sm print:text-xs font-bold uppercase tracking-wider text-slate-700">
          Equipment &amp; Repair Specifications
        </h4>
        <div className="grid grid-cols-2 gap-3 print:gap-2.5 text-sm print:text-xs">
          {REPAIR_KEYS.map((key) => {
            const isFullWidth = key === "Nature of Repair" || key === "Action Type Requested";
            return (
              <div
                key={key}
                className={`border border-black/30 rounded p-3 print:p-2 bg-slate-50 ${isFullWidth ? "col-span-2" : ""
                  }`}
              >
                <p className="text-xs print:text-[10px] text-slate-500 uppercase font-semibold">{key}</p>
                <p className="font-bold text-slate-900 text-base print:text-sm mt-0.5">{getDetailValue(key)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspection & Technician Findings Section */}
      {hasInspectionData && (
        <div className="border border-black/30 rounded overflow-hidden mt-4 print:mt-3">
          <div className="bg-slate-200 text-slate-800 px-4 py-2 print:py-1.5 font-bold text-xs print:text-[11px] uppercase tracking-wider">
            Technical Inspection &amp; Diagnosis Notes
          </div>
          <div className="p-3.5 print:p-3 bg-white space-y-2 print:space-y-1.5 text-sm print:text-xs">
            {preInspection && (
              <div>
                <span className="font-semibold text-slate-700">Pre-Inspection: </span>
                <span className="text-slate-900">{preInspection}</span>
              </div>
            )}
            {preRecommendation && (
              <div>
                <span className="font-semibold text-slate-700">Pre-Recommendation: </span>
                <span className="text-slate-900">{preRecommendation}</span>
              </div>
            )}
            {technicianFindings && (
              <div className="bg-blue-50 border-l-3 border-blue-500 p-2.5 print:p-2 rounded-r">
                <span className="font-bold text-blue-900">Technician Findings: </span>
                <span className="text-slate-900">{technicianFindings}</span>
              </div>
            )}
            {technicianRecommendation && (
              <div className="bg-emerald-50 border-l-3 border-emerald-500 p-2.5 print:p-2 rounded-r">
                <span className="font-bold text-emerald-900">Technician Recommendation: </span>
                <span className="text-slate-900">{technicianRecommendation}</span>
              </div>
            )}
            {postInspection && (
              <div>
                <span className="font-semibold text-slate-700">Post-Inspection: </span>
                <span className="text-slate-900">{postInspection}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signature Section */}
      <div className="pt-6 print:pt-18 border-t border-black/30">
        <RepairSignatureBlock
          preparedByName={item.createdBy.name || item.requestedBy}
          technicianName={technicianName}
          isApproved={item.isApproved}
        />

        <div className="pt-4 print:pt-8 text-center border-t border-black/30 text-xs print:text-[10px] text-slate-400 mt-6 print:mt-4">
          Provincial Capitol Compound, Suklayin, Baler, Aurora 3200 • MIS Technical Repair Service Document
        </div>
      </div>
    </div>
  );
}
