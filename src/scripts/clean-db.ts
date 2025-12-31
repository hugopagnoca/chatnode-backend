import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Clean database - keep only alice and bob users
 */
async function cleanDatabase() {
  try {
    logger.info('Starting database cleanup...');

    // Delete all messages
    const deletedMessages = await prisma.message.deleteMany({});
    logger.info(`Deleted ${deletedMessages.count} messages`);

    // Delete all room members
    const deletedMembers = await prisma.roomMember.deleteMany({});
    logger.info(`Deleted ${deletedMembers.count} room members`);

    // Delete all rooms
    const deletedRooms = await prisma.room.deleteMany({});
    logger.info(`Deleted ${deletedRooms.count} rooms`);

    // Delete all users except alice and bob
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          notIn: ['alice@mail.com', 'bob@mail.com'],
        },
      },
    });
    logger.info(`Deleted ${deletedUsers.count} users (kept alice and bob)`);

    logger.info('Database cleanup completed successfully!');
    logger.info('Remaining users: alice@mail.com, bob@mail.com');

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
