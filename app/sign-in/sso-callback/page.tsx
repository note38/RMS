import { Suspense } from "react";
import { SsoCallbackClient } from "./sso-callback-client";

/**
 * Finishes the Google OAuth hand-off after the provider redirects back.
 * The actual work runs client-side (`AuthenticateWithRedirectCallback`);
 * it is wrapped in Suspense because it reads `redirect_url` via useSearchParams.
 */
export default function SsoCallbackPage() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Suspense fallback={null}>
        <SsoCallbackClient />
      </Suspense>
    </div>
  );
}
