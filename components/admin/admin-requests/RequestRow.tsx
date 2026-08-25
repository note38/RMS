"use client";

import { Printer, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { CategoryBadge } from "./CategoryBadge";
import type { SystemRequest } from "./types";

interface RequestRowProps {
  request: SystemRequest;
  isLoading: boolean;
  onApproveClick: (request: SystemRequest) => void;
  onEditRepair: (request: SystemRequest) => void;
  onEditCctv: (request: SystemRequest) => void;
  onExportPdf: (request: SystemRequest) => void;
  onDelete: (request: SystemRequest) => void;
}

export function RequestRow({
  request: req,
  isLoading,
  onApproveClick,
  onEditRepair,
  onEditCctv,
  onExportPdf,
  onDelete,
}: RequestRowProps) {
  const hasFindings = req.technicianFindings || req.technicianRecommendation;

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="p-4 font-mono text-xs font-bold text-foreground">{req.seriesNo}</td>

      <td className="p-4">
        <CategoryBadge category={req.category} />
      </td>

      <td className="p-4 text-foreground font-medium">{req.requestingOffice || "N/A"}</td>

      <td className="p-4 text-xs">
        <div className="font-semibold text-foreground">{req.createdBy.name || req.requestedBy}</div>
        <div className="text-muted-foreground">{req.createdBy.email}</div>
      </td>

      <td className="p-4 text-xs">
        {req.category === "CCTV" && req.availabilityStatus ? (
          <div className="text-purple-600 font-semibold">{req.availabilityStatus}</div>
        ) : req.approvedBy ? (
          <div className="text-emerald-600 font-semibold">{req.approvedBy.name || req.approvedBy.email}</div>
        ) : (
          <span className="text-muted-foreground italic">—</span>
        )}
        {req.category === "Repair" && hasFindings && (
          <div className="mt-0.5 text-blue-500 text-[10px] font-medium">● Has findings</div>
        )}
      </td>

      <td className="p-4">
        <StatusBadge isApproved={req.isApproved} />
      </td>

      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant={req.isApproved ? "outline" : "default"}
            disabled={isLoading}
            onClick={() => onApproveClick(req)}
            className="cursor-pointer text-xs h-8 px-2.5"
          >
            {req.isApproved ? "Set Pending" : "Approve"}
          </Button>

          {req.category === "Repair" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditRepair(req)}
              className="cursor-pointer text-xs h-8 px-2.5 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          )}

          {req.category === "CCTV" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditCctv(req)}
              className="cursor-pointer text-xs h-8 px-2.5 gap-1 text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/30"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onExportPdf(req)}
            className="cursor-pointer text-xs h-8 px-2.5 gap-1"
          >
            <Printer className="size-3.5" />
            Export PDF
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(req)}
            className="cursor-pointer text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
