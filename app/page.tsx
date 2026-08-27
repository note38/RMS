import { getOrSyncUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import type { SystemRequest } from "@/components/admin/admin-requests/types";

export const dynamic = 'force-dynamic';
export default async function Page() {
  const dbUser = await getOrSyncUser();
  if (dbUser) {
    redirect("/sync");
  }

  let recentRequests: SystemRequest[] = [];
  try {
    const data = await getDashboardData();
    recentRequests = data.allRequests.slice(0, 3);
  } catch (error) {
    console.error("Failed to load dashboard data for hero preview:", error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero recentRequests={recentRequests} />
      </main>
    </div>
  );
}
