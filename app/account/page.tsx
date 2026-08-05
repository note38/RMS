import { redirect } from "next/navigation";
import { getOrSyncUser } from "@/lib/auth";
import { AccountForm } from "@/components/profile/account-form";

export const dynamic = 'force-dynamic';
export default async function AccountPage() {
  const dbUser = await getOrSyncUser();
  if (!dbUser) redirect("/");

  const parts = (dbUser.name || "").trim().split(/\s+/);
  const defaultFirstName = parts[0] && !parts[0].includes("@") ? parts[0] : "";
  const defaultLastName  = parts.slice(1).join(" ") || "";

  return (
    <AccountForm
      email={dbUser.email}
      defaultFirstName={defaultFirstName}
      defaultLastName={defaultLastName}
    />
  );
}
