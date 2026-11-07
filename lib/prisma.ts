import { PrismaClient } from "@prisma/client";

const prismaClient = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = prismaClient.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") prismaClient.prisma = prisma;
