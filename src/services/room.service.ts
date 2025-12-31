import { roomRepository } from '@/repositories/room.repository';
import { CreateRoomDto, UpdateRoomDto, RoomResponseDto, RoomWithMembersDto } from '@/dtos/room.dto';
import { NotFoundError, BadRequestError } from '@/utils/errors';

/**
 * Room Service
 * Business logic for chat rooms
 */

export class RoomService {
  /**
   * Create a new room and add creator as first member
   */
  async createRoom(data: CreateRoomDto, creatorId: string): Promise<RoomResponseDto> {
    // Validate
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestError('Room name is required');
    }

    // Create room
    const room = await roomRepository.create({
      name: data.name.trim(),
      description: data.description?.trim(),
    });

    // Add creator as first member
    await roomRepository.addMember(room.id, creatorId);

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberCount: 1,
    };
  }

  /**
   * Get all rooms with member counts
   */
  async getAllRooms(): Promise<RoomResponseDto[]> {
    const rooms = await roomRepository.findAllWithMemberCount();

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberCount: room._count.members,
    }));
  }

  /**
   * Get room by ID with members
   */
  async getRoomById(roomId: string): Promise<RoomWithMembersDto> {
    const room = await roomRepository.findByIdWithMembers(roomId);

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      members: room.members.map(member => ({
        id: member.user.id,
        username: member.user.username,
        joinedAt: member.joinedAt,
      })),
    };
  }

  /**
   * Get rooms that user is a member of
   */
  async getUserRooms(userId: string): Promise<RoomResponseDto[]> {
    const rooms = await roomRepository.findByUserId(userId);

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      type: room.type,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberCount: room._count.members,
    }));
  }

  /**
   * Get available rooms for user
   * Returns: All public rooms + user's DMs
   */
  async getAvailableRooms(userId: string): Promise<RoomResponseDto[]> {
    const rooms = await roomRepository.findAvailableForUser(userId);

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      type: room.type,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberCount: room._count.members,
    }));
  }

  /**
   * Update room
   * (For simplicity, anyone can update for now - add permissions later)
   */
  async updateRoom(roomId: string, data: UpdateRoomDto): Promise<RoomResponseDto> {
    // Check if room exists
    const existingRoom = await roomRepository.findById(roomId);
    if (!existingRoom) {
      throw new NotFoundError('Room not found');
    }

    // Update
    const room = await roomRepository.update(roomId, {
      name: data.name?.trim(),
      description: data.description?.trim(),
    });

    const memberCount = await roomRepository.getMemberCount(roomId);

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberCount,
    };
  }

  /**
   * Delete room
   * (For simplicity, anyone can delete for now - add permissions later)
   */
  async deleteRoom(roomId: string): Promise<void> {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    await roomRepository.delete(roomId);
  }

  /**
   * Join a room
   */
  async joinRoom(roomId: string, userId: string): Promise<void> {
    // Check if room exists
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // Check if already a member
    const isMember = await roomRepository.isMember(roomId, userId);
    if (isMember) {
      // Already a member, nothing to do (idempotent operation)
      return;
    }

    // Add member
    await roomRepository.addMember(roomId, userId);
  }

  /**
   * Leave a room
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    // Check if room exists
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // Check if member
    const isMember = await roomRepository.isMember(roomId, userId);
    if (!isMember) {
      throw new BadRequestError('Not a member of this room');
    }

    // Remove member
    await roomRepository.removeMember(roomId, userId);
  }

  /**
   * Get or create a direct message room between two users
   */
  async getOrCreateDirectMessage(userId1: string, userId2: string, username2: string): Promise<RoomResponseDto> {
    // Don't allow DM with yourself
    if (userId1 === userId2) {
      throw new BadRequestError('Cannot create DM with yourself');
    }

    // Check if DM already exists
    const existingDM = await roomRepository.findDirectMessage(userId1, userId2);
    if (existingDM) {
      return {
        id: existingDM.id,
        name: existingDM.name,
        description: existingDM.description,
        type: existingDM.type,
        createdAt: existingDM.createdAt,
        updatedAt: existingDM.updatedAt,
        memberCount: 2,
      };
    }

    // Create new DM room
    const room = await roomRepository.create({
      name: `DM: ${username2}`, // Just for internal reference
      type: 'direct',
    });

    // Add both users as members
    await roomRepository.addMember(room.id, userId1);
    await roomRepository.addMember(room.id, userId2);

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      type: room.type,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberCount: 2,
    };
  }
}

// Export singleton
export const roomService = new RoomService();
