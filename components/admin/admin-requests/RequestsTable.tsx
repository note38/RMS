"use client";

import { Filter } from "lucide-react";
import { RequestRow } from "./RequestRow";
import type { SystemRequest } from "./types";

interface RequestsTableProps {
  requests: SystemRequest[];
  loadingId: string | null;
  onApproveClick: (request: SystemRequest) => void;
  onEditRepair: (request: SystemRequest) => void;
  onEditCctv: (request: SystemRequest) => void;
  onEditInternet: (request: SystemRequest) => void;
  onExportPdf: (request: SystemRequest) => void;
  onDelete: (request: SystemRequest) => void;
}

export function RequestsTable({
  requests,
  loadingId,
  onApproveClick,
  onEditRepair,
  onEditCctv,
  onEditInternet,
  onExportPdf,
  onDelete,
}: RequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground space-y-2">
        <Filter className="size-8 mx-auto text-muted-foreground/50" />
        <p className="text-base font-semibold">No requests found matching your filter criteria.</p>
        <p className="text-xs">Try adjusting your search query or status filter.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
            <th className="p-4">Series No.</th>
            <th className="p-4">Category</th>
            <th className="p-4">Requesting Office</th>
            <th className="p-4">Submitted By</th>
            <th className="p-4">Technician / Status</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {requests.map((req) => {
            const key = `${req.category.toLowerCase()}-${req.id}`;
            return (
              <RequestRow
                key={key}
                request={req}
                isLoading={loadingId === key}
                onApproveClick={onApproveClick}
                onEditRepair={onEditRepair}
                onEditCctv={onEditCctv}
                onEditInternet={onEditInternet}
                onExportPdf={onExportPdf}
                onDelete={onDelete}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
