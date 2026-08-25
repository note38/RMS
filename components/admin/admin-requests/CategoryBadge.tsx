import { Wrench, Video, Wifi } from "lucide-react";
import type { RequestCategory } from "./types";

const CATEGORY_ICON: Record<RequestCategory, React.ReactNode> = {
  Repair: <Wrench className="size-3.5 text-blue-500" />,
  CCTV: <Video className="size-3.5 text-purple-500" />,
  Internet: <Wifi className="size-3.5 text-emerald-500" />,
};

export function CategoryBadge({ category }: { category: RequestCategory }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-border bg-background">
      {CATEGORY_ICON[category]}
      {category}
    </span>
  );
}
