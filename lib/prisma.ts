import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const createPrismaClient = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 30_000,
    max: 10,
    ssl: { rejectUnauthorized: false },
  });

  pool.on("error", (err) => {
    console.error("Unexpected background error on idle database client:", err);
  });

  return new PrismaClient({ adapter: new PrismaPg(pool) });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
