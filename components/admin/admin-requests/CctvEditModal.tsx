"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCctvFields } from "@/lib/actions";
import type { SystemRequest } from "./types";

interface CctvEditModalProps {
  request: SystemRequest;
  onClose: () => void;
}

const inputCls =
  "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
const selectCls = `${inputCls} cursor-pointer`;
const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide";

export function CctvEditModal({ request, onClose }: CctvEditModalProps) {
  const router = useRouter();
  const [requestType, setRequestType] = useState(
    request.requestType || request.details["Nature of Request"] || "Playback Viewing Only"
  );
  const [requirements, setRequirements] = useState(
    request.requirements || request.details["Requirements"] || ""
  );
  const [location, setLocation] = useState(request.location || request.details["Location"] || "");
  const [requestingParty, setRequestingParty] = useState(
    request.requestingParty || request.details["Requesting Party"] || ""
  );
  const [address, setAddress] = useState(request.address || request.details["Address / Agency"] || "");
  const [dateOfFootage, setDateOfFootage] = useState(
    request.dateOfFootage || request.details["Date of Footage"] || ""
  );
  const [timeOfFootage, setTimeOfFootage] = useState(
    request.timeOfFootage || request.details["Time of Footage"] || ""
  );
  const [purpose, setPurpose] = useState(request.purpose || request.details["Purpose"] || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateCctvFields(request.id, {
        requestType,
        requirements,
        location,
        requestingParty,
        address,
        dateOfFootage,
        timeOfFootage,
        purpose,
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
            <h3 className="text-base font-bold text-foreground">Edit CCTV Request & Status</h3>
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
            <label className={labelCls}>Nature of Request</label>
            <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className={selectCls}>
              <option value="Playback Viewing Only">Playback Viewing Only</option>
              <option value="Export Surveillance Footage">Export Surveillance Footage</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelCls}>CCTV Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelCls}>Requirements Label</label>
            <select value={requirements} onChange={(e) => setRequirements(e.target.value)} className={selectCls}>
              <option value="">Select Requirements…</option>
              <option value="Valid ID">Valid ID</option>
              <option value="Police Request">Police Request</option>
              <option value="Contract/Plantilla">Contract/Plantilla</option>
              <option value="Storage Device (Optional)">Storage Device (Optional)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelCls}>Requesting Party Name</label>
            <input
              value={requestingParty}
              onChange={(e) => setRequestingParty(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Address / Agency</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelCls}>Date of Footage</label>
            <input
              type="date"
              value={dateOfFootage}
              onChange={(e) => setDateOfFootage(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Time Range of Footage</label>
            <input
              value={timeOfFootage}
              onChange={(e) => setTimeOfFootage(e.target.value)}
              className={inputCls}
            />
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
