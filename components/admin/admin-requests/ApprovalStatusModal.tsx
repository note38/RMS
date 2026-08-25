"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ApprovalStatusModalProps {
  onCancel: () => void;
  onConfirm: (status: string) => void;
  isSubmitting: boolean;
}

export function ApprovalStatusModal({ onCancel, onConfirm, isSubmitting }: ApprovalStatusModalProps) {
  const [status, setStatus] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-foreground">Set Availability Status</h3>
        <p className="text-xs text-muted-foreground">
          Select the CCTV footage availability status before approving.
        </p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="">Select Status…</option>
          <option value="Footage Available">Footage Available</option>
          <option value="Footage Not Available">Footage Not Available</option>
        </select>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onCancel} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(status)}
            disabled={!status || isSubmitting}
            className="cursor-pointer"
          >
            Approve Request
          </Button>
        </div>
      </div>
    </div>
  );
}
