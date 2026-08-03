"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Show } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { UserHeaderMenu } from "@/components/navigation/user-header-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="MIS/CCTV COMMAND CENTER">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MIS/CCTV COMMAND CENTER"
              width={40}
              height={40}
            />
            <div>
              <span className="text-base font-bold text-foreground leading-tight block">
                MIS/CCTV COMMAND CENTER
              </span>
              <span className="text-xs text-muted-foreground">
                Provincial Government of Aurora
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button className="cursor-pointer gap-2">
                <LogIn className="size-4" />
                Sign In
              </Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <div className="flex items-center gap-3">
              <Link href="/sync">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                >
                  Go to Portal
                </Button>
              </Link>
              <UserHeaderMenu />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
