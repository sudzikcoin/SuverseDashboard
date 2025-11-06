import { PrismaClient } from '@prisma/client'

if (process.env.NODE_ENV !== 'production') {
  process.env.DATABASE_URL = "file:./prisma/dev.db"
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
