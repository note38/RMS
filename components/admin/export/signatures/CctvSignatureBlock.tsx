import {
  CCTV_OPERATOR_SUPERVISOR_NAME,
  CCTV_OPERATOR_SUPERVISOR_TITLE,
  FIXED_APPROVER_NAME,
  FIXED_APPROVER_TITLE,
  GOVERNOR_NAME,
  GOVERNOR_TITLE,
} from "../constants";

interface SignatureLineProps {
  label: string;
  name?: string;
  title: string;
  align?: "left" | "right";
  width?: string;
}

function SignatureLine({ label, name, title, align = "left", width = "w-44" }: SignatureLineProps) {
  const isRight = align === "right";
  return (
    <div className={isRight ? "text-right flex flex-col items-end" : undefined}>
      <p className="text-slate-400 uppercase font-semibold text-[10px]">{label}</p>
      <div className={`mt-6 border-b border-black/30 ${width}`} />
      <p className="font-bold text-slate-800 mt-1">{name || "\u00A0"}</p>
      <p className="text-[10px] text-slate-500">{title}</p>
    </div>
  );
}

interface CctvSignatureBlockProps {
  requestedBy: string;
}

export function CctvSignatureBlock({ requestedBy }: CctvSignatureBlockProps) {
  return (
    <div className="space-y-4 print:space-y-3 text-xs">

      <div className="grid grid-cols-3 gap-6">
        <SignatureLine label="Requesting Party:" name={requestedBy} title="Requesting Party Signature" />
        <SignatureLine label="CCTV Operator:" title="CCTV System Operator" />
        <SignatureLine
          label="Head of Operation:"
          name={CCTV_OPERATOR_SUPERVISOR_NAME}
          title={CCTV_OPERATOR_SUPERVISOR_TITLE}
        />
      </div>

      <div className="grid grid-cols-2 gap-8 pt-4 border-t border-black/30">
        <SignatureLine
          label="Recommending Approval:"
          name={FIXED_APPROVER_NAME}
          title={FIXED_APPROVER_TITLE}
          width="w-52"
        />
        <SignatureLine
          label="Approved By:"
          name={GOVERNOR_NAME}
          title={GOVERNOR_TITLE}
          align="right"
          width="w-52"
        />
      </div>
    </div>
  );
}
