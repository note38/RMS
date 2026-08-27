"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateRepairTechnicianFields } from "@/lib/actions";
import type { SystemRequest } from "./types";

interface TechEditModalProps {
  request: SystemRequest;
  onClose: () => void;
}

export function TechEditModal({ request, onClose }: TechEditModalProps) {
  const router = useRouter();
  const [findings, setFindings] = useState(request.technicianFindings ?? "");
  const [recommendation, setRecommendation] = useState(request.technicianRecommendation ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateRepairTechnicianFields(request.id, findings, recommendation);
      router.refresh();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Technician Notes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Series No: <span className="font-mono font-semibold">{request.seriesNo}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Findings</label>
          <textarea
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            rows={4}
            placeholder="Enter technician findings..."
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
            Recommendation
          </label>
          <textarea
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            rows={4}
            placeholder="Enter technician recommendation..."
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 cursor-pointer">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Save Notes
          </Button>
        </div>
      </div>
    </div>
  );
}
