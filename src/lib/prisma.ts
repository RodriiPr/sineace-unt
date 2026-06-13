import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL is available
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the environment variables')
}

// Create connection pool
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool, { schema: 'public' })

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  } as any)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
