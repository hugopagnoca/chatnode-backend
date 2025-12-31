import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Check all rooms in database
 */
async function checkRooms() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info(`\nTotal rooms: ${rooms.length}\n`);

    rooms.forEach(room => {
      const memberNames = room.members.map(m => m.user.username).join(', ');
      logger.info(`Room: ${room.name}`);
      logger.info(`  ID: ${room.id}`);
      logger.info(`  Type: ${room.type || 'null (public)'}`);
      logger.info(`  Members (${room.members.length}): ${memberNames}`);
      logger.info(`  Created: ${room.createdAt}`);
      logger.info('');
    });

  } catch (error) {
    logger.error('Error checking rooms:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
checkRooms()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
