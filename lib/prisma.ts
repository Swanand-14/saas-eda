// lib/prisma.ts
import { PrismaClient } from '../app/generated/prisma';

declare global {
  // Avoid multiple instances in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["query"], // optional, can remove if not needed
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;