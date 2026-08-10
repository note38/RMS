"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type SVGProps,
} from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

/** Post-sign-in destination when no usable `redirect_url` param is present. */
const DEFAULT_REDIRECT = "/sync";

/** Shared input styling — matches the rest of the app. */
const inputClass =
  "w-full rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition px-3 py-2 text-center";

/** Shared primary-button styling. */
const buttonClass =
  "w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-bold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-center cursor-pointer";

/** Outline button for the Google OAuth option. */
const googleButtonClass =
  "w-full rounded-lg border border-border bg-background text-foreground py-2 text-sm font-medium hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer";

/** Official Google "G" mark, used on the OAuth button. */
function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/** Pulls a human-readable message out of a Clerk error. */
function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const e = error as { longMessage?: unknown; message?: unknown };
    if (typeof e.longMessage === "string") return e.longMessage;
    if (typeof e.message === "string") return e.message;
  }
  return "Something went wrong. Please try again.";
}

/**
 * Fully custom sign-in flow — no Clerk UI, no Clerk branding.
 *   Step 1 (email): Clerk emails a 6-digit verification code.
 *   Step 2 (code):  the code is verified and the session is activated.
 *
 * Uses the Signal-based `SignInFuture` resource from `useSignIn`
 * (`emailCode.sendCode` → `emailCode.verifyCode` → `finalize`).
 */
export function SignInForm() {
  const { signIn } = useSignIn();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();


  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Focus the active field whenever the step changes.
  useEffect(() => {
    (step === "email" ? emailInputRef : codeInputRef).current?.focus();
  }, [step]);

  // Resolve the post-sign-in redirect, ignoring any external URLs.
  // (This component only renders on the client — Suspense wraps it — so
  // referencing `window` during render is safe.)
  const redirectUrl = (() => {
    const redirectParam = searchParams.get("redirect_url");
    if (redirectParam) {
      try {
        // Relative URLs can be used directly.
        if (redirectParam.startsWith("/")) return redirectParam;
        // Absolute URLs are only honored when they point at this origin.
        const url = new URL(
          decodeURIComponent(redirectParam),
          window.location.origin
        );
        if (url.origin === window.location.origin) return url.pathname;
        // External redirects are ignored for security.
      } catch {
        // Malformed URL — fall through to the default redirect.
      }
    }
    return DEFAULT_REDIRECT;
  })();

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      // Route that completes the OAuth flow (mounts <AuthenticateWithRedirectCallback />).
      // The `redirect_url` param survives the round-trip so the user lands where they intended.
      const callbackUrl = `${window.location.origin}/sign-in/sso-callback?redirect_url=${encodeURIComponent(
        redirectUrl
      )}`;
      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: callbackUrl,
        // If Google needs additional steps, return to the sign-in page.
        redirectCallbackUrl: "/sign-in",
      });
      if (error) setError(getErrorMessage(error));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signIn) return;

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      // Sends the verification code immediately.
      const { error } = await signIn.emailCode.sendCode({
        emailAddress: trimmed,
      });
      if (error) {
        setError(getErrorMessage(error));
        return;
      }
      setEmail(trimmed);
      setStep("code");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signIn) return;

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Enter the code from your email.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const { error } = await signIn.emailCode.verifyCode({ code: trimmedCode });
      if (error) {
        setError(getErrorMessage(error));
        return;
      }
      if (signIn.status === "complete") {
        // Activates the session, then routes to the portal with full cookie delivery.
        const { error: finalizeError } = await signIn.finalize({
          navigate: ({ decorateUrl }) =>
            window.location.assign(decorateUrl(redirectUrl)),
        });
        if (finalizeError) setError(getErrorMessage(finalizeError));
      } else {
        setError(
          "Almost there — an additional verification step is required. Please try again or contact the administrator."
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!signIn || !email) return;
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const { error } = await signIn.emailCode.sendCode({ emailAddress: email });
      if (error) {
        setError(getErrorMessage(error));
      } else {
        setNotice("A new code was sent to your email.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToEmail = async () => {
    await signIn?.reset();
    setStep("email");
    setCode("");
    setError(null);
    setNotice(null);
  };

  // Redirect away if already signed in (full page navigation ensures server reads session cookies)
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      window.location.assign(redirectUrl);
    }
  }, [isUserLoaded, isSignedIn, redirectUrl]);

  if (!signIn || (isUserLoaded && isSignedIn)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
        <Loader2 className="size-5 animate-spin text-primary" />
        <p>{isSignedIn ? "Redirecting..." : "Loading..."}</p>
      </div>
    );
  }


  return (
    <div className="space-y-4">
      {error && (
        <p
          role="alert"
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center"
        >
          {error}
        </p>
      )}

      {step === "email" ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className={googleButtonClass}
          >
            <GoogleIcon className="size-4 shrink-0" />
            Continue with Google
          </button>

          <div
            className="flex items-center gap-3 text-xs text-muted-foreground"
            aria-hidden="true"
          >
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
            <input
              ref={emailInputRef}
              type="email"
              name="identifier"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Work email address"
              className={inputClass}
            />
            <button type="submit" disabled={isSubmitting} className={buttonClass}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Send verification code
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleCodeSubmit} noValidate className="space-y-4">
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium text-foreground">Check your email</p>
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>

          {notice && (
            <p className="text-xs text-center text-emerald-600">{notice}</p>
          )}

          <input
            ref={codeInputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="••••••"
            className={inputClass}
          />

          <button type="submit" disabled={isSubmitting} className={buttonClass}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={backToEmail}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              Use a different email
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={isSubmitting}
              className="font-medium text-primary hover:opacity-80 transition-opacity cursor-pointer"
            >
              Resend code
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
