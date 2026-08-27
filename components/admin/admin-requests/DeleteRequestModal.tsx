"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SystemRequest } from "./types";

interface DeleteRequestModalProps {
  request: SystemRequest;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteRequestModal({
  request,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteRequestModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-md p-1 hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-6">
          <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Delete Request Record</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Are you sure you want to delete this request record?
            </p>
          </div>
        </div>

        {/* Request Details Card */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-foreground text-sm">{request.seriesNo}</span>
            <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {request.category}
            </span>
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">Office:</span> {request.requestingOffice || "N/A"}
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">Submitted By:</span> {request.requestedBy || request.createdBy.name || request.createdBy.email}
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          This action <strong className="text-destructive">cannot be undone</strong>. This request record will be permanently deleted from the database.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2 cursor-pointer font-bold"
          >
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            {isDeleting ? "Deleting…" : "Delete Record"}
          </Button>
        </div>
      </div>
    </div>
  );
}
