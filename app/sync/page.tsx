import { getOrSyncUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SyncPage() {
  const dbUser = await getOrSyncUser();

  if (!dbUser) {
    redirect("/");
  }

  // Check if full name (First & Last name) is missing or incomplete
  const nameParts = (dbUser.name || "").trim().split(/\s+/);
  const isNameIncomplete =
    !dbUser.name ||
    dbUser.name === dbUser.email ||
    dbUser.name.includes("@noemail.com") ||
    nameParts.length < 2;

  if (isNameIncomplete) {
    redirect("/complete-profile");
  }

  if (dbUser.role === "ADMIN") {
    redirect("/dashboard");
  } else {
    redirect("/request-form");
  }
}
