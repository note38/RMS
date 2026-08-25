import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserHeaderMenu } from "@/components/navigation/user-header-menu";

interface DashboardHeaderProps {
  isSuperAdmin: boolean;
  user: {
    name: string | null;
    email: string;
    role: string;
  };
}

export function DashboardHeader({ isSuperAdmin, user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MIS/CCTV Command Center" width={40} height={40} />
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">
              {isSuperAdmin ? "Super Admin Command Center" : "Admin Command Center"}
            </h1>
            <p className="text-xs text-muted-foreground">MIS &amp; CCTV Request Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Link href="/super-admin">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 cursor-pointer border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <ShieldCheck className="size-4" />
                <span className="hidden sm:inline">Super Admin</span>
              </Button>
            </Link>
          )}
          <UserHeaderMenu initialUser={user} />
        </div>
      </div>
    </header>
  );
}
