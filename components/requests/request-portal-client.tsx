"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RequestModal } from "./request-modal";

export interface UserRequestSummary {
	id: number;
	seriesNo: string;
	category: "Repair" | "CCTV" | "Internet";
	requestingOffice: string;
	date: string;
	isApproved: boolean;
	availabilityStatus?: string | null;
	details?: any;
}

interface RequestPortalClientProps {
	userRequests: UserRequestSummary[];
	defaultUserName: string;
	isAdmin?: boolean;
	defaultAdminName?: string;
}

export function RequestPortalClient({ userRequests = [], defaultUserName = "", isAdmin = false, defaultAdminName }: RequestPortalClientProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const [initialType, setInitialType] = useState<"Repair" | "CCTV" | "Internet" | null>("Repair");

	return (
		<>
			<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold">My Submitted Requests ({userRequests.length})</h3>
				<Button onClick={() => { setInitialType("Repair"); setModalOpen(true); }}>New Request</Button>
			</div>

			{/* Request Option Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
				{/* Repair */}
				<div className="rounded-xl border border-border bg-card p-4">
					<h4 className="font-semibold">Technical & Equipment Repair</h4>
					<p className="text-sm text-muted-foreground mt-2">Submit repair requests for equipment and hardware.</p>
					<div className="mt-4">
						<Button onClick={() => { setInitialType("Repair"); setModalOpen(true); }}>New Repair Request</Button>
					</div>
				</div>

				{/* CCTV */}
				<div className="rounded-xl border border-border bg-card p-4">
					<h4 className="font-semibold">CCTV Footage & Viewing</h4>
					<p className="text-sm text-muted-foreground mt-2">Request playback or export of CCTV footage.</p>
					<div className="mt-4">
						<Button onClick={() => { setInitialType("CCTV"); setModalOpen(true); }}>New CCTV Request</Button>
					</div>
				</div>

				{/* Internet */}
				<div className="rounded-xl border border-border bg-card p-4">
					<h4 className="font-semibold">CCTV/Internet Installation</h4>
					<p className="text-sm text-muted-foreground mt-2">Request installations or connectivity work.</p>
					<div className="mt-4">
						<Button onClick={() => { setInitialType("Internet"); setModalOpen(true); }}>New Installation Request</Button>
					</div>
				</div>
			</div>

			{userRequests.length === 0 ? (
				<div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
					<p className="text-sm">You haven't submitted any requests yet.</p>
				</div>
			) : (
				<div className="rounded-xl border border-border bg-card overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm border-collapse">
							<thead>
								<tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
									<th className="p-3">Series</th>
									<th className="p-3">Category</th>
									<th className="p-3">Office</th>
									<th className="p-3">Date</th>
									<th className="p-3">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{userRequests.map((r) => (
									<tr key={`${r.category}-${r.id}`}>
										<td className="p-3 font-mono text-xs font-bold">{r.seriesNo}</td>
										<td className="p-3 text-sm">{r.category}</td>
										<td className="p-3">{r.requestingOffice || "N/A"}</td>
										<td className="p-3 text-xs">{r.date}</td>
										<td className="p-3 text-sm">{r.isApproved ? "Approved" : "Pending"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
			</div>

			{modalOpen && (
				<RequestModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					initialType={initialType}
					defaultUserName={defaultUserName}
					isAdmin={isAdmin}
					defaultAdminName={defaultAdminName}
				/>
			)}
		</>
	);
}

export default RequestPortalClient;
