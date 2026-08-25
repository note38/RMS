"use client";

import { useState } from "react";
import { toggleRequestApproval, deleteRequest } from "@/lib/actions";
import { PrintableRequestModal } from "./export/PrintableRequestModal";
import type { RequestPrintItem } from "./export/types";
import { RequestsControlsBar } from "./admin-requests/RequestsControlsBar";
import { RequestsTable } from "./admin-requests/RequestsTable";
import { PaginationBar } from "./admin-requests/PaginationBar";
import { ApprovalStatusModal } from "./admin-requests/ApprovalStatusModal";
import { CctvEditModal } from "./admin-requests/CctvEditModal";
import { TechEditModal } from "./admin-requests/TechEditModal";
import { useRequestFilters } from "./admin-requests/useRequestFilters";
import { categoryToTypeKey } from "./admin-requests/types";
import type { SystemRequest, RequestCategory } from "./admin-requests/types";

interface AdminRequestsTableProps {
  initialRequests: SystemRequest[];
}

export function AdminRequestsTable({ initialRequests }: AdminRequestsTableProps) {
  const {
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredRequests,
    paginatedRequests,
  } = useRequestFilters(initialRequests);

  const [selectedPrintItem, setSelectedPrintItem] = useState<RequestPrintItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<SystemRequest | null>(null);
  const [cctvEditingRequest, setCctvEditingRequest] = useState<SystemRequest | null>(null);
  const [approvalModalRequest, setApprovalModalRequest] = useState<SystemRequest | null>(null);

  const handleToggleApproval = async (category: RequestCategory, id: number, status?: string) => {
    const key = `${categoryToTypeKey(category)}-${id}`;
    setLoadingId(key);
    try {
      await toggleRequestApproval(categoryToTypeKey(category), id, status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
      setApprovalModalRequest(null);
    }
  };

  const handleApproveClick = (req: SystemRequest) => {
    if (req.category === "CCTV" && !req.isApproved) {
      setApprovalModalRequest(req);
    } else {
      handleToggleApproval(req.category, req.id);
    }
  };

  const handleDelete = async (req: SystemRequest) => {
    if (!confirm("Are you sure you want to delete this request record?")) return;
    try {
      await deleteRequest(categoryToTypeKey(req.category), req.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <RequestsControlsBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        exportRequests={filteredRequests}
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <RequestsTable
          requests={paginatedRequests}
          loadingId={loadingId}
          onApproveClick={handleApproveClick}
          onEditRepair={setEditingRequest}
          onEditCctv={setCctvEditingRequest}
          onExportPdf={setSelectedPrintItem}
          onDelete={handleDelete}
        />

        {filteredRequests.length > itemsPerPage && (
          <PaginationBar
            currentPage={currentPage}
            totalItems={filteredRequests.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <PrintableRequestModal item={selectedPrintItem} onClose={() => setSelectedPrintItem(null)} />

      {editingRequest && (
        <TechEditModal request={editingRequest} onClose={() => setEditingRequest(null)} />
      )}

      {cctvEditingRequest && (
        <CctvEditModal request={cctvEditingRequest} onClose={() => setCctvEditingRequest(null)} />
      )}

      {approvalModalRequest && (
        <ApprovalStatusModal
          onCancel={() => setApprovalModalRequest(null)}
          onConfirm={(status) => handleToggleApproval(approvalModalRequest.category, approvalModalRequest.id, status)}
          isSubmitting={!!loadingId}
        />
      )}
    </div>
  );
}
