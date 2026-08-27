"use client";

import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintStyles } from "./PrintStyles";
import { PrintableSheet } from "./PrintableSheet";
import type { RequestPrintItem } from "./types";

interface PrintableRequestModalProps {
  item: RequestPrintItem | null;
  onClose: () => void;
}

// CCTV and Internet requests need two copies side by side; everything else is a single sheet.
// All categories now use two copies side‑by‑side
const DUAL_COPY_CATEGORIES = new Set();

export function PrintableRequestModal({ item, onClose }: PrintableRequestModalProps) {
  if (!item) return null;

  const handlePrint = () => window.print();
  const needsTwoCopies = true; // always render two copies
  const isLandscape = ["CCTV", "Internet"].includes(item.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:static print:inset-auto print:bg-transparent print:backdrop-blur-none print:p-0 print:m-0 print:overflow-visible print-modal-overlay">
      <div className={`bg-white text-slate-900 w-full ${isLandscape ? "max-w-6xl" : "max-w-4xl"} rounded-xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none printable-sheet`}>

        {/* Action Header (hidden in print) */}
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

        <PrintStyles category={item.category} />

        <div className="p-6 print:p-0 space-y-6 print:space-y-0" id="printable-area">

          {item.category === "Repair" ? (
            <div className="repair-dual-container">
              {/* Sheet 1 (Copy 1): Shown on screen preview & printed on Page 1 */}
              <div className="repair-copy-item">
                <PrintableSheet item={item} copyLabel="ORIGINAL / REQUESTER COPY" />
              </div>

              {/* Sheet 2 (Copy 2): Hidden on screen preview, printed on Page 2 */}
              <div className="repair-copy-item repair-second-copy hidden print:block">
                <PrintableSheet item={item} copyLabel="MIS TECHNICAL / OPERATIONS COPY" />
              </div>
            </div>
          ) : needsTwoCopies ? (
            <div className="print-columns flex flex-row gap-6">
              <div className="copy w-1/2 pr-6">
                <PrintableSheet item={item} copyLabel="REQUESTER COPY" />
              </div>
              <div className="copy w-1/2 border-l-2 border-dashed border-slate-300 pl-6">
                <PrintableSheet item={item} copyLabel="OPERATIONS COPY" />
              </div>
            </div>
          ) : (
            <PrintableSheet item={item} />
          )}
        </div>
      </div>
    </div>
  );
}

