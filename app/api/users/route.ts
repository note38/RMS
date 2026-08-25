import { NextRequest, NextResponse } from "next/server";
import { updateUserName } from "@/lib/controllers/user-controller";

/**
 * PATCH /api/users
 * Update a user's display name (admin only).
 * Body: JSON { userId, firstName, lastName }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId, firstName, lastName } = await req.json();
    if (!userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing userId, firstName, or lastName" },
        { status: 400 }
      );
    }
    const result = await updateUserName(Number(userId), firstName, lastName);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
