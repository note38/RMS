"use client";

import { useState } from "react";
import {
  Wrench,
  Video,
  Wifi,
  Printer,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  Filter,
  Pencil,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleRequestApproval, deleteRequest, updateRepairTechnicianFields, updateCctvFields } from "@/lib/actions";
import { PrintableRequestModal, RequestPrintItem } from "./printable-request";

export interface SystemRequest {
  id: number;
  seriesNo: string;
  category: "Repair" | "CCTV" | "Internet";
  requestingOffice: string;
  requestedBy: string;
  date: string;
  isApproved: boolean;
  createdBy: {
    id: number;
    name: string | null;
    email: string;
  };
  approvedBy?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  details: Record<string, string | null | undefined>;
  // Technician fields (Repair only)
  technicianFindings?: string | null;
  technicianRecommendation?: string | null;
  // CCTV specific fields
  requestType?: string | null;
  location?: string | null;
  requestingParty?: string | null;
  address?: string | null;
  purpose?: string | null;
  dateOfFootage?: string | null;
  timeOfFootage?: string | null;
  requirements?: string | null;
  availabilityStatus?: string | null;
}

interface AdminRequestsTableProps {
  initialRequests: SystemRequest[];
}

// ── CCTV Edit Modal ───────────────────────────────────────────────────────────
interface CctvEditModalProps {
  request: SystemRequest;
  onClose: () => void;
}

function CctvEditModal({ request, onClose }: CctvEditModalProps) {
  const [requestType, setRequestType] = useState(
    request.requestType || request.details["Nature of Request"] || "Playback Viewing Only"
  );
  const [requirements, setRequirements] = useState(
    request.requirements || request.details["Requirements"] || ""
  );
  const [availabilityStatus, setAvailabilityStatus] = useState(
    request.availabilityStatus || request.details["Availability Status"] || ""
  );
  const [location, setLocation] = useState(
    request.location || request.details["Location"] || ""
  );
  const [requestingParty, setRequestingParty] = useState(
    request.requestingParty || request.details["Requesting Party"] || ""
  );
  const [address, setAddress] = useState(
    request.address || request.details["Address / Agency"] || ""
  );
  const [dateOfFootage, setDateOfFootage] = useState(
    request.dateOfFootage || request.details["Date of Footage"] || ""
  );
  const [timeOfFootage, setTimeOfFootage] = useState(
    request.timeOfFootage || request.details["Time of Footage"] || ""
  );
  const [purpose, setPurpose] = useState(
    request.purpose || request.details["Purpose"] || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateCctvFields(request.id, {
        requestType,
        requirements,
        availabilityStatus,
        location,
        requestingParty,
        address,
        dateOfFootage,
        timeOfFootage,
        purpose,
      });
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const selectCls =
    "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer";
  const labelCls =
    "text-xs font-semibold text-muted-foreground uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Edit CCTV Request & Status
            </h3>
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
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className={selectCls}
            >
              <option value="Playback Viewing Only">Playback Viewing Only</option>
              <option value="Export Surveillance Footage">
                Export Surveillance Footage
              </option>
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelCls}>CCTV Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelCls}>Requirements Label</label>
            <select
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className={selectCls}
            >
              <option value="">Select Requirements…</option>
              <option value="Valid ID">Valid ID</option>
              <option value="Police Request">Police Request</option>
              <option value="Contract/Plantilla">Contract/Plantilla</option>
              <option value="Storage Device (Optional)">
                Storage Device (Optional)
              </option>
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Availability Status</label>
            <select
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value)}
              className={selectCls}
            >
              <option value="">Select Status…</option>
              <option value="Footage Available">Footage Available</option>
              <option value="Footage Not Available">Footage Not Available</option>
              <option value="For Release">For Release</option>
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
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputCls}
            />
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
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 cursor-pointer font-bold"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Technician Edit Modal ─────────────────────────────────────────────────────
interface TechEditModalProps {
  request: SystemRequest;
  onClose: () => void;
}

function TechEditModal({ request, onClose }: TechEditModalProps) {
  const [findings, setFindings] = useState(request.technicianFindings ?? "");
  const [recommendation, setRecommendation] = useState(request.technicianRecommendation ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateRepairTechnicianFields(request.id, findings, recommendation);
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
        {/* Header */}
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

        {/* Findings */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
            Findings
          </label>
          <textarea
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            rows={4}
            placeholder="Enter technician findings..."
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Recommendation */}
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

        {/* Actions */}
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

// ── Main Table ────────────────────────────────────────────────────────────────
export function AdminRequestsTable({ initialRequests }: AdminRequestsTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "Repair" | "CCTV" | "Internet">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrintItem, setSelectedPrintItem] = useState<RequestPrintItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<SystemRequest | null>(null);
  const [cctvEditingRequest, setCctvEditingRequest] = useState<SystemRequest | null>(null);

  // Filter requests based on state
  const filteredRequests = initialRequests.filter((req) => {
    if (categoryFilter !== "ALL" && req.category !== categoryFilter) return false;
    if (statusFilter === "PENDING" && req.isApproved) return false;
    if (statusFilter === "APPROVED" && !req.isApproved) return false;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const matchSeries = req.seriesNo.toLowerCase().includes(term);
      const matchOffice = req.requestingOffice.toLowerCase().includes(term);
      const matchUser = req.requestedBy.toLowerCase().includes(term) || req.createdBy.email.toLowerCase().includes(term);
      return matchSeries || matchOffice || matchUser;
    }

    return true;
  });

  const handleToggleApproval = async (category: "Repair" | "CCTV" | "Internet", id: number) => {
    const typeKey = category === "Repair" ? "repair" : category === "CCTV" ? "cctv" : "internet";
    const key = `${typeKey}-${id}`;
    setLoadingId(key);
    try {
      await toggleRequestApproval(typeKey, id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (category: "Repair" | "CCTV" | "Internet", id: number) => {
    if (!confirm("Are you sure you want to delete this request record?")) return;
    const typeKey = category === "Repair" ? "repair" : category === "CCTV" ? "cctv" : "internet";
    try {
      await deleteRequest(typeKey, id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search series #, office, or requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                categoryFilter === "ALL" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setCategoryFilter("Repair")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                categoryFilter === "Repair" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Repair
            </button>
            <button
              onClick={() => setCategoryFilter("CCTV")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                categoryFilter === "CCTV" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CCTV
            </button>
            <button
              onClick={() => setCategoryFilter("Internet")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                categoryFilter === "Internet" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CCTV/Install
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                statusFilter === "ALL" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                statusFilter === "PENDING" ? "bg-amber-500/10 text-amber-600 font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                statusFilter === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <Filter className="size-8 mx-auto text-muted-foreground/50" />
            <p className="text-base font-semibold">No requests found matching your filter criteria.</p>
            <p className="text-xs">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
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
                {filteredRequests.map((req) => {
                  const key = `${req.category.toLowerCase()}-${req.id}`;
                  const isLoading = loadingId === key;
                  const hasFindings = req.technicianFindings || req.technicianRecommendation;

                  return (
                    <tr key={key} className="hover:bg-muted/30 transition-colors">
                      {/* Series No */}
                      <td className="p-4 font-mono text-xs font-bold text-foreground">
                        {req.seriesNo}
                      </td>

                      {/* Category Badge */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-border bg-background">
                          {req.category === "Repair" && <Wrench className="size-3.5 text-blue-500" />}
                          {req.category === "CCTV" && <Video className="size-3.5 text-purple-500" />}
                          {req.category === "Internet" && <Wifi className="size-3.5 text-emerald-500" />}
                          {req.category}
                        </span>
                      </td>

                      {/* Requesting Office */}
                      <td className="p-4 text-foreground font-medium">
                        {req.requestingOffice || "N/A"}
                      </td>

                      {/* Submitted By */}
                      <td className="p-4 text-xs">
                        <div className="font-semibold text-foreground">{req.createdBy.name || req.requestedBy}</div>
                        <div className="text-muted-foreground">{req.createdBy.email}</div>
                      </td>

                      {/* Approved By / Technician / Status */}
                      <td className="p-4 text-xs">
                        {req.category === "CCTV" && req.availabilityStatus ? (
                          <div className="text-purple-600 font-semibold">
                            {req.availabilityStatus}
                          </div>
                        ) : req.approvedBy ? (
                          <div className="text-emerald-600 font-semibold">
                            {req.approvedBy.name || req.approvedBy.email}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                        {/* Show indicator if findings exist */}
                        {req.category === "Repair" && hasFindings && (
                          <div className="mt-0.5 text-blue-500 text-[10px] font-medium">
                            ● Has findings
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {req.isApproved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 px-2.5 py-1 text-xs font-semibold">
                            <CheckCircle2 className="size-3.5" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 px-2.5 py-1 text-xs font-semibold">
                            <Clock className="size-3.5" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Status Button */}
                          <Button
                            size="sm"
                            variant={req.isApproved ? "outline" : "default"}
                            disabled={isLoading}
                            onClick={() => handleToggleApproval(req.category, req.id)}
                            className="cursor-pointer text-xs h-8 px-2.5"
                          >
                            {req.isApproved ? "Set Pending" : "Approve"}
                          </Button>

                          {/* Edit Technician Notes (Repair) */}
                          {req.category === "Repair" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingRequest(req)}
                              className="cursor-pointer text-xs h-8 px-2.5 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                          )}

                          {/* Edit CCTV Status & Fields (CCTV) */}
                          {req.category === "CCTV" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCctvEditingRequest(req)}
                              className="cursor-pointer text-xs h-8 px-2.5 gap-1 text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                          )}

                          {/* Export PDF Button */}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedPrintItem(req)}
                            className="cursor-pointer text-xs h-8 px-2.5 gap-1"
                          >
                            <Printer className="size-3.5" />
                            Export PDF
                          </Button>

                          {/* Delete Action */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(req.category, req.id)}
                            className="cursor-pointer text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF Export Modal */}
      <PrintableRequestModal
        item={selectedPrintItem}
        onClose={() => setSelectedPrintItem(null)}
      />

      {/* Technician Edit Modal (Repair) */}
      {editingRequest && (
        <TechEditModal
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
        />
      )}

      {/* CCTV Edit Modal (CCTV) */}
      {cctvEditingRequest && (
        <CctvEditModal
          request={cctvEditingRequest}
          onClose={() => setCctvEditingRequest(null)}
        />
      )}
    </div>
  );
}
