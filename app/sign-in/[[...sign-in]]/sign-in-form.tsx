"use client";

import { useClerk, useSignIn, useSignUp, useUser } from "@clerk/nextjs";
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
  if (typeof error === "object" && error !== null) {
    const e = error as any;
    if (Array.isArray(e.errors) && e.errors.length > 0) {
      return e.errors[0].longMessage || e.errors[0].message || "Unknown error";
    }
    if (typeof e.longMessage === "string") return e.longMessage;
    if (typeof e.message === "string") return e.message;
  }
  return "Something went wrong. Please try again.";
}

export function SignInForm() {
  const clerk = useClerk();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"email" | "code">("email");
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
        if (redirectParam.startsWith("/")) return redirectParam;
        const url = new URL(decodeURIComponent(redirectParam), window.location.origin);
        if (url.origin === window.location.origin) return url.pathname;
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
    setIsSubmitting(true);
    try {
      if (typeof (signIn as any).authenticateWithRedirect === "function") {
        await (signIn as any).authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: `${window.location.origin}/sign-in/sso-callback`,
        });
      } else if (typeof (signIn as any).sso === "function") {
        const { error: ssoErr } = await (signIn as any).sso({
          strategy: "oauth_google",
          redirectUrl: redirectUrl,
          redirectCallbackUrl: `${window.location.origin}/sign-in/sso-callback`,
        });
        if (ssoErr) {
          setError(getErrorMessage(ssoErr));
        }
      } else if (clerk && typeof (clerk as any).redirectToSignIn === "function") {
        await (clerk as any).redirectToSignIn({
          signInFallbackRedirectUrl: redirectUrl,
        });
      } else {
        setError("OAuth authentication is not supported on this Clerk version.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      if (signIn) {
        try {
          let si: any;
          if (typeof (signIn as any).create === "function") {
            si = await (signIn as any).create({ identifier: trimmed });
          }

          if (si && si.prepareFirstFactor) {
            await si.prepareFirstFactor({ strategy: "email_code" });
            setEmail(trimmed);
            setStep("code");
            return;
          } else if ((signIn as any).emailCode?.sendCode) {
            await (signIn as any).emailCode.sendCode();
            setEmail(trimmed);
            setStep("code");
            return;
          }
        } catch {
          // fall through
        }
      }

      if (signUp) {
        try {
          if (typeof (signUp as any).create === "function") {
            await (signUp as any).create({ emailAddress: trimmed });
          }
        } catch {
          // Ignore if user already exists in sign up context
        }

        if ((signUp as any).prepareEmailAddressVerification) {
          await (signUp as any).prepareEmailAddressVerification({ strategy: "email_code" });
        } else if ((signUp as any).verifications?.sendEmailCode) {
          await (signUp as any).verifications.sendEmailCode();
        }

        setEmail(trimmed);
        setStep("code");
        return;
      }

      setError("Unable to send verification code. Please try again.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Enter the code from your email.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      if (signIn) {
        try {
          let result: any;
          if ((signIn as any).attemptFirstFactor) {
            result = await (signIn as any).attemptFirstFactor({
              strategy: "email_code",
              code: trimmedCode,
            });
          } else if ((signIn as any).emailCode?.verifyCode) {
            await (signIn as any).emailCode.verifyCode({ code: trimmedCode });
            result = await (signIn as any).finalize();
          }

          if (result && (result.status === "complete" || result.createdSessionId)) {
            if (setSignInActive && result.createdSessionId) {
              await setSignInActive({ session: result.createdSessionId });
            }
            window.location.assign(redirectUrl);
            return;
          }
        } catch {
          // Fall through to sign up attempt below
        }
      }

      if (signUp) {
        let result: any;
        if ((signUp as any).attemptEmailAddressVerification) {
          result = await (signUp as any).attemptEmailAddressVerification({
            code: trimmedCode,
          });
        } else if ((signUp as any).verifications?.verifyEmailCode) {
          await (signUp as any).verifications.verifyEmailCode({ code: trimmedCode });
          result = await (signUp as any).finalize();
        }

        if (result && (result.status === "complete" || result.createdSessionId)) {
          if (setSignUpActive && result.createdSessionId) {
            await setSignUpActive({ session: result.createdSessionId });
          }
          window.location.assign(redirectUrl);
          return;
        }
      }

      setError("Verification failed. Please check the code and try again.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      if (signIn && (signIn as any).prepareFirstFactor) {
        await (signIn as any).prepareFirstFactor({ strategy: "email_code" });
        setNotice("A new code was sent to your email.");
        return;
      } else if (signUp && (signUp as any).prepareEmailAddressVerification) {
        await (signUp as any).prepareEmailAddressVerification({ strategy: "email_code" });
        setNotice("A new code was sent to your email.");
        return;
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
    setError(null);
    setNotice(null);
  };

  if (!signIn || !signUp || (isUserLoaded && isSignedIn)) {
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

        {/* `clerk-captcha` placeholder moved to the server-rendered sign-in page
          so Clerk can find it during initial script initialization. */}

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
