import { userRepository } from '@/repositories/user.repository';

/**
 * User Service
 * Business logic for user operations
 */

export class UserService {
  /**
   * Get all users except the current one (for DM list)
   */
  async getAllUsers(currentUserId: string) {
    const users = await userRepository.findAllExcept(currentUserId);

    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    }));
  }
}

// Export singleton instance
export const userService = new UserService();
