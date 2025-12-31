import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';

/**
 * Create alice and bob test users + General room
 */
async function createTestUsers() {
  try {
    logger.info('Creating test users and rooms...');

    const password = await bcrypt.hash('password123', 10);

    // Create or update alice
    const alice = await prisma.user.upsert({
      where: { email: 'alice@mail.com' },
      update: { password },
      create: {
        username: 'alice',
        email: 'alice@mail.com',
        password,
      },
    });
    logger.info('✓ Alice created/updated: alice@mail.com / password123');

    // Create or update bob
    const bob = await prisma.user.upsert({
      where: { email: 'bob@mail.com' },
      update: { password },
      create: {
        username: 'bob',
        email: 'bob@mail.com',
        password,
      },
    });
    logger.info('✓ Bob created/updated: bob@mail.com / password123');

    // Create General room if it doesn't exist
    let generalRoom = await prisma.room.findFirst({
      where: { name: 'General' },
    });

    if (!generalRoom) {
      generalRoom = await prisma.room.create({
        data: {
          name: 'General',
          description: 'General discussion room for everyone',
          type: 'public',
        },
      });
      logger.info('✓ General room created');
    } else {
      logger.info('✓ General room already exists');
    }

    // Add alice and bob as members
    await prisma.roomMember.upsert({
      where: {
        userId_roomId: {
          userId: alice.id,
          roomId: generalRoom.id,
        },
      },
      update: {},
      create: {
        userId: alice.id,
        roomId: generalRoom.id,
      },
    });

    await prisma.roomMember.upsert({
      where: {
        userId_roomId: {
          userId: bob.id,
          roomId: generalRoom.id,
        },
      },
      update: {},
      create: {
        userId: bob.id,
        roomId: generalRoom.id,
      },
    });

    logger.info('✓ Alice and Bob added to General room');
    logger.info('');
    logger.info('Setup complete! Login with:');
    logger.info('  👤 alice@mail.com / password123');
    logger.info('  👤 bob@mail.com / password123');

  } catch (error) {
    logger.error('Error creating test users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
createTestUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
