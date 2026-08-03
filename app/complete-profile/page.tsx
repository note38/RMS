import { redirect } from "next/navigation";
import { getOrSyncUser } from "@/lib/auth";
import { CompleteProfileForm } from "@/components/profile/complete-profile-form";

export default async function CompleteProfilePage() {
  const dbUser = await getOrSyncUser();

  if (!dbUser) {
    redirect("/");
  }

  // If already completed profile explicitly, skip this page
  if (dbUser.profileCompleted) {
    redirect("/sync");
  }

  // Pre-fill existing name if available (from Clerk or Google) for user convenience
  const existingNameParts = (dbUser.name || "").trim().split(/\s+/);

  const defaultFirstName =
    existingNameParts[0] && !existingNameParts[0].includes("@")
      ? existingNameParts[0]
      : "";
  const defaultLastName = existingNameParts.slice(1).join(" ") || "";

  return (
    <CompleteProfileForm
      email={dbUser.email}
      defaultFirstName={defaultFirstName}
      defaultLastName={defaultLastName}
    />
  );
}
