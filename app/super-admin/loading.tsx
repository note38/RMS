import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Super Admin Header Skeleton */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 space-y-8">
        {/* Title Section Skeleton */}
        <div className="border-b border-border pb-6 space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Action Bar / Tabs Skeleton */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>

        {/* Content Panel Skeleton */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>

          <div className="rounded-xl border border-border bg-background overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
