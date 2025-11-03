// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuração do Prisma
const createPrismaClient = () => {
  let databaseUrl = process.env.DATABASE_URL;

  // Em produção, adiciona pgbouncer=true automaticamente
  if (process.env.NODE_ENV === "production" && databaseUrl) {
    if (!databaseUrl.includes("pgbouncer=true")) {
      const separator = databaseUrl.includes("?") ? "&" : "?";
      databaseUrl = `${databaseUrl}${separator}pgbouncer=true`;
      console.log("✅ Prisma: pgbouncer mode enabled");
    }
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
};

process.on("beforeExit", shutdown);
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
