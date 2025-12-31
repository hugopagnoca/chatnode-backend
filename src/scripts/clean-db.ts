import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Clean database - DELETE ALL DATA
 */
async function cleanDatabase() {
  try {
    logger.info('Starting database cleanup...');
    logger.info('⚠️  WARNING: This will delete ALL data!');

    // Delete all messages
    const deletedMessages = await prisma.message.deleteMany({});
    logger.info(`✓ Deleted ${deletedMessages.count} messages`);

    // Delete all room members
    const deletedMembers = await prisma.roomMember.deleteMany({});
    logger.info(`✓ Deleted ${deletedMembers.count} room members`);

    // Delete all rooms
    const deletedRooms = await prisma.room.deleteMany({});
    logger.info(`✓ Deleted ${deletedRooms.count} rooms`);

    // Delete ALL users
    const deletedUsers = await prisma.user.deleteMany({});
    logger.info(`✓ Deleted ${deletedUsers.count} users`);

    logger.info('✅ Database cleanup completed successfully!');
    logger.info('Database is now completely empty.');

  } catch (error) {
    logger.error('Error cleaning database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
