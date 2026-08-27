"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateInternetFields } from "@/lib/actions";
import type { SystemRequest } from "./types";

interface InternetEditModalProps {
  request: SystemRequest;
  onClose: () => void;
}

const inputCls =
  "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide";

export function InternetEditModal({ request, onClose }: InternetEditModalProps) {
  const router = useRouter();
  const [natureOfRepair, setNatureOfRepair] = useState(
    request.details["Nature of Request"] || ""
  );
  const [requestingOffice, setRequestingOffice] = useState(
    request.requestingOffice || ""
  );
  const [location, setLocation] = useState(request.details["Location"] || "");
  const [purpose, setPurpose] = useState(request.details["Purpose"] || "");
  const [requestedBy, setRequestedBy] = useState(
    request.details["Requested By"] || request.requestedBy || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateInternetFields(request.id, {
        natureOfRepair,
        requestingOffice,
        location,
        purpose,
        requestedBy,
      });
      router.refresh();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Edit Internet/Installation Request</h3>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelCls}>Requested By</label>
            <input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Requesting Office</label>
            <input value={requestingOffice} onChange={(e) => setRequestingOffice(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelCls}>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Nature of Request</label>
            <input value={natureOfRepair} onChange={(e) => setNatureOfRepair(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 cursor-pointer font-bold">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
