import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrSyncUser } from "@/lib/auth";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { Wrench, Video, Wifi, Users, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminRequestsTable, SystemRequest } from "@/components/admin/admin-requests-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";

export default async function DashboardPage() {
  const dbUser = await getOrSyncUser();

  if (!dbUser) redirect("/");
  if (dbUser.role !== "ADMIN") redirect("/request-form");

  const [repairs, cctvs, internets, allUsers] = await Promise.all([
    prisma.repairRequest.findMany({
      include: { createdBy: true, approvedBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cctvRequest.findMany({
      include: { createdBy: true, approvedBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.internetRequest.findMany({
      include: { createdBy: true, approvedBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
      orderBy: { id: "asc" },
    }),
  ]);

  const normalizedRepairs: SystemRequest[] = repairs.map((item) => ({
    id: item.id,
    seriesNo: item.seriesNo,
    category: "Repair",
    requestingOffice: item.requestingOffice,
    requestedBy: item.requestedBy || item.createdBy.name || item.createdBy.email,
    date: new Date(item.createdAt).toLocaleDateString(),
    isApproved: Boolean(item.approvedById),
    createdBy: { id: item.createdBy.id, name: item.createdBy.name, email: item.createdBy.email },
    approvedBy: item.approvedBy
      ? { id: item.approvedBy.id, name: item.approvedBy.name, email: item.approvedBy.email }
      : null,
    details: {
      "Requested By":    item.requestedBy,
      "Equipment Type":  item.equipmentType,
      "Brand Name":      item.brandName,
      "Model Number":    item.modelNo,
      "Serial Number":   item.serialNo,
      "Property Number": item.propertyNo,
      "Nature of Repair": item.natureOfRepair,
      "Action Type":     item.actionType,
      "Pre-Inspection":  item.preInspection,
      "Technician":      item.preRecommendation, // repurposed field
    },
  }));

  const normalizedCctvs: SystemRequest[] = cctvs.map((item) => ({
    id: item.id,
    seriesNo: item.seriesNo,
    category: "CCTV",
    requestingOffice: item.requestingOffice,
    requestedBy: item.requestedBy || item.createdBy.name || item.createdBy.email,
    date: new Date(item.createdAt).toLocaleDateString(),
    isApproved: Boolean(item.approvedById),
    createdBy: { id: item.createdBy.id, name: item.createdBy.name, email: item.createdBy.email },
    approvedBy: item.approvedBy
      ? { id: item.approvedBy.id, name: item.approvedBy.name, email: item.approvedBy.email }
      : null,
    details: {
      "Request Type":     item.requestType,
      Location:           item.location,
      "Requesting Party": item.requestingParty,
      Address:            item.address,
      Purpose:            item.purpose,
      "Date of Footage":  item.dateOfFootage,
      "Time of Footage":  item.timeOfFootage,
    },
  }));

  const normalizedInternets: SystemRequest[] = internets.map((item) => ({
    id: item.id,
    seriesNo: item.seriesNo,
    category: "Internet",
    requestingOffice: item.requestingOffice,
    requestedBy: item.requestedBy || item.createdBy.name || item.createdBy.email,
    date: new Date(item.createdAt).toLocaleDateString(),
    isApproved: Boolean(item.approvedById),
    createdBy: { id: item.createdBy.id, name: item.createdBy.name, email: item.createdBy.email },
    approvedBy: item.approvedBy
      ? { id: item.approvedBy.id, name: item.approvedBy.name, email: item.approvedBy.email }
      : null,
    details: {
      "Requested By":    item.requestedBy,
      Location:          item.location,
      "Nature of Request": item.natureOfRepair,
      Purpose:           item.purpose,
    },
  }));

  const allRequests: SystemRequest[] = [
    ...normalizedRepairs,
    ...normalizedCctvs,
    ...normalizedInternets,
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
                Admin Command Center
              </h1>
              <p className="text-xs text-muted-foreground">
                MIS &amp; CCTV Request Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
                <Home className="size-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            {/* Routes "Manage account" to our custom /account page */}
            <UserButton userProfileUrl="/account" userProfileMode="navigation" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Request Management Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Review, approve, and manage official requests or export PDF reports.
            </p>
          </div>
          <Link href="/request-form">
            <Button className="gap-2 cursor-pointer font-semibold">
              <FileText className="size-4" />
              Open Request Form
            </Button>
          </Link>
        </div>

        {/* System Stats Bar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Technical Repairs</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{repairs.length}</h3>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-600">
              <Wrench className="size-6" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">CCTV Footage Requests</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{cctvs.length}</h3>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-3 text-purple-600">
              <Video className="size-6" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Installation Requests</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{internets.length}</h3>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-600">
              <Wifi className="size-6" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registered Users</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{allUsers.length}</h3>
            </div>
            <div className="rounded-lg bg-orange-500/10 p-3 text-orange-600">
              <Users className="size-6" />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <AdminRequestsTable initialRequests={allRequests} />

        {/* Admin Toolbar: Backup/Restore + User Management */}
        <AdminToolbar users={allUsers} />
      </main>
    </div>
  );
}
