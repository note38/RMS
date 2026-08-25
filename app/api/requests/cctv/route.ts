import { NextRequest, NextResponse } from "next/server";
import {
  createCctvRequest,
  updateCctvRequest,
  updateCctvFields,
} from "@/lib/controllers/cctv-controller";

/**
 * POST /api/requests/cctv
 * Create a new CCTV request. Accepts multipart/form-data.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await createCctvRequest(formData);
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PUT /api/requests/cctv
 * Update an existing CCTV request (owner or admin).
 * Body: multipart/form-data with field `id` (number) plus request fields.
 */
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const result = await updateCctvRequest(id, formData);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PATCH /api/requests/cctv
 * Update admin-only CCTV fields (admin only).
 * Body: JSON { id, ...cctvFields }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const result = await updateCctvFields(Number(id), data);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
