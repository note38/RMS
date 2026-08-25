import { FIXED_APPROVER_NAME, FIXED_APPROVER_TITLE } from "../constants";

interface InternetSignatureBlockProps {
  requestedBy: string;
}

export function InternetSignatureBlock({ requestedBy }: InternetSignatureBlockProps) {
  return (
    <div className="grid grid-cols-2 gap-8 text-xs">
      <div>
        <p className="text-slate-400 uppercase font-semibold text-[10px]">Requested By:</p>
        <div className="mt-8 border-b border-slate-400 w-48" />
        <p className="font-bold text-slate-800 mt-1">{requestedBy}</p>
        <p className="text-[10px] text-slate-500">Requesting Party</p>
      </div>
      <div className="text-right flex flex-col items-end">
        <p className="text-slate-400 uppercase font-semibold text-[10px]">Approved By:</p>
        <div className="mt-8 border-b border-slate-400 w-48" />
        <p className="font-bold text-slate-800 mt-1">{FIXED_APPROVER_NAME}</p>
        <p className="text-[10px] text-slate-500">{FIXED_APPROVER_TITLE}</p>
      </div>
    </div>
  );
}
