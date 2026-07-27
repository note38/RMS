import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";

/**
 * Retrieves current Clerk user, upserts into PostgreSQL DB via Prisma using clerkId,
 * and returns the synchronized database User object.
 */
export async function getOrSyncUser() {
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
    const existingByEmail = await prisma.user.findUnique({
      where: { email: primaryEmail },
    });

    if (existingByEmail) {
      dbUser = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          clerkId: clerkUser.id,
          name: fullName,
        },
      });
    } else {
      // 3. Create brand new user in DB (defaults to REQUESTER role)
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: primaryEmail,
          name: fullName,
          role: Role.REQUESTER,
        },
      });
    }
  } else {
    // 4. Update email if changed, but only sync name from Clerk if the user
    //    hasn't already set a valid custom name (i.e. it's not just their email).
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
}
