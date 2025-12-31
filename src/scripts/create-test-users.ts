import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';

/**
 * Create admin user only
 */
async function createTestUsers() {
  try {
    logger.info('Creating admin user...');

    const password = await bcrypt.hash('admin123', 10);

    // Create or update admin
    await prisma.user.upsert({
      where: { email: 'admin@chatnode.com' },
      update: { password },
      create: {
        username: 'admin',
        email: 'admin@chatnode.com',
        password,
      },
    });
    logger.info('✓ Admin created/updated: admin@chatnode.com / admin123');

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
