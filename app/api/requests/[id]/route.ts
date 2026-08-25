import { NextRequest, NextResponse } from "next/server";
import { deleteRequest, toggleRequestApproval } from "@/lib/controllers/user-controller";

/**
 * DELETE /api/requests/[id]?type=repair|cctv|internet
 * Delete a request by id. Owner can delete unapproved; admin can delete any.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    const type = req.nextUrl.searchParams.get("type") as
      | "repair"
      | "cctv"
      | "internet"
      | null;

    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
    }

    const result = await deleteRequest(type, id);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PATCH /api/requests/[id]?type=repair|cctv|internet
 * Toggle approval on a request. Admin only.
 * Optional body: JSON { availabilityStatus } (for CCTV requests)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    const type = req.nextUrl.searchParams.get("type") as
      | "repair"
      | "cctv"
      | "internet"
      | null;

    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
    }

    let availabilityStatus: string | undefined;
    try {
      const body = await req.json();
      availabilityStatus = body?.availabilityStatus;
    } catch {
      // no body — that's fine
    }

    const result = await toggleRequestApproval(type, id, availabilityStatus);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
