"use server";

import { prisma } from "@/lib/prisma";
import { getOrSyncUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Complete profile (first-time, redirects to /sync)
// ---------------------------------------------------------------------------

export async function updateUserProfile(formData: FormData) {
  // `getOrSyncUser` may fail transiently (Clerk or DB). Retry a few times
  // with small backoff before giving up to reduce race conditions after sign-in.
  let dbUser = null;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    dbUser = await getOrSyncUser();
    if (dbUser) break;
    // small exponential backoff
    await new Promise((res) => setTimeout(res, 100 * attempt));
  }

  const firstName = ((formData.get("firstName") as string) || "").trim();
  const lastName  = ((formData.get("lastName")  as string) || "").trim();

  if (!dbUser) {
    throw new Error("Unauthorized: Please sign in. (Failed to synchronize Clerk user)");
  }
  if (!firstName || !lastName) {
    throw new Error("Please enter both First Name and Last Name.");
  }

  const fullName = `${firstName} ${lastName}`;

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      name: fullName,
      profileCompleted: true,
    },
  });

  revalidatePath("/sync");
  revalidatePath("/dashboard");
  revalidatePath("/request-form");
  revalidatePath("/account");

  redirect("/sync");
}

// ---------------------------------------------------------------------------
// Update account profile (no redirect — used by /account page)
// ---------------------------------------------------------------------------

export async function updateAccountProfile(formData: FormData) {
  let dbUser = null;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    dbUser = await getOrSyncUser();
    if (dbUser) break;
    await new Promise((res) => setTimeout(res, 100 * attempt));
  }
  if (!dbUser) {
    throw new Error("Unauthorized: Please sign in. (Failed to synchronize Clerk user)");
  }

  const firstName = ((formData.get("firstName") as string) || "").trim();
  const lastName  = ((formData.get("lastName")  as string) || "").trim();

  if (!firstName || !lastName) {
    throw new Error("Please enter both First Name and Last Name.");
  }

  const fullName = `${firstName} ${lastName}`;
  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      name: fullName,
      profileCompleted: true,
    },
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/request-form");
  return { success: true };
}
