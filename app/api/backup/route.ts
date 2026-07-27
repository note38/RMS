import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

async function getAdminUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser || dbUser.role !== "ADMIN") return null;
  return dbUser;
}

/** GET /api/backup — download full JSON backup */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [repairs, cctvs, internets, users] = await Promise.all([
    prisma.repairRequest.findMany({ orderBy: { id: "asc" } }),
    prisma.cctvRequest.findMany({ orderBy: { id: "asc" } }),
    prisma.internetRequest.findMany({ orderBy: { id: "asc" } }),
    prisma.user.findMany({
      select: { id: true, clerkId: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { id: "asc" },
    }),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    data: { users, repairs, cctvs, internets },
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="rms-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

/** POST /api/backup — restore from JSON backup */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let backup: any;
  try {
    backup = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON file." }, { status: 400 });
  }

  if (!backup?.data) {
    return NextResponse.json({ error: "Invalid backup format." }, { status: 400 });
  }

  try {
    // Delete existing requests (preserve users/auth)
    await prisma.internetRequest.deleteMany();
    await prisma.cctvRequest.deleteMany();
    await prisma.repairRequest.deleteMany();

    // Restore repair requests
    for (const r of backup.data.repairs ?? []) {
      const { id, createdAt, updatedAt, date, ...rest } = r;
      await prisma.repairRequest.create({
        data: { ...rest, createdAt: new Date(createdAt) },
      });
    }

    // Restore CCTV requests
    for (const c of backup.data.cctvs ?? []) {
      const { id, createdAt, updatedAt, ...rest } = c;
      await prisma.cctvRequest.create({
        data: { ...rest, createdAt: new Date(createdAt) },
      });
    }

    // Restore internet requests
    for (const i of backup.data.internets ?? []) {
      const { id, createdAt, updatedAt, ...rest } = i;
      await prisma.internetRequest.create({
        data: { ...rest, createdAt: new Date(createdAt) },
      });
    }

    return NextResponse.json({ success: true, message: "Restore completed successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Restore failed." }, { status: 500 });
  }
}
