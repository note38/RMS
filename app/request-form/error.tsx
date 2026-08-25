"use client";

import { useEffect } from "react";
import { WifiOff, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RequestFormError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Request Form network / server error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-lg space-y-6">
        <div className="size-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
          <WifiOff className="size-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Request Portal Connection Notice</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We are experiencing temporary network delays connecting to the server. Your submitted data is safe. Please check your network and retry.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
          >
            <RefreshCw className="size-4" />
            Retry Portal Connection
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2 cursor-pointer border-border">
              <ArrowLeft className="size-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
