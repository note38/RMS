"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  ShieldCheck,
  UserCheck,
  LayoutDashboard,
  FileCheck2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { AccountForm } from "@/components/profile/account-form";

interface UserHeaderMenuProps {
  initialUser?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export function UserHeaderMenu({ initialUser }: UserHeaderMenuProps) {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const name =
    initialUser?.name ||
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    "User";
  const email =
    initialUser?.email ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    "";
  const role = initialUser?.role || "REQUESTER";
  const imageUrl = clerkUser?.imageUrl;

  // Compute initials
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  const parts = name.trim().split(/\s+/);
  const defaultFirstName = parts[0] && !parts[0].includes("@") ? parts[0] : "";
  const defaultLastName = parts.slice(1).join(" ") || "";

  const handleSignOut = async () => {
    setIsOpen(false);
    setLoadingTarget("/sign-out");
    try {
      await signOut(() => router.push("/"));
    } finally {
      setLoadingTarget(null);
    }
  };

  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

  const handleNavigate = async (target: string) => {
    setIsOpen(false);
    setLoadingTarget(target);
    try {
      await router.push(target);
    } finally {
      setLoadingTarget(null);
    }
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        {/* Trigger Avatar Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer border border-border/80"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="size-8 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center ring-1 ring-primary/20">
              {initials}
            </div>
          )}
          <ChevronDown className="size-3.5 text-muted-foreground mr-1" />
        </button>

        {/* Dropdown Menu Popover */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card text-card-foreground shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* User Identity Header */}
            <div className="p-4 bg-muted/30 border-b border-border space-y-1">
              <div className="flex items-center gap-3">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name}
                    className="size-10 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center ring-1 ring-primary/20">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {name}
                  </p>
                  {email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-1.5 space-y-0.5 text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowAccountModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-foreground rounded-lg hover:bg-muted font-medium transition-colors cursor-pointer"
              >
                <UserCheck className="size-4 text-primary" />
                Manage Account
              </button>

              {role === "SUPERADMIN" && (
                <button
                  type="button"
                  onClick={() => handleNavigate("/super-admin")}
                  disabled={!!loadingTarget}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-foreground rounded-lg hover:bg-muted font-medium transition-colors cursor-pointer ${
                    loadingTarget ? "opacity-70 pointer-events-none" : ""
                  }`}
                >
                  <ShieldCheck className="size-4 text-purple-500" />
                  <span className="flex-1">Super Admin Panel</span>
                  {loadingTarget === "/super-admin" && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </button>
              )}

              {(role === "ADMIN" || role === "SUPERADMIN") && (
                <button
                  type="button"
                  onClick={() => handleNavigate("/dashboard")}
                  disabled={!!loadingTarget}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-foreground rounded-lg hover:bg-muted font-medium transition-colors cursor-pointer ${
                    loadingTarget ? "opacity-70 pointer-events-none" : ""
                  }`}
                >
                  <LayoutDashboard className="size-4 text-blue-500" />
                  <span className="flex-1">Admin Dashboard</span>
                  {loadingTarget === "/dashboard" && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleNavigate("/request-form")}
                disabled={!!loadingTarget}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-foreground rounded-lg hover:bg-muted font-medium transition-colors cursor-pointer ${
                  loadingTarget ? "opacity-70 pointer-events-none" : ""
                }`}
              >
                <FileCheck2 className="size-4 text-emerald-500" />
                <span className="flex-1">Request Portal</span>
                {loadingTarget === "/request-form" && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Footer Sign Out */}
            <div className="p-1.5 border-t border-border">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={!!loadingTarget}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-destructive rounded-lg hover:bg-destructive/10 font-medium transition-colors cursor-pointer ${
                  loadingTarget ? "opacity-70 pointer-events-none" : ""
                }`}
              >
                <LogOut className="size-4" />
                <span className="flex-1">Sign Out</span>
                {loadingTarget === "/sign-out" && (
                  <Loader2 className="size-4 animate-spin text-destructive" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Manage Account Modal */}
      {showAccountModal && (
        <AccountForm
          email={email}
          defaultFirstName={defaultFirstName}
          defaultLastName={defaultLastName}
          onClose={() => setShowAccountModal(false)}
          isModal={true}
        />
      )}
    </>
  );
}
