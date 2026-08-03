"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Post-sign-in destination when no usable `redirect_url` param is present. */
const DEFAULT_REDIRECT = "/sync";

/** Resolves a same-origin `redirect_url` param, ignoring external URLs. */
function getRedirectUrl(param: string | null): string {
  if (param) {
    try {
      // Relative URLs can be used directly.
      if (param.startsWith("/")) return param;
      // Absolute URLs are only honored when they point at this origin.
      const url = new URL(decodeURIComponent(param), window.location.origin);
      if (url.origin === window.location.origin) return url.pathname;
      // External redirects are ignored for security.
    } catch {
      // Malformed URL — fall through to the default redirect.
    }
  }
  return DEFAULT_REDIRECT;
}

/** Completes the Google OAuth callback and forwards to the portal. */
export function SsoCallbackClient() {
  const searchParams = useSearchParams();
  const redirectUrl = getRedirectUrl(searchParams.get("redirect_url"));

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
        <Loader2 className="size-7 animate-spin" />
        <p className="text-sm">Loading&hellip;</p>
      </div>
      {/* signIn AND signUp fallbacks — a first-time Google user's OAuth
          completes as a sign-up, which resolves against the signUp URL. */}
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl={redirectUrl}
        signUpForceRedirectUrl={redirectUrl}
        signInFallbackRedirectUrl={redirectUrl}
        signUpFallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}
