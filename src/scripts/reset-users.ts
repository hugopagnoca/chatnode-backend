import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';

/**
 * Reset alice and bob users with known passwords
 */
async function resetUsers() {
  try {
    logger.info('Resetting alice and bob users...');

    const password = await bcrypt.hash('password123', 10);

    // Update alice
    await prisma.user.update({
      where: { email: 'alice@mail.com' },
      data: { password },
    });
    logger.info('Alice password reset to: password123');

    // Update bob
    await prisma.user.update({
      where: { email: 'bob@mail.com' },
      data: { password },
    });
    logger.info('Bob password reset to: password123');

    logger.info('Users reset successfully!');
    logger.info('Login with:');
    logger.info('  alice@mail.com / password123');
    logger.info('  bob@mail.com / password123');

  } catch (error) {
    logger.error('Error resetting users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
