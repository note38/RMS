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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleRequestApproval, deleteRequest } from "@/lib/actions";
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
}

interface AdminRequestsTableProps {
  initialRequests: SystemRequest[];
}

export function AdminRequestsTable({ initialRequests }: AdminRequestsTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "Repair" | "CCTV" | "Internet">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrintItem, setSelectedPrintItem] = useState<RequestPrintItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
                  <th className="p-4">Technician</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((req) => {
                  const key = `${req.category.toLowerCase()}-${req.id}`;
                  const isLoading = loadingId === key;

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

                      {/* Approved By Relation */}
                      <td className="p-4 text-xs">
                        {req.approvedBy ? (
                          <div className="text-emerald-600 font-semibold">
                            {req.approvedBy.name || req.approvedBy.email}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
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
    </div>
  );
}
