"use client";

import { useState } from "react";
import { Wrench, Video, Wifi, FileCheck2, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestModal } from "./request-modal";

export interface UserRequestSummary {
  id: number;
  seriesNo: string;
  category: "Repair" | "CCTV" | "Internet";
  requestingOffice: string;
  date: string;
  isApproved: boolean;
}

interface RequestPortalClientProps {
  userRequests: UserRequestSummary[];
  defaultUserName: string;
  isAdmin?: boolean;
  defaultAdminName?: string;
}

export function RequestPortalClient({
  userRequests,
  defaultUserName,
  isAdmin = false,
  defaultAdminName = "",
}: RequestPortalClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFormType, setActiveFormType] = useState<"Repair" | "CCTV" | "Internet">("Repair");

  const openForm = (type: "Repair" | "CCTV" | "Internet") => {
    setActiveFormType(type);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Request Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Technical Repair Card */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors shadow-xs">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Wrench className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Technical & Equipment Repair
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Submit requests for computer equipment, printer repairs, hardware troubleshooting, or pre-inspection evaluations.
            </p>
          </div>
          <Button
            onClick={() => openForm("Repair")}
            className="w-full gap-2 cursor-pointer mt-4 font-bold"
          >
            <FileCheck2 className="size-4" />
            New Repair Request
          </Button>
        </div>

        {/* CCTV Request Card */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors shadow-xs">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Video className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              CCTV Footage & Viewing
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Request CCTV playback or video recording retrieval for office security, incident investigation, or verification.
            </p>
          </div>
          <Button
            onClick={() => openForm("CCTV")}
            className="w-full gap-2 cursor-pointer mt-4 font-bold"
          >
            <FileCheck2 className="size-4" />
            New CCTV Request
          </Button>
        </div>

        {/* Internet Request Card */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors shadow-xs">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Wifi className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              CCTV/Internet Installation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Request CCTV installation, new internet line setup, check-up/repair, or additional connectivity for your office.
            </p>
          </div>
          <Button
            onClick={() => openForm("Internet")}
            className="w-full gap-2 cursor-pointer mt-4 font-bold"
          >
            <FileCheck2 className="size-4" />
            New Installation Request
          </Button>
        </div>
      </div>

      {/* User's Submitted Requests Table */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileCheck2 className="size-5 text-primary" />
          My Submitted Requests ({userRequests.length})
        </h3>

        {userRequests.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <p className="text-sm font-medium">You haven't submitted any requests yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click one of the request cards above to fill out an official service request.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                    <th className="p-4">Series No.</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Requesting Office</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {userRequests.map((req) => (
                    <tr key={`${req.category}-${req.id}`} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-xs font-bold text-foreground">
                        {req.seriesNo}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-border bg-background">
                          {req.category === "Repair" && <Wrench className="size-3.5 text-blue-500" />}
                          {req.category === "CCTV" && <Video className="size-3.5 text-purple-500" />}
                          {req.category === "Internet" && <Wifi className="size-3.5 text-emerald-500" />}
                          {req.category}
                        </span>
                      </td>
                      <td className="p-4 text-foreground font-medium">
                        {req.requestingOffice || "N/A"}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">{req.date}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {modalOpen && (
        <RequestModal
          isOpen={modalOpen}
          initialType={activeFormType}
          onClose={() => setModalOpen(false)}
          defaultUserName={defaultUserName}
          isAdmin={isAdmin}
          defaultAdminName={defaultAdminName || defaultUserName}
        />
      )}
    </div>
  );
}
