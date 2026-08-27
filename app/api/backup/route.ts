import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

async function getSuperAdminUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser || dbUser.role !== "SUPERADMIN") return null;
  return dbUser;
}

/** GET /api/backup — download full JSON backup (Super Admin only) */
export async function GET() {
  const admin = await getSuperAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const repairs = await prisma.repairRequest.findMany({ orderBy: { id: "asc" } });
  const cctvs = await prisma.cctvRequest.findMany({ orderBy: { id: "asc" } });
  const internets = await prisma.internetRequest.findMany({ orderBy: { id: "asc" } });
  const users = await prisma.user.findMany({
    select: { id: true, clerkId: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { id: "asc" },
  });

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

/** POST /api/backup — restore from JSON backup (Super Admin only) */
export async function POST(req: NextRequest) {
  const admin = await getSuperAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let backup: any;
  try {
    backup = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON file." }, { status: 400 });
  }

  // Handle both { data: { repairs, cctvs, internets } } and root { repairs, cctvs, internets }
  const data = backup?.data || backup;
  const repairsList = Array.isArray(data?.repairs) ? data.repairs : [];
  const cctvsList = Array.isArray(data?.cctvs) ? data.cctvs : [];
  const internetsList = Array.isArray(data?.internets) ? data.internets : [];

  if (!data || (repairsList.length === 0 && cctvsList.length === 0 && internetsList.length === 0)) {
    return NextResponse.json(
      { error: "Invalid backup format. File must contain requests data." },
      { status: 400 }
    );
  }

  try {
    // 1. Get existing users to validate foreign keys (createdById, approvedById)
    const existingUsers = await prisma.user.findMany({ select: { id: true } });
    const validUserIds = new Set(existingUsers.map((u) => u.id));

    // Fallback user ID if createdById / approvedById does not exist in target DB
    const fallbackUserId = admin.id;

    const resolveUserId = (id: any): number => {
      if (id && typeof id === "number" && validUserIds.has(id)) {
        return id;
      }
      return fallbackUserId;
    };

    const resolveOptionalUserId = (id: any): number | null => {
      if (!id) return null;
      if (typeof id === "number" && validUserIds.has(id)) {
        return id;
      }
      return fallbackUserId;
    };

    const restoredCounts = { repairs: 0, cctvs: 0, internets: 0 };

    // 2. Perform atomic restore inside a transaction
    await prisma.$transaction(
      async (tx) => {
        // Delete existing requests
        await tx.internetRequest.deleteMany();
        await tx.cctvRequest.deleteMany();
        await tx.repairRequest.deleteMany();

        // Restore repair requests
        for (const r of repairsList) {
          const { id, createdAt, updatedAt, date, createdById, approvedById, createdBy, approvedBy, ...rest } = r;
          await tx.repairRequest.create({
            data: {
              ...rest,
              createdById: resolveUserId(createdById),
              approvedById: resolveOptionalUserId(approvedById),
              date: date ? new Date(date) : new Date(),
              createdAt: createdAt ? new Date(createdAt) : new Date(),
              updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
            },
          });
          restoredCounts.repairs++;
        }

        // Restore CCTV requests
        for (const c of cctvsList) {
          const { id, createdAt, updatedAt, createdById, approvedById, createdBy, approvedBy, ...rest } = c;
          await tx.cctvRequest.create({
            data: {
              ...rest,
              createdById: resolveUserId(createdById),
              approvedById: resolveOptionalUserId(approvedById),
              createdAt: createdAt ? new Date(createdAt) : new Date(),
              updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
            },
          });
          restoredCounts.cctvs++;
        }

        // Restore internet requests
        for (const i of internetsList) {
          const { id, createdAt, updatedAt, createdById, approvedById, createdBy, approvedBy, ...rest } = i;
          await tx.internetRequest.create({
            data: {
              ...rest,
              createdById: resolveUserId(createdById),
              approvedById: resolveOptionalUserId(approvedById),
              createdAt: createdAt ? new Date(createdAt) : new Date(),
              updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
            },
          });
          restoredCounts.internets++;
        }

        // Add audit log entry
        await tx.auditLog.create({
          data: {
            action: "RESTORE_BACKUP",
            entityType: "SystemBackup",
            entityId: 0,
            userId: admin.id,
            details: JSON.stringify(restoredCounts),
          },
        });
      },
      { timeout: 30000 }
    );

    return NextResponse.json({
      success: true,
      message: `Restore completed successfully! Restored ${restoredCounts.repairs} Repair, ${restoredCounts.cctvs} CCTV, and ${restoredCounts.internets} Internet requests.`,
      counts: restoredCounts,
    });
  } catch (err: any) {
    console.error("Restore backup error:", err);
    return NextResponse.json({ error: err.message || "Restore failed." }, { status: 500 });
  }
}
