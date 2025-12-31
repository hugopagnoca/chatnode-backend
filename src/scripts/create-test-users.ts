import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';

/**
 * Create admin user and General room
 */
async function createTestUsers() {
  try {
    logger.info('Creating admin user and General room...');

    const password = await bcrypt.hash('admin123', 10);

    // Create or update admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@chatnode.com' },
      update: { password },
      create: {
        username: 'admin',
        email: 'admin@chatnode.com',
        password,
      },
    });
    logger.info('✓ Admin created/updated: admin@chatnode.com / admin123');

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

    // Add admin as member of General room
    await prisma.roomMember.upsert({
      where: {
        userId_roomId: {
          userId: admin.id,
          roomId: generalRoom.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roomId: generalRoom.id,
      },
    });
    logger.info('✓ Admin added to General room');

    logger.info('');
    logger.info('✅ Setup complete! Login with:');
    logger.info('  👤 admin@chatnode.com / admin123');

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
