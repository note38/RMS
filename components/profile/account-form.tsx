"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserCheck, Loader2, CheckCircle2, X, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAccountProfile } from "@/lib/profile-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserHeaderMenu } from "@/components/navigation/user-header-menu";

interface AccountFormProps {
  email: string;
  defaultFirstName: string;
  defaultLastName: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function AccountForm({
  email,
  defaultFirstName,
  defaultLastName,
  onClose,
  isModal = false,
}: AccountFormProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/sync");
    }
  };

  // Listen for Escape key in modal mode
  useEffect(() => {
    if (!isModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModal]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter both First Name and Last Name.");
      return;
    }

    const formData = new FormData();
    formData.set("firstName", firstName.trim());
    formData.set("lastName", lastName.trim());

    startTransition(async () => {
      try {
        await updateAccountProfile(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err: any) {
        setError(err?.message || "Something went wrong. Please try again.");
      }
    });
  };

  const inputCls =
    "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";
  const labelCls =
    "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  // MODAL VIEW (If rendered as an overlay dialog)
  if (isModal) {
    if (!mounted) return null;

    return createPortal(
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header with top divider & Close Button */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <UserCheck className="size-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">Manage Account</h3>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1 transition-colors hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            {saved && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                Profile updated successfully!
              </div>
            )}

            <div className="space-y-1">
              <label className={labelCls}>First Name *</label>
              <input
                required
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Juan"
                disabled={isPending}
                className={inputCls}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Last Name *</label>
              <input
                required
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Dela Cruz"
                disabled={isPending}
                className={inputCls}
              />
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                Signed in as:{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            {/* Footer with bottom divider */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer font-bold gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  }

  // FULL PAGE VIEW (Used on /account page)
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header Bar with Divider */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MIS/CCTV Command Center"
              width={40}
              height={40}
            />
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                Manage Account
              </h1>
              <p className="text-xs text-muted-foreground">
                Provincial Government of Aurora
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="gap-1.5 cursor-pointer font-semibold"
            >
              <X className="size-4" />
              <span>Close</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-8 space-y-8">
        {/* Page Title Header with Divider */}
        <div className="border-b border-border pb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              My Profile Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update your personal display name below.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Portal
          </Button>
        </div>

        {/* Card Form */}
        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xs p-6 space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          {saved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelCls}>First Name *</label>
                <input
                  required
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Juan"
                  disabled={isPending}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Last Name *</label>
                <input
                  required
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Dela Cruz"
                  disabled={isPending}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Signed in email:{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            {/* Bottom Divider & Action Buttons */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer font-bold gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
