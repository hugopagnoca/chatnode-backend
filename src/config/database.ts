import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

/**
 * Prisma Client Singleton
 *
 * Why singleton?
 * - PrismaClient manages a connection pool to the database
 * - Creating multiple instances wastes resources and can cause issues
 * - Singleton pattern ensures only ONE instance exists in the entire app
 */

// Extend global namespace to store Prisma instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Get or create Prisma Client instance
 */
const getPrismaClient = (): PrismaClient => {
  // In production, always create a new instance
  // In development, reuse the global instance (hot reload friendly)
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient({
      log: ['error', 'warn'],  // Only log errors and warnings
    });
  }

  // Development mode
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['error', 'warn'],  // Only errors and warnings (queries disabled for performance)
    });
    logger.info('Prisma Client initialized');
  }

  return global.__prisma;
};

// Export the singleton instance
export const prisma = getPrismaClient();

/**
 * Disconnect from database
 * Called during graceful shutdown
 */
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};
