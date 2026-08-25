import { NextRequest, NextResponse } from "next/server";
import {
  createRepairRequest,
  updateRepairRequest,
  updateRepairTechnicianFields,
} from "@/lib/controllers/repair-controller";

/**
 * POST /api/requests/repair
 * Create a new repair request. Accepts multipart/form-data or
 * application/x-www-form-urlencoded (standard HTML form submission).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await createRepairRequest(formData);
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PUT /api/requests/repair
 * Update an existing repair request.
 * Body: multipart/form-data with field `id` (number) plus request fields.
 */
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const result = await updateRepairRequest(id, formData);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PATCH /api/requests/repair
 * Update technician findings/recommendation (admin only).
 * Body: JSON { id, technicianFindings, technicianRecommendation }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { id, technicianFindings, technicianRecommendation } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const result = await updateRepairTechnicianFields(
      Number(id),
      technicianFindings ?? "",
      technicianRecommendation ?? ""
    );
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
