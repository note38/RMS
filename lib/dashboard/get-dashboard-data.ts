import { prisma } from "@/lib/prisma";
import type { SystemRequest } from "@/components/admin/admin-requests/types";
import { normalizeRepair, normalizeCctv, normalizeInternet } from "./normalizers";
import { unstable_cache } from "next/cache";

export interface DashboardCounts {
  repairs: number;
  cctvs: number;
  internets: number;
}

export interface DashboardUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface DashboardData {
  allRequests: SystemRequest[];
  counts: DashboardCounts;
  users: DashboardUser[];
}

/**
 * Raw data fetcher retrieving all requests for export & pagination
 */
async function fetchDashboardData(): Promise<DashboardData> {
  const repairs = await prisma.repairRequest.findMany({
    include: { createdBy: true, approvedBy: true },
    orderBy: { createdAt: "desc" },
  });
  const cctvs = await prisma.cctvRequest.findMany({
    include: { createdBy: true, approvedBy: true },
    orderBy: { createdAt: "desc" },
  });
  const internets = await prisma.internetRequest.findMany({
    include: { createdBy: true, approvedBy: true },
    orderBy: { createdAt: "desc" },
  });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { id: "asc" },
  });

  const allRequests = [
    ...repairs.map(normalizeRepair),
    ...cctvs.map(normalizeCctv),
    ...internets.map(normalizeInternet),
  ]
    .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
    .map((n) => n.request);

  return {
    allRequests,
    counts: { repairs: repairs.length, cctvs: cctvs.length, internets: internets.length },
    users,
  };
}

/**
 * Cached version of getDashboardData using Next.js unstable_cache
 */
export const getDashboardData = unstable_cache(
  async () => fetchDashboardData(),
  ["admin-dashboard-data-v2"],
  {
    revalidate: 30, // Revalidate cache every 30 seconds
    tags: ["dashboard-data"],
  }
);
