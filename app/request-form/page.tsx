import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrSyncUser } from "@/lib/auth";
import { UserHeaderMenu } from "@/components/navigation/user-header-menu";
import { prisma } from "@/lib/prisma";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestPortalClient, UserRequestSummary } from "@/components/requests/request-portal-client";

export const dynamic = 'force-dynamic';
export default async function RequestFormPage() {
  const dbUser = await getOrSyncUser();

  if (!dbUser) {
    redirect("/");
  }

  // Fetch only requests created by this logged-in user
  const [repairs, cctvs, internets] = await Promise.all([
    prisma.repairRequest.findMany({
      where: { createdById: dbUser.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cctvRequest.findMany({
      where: { createdById: dbUser.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.internetRequest.findMany({
      where: { createdById: dbUser.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const userRequests: UserRequestSummary[] = [
    ...repairs.map((r) => ({
      id: r.id,
      seriesNo: r.seriesNo,
      category: "Repair" as const,
      requestingOffice: r.requestingOffice,
      date: new Date(r.createdAt).toLocaleDateString(),
      isApproved: Boolean(r.approvedById),
    })),
    ...cctvs.map((c) => ({
      id: c.id,
      seriesNo: c.seriesNo,
      category: "CCTV" as const,
      requestingOffice: c.requestingOffice,
      date: new Date(c.createdAt).toLocaleDateString(),
      isApproved: Boolean(c.approvedById),
    })),
    ...internets.map((i) => ({
      id: i.id,
      seriesNo: i.seriesNo,
      category: "Internet" as const,
      requestingOffice: i.requestingOffice,
      date: new Date(i.createdAt).toLocaleDateString(),
      isApproved: Boolean(i.approvedById),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MIS/CCTV Command Center" width={40} height={40} />
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                Request Management Portal
              </h1>
              <p className="text-xs text-muted-foreground">
                Provincial Government of Aurora
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(dbUser.role === "ADMIN" || dbUser.role === "SUPERADMIN") && (
              <Link href="/dashboard">
                <Button variant="default" size="sm" className="gap-1.5 cursor-pointer font-semibold">
                  <ArrowLeft className="size-4" />
                  Admin Dashboard
                </Button>
              </Link>
            )}

            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
                <Home className="size-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>

            <UserHeaderMenu
              initialUser={{
                name: dbUser.name,
                email: dbUser.email,
                role: dbUser.role,
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 space-y-8">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Submit a Request, {dbUser.name || "User"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select the service type below to initiate an official MIS or CCTV request.
          </p>
        </div>

        {/* Client Requests Portal */}
        <RequestPortalClient
          userRequests={userRequests}
          defaultUserName={dbUser.name || ""}
          isAdmin={dbUser.role === "ADMIN" || dbUser.role === "SUPERADMIN"}
          defaultAdminName={dbUser.name || ""}
        />
      </main>
    </div>
  );
}
