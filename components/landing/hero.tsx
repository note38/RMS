import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SystemRequest } from "@/components/admin/admin-requests/types"

interface HeroProps {
    recentRequests?: SystemRequest[]
}

export function Hero({ recentRequests = [] }: HeroProps) {
    return (
        <section className="relative overflow-hidden border-b border-border">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
                <div className="flex flex-col items-start gap-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                        <ShieldCheck className="size-3.5 text-primary" />
                        Built for office and facilities teams
                    </span>

                    <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
                        Manage every facilities request in one place
                    </h1>

                    <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
                        Provincial Government of Aurora MIS & CCTV Command Center: Centralizing tech
                        repairs, CCTV footage retrieval, and internet service requests into a single,
                        seamless workflow ensuring end-to-end transparency, real-time tracking, and full
                        audit accountability across the Capitol.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button render={<Link href="/sync" />} nativeButton={false} size="lg" className="gap-2 cursor-pointer">
                            Get started
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <HeroPreview requests={recentRequests} />
                </div>
            </div>
        </section>
    )
}

function HeroPreview({ requests = [] }: { requests?: SystemRequest[] }) {
    const defaultRows = [
        { series: "RR-2026-0142", type: "Repair", office: "Records Office", status: "Approved" },
        { series: "CV-2026-0088", type: "CCTV", office: "Security", status: "Pending" },
        { series: "IN-2026-0031", type: "Internet", office: "Accounting", status: "Approved" },
    ]

    const rows = requests.length > 0
        ? requests.slice(0, 3).map((req) => ({
            series: req.seriesNo,
            type: req.category,
            office: req.requestingOffice || "Capitol Office",
            status: req.isApproved ? "Approved" : "Pending",
        }))
        : defaultRows

    const statusStyles: Record<string, string> = {
        Approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold",
        Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold",
        "In review": "bg-blue-500/15 text-blue-700 dark:text-blue-400 font-semibold",
    }

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-xl shadow-primary/5">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <p className="text-sm font-semibold text-foreground">Recent requests</p>
                <span className="text-xs text-muted-foreground">Admin view</span>
            </div>
            <div className="divide-y divide-border">
                {rows.map((row) => (
                    <div key={row.series} className="flex items-center justify-between py-3">
                        <div className="flex flex-col">
                            <span className="font-mono text-xs text-muted-foreground">{row.series}</span>
                            <span className="text-sm font-medium text-foreground">
                                {row.type} — {row.office}
                            </span>
                        </div>
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[row.status] || "bg-muted text-muted-foreground"}`}
                        >
                            {row.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
