import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent TypeScript error during hot reload in development
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? [] : ["query", "info", "warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // Ensure DATABASE_URL is configured in Vercel
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
