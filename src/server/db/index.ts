/**
 * Database Client
 * 
 * Singleton Prisma client instance with PostgreSQL adapter.
 * Prevents multiple database connections in development (hot reload).
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  max: 10,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Named export for backwards compatibility
export const prisma = db;
