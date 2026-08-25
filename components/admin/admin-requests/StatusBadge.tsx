import { CheckCircle2, Clock } from "lucide-react";

export function StatusBadge({ isApproved }: { isApproved: boolean }) {
  if (isApproved) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 px-2.5 py-1 text-xs font-semibold">
        <CheckCircle2 className="size-3.5" />
        Approved
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 px-2.5 py-1 text-xs font-semibold">
      <Clock className="size-3.5" />
      Pending
    </span>
  );
}
