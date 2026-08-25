"use client";

import { useEffect } from "react";
import { WifiOff, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard network / server error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-lg space-y-6">
        <div className="size-16 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
          <WifiOff className="size-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Dashboard Connection Notice</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Admin Dashboard lost connection to the backend service. This can happen due to intermittent internet latency or server connection timeouts.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
          >
            <RefreshCw className="size-4" />
            Reload Dashboard Data
          </Button>
        </div>
      </div>
    </div>
  );
}
