import { useEffect, useMemo, useState } from "react";
import type { CategoryFilter, StatusFilter, SystemRequest } from "./types";

const ITEMS_PER_PAGE = 5;

export function useRequestFilters(initialRequests: SystemRequest[]) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRequests = useMemo(() => {
    return initialRequests.filter((req) => {
      if (categoryFilter !== "ALL" && req.category !== categoryFilter) return false;
      if (statusFilter === "PENDING" && req.isApproved) return false;
      if (statusFilter === "APPROVED" && !req.isApproved) return false;

      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchSeries = req.seriesNo.toLowerCase().includes(term);
        const matchOffice = req.requestingOffice.toLowerCase().includes(term);
        const matchUser =
          req.requestedBy.toLowerCase().includes(term) || req.createdBy.email.toLowerCase().includes(term);
        return matchSeries || matchOffice || matchUser;
      }

      return true;
    });
  }, [initialRequests, categoryFilter, statusFilter, searchTerm]);

  // Reset to page 1 whenever the active filters change.
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, searchTerm]);

  const paginatedRequests = useMemo(
    () => filteredRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredRequests, currentPage]
  );

  return {
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    filteredRequests,
    paginatedRequests,
  };
}
