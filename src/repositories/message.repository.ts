import { prisma } from '@/config/database';
import { Message } from '@/generated/prisma';

/**
 * Message Repository
 * Handles database operations for messages
 */

export class MessageRepository {
  /**
   * Create a new message
   */
  async create(data: { content: string; userId: string; roomId: string }): Promise<Message> {
    return prisma.message.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Create message (fast - no joins)
   * Used for WebSocket where we already have user data
   */
  async createFast(data: { content: string; userId: string; roomId: string }): Promise<Message> {
    return prisma.message.create({
      data,
    });
  }

  /**
   * Find message by ID
   */
  async findById(id: string) {
    return prisma.message.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Get messages in a room (paginated)
   *
   * @param roomId - Room ID
   * @param page - Page number (1-indexed)
   * @param limit - Messages per page
   */
  async findByRoomId(roomId: string, page: number = 1, limit: number = 50) {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get messages and total count in parallel
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { roomId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },  // Newest first
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: { roomId },
      }),
    ]);

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get recent messages in a room (for real-time updates)
   * Fast version - no COUNT, just messages
   */
  async findRecentByRoomId(roomId: string, limit: number = 50) {
    return prisma.message.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get messages without pagination info (FAST - 1 query only)
   * Use when you don't need total count
   */
  async findByRoomIdFast(roomId: string, limit: number = 50) {
    return prisma.message.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Update message
   */
  async update(id: string, content: string): Promise<Message> {
    return prisma.message.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Delete message
   */
  async delete(id: string): Promise<Message> {
    return prisma.message.delete({
      where: { id },
    });
  }

  /**
   * Get message count in room
   */
  async countByRoomId(roomId: string): Promise<number> {
    return prisma.message.count({
      where: { roomId },
    });
  }
}

// Export singleton instance
export const messageRepository = new MessageRepository();
