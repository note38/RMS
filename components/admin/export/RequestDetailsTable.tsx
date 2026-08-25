import { REPAIR_KEYS } from "./constants";
import type { RequestCategory } from "./types";

interface RequestDetailsTableProps {
  category: RequestCategory;
  details: Record<string, string | null | undefined>;
}

export function RequestDetailsTable({ category, details }: RequestDetailsTableProps) {
  const isRepair = category === "Repair";
  const entries = Object.entries(details).filter(
    ([key, value]) => Boolean(value) && !(isRepair && (REPAIR_KEYS as readonly string[]).includes(key))
  );

  return (
    <div className="space-y-2 mt-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
        Request Parameters &amp; Details
      </h4>

      {isRepair && (
        <div className="grid grid-cols-2 gap-3 text-xs mb-2">
          {REPAIR_KEYS.map((key) => (
            <div key={key} className="border border-slate-200 rounded p-2 bg-slate-50">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">{key}</p>
              <p className="font-bold text-slate-900 text-sm">{details[key] || "-"}</p>
            </div>
          ))}
        </div>
      )}

      <div className="border border-slate-300 rounded overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-200 text-slate-700 font-semibold border-b border-slate-300">
              <th className="p-2 w-1/3">Field Name</th>
              <th className="p-2">Specified Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {entries.length === 0 ? (
              <tr>
                <td className="p-2 text-slate-400 italic" colSpan={2}>
                  No additional fields provided
                </td>
              </tr>
            ) : (
              entries.map(([key, value]) => (
                <tr key={key}>
                  <td className="p-2 font-medium text-slate-600 bg-slate-50">{key}</td>
                  <td className="p-2 text-slate-900 font-semibold">{value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
