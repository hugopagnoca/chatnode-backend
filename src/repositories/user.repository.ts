import { prisma } from '@/config/database';
import { User } from '@/generated/prisma';

/**
 * User Repository
 *
 * Responsibilities:
 * - Database operations for users (CRUD)
 * - No business logic (that's in services)
 * - Just "how to save/retrieve user data"
 *
 * Why separate this from services?
 * - Easy to test (mock the repository, test the service)
 * - Easy to swap databases (change repository implementation, services stay same)
 * - Single Responsibility Principle
 */

export class UserRepository {
  /**
   * Create a new user
   */
  async create(data: { username: string; email: string; password: string }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { username },
    });
    return count > 0;
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get all users except the current user (for DM list)
   */
  async findAllExcept(excludeUserId: string): Promise<Pick<User, 'id' | 'username' | 'email' | 'createdAt'>[]> {
    return prisma.user.findMany({
      where: {
        id: {
          not: excludeUserId,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        username: 'asc',
      },
    });
  }
}

// Export a singleton instance
export const userRepository = new UserRepository();
