interface RequestSummaryGridProps {
  requestingOffice: string;
  requestedBy: string;
  submittedByEmail: string;
  isApproved: boolean;
}

function SummaryField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-black/30 rounded p-3.5 print:p-2.5 space-y-1">
      <span className="text-slate-500 uppercase font-semibold text-xs print:text-[10px]">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export function RequestSummaryGrid({
  requestingOffice,
  requestedBy,
  submittedByEmail,
  isApproved,
}: RequestSummaryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm print:text-xs">
      <SummaryField label="Requesting Office">
        <p className="font-bold text-slate-900 text-base print:text-sm">{requestingOffice || "N/A"}</p>
      </SummaryField>

      <SummaryField label="Requested By">
        <p className="font-bold text-slate-900 text-base print:text-sm">{requestedBy || "N/A"}</p>
      </SummaryField>

      <SummaryField label="Submitted By (Email)">
        <p className="font-medium text-slate-800 text-sm print:text-xs">{submittedByEmail}</p>
      </SummaryField>

      <SummaryField label="Current Status">
        {isApproved ? (
          <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded text-xs print:text-[11px]">
            APPROVED
          </span>
        ) : (
          <span className="inline-block bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded text-xs print:text-[11px]">
            PENDING APPROVAL
          </span>
        )}
      </SummaryField>
    </div>
  );
}
