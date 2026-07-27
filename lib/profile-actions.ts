"use server";

import { prisma } from "@/lib/prisma";
import { getOrSyncUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateUserProfile(formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const firstName = ((formData.get("firstName") as string) || "").trim();
  const lastName = ((formData.get("lastName") as string) || "").trim();

  if (!firstName || !lastName) {
    throw new Error("Please enter both First Name and Last Name.");
  }

  const fullName = `${firstName} ${lastName}`;

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { name: fullName },
  });

  revalidatePath("/sync");
  revalidatePath("/dashboard");
  revalidatePath("/request-form");
  revalidatePath("/account");

  redirect("/sync");
}

/** Used by the /account page — saves name without redirecting */
export async function updateAccountProfile(formData: FormData) {
  const dbUser = await getOrSyncUser();
  if (!dbUser) throw new Error("Unauthorized: Please sign in.");

  const firstName = ((formData.get("firstName") as string) || "").trim();
  const lastName  = ((formData.get("lastName")  as string) || "").trim();

  if (!firstName || !lastName) {
    throw new Error("Please enter both First Name and Last Name.");
  }

  const fullName = `${firstName} ${lastName}`;
  await prisma.user.update({ where: { id: dbUser.id }, data: { name: fullName } });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/request-form");
  return { success: true };
}

