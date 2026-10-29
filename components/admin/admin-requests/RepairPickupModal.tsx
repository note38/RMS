"use client";

import { useState } from "react";
import { X, Send, Loader2, RotateCcw, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendRepairPickupEmail } from "@/lib/actions";
import {
  generateRepairPickupDefaultMessage,
  generateRepairPickupDefaultSubject,
} from "@/lib/email/templates/repair-pickup";
import type { SystemRequest } from "./types";

interface RepairPickupModalProps {
  request: SystemRequest;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RepairPickupModal({ request, onClose, onSuccess }: RepairPickupModalProps) {
  const defaultSubject = generateRepairPickupDefaultSubject(request);
  const defaultBody = generateRepairPickupDefaultMessage(request);

  const [recipient, setRecipient] = useState(request.createdBy.email || "");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultBody);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isCustomized = subject !== defaultSubject || message !== defaultBody;

  const handleReset = () => {
    setSubject(defaultSubject);
    setMessage(defaultBody);
    setError(null);
  };

  const handleSend = async () => {
    if (!recipient.trim()) {
      setError("Recipient email cannot be empty.");
      return;
    }
    if (!subject.trim()) {
      setError("Subject cannot be empty.");
      return;
    }
    if (!message.trim()) {
      setError("Message body cannot be empty.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await sendRepairPickupEmail({
        repairId: request.id,
        recipientEmail: recipient.trim(),
        subject: subject.trim(),
        messageBody: message.trim(),
      });

      if (res && (res as any).error) {
        throw new Error((res as any).error);
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Failed to send pickup email:", err);
      setError(
        err.message ||
          "Failed to send email. Please check your SMTP / Gmail App Password settings in .env."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Mail className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Notify Requester: Ready for Pickup
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Repair Request Ref: <span className="font-mono font-semibold text-foreground">{request.seriesNo}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="size-8" />
              </div>
              <h4 className="text-base font-bold text-foreground">Email Sent Successfully!</h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                The ready-for-pickup notification has been sent to{" "}
                <span className="font-medium text-foreground">{recipient}</span>.
              </p>
            </div>
          ) : (
            <>
              {/* Optional Editing Helper Banner */}
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3.5 flex items-start justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
                <div className="flex gap-2.5">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">💡</span>
                  <div>
                    <span className="font-semibold">Default message is ready to send.</span>
                    <p className="text-muted-foreground dark:text-blue-200/80 mt-0.5">
                      Editing is completely optional. You can review and click &ldquo;Send Notification&rdquo; immediately, or edit the fields below.
                    </p>
                  </div>
                </div>
                {isCustomized && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-7 px-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 gap-1 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    Reset Default
                  </Button>
                )}
              </div>

              {/* Recipient Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center justify-between">
                  <span>To (Requester Email)</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    Name: {request.createdBy.name || request.requestedBy}
                  </span>
                </label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="requester@example.com"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              {/* Subject Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              {/* Message Body Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Email Message
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {isCustomized ? "Modified message" : "Default template"}
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={9}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Unable to send email</p>
                    <p className="text-destructive/90">{error}</p>
                    {error.includes("configuration missing") && (
                      <p className="text-[11px] text-destructive/80 mt-1">
                        Add <code className="font-mono font-bold">EMAIL_USER</code> and <code className="font-mono font-bold">EMAIL_PASS</code> (Gmail 16-character App Password) to your <code className="font-mono font-bold">.env</code> file.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground">
              Equipment: <span className="font-medium text-foreground">{request.details["Equipment Type"] || "Repair Item"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={sending}
                className="cursor-pointer text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
                className="gap-2 cursor-pointer text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {sending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
