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
    <div className="grid grid-cols-3 gap-6 text-xs">
      <div>
        <p className="text-slate-400 uppercase font-semibold text-[10px]">Prepared By:</p>
        <div className="mt-8 border-b border-slate-400 w-36" />
        <p className="font-bold text-slate-800 mt-1">{preparedByName}</p>
        <p className="text-[10px] text-slate-500">Requesting Party</p>
      </div>

      <div>
        <p className="text-slate-400 uppercase font-semibold text-[10px]">Technician:</p>
        <div className="mt-8 border-b border-slate-400 w-36" />
        <p className="font-bold text-slate-800 mt-1">
          {technicianName || (isApproved ? "MIS Technician" : "Pending Assignment")}
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
  );
}
