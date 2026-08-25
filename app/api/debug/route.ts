import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  const user = await currentUser();
  return NextResponse.json({
    userId,
    clerkUser: user ? {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName,
    } : null,
  });
}
