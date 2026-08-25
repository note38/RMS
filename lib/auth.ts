import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";

/**
 * Retrieves current Clerk user, upserts into PostgreSQL DB via Prisma using clerkId,
 * and returns the synchronized database User object.
 */
export async function getOrSyncUser() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    let clerkUser = null;

    // Helper for clerkClient fallback
    const tryGetClerkUser = async () => {
      const client = await clerkClient();
      return await client.users.getUser(userId);
    };

    try {
      clerkUser = await currentUser({ treatPendingAsSignedOut: true });
    } catch (error) {
      // Quiet warning for network / API unreachable
      console.warn("Clerk currentUser(treatPendingAsSignedOut) unreachable — trying fallback.");
    }

    if (!clerkUser) {
      try {
        clerkUser = await currentUser();
      } catch (error) {
        console.warn("Clerk currentUser() unreachable — trying clerkClient fallback.");
      }
    }

    if (!clerkUser) {
      try {
        clerkUser = await tryGetClerkUser();
      } catch (clerkClientError) {
        console.warn("Clerk API connection unavailable — attempting database fallback for user:", userId);
      }
    }

    // If Clerk API calls failed (e.g. internet connection delay / network timeout),
    // perform local DB lookup by clerkId to keep the user logged in seamlessly.
    if (!clerkUser) {
      try {
        const fallbackUser = await prisma.user.findFirst({ where: { clerkId: userId } });
        if (fallbackUser) {
          return fallbackUser;
        }
      } catch (dbErr: any) {
        console.warn("Database server unreachable (offline/network timeout). Please check internet connection.");
        return null;
      }
      return null;
    }

    const primaryEmail =
      clerkUser.emailAddresses.find((e: { id: string; emailAddress: string }) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      `${clerkUser.id}@noemail.com`;

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      clerkUser.username ||
      primaryEmail;

    // 1. Try finding existing record by clerkId
    let dbUser = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      // 2. If not found by clerkId, check if email matches existing DB user
      let existingByEmail = await prisma.user.findFirst({
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
        },
      });
    }

    return dbUser;
  } catch (error) {
    console.warn("Unable to synchronize user due to network connection timeout.");
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
