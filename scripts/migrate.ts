import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // Add requestedBy column to RepairRequest if it doesn't exist
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "RepairRequest" 
    ADD COLUMN IF NOT EXISTS "requestedBy" TEXT NOT NULL DEFAULT '';
  `);
  console.log("✅ Migration complete: RepairRequest.requestedBy added.");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
