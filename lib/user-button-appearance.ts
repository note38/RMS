/**
 * Shared Clerk UserButton appearance — consistent across the app.
 * The divider row is themed to match the app; the popover is styled
 * to match the sign-in look.
 */
export const userButtonAppearance = {
  elements: {
    /* ── Divider row (separates identity from actions, themed) ── */
    dividerRow: "px-4 py-1",
    dividerLine: "border-t border-border",

    /* ── Avatar ───────────────────────────────────────── */
    userButtonAvatarBox:
      "size-7 border-2 border-border hover:border-primary transition-colors rounded-full",

    /* ── Popover card ─────────────────────────────────── */
    userButtonPopoverCard:
      "bg-card border border-border shadow-xl rounded-xl overflow-hidden min-w-[14rem]",

    /* ── Action buttons ───────────────────────────────── */
    userButtonPopoverActionButton:
      "px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors",
    userButtonPopoverActionButtonText: "text-sm font-medium",

    /* ── Signed-in user identifier ────────────────────── */
    userButtonOuterIdentifier: "text-xs text-muted-foreground px-4 pt-3 pb-1",
    userButtonBox: "px-4 pt-3 pb-1",

    /* ── Footer ───────────────────────────────────────── */
    userButtonPopoverFooter: "hidden",
  },
} as const;
