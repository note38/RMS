import { redirect } from "next/navigation";
import { getOrSyncUser } from "@/lib/auth";
import { CompleteProfileForm } from "@/components/profile/complete-profile-form";

export default async function CompleteProfilePage() {
  const dbUser = await getOrSyncUser();

  if (!dbUser) {
    redirect("/");
  }

  // Pre-split existing name if available and valid
  const existingNameParts = (dbUser.name || "").trim().split(/\s+/);
  const hasValidName =
    dbUser.name &&
    dbUser.name !== dbUser.email &&
    !dbUser.name.includes("@") &&
    existingNameParts.length >= 2;

  // If already has a full name, skip this page
  if (hasValidName) {
    redirect("/sync");
  }

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
