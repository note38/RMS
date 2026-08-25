"use client";

import { Search } from "lucide-react";
import { ExportDropdown } from "../export/ExportDropdown";
import type { CategoryFilter, StatusFilter, SystemRequest } from "./types";

interface RequestsControlsBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  exportRequests?: SystemRequest[];
}

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "Repair", label: "Repair" },
  { value: "CCTV", label: "CCTV" },
  { value: "Internet", label: "CCTV/Install" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string; activeCls: string }[] = [
  { value: "ALL", label: "All Status", activeCls: "bg-card text-foreground font-semibold shadow-xs" },
  { value: "PENDING", label: "Pending", activeCls: "bg-amber-500/10 text-amber-600 font-semibold shadow-xs" },
  { value: "APPROVED", label: "Approved", activeCls: "bg-emerald-500/10 text-emerald-600 font-semibold shadow-xs" },
];

function FilterButton<T extends string>({
  active,
  activeCls,
  onClick,
  children,
}: {
  active: boolean;
  activeCls: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
        active ? activeCls : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function RequestsControlsBar({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  exportRequests = [],
}: RequestsControlsBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search series #, office, or requester..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
          {CATEGORY_OPTIONS.map((opt) => (
            <FilterButton
              key={opt.value}
              active={categoryFilter === opt.value}
              activeCls="bg-card text-foreground font-semibold shadow-xs"
              onClick={() => onCategoryChange(opt.value)}
            >
              {opt.label}
            </FilterButton>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
          {STATUS_OPTIONS.map((opt) => (
            <FilterButton
              key={opt.value}
              active={statusFilter === opt.value}
              activeCls={opt.activeCls}
              onClick={() => onStatusChange(opt.value)}
            >
              {opt.label}
            </FilterButton>
          ))}
        </div>

        <div className="border-l border-border pl-3 hidden sm:block md:block">
          <ExportDropdown requests={exportRequests} />
        </div>
      </div>
    </div>
  );
}
