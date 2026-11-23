"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const DEFAULT_REDIRECT = "/sync";

function getRedirectUrl(param: string | null): string {
  if (param) {
    try {
      if (param.startsWith("/") && !param.startsWith("//")) {
        return param;
      }
      if (typeof window !== "undefined") {
        const url = new URL(decodeURIComponent(param), window.location.origin);
        if (url.origin === window.location.origin) {
          return `${url.pathname}${url.search}`;
        }
      }
    } catch {
      // fall through
    }
  }
  return DEFAULT_REDIRECT;
}

/** Completes the Google OAuth callback and forwards to the portal. */
export function SsoCallbackClient() {
  const searchParams = useSearchParams();
  const redirectUrl = getRedirectUrl(searchParams.get("redirect_url"));

  return (
    <div className="w-full max-w-sm flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="text-sm font-medium">Completing sign in&hellip;</p>
      </div>
      <div id="clerk-captcha" className="flex justify-center" />
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={redirectUrl}
        signUpFallbackRedirectUrl={redirectUrl}
        continueSignUpUrl={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
      />
    </div>
  );
}
