import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prisma 7 برای اتصال مستقیم به PostgreSQL به driver adapter نیاز دارد
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

export default prisma;