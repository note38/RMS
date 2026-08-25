import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden">

      {/* ── Decorative background accents ───────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -right-48 size-120 rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-amber-500/5 blur-3xl"
      />

      {/* ── Branded wrapper card (no shadow — Clerk is blended into it) ── */}
      <div
        className="relative w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border bg-card text-card-foreground"
        style={{ boxShadow: "none" }}
      >
        {/* ── Branding header (inside the card) ─────────────────────── */}
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex justify-center mb-2">
            <div className="size-16 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="MIS / CCTV Command Center Logo"
                className="size-10 object-contain"
              />
            </div>
          </div>
          <h1 className="font-semibold leading-none tracking-tight text-2xl text-center">
            MIS / CCTV Command Center
          </h1>
          <div className="text-sm text-muted-foreground text-center">
            Request Management System — Provincial Government of Aurora
          </div>
        </div>

        {/* ── Clerk SignIn — transparent inside the wrapper card ─────── */}
        <div className="px-6 pb-6">
          <Suspense fallback={<SignInFallback />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <p className="relative mt-8 text-[11px] text-muted-foreground/50 tracking-wide">
        &copy; {new Date().getFullYear()} Provincial Government of Aurora
      </p>
    </div>
  );

}

/** Skeleton shown while the form (which reads search params) hydrates. */
function SignInFallback() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden>
      <div className="h-11 w-full rounded-lg bg-muted" />
      <div className="h-11 w-full rounded-lg bg-muted" />
      <div className="h-11 w-full rounded-lg bg-muted" />
    </div>
  );
}
