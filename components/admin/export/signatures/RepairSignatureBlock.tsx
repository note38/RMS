import { FIXED_APPROVER_NAME, FIXED_APPROVER_TITLE } from "../constants";

interface RepairSignatureBlockProps {
  preparedByName: string;
  technicianName: string | null;
  isApproved: boolean;
}

export function RepairSignatureBlock({
  preparedByName,
  technicianName,
  isApproved,
}: RepairSignatureBlockProps) {
  return (
    <div className="grid grid-cols-3 gap-6 text-sm print:text-xs">
      <div>
        <p className="text-slate-500 uppercase font-semibold text-xs print:text-[10px]">Prepared By:</p>
        <div className="mt-10 print:mt-8 border-b border-black/30 w-44 print:w-36 max-w-full" />
        <p className="font-bold text-slate-900 mt-1 text-sm print:text-xs">{preparedByName}</p>
        <p className="text-xs print:text-[10px] text-slate-500">Requesting Party</p>
      </div>

      <div>
        <p className="text-slate-500 uppercase font-semibold text-xs print:text-[10px]">Technician:</p>
        <div className="mt-10 print:mt-8 border-b border-black/30 w-44 print:w-36 max-w-full" />
        <p className="font-bold text-slate-900 mt-1 text-sm print:text-xs">
          {technicianName || (isApproved ? "MIS Technician" : "Pending Assignment")}
        </p>
        <p className="text-xs print:text-[10px] text-slate-500">MIS Technical Staff</p>
      </div>

      <div className="text-right flex flex-col items-end">
        <p className="text-slate-500 uppercase font-semibold text-xs print:text-[10px]">Approved By:</p>
        <div className="mt-10 print:mt-8 border-b border-black/30 w-44 print:w-36 max-w-full" />
        <p className="font-bold text-slate-900 mt-1 text-sm print:text-xs">{FIXED_APPROVER_NAME}</p>
        <p className="text-xs print:text-[10px] text-slate-500">{FIXED_APPROVER_TITLE}</p>
      </div>
    </div>
  );
}
