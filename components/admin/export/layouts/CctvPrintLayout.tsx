import { DocumentLetterhead } from "../DocumentLetterhead";
import { CctvSignatureBlock } from "../signatures/CctvSignatureBlock";
import type { RequestPrintItem } from "../types";

interface CctvPrintLayoutProps {
  item: RequestPrintItem;
  copyLabel?: string;
}

export function CctvPrintLayout({ item, copyLabel }: CctvPrintLayoutProps) {
  const requestedByName = item.requestedBy || item.createdBy.name || "N/A";
  const details = item.details || {};

  const requestType = details["Request Type"] || details.requestType || "PLAYBACK_VIEWING";
  const location = details["Location"] || details.location || "N/A";
  const requestingParty = details["Requesting Party"] || details.requestingParty || requestedByName;
  const address = details["Address"] || details.address || "Aurora Provincial Capitol";
  const purpose = details["Purpose"] || details.purpose || "N/A";
  const dateOfFootage = details["Date of Footage"] || details.dateOfFootage || "N/A";
  const timeOfFootage = details["Time of Footage"] || details.timeOfFootage || "N/A";
  const availabilityStatus = details["Availability Status"] || details.availabilityStatus;
  const requirements = details["Requirements"] || details.requirements;

  return (
    <div className="space-y-3 print:space-y-2 text-xs">
      {/* Letterhead Header */}
      <DocumentLetterhead seriesNo={item.seriesNo} date={item.date} category="CCTV" copyLabel={copyLabel} />

      {/* CCTV Requester & Office Details */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="border border-slate-300 rounded p-2 bg-slate-50">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Requesting Office / Unit</p>
          <p className="font-bold text-slate-900 text-sm">{item.requestingOffice || "N/A"}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Location: {location}</p>
        </div>
        <div className="border border-slate-300 rounded p-2 bg-slate-50">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Requesting Party</p>
          <p className="font-bold text-slate-900 text-sm">{requestingParty}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Address: {address}</p>
        </div>
      </div>

      {/* CCTV Footage Request Parameters Table */}
      <div className="space-y-1.5 mt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          CCTV Footage &amp; Playback Specifications
        </h4>
        <div className="border border-slate-300 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 font-medium text-slate-600 bg-slate-100 w-1/3">Request Type</td>
                <td className="p-2 text-slate-900 font-bold uppercase">{requestType}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-slate-600 bg-slate-100">Date of Footage</td>
                <td className="p-2 text-slate-900 font-semibold">{dateOfFootage}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-slate-600 bg-slate-100">Time Range of Footage</td>
                <td className="p-2 text-slate-900 font-semibold">{timeOfFootage}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-slate-600 bg-slate-100">Purpose of Request</td>
                <td className="p-2 text-slate-900 font-medium">{purpose}</td>
              </tr>
              {availabilityStatus && (
                <tr>
                  <td className="p-2 font-medium text-slate-600 bg-slate-100">Availability Status</td>
                  <td className="p-2 font-bold text-purple-700 bg-purple-50">{availabilityStatus}</td>
                </tr>
              )}
              {requirements && (
                <tr>
                  <td className="p-2 font-medium text-slate-600 bg-slate-100">Submitted Requirements</td>
                  <td className="p-2 text-slate-900">{requirements}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official 5-Signature Block */}
      <div className="pt-3 border-t border-slate-300">
        <CctvSignatureBlock requestedBy={requestingParty} />

        <div className="pt-2 text-center border-t border-slate-200 text-[10px] text-slate-400 mt-2">
          Provincial Capitol Compound, Suklayin, Baler, Aurora 3200 • CCTV Command Center Official Document
        </div>
      </div>
    </div>
  );

}
