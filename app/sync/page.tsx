import { getOrSyncUser, isAdminOrSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SyncPage() {
  const dbUser = await getOrSyncUser();

  if (!dbUser) {
    redirect("/");
  }

  // Redirect to complete profile if profile has not been explicitly completed
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
