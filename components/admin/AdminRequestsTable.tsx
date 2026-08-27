"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleRequestApproval, deleteRequest } from "@/lib/actions";
import { PrintableRequestModal } from "./export/PrintableRequestModal";
import type { RequestPrintItem } from "./export/types";
import { RequestsControlsBar } from "./admin-requests/RequestsControlsBar";
import { RequestsTable } from "./admin-requests/RequestsTable";
import { PaginationBar } from "./admin-requests/PaginationBar";
import { ApprovalStatusModal } from "./admin-requests/ApprovalStatusModal";
import { CctvEditModal } from "./admin-requests/CctvEditModal";
import { TechEditModal } from "./admin-requests/TechEditModal";
import { InternetEditModal } from "./admin-requests/InternetEditModal";
import { DeleteRequestModal } from "./admin-requests/DeleteRequestModal";
import { useRequestFilters } from "./admin-requests/useRequestFilters";
import { categoryToTypeKey } from "./admin-requests/types";
import type { SystemRequest, RequestCategory } from "./admin-requests/types";

interface AdminRequestsTableProps {
  initialRequests: SystemRequest[];
}

export function AdminRequestsTable({ initialRequests }: AdminRequestsTableProps) {
  const router = useRouter();
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
  const [internetEditingRequest, setInternetEditingRequest] = useState<SystemRequest | null>(null);
  const [approvalModalRequest, setApprovalModalRequest] = useState<SystemRequest | null>(null);
  const [deleteTargetRequest, setDeleteTargetRequest] = useState<SystemRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleApproval = async (category: RequestCategory, id: number, status?: string) => {
    const key = `${categoryToTypeKey(category)}-${id}`;
    setLoadingId(key);
    try {
      const res = await toggleRequestApproval(categoryToTypeKey(category), id, status);
      if (res && !res.success && res.error) {
        alert(res.error);
      }
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to toggle approval.");
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

  const confirmDelete = async () => {
    if (!deleteTargetRequest) return;
    setIsDeleting(true);
    try {
      const res = await deleteRequest(categoryToTypeKey(deleteTargetRequest.category), deleteTargetRequest.id);
      if (res && !res.success && res.error) {
        alert(res.error);
      } else {
        setDeleteTargetRequest(null);
      }
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete request.");
    } finally {
      setIsDeleting(false);
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
          onEditInternet={setInternetEditingRequest}
          onExportPdf={setSelectedPrintItem}
          onDelete={setDeleteTargetRequest}
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

      {internetEditingRequest && (
        <InternetEditModal request={internetEditingRequest} onClose={() => setInternetEditingRequest(null)} />
      )}

      {deleteTargetRequest && (
        <DeleteRequestModal
          request={deleteTargetRequest}
          onClose={() => setDeleteTargetRequest(null)}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
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
