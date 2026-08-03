"use client";

import { useState, useEffect } from "react";
import { Wrench, Video, Wifi, X, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createRepairRequest,
  createCctvRequest,
  createInternetRequest,
} from "@/lib/actions";

interface RequestModalProps {
  initialType?: "Repair" | "CCTV" | "Internet" | null;
  isOpen: boolean;
  onClose: () => void;
  defaultUserName?: string;
  isAdmin?: boolean;
  defaultAdminName?: string;
}

export function RequestModal({
  initialType = "Repair",
  isOpen,
  onClose,
  defaultUserName = "",
  isAdmin = false,
  defaultAdminName = "",
}: RequestModalProps) {
  const [activeTab, setActiveTab] = useState<"Repair" | "CCTV" | "Internet">(
    initialType || "Repair"
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen && initialType) {
      setActiveTab(initialType);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    const formData = new FormData(e.currentTarget);

    try {
      if (activeTab === "Repair") {
        await createRepairRequest(formData);
      } else if (activeTab === "CCTV") {
        await createCctvRequest(formData);
      } else if (activeTab === "Internet") {
        await createInternetRequest(formData);
      }

      setSuccessMessage(`${activeTab} request submitted successfully!`);
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const selectCls = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground border border-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h3 className="font-bold text-lg">Submit Official Request</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Type Tabs */}
        <div className="flex border-b border-border bg-muted/40 p-2 gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("Repair")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "Repair"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="size-4 text-blue-500" />
            Technical Repair
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CCTV")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "CCTV"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="size-4 text-purple-500" />
            CCTV Footage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Internet")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "Internet"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wifi className="size-4 text-emerald-500" />
            CCTV/Internet Installation
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="m-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg flex items-center gap-2 text-sm font-medium">
            <Check className="size-5" />
            {successMessage}
          </div>
        )}

        {/* Dynamic Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">

          {/* TAB 1: TECHNICAL REPAIR FORM */}
          {activeTab === "Repair" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Requesting Office *</label>
                  <input
                    required
                    name="requestingOffice"
                    placeholder="e.g. Accounting Office"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Requested By *</label>
                  <input
                    required
                    name="requestedBy"
                    defaultValue={defaultUserName}
                    placeholder="Full name of requester"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Equipment Type *</label>
                  <select required name="equipmentType" className={selectCls}>
                    <option value="">Select equipment type…</option>
                    <option value="Desktop Computer">Desktop Computer</option>
                    <option value="Laptop Computer">Laptop Computer</option>
                    <option value="Printer">Printer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Nature of Repair *</label>
                  <select required name="natureOfRepair" className={selectCls}>
                    <option value="">Select nature of repair…</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Brand Name *</label>
                  <input
                    required
                    name="brandName"
                    placeholder="e.g. Dell, HP, Epson"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Model Number *</label>
                  <input
                    required
                    name="modelNo"
                    placeholder="e.g. OptiPlex 3080"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Serial Number *</label>
                  <input
                    required
                    name="serialNo"
                    placeholder="e.g. SN-9988221"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Property Number *</label>
                  <input
                    required
                    name="propertyNo"
                    placeholder="e.g. PROP-2026-0042"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Action Type Requested *</label>
                <select required name="actionType" className={selectCls}>
                  <option value="">Select action type…</option>
                  <option value="Upgrade">Upgrade</option>
                  <option value="Repair">Repair</option>
                  <option value="Update">Update</option>
                </select>
              </div>

              {/* Technician field — shown only to admins, pre-filled */}
              {isAdmin && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Technician (Admin Name)
                  </label>
                  <input
                    name="technicianName"
                    defaultValue={defaultAdminName || defaultUserName}
                    placeholder="Technician full name"
                    className="w-full px-3 py-2 bg-primary/5 border border-primary/30 rounded-lg text-sm font-semibold text-primary focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className={labelCls}>Pre-Inspection Notes (Optional)</label>
                <textarea
                  name="preInspection"
                  rows={2}
                  placeholder="Additional technical details..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          )}

          {/* TAB 2: CCTV FOOTAGE REQUEST FORM */}
          {activeTab === "CCTV" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Nature of Request *</label>
                  <select required name="requestType" className={selectCls}>
                    <option value="">Select nature of request…</option>
                    <option value="Playback Viewing Only">Playback Viewing Only</option>
                    <option value="Export Surveillance Footage">Export Surveillance Footage</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>CCTV Location / Camera Area *</label>
                  <input
                    required
                    name="location"
                    placeholder="e.g. Main Lobby, Parking Area Gate 2"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Name of Requesting Party *</label>
                  <input
                    required
                    name="requestingParty"
                    defaultValue={defaultUserName}
                    placeholder="Full name of party"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Address / Agency *</label>
                  <input
                    required
                    name="address"
                    placeholder="Office address or department"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Requesting Office (Optional)</label>
                  <input
                    name="requestingOffice"
                    placeholder="e.g. Security Office / Office Name"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Date of Incident / Footage *</label>
                  <input
                    type="date"
                    required
                    name="dateOfFootage"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Time Range of Footage *</label>
                <input
                  required
                  name="timeOfFootage"
                  placeholder="e.g. 02:00 PM - 03:30 PM"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Purpose of Footage Request *</label>
                <textarea
                  required
                  name="purpose"
                  rows={2}
                  placeholder="State the official security, incident investigation, or legal purpose..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Admin optional fields when admin creates or approves */}
              {isAdmin && (
                <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Requirements Label (Admin)
                    </label>
                    <select name="requirements" className={selectCls}>
                      <option value="">Select Requirements…</option>
                      <option value="Valid ID">Valid ID</option>
                      <option value="Police Request">Police Request</option>
                      <option value="Contract/Plantilla">Contract/Plantilla</option>
                      <option value="Storage Device (Optional)">Storage Device (Optional)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Availability Status (Admin)
                    </label>
                    <select name="availabilityStatus" className={selectCls}>
                      <option value="">Select Availability Status…</option>
                      <option value="Footage Available">Footage Available</option>
                      <option value="Footage Not Available">Footage Not Available</option>
                      <option value="For Release">For Release</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CCTV/INTERNET INSTALLATION FORM */}
          {activeTab === "Internet" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Requesting Office *</label>
                  <input
                    required
                    name="requestingOffice"
                    placeholder="e.g. Budget & Management Office"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Requested By *</label>
                  <input
                    required
                    name="requestedBy"
                    defaultValue={defaultUserName}
                    placeholder="Full name of requester"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Physical Location / Station *</label>
                  <input
                    required
                    name="location"
                    placeholder="e.g. 2nd Floor West Wing Station 4"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Nature of Request *</label>
                  <select required name="natureOfRepair" className={selectCls}>
                    <option value="">Select nature of request…</option>
                    <option value="CCTV Installation">CCTV Installation</option>
                    <option value="Internet Line Installation">Internet Line Installation</option>
                    <option value="Check-up/Repair">Check-up/Repair</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Official Purpose & Justification *</label>
                <textarea
                  required
                  name="purpose"
                  rows={3}
                  placeholder="Describe the installation or service requirements..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="cursor-pointer font-bold">
              {loading ? "Submitting..." : `Submit ${activeTab === "Internet" ? "Installation" : activeTab} Request`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
