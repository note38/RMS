import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";

/**
 * Retrieves current Clerk user, upserts into PostgreSQL DB via Prisma using clerkId,
 * and returns the synchronized database User object.
 */
export async function getOrSyncUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const primaryEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      `${clerkUser.id}@noemail.com`;

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      clerkUser.username ||
      primaryEmail;

    // 1. Try finding existing record by clerkId
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      // 2. If not found by clerkId, check if email matches existing DB user
      //    Try exact match first, then case-insensitive (ILIKE) as fallback
      let existingByEmail = await prisma.user.findUnique({
        where: { email: primaryEmail },
      });

      if (!existingByEmail) {
        existingByEmail = await prisma.user.findFirst({
          where: { email: { equals: primaryEmail, mode: "insensitive" } },
        });
      }

      if (existingByEmail) {
        const hasCustomName =
          existingByEmail.name &&
          !existingByEmail.name.includes("@") &&
          existingByEmail.name !== existingByEmail.email;

        dbUser = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            clerkId: clerkUser.id,
            name: hasCustomName ? existingByEmail.name : fullName,
            // Retain the existing profileCompleted status without auto-flipping
            profileCompleted: existingByEmail.profileCompleted,
          },
        });
      } else {
        // 3. Create brand new user in DB (defaults to REQUESTER role, profileCompleted: false)
        dbUser = await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email: primaryEmail,
            name: fullName,
            role: Role.REQUESTER,
            profileCompleted: false,
          },
        });
      }
    } else {
      // 4. Update email if changed.
      const hasCustomName =
        dbUser.name &&
        !dbUser.name.includes("@") &&
        dbUser.name !== dbUser.email;

      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          email: primaryEmail,
          name: hasCustomName ? dbUser.name : fullName,
          // Do not auto-flip profileCompleted. Only the completion form does this.
        },
      });
    }

    return dbUser;
  } catch (error) {
    console.error("Error in getOrSyncUser:", error);
    return null;
  }
}

/** Returns true if the user has the SUPERADMIN role. */
export function isSuperAdmin(user: { role: string } | null): boolean {
  return user?.role === "SUPERADMIN";
}

/** Returns true if the user has ADMIN or SUPERADMIN role. */
export function isAdminOrSuperAdmin(user: { role: string } | null): boolean {
  return user?.role === "ADMIN" || user?.role === "SUPERADMIN";
}

