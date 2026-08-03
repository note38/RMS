import { redirect } from "next/navigation";
import { getOrSyncUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserHeaderMenu } from "@/components/navigation/user-header-menu";
import { Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuperAdminPanel } from "@/components/admin/super-admin-panel";

export default async function SuperAdminPage() {
  const dbUser = await getOrSyncUser();

  if (!dbUser) redirect("/");
  if (dbUser.role !== "SUPERADMIN") redirect("/dashboard");

  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { id: "asc" },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="RMS" width={40} height={40} />
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                Super Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground">
                User management &amp; system backup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
                <LayoutDashboard className="size-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
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
        {/* Page Title */}
        <div className="border-b border-border pb-6">
          <h2 className="text-2xl font-bold text-foreground">Super Admin Control Panel</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin users, configure roles, and handle system backup &amp; restore.
          </p>
        </div>

        <SuperAdminPanel users={allUsers} />
      </main>
    </div>
  );
}
