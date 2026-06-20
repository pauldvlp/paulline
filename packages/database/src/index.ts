import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma, PrismaClient };
export type { Prisma } from '@prisma/client';
