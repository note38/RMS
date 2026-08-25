import { DocumentLetterhead } from "../DocumentLetterhead";
import { RequestSummaryGrid } from "../RequestSummaryGrid";
import { InternetSignatureBlock } from "../signatures/InternetSignatureBlock";
import type { RequestPrintItem } from "../types";

interface InstallationPrintLayoutProps {
  item: RequestPrintItem;
  copyLabel?: string;
}

export function InstallationPrintLayout({ item, copyLabel }: InstallationPrintLayoutProps) {
  const requestedByName = item.requestedBy || item.createdBy.name || "N/A";
  const details = item.details || {};

  const installationType = details["Nature of Repair"] || details.natureOfRepair || "CCTV / Network Installation";
  const location = details["Location"] || details.location || "N/A";
  const purpose = details["Purpose"] || details.purpose || "N/A";

  return (
    <div className="space-y-4">
      {/* Letterhead Header */}
      <DocumentLetterhead seriesNo={item.seriesNo} date={item.date} category="Internet" copyLabel={copyLabel} />

      {/* Request Summary Grid */}
      <RequestSummaryGrid
        requestingOffice={item.requestingOffice}
        requestedBy={requestedByName}
        submittedByEmail={item.createdBy.email}
        isApproved={item.isApproved}
      />

      {/* Installation Specifications Table */}
      <div className="space-y-2 mt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Installation Request Details
        </h4>
        <div className="border border-slate-300 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2.5 font-medium text-slate-600 bg-slate-100 w-1/3">Installation / Work Type</td>
                <td className="p-2.5 text-slate-900 font-bold">{installationType}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-slate-600 bg-slate-100">Target Location</td>
                <td className="p-2.5 text-slate-900 font-semibold">{location}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-slate-600 bg-slate-100">Request Purpose</td>
                <td className="p-2.5 text-slate-900 font-medium">{purpose}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature Section */}
      <div className="pt-6 border-t border-slate-300">
        <InternetSignatureBlock requestedBy={requestedByName} />

        <div className="pt-4 text-center border-t border-slate-200 text-[10px] text-slate-400 mt-4">
          Provincial Capitol Compound, Suklayin, Baler, Aurora 3200 • Network &amp; CCTV Installation Document
        </div>
      </div>
    </div>
  );
}
