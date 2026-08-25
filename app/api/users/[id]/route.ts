import { NextRequest, NextResponse } from "next/server";
import { createAdminUser, deleteAdminUser } from "@/lib/controllers/user-controller";

/**
 * POST /api/users/[id]
 * Promote a user to ADMIN role (super admin only).
 * Body: JSON { email, name }
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    const result = await createAdminUser(email, name ?? "");
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401
                 : message.startsWith("Service unavailable") ? 503
                 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * DELETE /api/users/[id]
 * Demote a user from ADMIN back to REQUESTER (super admin only).
 * URL param: id (user DB id)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const userId = Number(rawId);
    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }
    const result = await deleteAdminUser(userId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401
                 : message.startsWith("Service unavailable") ? 503
                 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
