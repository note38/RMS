import { getOrSyncUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";

export const dynamic = 'force-dynamic';
export default async function Page() {
  const dbUser = await getOrSyncUser();
  if (dbUser) {
    redirect("/sync");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}
