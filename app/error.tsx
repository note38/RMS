"use client";

import { useEffect } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Application runtime / network error captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-lg space-y-6 animate-in fade-in-50 zoom-in-95">
        <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <WifiOff className="size-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Connection &amp; Network Notice</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The system encountered a network connection interruption while reaching the authentication server or database. Please verify your internet connection and try again.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
          >
            <RefreshCw className="size-4" />
            Retry Connection
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2 cursor-pointer border-border">
              <Home className="size-4" />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
