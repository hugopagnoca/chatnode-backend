import { prisma } from '@/config/database';
import { Room, RoomMember } from '@/generated/prisma';

/**
 * Room Repository
 * Handles database operations for rooms and room memberships
 */

export class RoomRepository {
  /**
   * Create a new room
   */
  async create(data: { name: string; description?: string; type?: string }): Promise<Room> {
    return prisma.room.create({
      data,
    });
  }

  /**
   * Find room by ID
   */
  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id },
    });
  }

  /**
   * Find room by ID with members
   */
  async findByIdWithMembers(id: string) {
    return prisma.room.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get all rooms
   */
  async findAll(): Promise<Room[]> {
    return prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all rooms with member count
   */
  async findAllWithMemberCount() {
    return prisma.room.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get rooms that a user is a member of
   */
  async findByUserId(userId: string) {
    return prisma.room.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: { members: true, messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get available rooms for user
   * Returns: Only public rooms (excludes DMs)
   * DMs are accessed directly by clicking on users
   */
  async findAvailableForUser(userId: string) {
    return prisma.room.findMany({
      where: {
        NOT: {
          type: 'direct',
        },
      },
      include: {
        _count: {
          select: { members: true, messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Update room
   */
  async update(id: string, data: { name?: string; description?: string }): Promise<Room> {
    return prisma.room.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete room
   */
  async delete(id: string): Promise<Room> {
    return prisma.room.delete({
      where: { id },
    });
  }

  /**
   * Add user to room
   */
  async addMember(roomId: string, userId: string): Promise<RoomMember> {
    return prisma.roomMember.create({
      data: {
        roomId,
        userId,
      },
    });
  }

  /**
   * Remove user from room
   */
  async removeMember(roomId: string, userId: string): Promise<RoomMember> {
    return prisma.roomMember.delete({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
  }

  /**
   * Check if user is member of room
   */
  async isMember(roomId: string, userId: string): Promise<boolean> {
    const count = await prisma.roomMember.count({
      where: {
        roomId,
        userId,
      },
    });
    return count > 0;
  }

  /**
   * Get member count for a room
   */
  async getMemberCount(roomId: string): Promise<number> {
    return prisma.roomMember.count({
      where: { roomId },
    });
  }

  /**
   * Find existing DM between two users
   */
  async findDirectMessage(userId1: string, userId2: string): Promise<Room | null> {
    // Find rooms where both users are members and type is "direct"
    const room = await prisma.room.findFirst({
      where: {
        type: 'direct',
        members: {
          every: {
            OR: [
              { userId: userId1 },
              { userId: userId2 },
            ],
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Verify it has exactly 2 members and both are our users
    if (room && room.members.length === 2) {
      const memberIds = room.members.map(m => m.userId).sort();
      const expectedIds = [userId1, userId2].sort();
      if (memberIds[0] === expectedIds[0] && memberIds[1] === expectedIds[1]) {
        return room;
      }
    }

    return null;
  }
}

// Export singleton instance
export const roomRepository = new RoomRepository();
