import { NextRequest, NextResponse } from "next/server";
import {
  updateUserProfile,
  updateAccountProfile,
} from "@/lib/controllers/profile-controller";

/**
 * POST /api/profile
 * Complete user profile for the first time.
 * Accepts multipart/form-data with fields: firstName, lastName.
 * Redirects to /sync on success (via server-side redirect in controller).
 *
 * NOTE: Because the controller calls Next.js `redirect()`, a successful
 * invocation throws a NEXT_REDIRECT error which Next.js handles internally.
 * Only actual errors should reach the catch block here.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    await updateUserProfile(formData);
    // If redirect() was NOT called (edge case), return success
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    // Let Next.js handle NEXT_REDIRECT internally
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PATCH /api/profile
 * Update display name from the /account page (no redirect).
 * Accepts multipart/form-data with fields: firstName, lastName.
 */
export async function PATCH(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await updateAccountProfile(formData);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
