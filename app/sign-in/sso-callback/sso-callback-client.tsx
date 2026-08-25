"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

/** Completes the Google OAuth callback and forwards to the portal. */
export function SsoCallbackClient() {

  return (
    <div className="w-full max-w-sm flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="text-sm font-medium">Completing sign in&hellip;</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
