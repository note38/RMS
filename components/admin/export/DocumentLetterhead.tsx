import type { RequestCategory } from "./types";

interface DocumentLetterheadProps {
  seriesNo: string;
  date: string;
  category: RequestCategory;
  copyLabel?: string;
}

export function DocumentLetterhead({ seriesNo, date, category, copyLabel }: DocumentLetterheadProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b-2 border-black/30 pb-3 print:pb-2">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Capitol Logo" className="w-14 h-14 print:w-12 print:h-12 object-contain" />
          <img
            src="/Bagong_Pilipinas_Logo.svg.webp"
            alt="Bagong Pilipinas"
            className="w-14 h-14 print:w-12 print:h-12 object-contain"
          />
          <div className="flex flex-col items-start">
            <h4
              className="text-xs print:text-[11px] font-bold uppercase tracking-widest text-slate-500"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              Republic of the Philippines
            </h4>
            <h2
              className="text-xl print:text-lg font-bold text-slate-900 leading-tight"
              style={{ fontFamily: "'Old English Text MT', 'UnifrakturMaguntia', serif" }}
            >
              Provincial Government of Aurora
            </h2>
            <p
              className="text-sm print:text-xs font-bold text-slate-800 leading-tight"
              style={{ fontFamily: "'Baskerville Old Face', 'Baskerville', 'Libre Baskerville', Georgia, serif" }}
            >
              B A L E R
            </p>
            <p
              className="text-xl print:text-lg text-slate-600 leading-tight"
              style={{ fontFamily: "'Edwardian Script ITC', 'Palatino Linotype', cursive" }}
            >
              Office of the Provincial Administrator
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="inline-block bg-slate-100 border border-black/30 rounded px-3 py-1 text-right">
            <p className="text-[10px] print:text-[9px] font-mono uppercase text-slate-500">Series No.</p>
            <p className="text-sm print:text-xs font-bold font-mono text-blue-900">{seriesNo}</p>
          </div>
          <p className="text-xs print:text-[11px] text-slate-600 font-medium">Date: {date}</p>
          {copyLabel && (
            <span className="inline-block bg-slate-900 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              {copyLabel}
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-100 border-y border-black/30 py-2 print:py-1 text-center relative">
        <h3 className="text-base print:text-sm font-extrabold uppercase tracking-wide text-slate-800">
          {category === "Internet"
            ? "CCTV/Internet Installation Request Form"
            : `${category} Service Request Form`}
        </h3>
      </div>
    </>
  );
}
