import { auth } from "@clerk/nextjs/server";
import { getOrSyncUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SyncPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await getOrSyncUser();
  if (!dbUser) {
    redirect("/");
  }

  if (!dbUser.profileCompleted) {
    redirect("/complete-profile");
  }

  if (dbUser.role === "SUPERADMIN") {
    redirect("/super-admin");
  } else if (dbUser.role === "ADMIN") {
    redirect("/dashboard");
  } else {
    redirect("/request-form");
  }
}