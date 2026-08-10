"use client";

import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RequestPrintItem {
  id: number;
  seriesNo: string;
  category: "Repair" | "CCTV" | "Internet";
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
}

interface PrintableRequestModalProps {
  item: RequestPrintItem | null;
  onClose: () => void;
}

const FIXED_APPROVER_NAME = "SHIERWIN H. TAAY";
const FIXED_APPROVER_TITLE = "Provincial Administrator";

export function PrintableRequestModal({ item, onClose }: PrintableRequestModalProps) {
  if (!item) return null;

  const handlePrint = () => window.print();

  // The admin who processed/approved = "Technician"
  const technicianName = item.approvedBy?.name || item.approvedBy?.email || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none">
        {/* Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between bg-slate-900 text-white px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="size-5 text-blue-400" />
            <h3 className="font-semibold text-lg">Official PDF Export Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer"
            >
              <Printer className="size-4" />
              Print / Export to PDF
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 print:p-6 space-y-6" id="printable-area">
          {/* Document Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Capitol Logo" className="w-16 h-16 object-contain" />
              <img src="/Bagong_Pilipinas_Logo.svg.webp" alt="Bagong Pilipinas" className="w-16 h-16 object-contain" />
              <div>
                <h4
                  className="text-xs font-bold uppercase tracking-widest text-slate-500"
                  style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                  Republic of the Philippines
                </h4>
                <h2
                  className="text-xl font-bold text-slate-900"
                  style={{ fontFamily: "'Old English Text MT', 'UnifrakturMaguntia', serif" }}
                >
                  Provincial Government of Aurora
                </h2>
                <p
                  className="text-base font-bold text-slate-800"
                  style={{ fontFamily: "'Baskerville Old Face', 'Baskerville', 'Libre Baskerville', Georgia, serif" }}
                >
                  B A L E R
                </p>
                <p
                  className="text-2xl text-slate-600"
                  style={{ fontFamily: "'Edwardian Script ITC', 'Palatino Linotype', cursive" }}
                >
                  Office of the Provincial Administrator
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">

              <div className="inline-block bg-slate-100 border border-slate-300 rounded px-3 py-1 text-right">
                <p className="text-[10px] font-mono uppercase text-slate-500">Series No.</p>
                <p className="text-sm font-bold font-mono text-blue-900">{item.seriesNo}</p>
              </div>
              <p className="text-xs text-slate-500">Date: {item.date}</p>
            </div>
          </div>

          {/* Form Title Banner */}
          <div className="bg-slate-100 border-y border-slate-300 py-2 text-center">
            <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-800">
              {item.category === "Internet"
                ? "CCTV/Internet Installation Request Form"
                : `${item.category} Service Request Form`}
            </h3>
          </div>

          {/* Key Fields Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded p-3 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Requesting Office</span>
              <p className="font-bold text-slate-900">{item.requestingOffice || "N/A"}</p>
            </div>
            <div className="border border-slate-200 rounded p-3 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Requested By</span>
              <p className="font-bold text-slate-900">{item.requestedBy || item.createdBy.name || "N/A"}</p>
            </div>
            <div className="border border-slate-200 rounded p-3 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Submitted By (Email)</span>
              <p className="font-medium text-slate-800">{item.createdBy.email}</p>
            </div>
            <div className="border border-slate-200 rounded p-3 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Current Status</span>
              <div>
                {item.isApproved ? (
                  <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[11px]">
                    APPROVED
                  </span>
                ) : (
                  <span className="inline-block bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded text-[11px]">
                    PENDING APPROVAL
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Category Details Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Request Parameters &amp; Details
            </h4>
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-700 font-semibold border-b border-slate-300">
                    <th className="p-2.5 w-1/3">Field Name</th>
                    <th className="p-2.5">Specified Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(item.details).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <tr key={key}>
                        <td className="p-2.5 font-medium text-slate-600 bg-slate-50">{key}</td>
                        <td className="p-2.5 text-slate-900 font-semibold">{value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Approval Section */}
          <div className="pt-8 border-t border-slate-300">
            {/* Category: CCTV Footage Request Signatures */}
            {item.category === "CCTV" && (
              <div className="space-y-8 text-xs">
                {/* Row 1: Requesting Party, CCTV Operator, Head of Operation */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Requesting Party:</p>
                    <div className="mt-8 border-b border-slate-400 w-44" />
                    <p className="font-bold text-slate-800 mt-1">{item.requestedBy || item.createdBy.name}</p>
                    <p className="text-[10px] text-slate-500">Requesting Party Signature</p>
                  </div>
                  <div>
                    <p className="text-slate-900 uppercase font-semibold text-[10px]">CCTV Operator:</p>
                    <div className="mt-8 border-b border-slate-400 w-44" />
                    <p className="font-bold text-slate-900 mt-1">&nbsp;</p>
                    <p className="text-[10px] text-slate-900">CCTV System Operator</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Head of Operation:</p>
                    <div className="mt-8 border-b border-slate-400 w-44" />
                    <p className="font-bold text-slate-800 mt-1">RICARDO Q. BAUTISTA</p>
                    <p className="text-[10px] text-slate-500">Head of Operation</p>
                  </div>
                </div>

                {/* Row 2: Recommending Approval & Approved By */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Recommending Approval:</p>
                    <div className="mt-8 border-b border-slate-400 w-52" />
                    <p className="font-bold text-slate-800 mt-1">SHIERWIN H. TAAY</p>
                    <p className="text-[10px] text-slate-500">Provincial Administrator</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Approved By:</p>
                    <div className="mt-8 border-b border-slate-400 w-52" />
                    <p className="font-bold text-slate-800 mt-1">HON. ISIDRO P. GALBAN</p>
                    <p className="text-[10px] text-slate-500">Governor</p>
                  </div>
                </div>
              </div>
            )}

            {/* Category: CCTV/Internet Installation Signatures */}
            {item.category === "Internet" && (
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div>
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Requested By:</p>
                  <div className="mt-8 border-b border-slate-400 w-48" />
                  <p className="font-bold text-slate-800 mt-1">{item.requestedBy || item.createdBy.name}</p>
                  <p className="text-[10px] text-slate-500">Requesting Party</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Approved By:</p>
                  <div className="mt-8 border-b border-slate-400 w-48" />
                  <p className="font-bold text-slate-800 mt-1">SHIERWIN H. TAAY</p>
                  <p className="text-[10px] text-slate-500">Provincial Administrator</p>
                </div>
              </div>
            )}

            {/* Category: Technical Repair Signatures */}
            {item.category === "Repair" && (
              <div className="grid grid-cols-3 gap-6 text-xs">
                <div>
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Prepared By:</p>
                  <div className="mt-8 border-b border-slate-400 w-36" />
                  <p className="font-bold text-slate-800 mt-1">{item.createdBy.name || item.requestedBy}</p>
                  <p className="text-[10px] text-slate-500">Requesting Party</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Technician:</p>
                  <div className="mt-8 border-b border-slate-400 w-36" />
                  <p className="font-bold text-slate-800 mt-1">
                    {technicianName || (item.isApproved ? "MIS Technician" : "Pending Assignment")}
                  </p>
                  <p className="text-[10px] text-slate-500">MIS Technical Staff</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Approved By:</p>
                  <div className="mt-8 border-b border-slate-400 w-36" />
                  <p className="font-bold text-slate-800 mt-1">{FIXED_APPROVER_NAME}</p>
                  <p className="text-[10px] text-slate-500">{FIXED_APPROVER_TITLE}</p>
                </div>
              </div>
            )}
          </div>

          {/* Document Footer */}
          <div className="pt-4 text-center border-t border-slate-200 text-[10px] text-slate-400">
            Provincial Capitol Compound, Suklayin, Baler, Aurora 3200 • MIS &amp; CCTV System Automated Document
          </div>
        </div>
      </div>
    </div>
  );
}
