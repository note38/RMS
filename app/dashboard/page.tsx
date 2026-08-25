import { redirect } from "next/navigation";
import { getOrSyncUser } from "@/lib/auth";
import { AdminRequestsTable } from "@/components/admin/AdminRequestsTable";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RequestStatsBar } from "@/components/dashboard/RequestStatsBar";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dbUser = await getOrSyncUser();

  if (!dbUser) redirect("/");
  // Allow both ADMIN and SUPERADMIN to access the dashboard
  if (dbUser.role !== "ADMIN" && dbUser.role !== "SUPERADMIN") redirect("/request-form");

  const { allRequests, counts, users } = await getDashboardData();
  const isSuperAdmin = dbUser.role === "SUPERADMIN";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader
        isSuperAdmin={isSuperAdmin}
        user={{ name: dbUser.name, email: dbUser.email, role: dbUser.role }}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 space-y-8">
        <WelcomeBanner />
        <RequestStatsBar counts={counts} />

        {/* Requests Table */}
        <AdminRequestsTable initialRequests={allRequests} />

        {/* Admin Toolbar: Users list (requesters only) */}
        <AdminToolbar users={users} />
      </main>
    </div>
  );
}
