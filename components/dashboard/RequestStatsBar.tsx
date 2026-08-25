import { Wrench, Video, Wifi, type LucideIcon } from "lucide-react";
import type { DashboardCounts } from "@/lib/dashboard/get-dashboard-data";

interface RequestStatsBarProps {
  counts: DashboardCounts;
}

interface StatCard {
  label: string;
  icon: LucideIcon;
  iconWrapperCls: string;
  value: (counts: DashboardCounts) => number;
}

const CARDS: StatCard[] = [
  {
    label: "Technical Repairs",
    icon: Wrench,
    iconWrapperCls: "bg-blue-500/10 text-blue-600",
    value: (c) => c.repairs,
  },
  {
    label: "CCTV Footage Requests",
    icon: Video,
    iconWrapperCls: "bg-purple-500/10 text-purple-600",
    value: (c) => c.cctvs,
  },
  {
    label: "Installation Requests",
    icon: Wifi,
    iconWrapperCls: "bg-emerald-500/10 text-emerald-600",
    value: (c) => c.internets,
  },
];

export function RequestStatsBar({ counts }: RequestStatsBarProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CARDS.map(({ label, icon: Icon, iconWrapperCls, value }) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{value(counts)}</h3>
          </div>
          <div className={`rounded-lg p-3 ${iconWrapperCls}`}>
            <Icon className="size-6" />
          </div>
        </div>
      ))}
    </div>
  );
}
