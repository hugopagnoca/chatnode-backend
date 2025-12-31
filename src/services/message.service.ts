import { messageRepository } from '@/repositories/message.repository';
import { roomRepository } from '@/repositories/room.repository';
import { CreateMessageDto, MessageResponseDto, PaginatedMessagesDto, GetMessagesQueryDto } from '@/dtos/message.dto';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/utils/errors';

/**
 * Message Service
 * Business logic for messages
 */

export class MessageService {
  /**
   * Create a new message in a room
   */
  async createMessage(
    roomId: string,
    userId: string,
    data: CreateMessageDto
  ): Promise<MessageResponseDto> {
    // Validate
    if (!data.content || data.content.trim().length === 0) {
      throw new BadRequestError('Message content is required');
    }

    // Check if room exists
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // Check if user is a member of the room
    const isMember = await roomRepository.isMember(roomId, userId);
    if (!isMember) {
      throw new ForbiddenError('You must be a member of the room to send messages');
    }

    // Create message
    const message = await messageRepository.create({
      content: data.content.trim(),
      userId,
      roomId,
    });

    // Type assertion because we know repository includes user
    const messageWithUser = message as typeof message & {
      user: { id: string; username: string };
    };

    return {
      id: messageWithUser.id,
      content: messageWithUser.content,
      roomId: messageWithUser.roomId,
      userId: messageWithUser.userId,
      user: {
        id: messageWithUser.user.id,
        username: messageWithUser.user.username,
      },
      createdAt: messageWithUser.createdAt,
      updatedAt: messageWithUser.updatedAt,
    };
  }

  /**
   * Get messages in a room (paginated)
   */
  async getMessages(
    roomId: string,
    userId: string,
    query: GetMessagesQueryDto
  ): Promise<PaginatedMessagesDto> {
    // Check if room exists
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // Check if user is a member
    const isMember = await roomRepository.isMember(roomId, userId);
    if (!isMember) {
      throw new ForbiddenError('You must be a member of the room to view messages');
    }

    // Parse pagination params
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));  // Max 100, default 50

    // Get messages
    const result = await messageRepository.findByRoomId(roomId, page, limit);

    return {
      messages: result.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        roomId: msg.roomId,
        userId: msg.userId,
        user: {
          id: msg.user.id,
          username: msg.user.username,
        },
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrevious: result.page > 1,
      },
    };
  }

  /**
   * Get messages (FAST - for when user is already in room)
   * Skips room/member checks, no pagination
   * Performance: 1 query instead of 4
   */
  async getMessagesFast(roomId: string, limit: number = 50) {
    const messages = await messageRepository.findByRoomIdFast(roomId, limit);

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      roomId: msg.roomId,
      userId: msg.userId,
      user: {
        id: msg.user.id,
        username: msg.user.username,
      },
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));
  }

  /**
   * Create message via WebSocket (optimized - skip validations)
   *
   * Used by Socket.io handlers where user is already authenticated
   * and we know they're in the room. Skips redundant checks for speed.
   *
   * Performance: 1 query instead of 7
   * - No room existence check (user already joined)
   * - No membership check (enforced by join-room)
   * - No user JOIN (we have username from socket)
   */
  async createMessageFast(
    roomId: string,
    userId: string,
    content: string,
    username: string
  ): Promise<MessageResponseDto> {
    // Basic validation only
    if (!content || content.trim().length === 0) {
      throw new BadRequestError('Message content is required');
    }

    // Single INSERT query - no joins, no extra SELECTs
    const message = await messageRepository.createFast({
      content: content.trim(),
      userId,
      roomId,
    });

    // Return with user data from socket (avoid extra query)
    return {
      id: message.id,
      content: message.content,
      roomId: message.roomId,
      userId: message.userId,
      user: {
        id: userId,
        username: username,
      },
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  /**
   * Delete a message
   * Only the author can delete their message
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Check if user is the author
    if (message.userId !== userId) {
      throw new ForbiddenError('You can only delete your own messages');
    }

    await messageRepository.delete(messageId);
  }
}

export const messageService = new MessageService();
