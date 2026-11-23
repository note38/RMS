"use client";

import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useSearchParams } from "next/navigation";
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

const inputClass =
  "w-full rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition px-3 py-2 text-center";

const buttonClass =
  "w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-bold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-center cursor-pointer";

const googleButtonClass =
  "w-full rounded-lg border border-border bg-background text-foreground py-2 text-sm font-medium hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer";

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function getErrorMessage(error: unknown): string {
  if (isClerkAPIResponseError(error) && error.errors.length > 0) {
    const first = error.errors[0];
    if (first.code === "captcha_invalid" || first.code === "captcha_unavailable") {
      return "Security verification failed. If you are using a VPN, proxy, or ad blocker, try disabling it, refresh the page, and try again.";
    }
    return first.longMessage || first.message || "Something went wrong. Please try again.";
  }
  if (typeof error === "object" && error !== null) {
    const e = error as {
      errors?: Array<{ longMessage?: string; message?: string }>;
      longMessage?: unknown;
      message?: unknown;
    };
    if (Array.isArray(e.errors) && e.errors.length > 0) {
      return e.errors[0].longMessage || e.errors[0].message || "Something went wrong. Please try again.";
    }
    if (typeof e.longMessage === "string") return e.longMessage;
    if (typeof e.message === "string") return e.message;
  }
  return "Something went wrong. Please try again.";
}

export function SignInForm() {
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"email" | "code">("email");
  const [authFlow, setAuthFlow] = useState<"signIn" | "signUp">("signIn");
  const [signInEmailAddressId, setSignInEmailAddressId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (step === "email" ? emailInputRef : codeInputRef).current?.focus();
  }, [step]);

  const redirectUrl = (() => {
    const redirectParam = searchParams.get("redirect_url");
    if (redirectParam) {
      try {
        if (redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
          return redirectParam;
        }
        const url = new URL(decodeURIComponent(redirectParam), window.location.origin);
        if (url.origin === window.location.origin) {
          return `${url.pathname}${url.search}`;
        }
      } catch {
        // fall through
      }
    }
    return DEFAULT_REDIRECT;
  })();

  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      window.location.assign(redirectUrl);
    }
  }, [isUserLoaded, isSignedIn, redirectUrl]);

  const handleGoogleSignIn = async () => {
    if (!signInLoaded || !signIn) {
      return;
    }
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const callbackUrl = `${window.location.origin}/sign-in/sso-callback?redirect_url=${encodeURIComponent(redirectUrl)}`;
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: callbackUrl,
        redirectUrlComplete: redirectUrl,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signInLoaded || !signIn || !signUpLoaded || !signUp) return;

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      try {
        const si = await signIn.create({ identifier: trimmed });
        const emailCodeFactor = si.supportedFirstFactors?.find(
          (factor): factor is Extract<typeof factor, { strategy: "email_code" }> =>
            factor.strategy === "email_code"
        );
        if (!emailCodeFactor) {
          setError(
            "Email verification code is not available for this account. Please continue with Google."
          );
          return;
        }
        await si.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });
        setAuthFlow("signIn");
        setSignInEmailAddressId(emailCodeFactor.emailAddressId);
        setEmail(trimmed);
        setStep("code");
        return;
      } catch (signInErr) {
        const isNotFound =
          isClerkAPIResponseError(signInErr) &&
          signInErr.errors.some(
            (errItem) =>
              errItem.code === "form_identifier_not_found" ||
              errItem.code === "identifier_not_found"
          );
        if (!isNotFound) {
          throw signInErr;
        }
      }

      const su = await signUp.create({ emailAddress: trimmed });
      if (su.status === "complete" && su.createdSessionId) {
        await setSignUpActive({ session: su.createdSessionId });
        window.location.assign(redirectUrl);
        return;
      }
      await su.prepareEmailAddressVerification({ strategy: "email_code" });
      setAuthFlow("signUp");
      setSignInEmailAddressId(null);
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
    if (!signInLoaded || !signIn || !signUpLoaded || !signUp) return;

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Enter the code from your email.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      if (authFlow === "signIn") {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: trimmedCode,
        });
        if (result.status === "complete" && result.createdSessionId) {
          await setSignInActive({ session: result.createdSessionId });
          window.location.assign(redirectUrl);
          return;
        }
      } else {
        const result = await signUp.attemptEmailAddressVerification({
          code: trimmedCode,
        });
        if (result.status === "complete" && result.createdSessionId) {
          await setSignUpActive({ session: result.createdSessionId });
          window.location.assign(redirectUrl);
          return;
        }
      }

      setError("Verification could not be completed. Please check the code and try again.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!signInLoaded || !signIn || !signUpLoaded || !signUp) return;

    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      if (authFlow === "signIn") {
        const emailAddressId =
          signInEmailAddressId ??
          signIn.supportedFirstFactors?.find((f) => f.strategy === "email_code")
            ?.emailAddressId;
        if (!emailAddressId) {
          setError("Unable to resend code. Please go back and enter your email again.");
          return;
        }
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId,
        });
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
      setNotice("A new code was sent to your email.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToEmail = () => {
    setStep("email");
    setCode("");
    setAuthFlow("signIn");
    setSignInEmailAddressId(null);
    setError(null);
    setNotice(null);
  };

  if (!signInLoaded || !signUpLoaded || !signIn || !signUp || (isUserLoaded && isSignedIn)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
        <Loader2 className="size-5 animate-spin text-primary" />
        <p>{isUserLoaded && isSignedIn ? "Redirecting..." : "Loading..."}</p>
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
            <div id="clerk-captcha" className="flex justify-center" />
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
              Enter the 6-digit code sent to{' '}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>

          {notice && <p className="text-xs text-center text-emerald-600">{notice}</p>}

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

      <div className="mt-8 text-center text-xs text-muted-foreground pt-4">
        By continuing, you agree to our{' '}
        <a href="/terms" className="underline hover:text-foreground">
          Terms of Use
        </a>{' '}
        and{' '}
        <a href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </a>.
      </div>
    </div>
  );
}
