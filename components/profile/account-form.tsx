"use client";

import { useState, useTransition } from "react";
import { UserCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAccountProfile } from "@/lib/profile-actions";

interface AccountFormProps {
  email: string;
  defaultFirstName: string;
  defaultLastName: string;
}

export function AccountForm({ email, defaultFirstName, defaultLastName }: AccountFormProps) {
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName,  setLastName]  = useState(defaultLastName);
  const [error,     setError]     = useState("");
  const [saved,     setSaved]     = useState(false);
  const [isPending, startTransition] = useTransition();

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
    formData.set("lastName",  lastName.trim());

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card text-card-foreground border border-border rounded-xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <UserCheck className="size-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h2>
          <p className="text-sm text-muted-foreground">
            Update your display name below.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        {/* Success */}
        {saved && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            Profile updated successfully!
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button
              type="submit"
              disabled={isPending}
              className="w-full font-bold cursor-pointer gap-2"
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

        <p className="text-center text-xs text-muted-foreground">
          Signed in as:{" "}
          <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>
    </div>
  );
}
