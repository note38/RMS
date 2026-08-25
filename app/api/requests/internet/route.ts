import { NextRequest, NextResponse } from "next/server";
import {
  createInternetRequest,
  updateInternetRequest,
} from "@/lib/controllers/internet-controller";

/**
 * POST /api/requests/internet
 * Create a new internet request. Accepts multipart/form-data.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await createInternetRequest(formData);
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PUT /api/requests/internet
 * Update an existing internet request (owner or admin).
 * Body: multipart/form-data with field `id` (number) plus request fields.
 */
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const result = await updateInternetRequest(id, formData);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
