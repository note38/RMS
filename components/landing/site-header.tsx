"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Show, SignInButton, UserButton } from "@clerk/nextjs"

// const navLinks = [
//     // { label: "Features", href: "#features" },
//     // { label: "How it works", href: "#how-it-works" },
//     // { label: "Request types", href: "#request-types" },
// ]

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                <Link href="/" aria-label="MIS/CCTV COMMAND CENTER">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="MIS/CCTV COMMAND CENTER" width={40} height={40} />
                        <div>
                            <span className="text-base font-bold text-foreground leading-tight block">MIS/CCTV COMMAND CENTER</span>
                            <span className="text-xs text-muted-foreground">Provincial Government of Aurora</span>
                        </div>
                    </div>
                </Link>

                {/* <nav className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav> */}

                <div className="flex items-center gap-3">
                    <Show when="signed-out">
                        <SignInButton mode="modal" fallbackRedirectUrl="/sync" signUpFallbackRedirectUrl="/sync">
                            <Button className="cursor-pointer">Sign In</Button>
                        </SignInButton>
                    </Show>
                    <Show when="signed-in">
                        <div className="flex items-center gap-3">
                            <Link href="/sync">
                                <Button variant="outline" size="sm" className="cursor-pointer">
                                    Go to Portal
                                </Button>
                            </Link>
                            <UserButton />
                        </div>
                    </Show>
                </div>
            </div>
        </header>
    )
}


