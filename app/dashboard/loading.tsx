import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Dashboard Header Skeleton */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 space-y-8">
        {/* Welcome Banner Skeleton */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Bar Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="size-12 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Requests Toolbar & Search Skeleton */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-48 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Admin Requests Table Skeleton */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>

          {[1, 2, 3, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-none">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
