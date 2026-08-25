"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileCode, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv, exportToExcel, exportToJson } from "@/lib/export-utils";
import type { SystemRequest } from "../admin-requests/types";

interface ExportDropdownProps {
  requests: SystemRequest[];
  label?: string;
}

export function ExportDropdown({ requests, label = "Export Data" }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateStr = new Date().toISOString().split("T")[0];

  const handleExportCsv = () => {
    exportToCsv(requests, `requests_export_${dateStr}.csv`);
    setIsOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(requests, `requests_export_${dateStr}.csv`);
    setIsOpen(false);
  };

  const handleExportJson = () => {
    exportToJson(requests, `requests_export_${dateStr}.json`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={requests.length === 0}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer gap-2 font-medium border-border hover:bg-accent text-foreground shadow-xs h-9 px-3"
      >
        <Download className="size-4 text-primary" />
        <span>{label}</span>
        <span className="ml-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-semibold">
          {requests.length}
        </span>
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in-50 zoom-in-95">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
            Export {requests.length} Record{requests.length === 1 ? "" : "s"}
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="size-4 text-emerald-600" />
            <div className="text-left">
              <div>Excel Spreadsheet (.csv)</div>
              <div className="text-[10px] text-muted-foreground">Formatted with UTF-8 BOM</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <FileText className="size-4 text-blue-600" />
            <div className="text-left">
              <div>CSV File (.csv)</div>
              <div className="text-[10px] text-muted-foreground">Standard comma-separated</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 transition-colors cursor-pointer"
          >
            <FileCode className="size-4 text-purple-600" />
            <div className="text-left">
              <div>JSON Data (.json)</div>
              <div className="text-[10px] text-muted-foreground">Structured raw objects</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
