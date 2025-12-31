import { Server, Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { messageService } from '@/services/message.service';

/**
 * Message event handlers
 *
 * Handles real-time messaging events
 */

interface JoinRoomPayload {
  roomId: string;
}

interface SendMessagePayload {
  roomId: string;
  content: string;
}

interface TypingPayload {
  roomId: string;
}

export const setupMessageHandlers = (io: Server, socket: Socket) => {
  /**
   * Join a room
   *
   * Client emits: socket.emit('join-room', { roomId: 'room-id' })
   * Server: Joins socket to room for broadcasting
   */
  socket.on('join-room', async (payload: JoinRoomPayload) => {
    try {
      const { roomId } = payload;
      const username = socket.user?.username || 'Unknown';

      // Join the Socket.io room
      await socket.join(`room:${roomId}`);

      logger.info(`${username} joined room ${roomId}`);

      // Notify other users in the room
      socket.to(`room:${roomId}`).emit('user-joined', {
        userId: socket.user?.id,
        username,
        roomId,
        timestamp: new Date(),
      });

      // Confirm to the user
      socket.emit('room-joined', {
        roomId,
        message: 'Successfully joined room',
      });
    } catch (error) {
      logger.error(`Error joining room:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  /**
   * Leave a room
   *
   * Client emits: socket.emit('leave-room', { roomId: 'room-id' })
   */
  socket.on('leave-room', async (payload: JoinRoomPayload) => {
    try {
      const { roomId } = payload;
      const username = socket.user?.username || 'Unknown';

      // Leave the Socket.io room
      await socket.leave(`room:${roomId}`);

      logger.info(`${username} left room ${roomId}`);

      // Notify other users in the room
      socket.to(`room:${roomId}`).emit('user-left', {
        userId: socket.user?.id,
        username,
        roomId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Error leaving room:`, error);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  });

  /**
   * Send message
   *
   * Client emits: socket.emit('send-message', { roomId: 'room-id', content: 'Hello!' })
   * Server:
   *  1. Saves message to database
   *  2. Broadcasts to all users in the room
   */
  socket.on('send-message', async (payload: SendMessagePayload) => {
    try {
      const { roomId, content } = payload;
      const userId = socket.user?.id;
      const username = socket.user?.username;

      if (!userId || !username) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Use optimized method - skips redundant validations
      // User is already authenticated (JWT) and in room (join-room)
      const message = await messageService.createMessageFast(
        roomId,
        userId,
        content,
        username
      );

      logger.info(`Message sent by ${username} in room ${roomId}`);

      // Broadcast to everyone in the room (including sender)
      io.to(`room:${roomId}`).emit('message-received', message);

    } catch (error) {
      logger.error(`Error sending message:`, error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  });

  /**
   * Typing start
   *
   * Client emits when user starts typing
   * Ephemeral event - not saved to database
   */
  socket.on('typing-start', (payload: TypingPayload) => {
    const { roomId } = payload;
    const username = socket.user?.username || 'Unknown';

    // Broadcast to others in room (NOT including sender)
    socket.to(`room:${roomId}`).emit('user-typing', {
      userId: socket.user?.id,
      username,
      roomId,
      isTyping: true,
    });
  });

  /**
   * Typing stop
   *
   * Client emits when user stops typing
   */
  socket.on('typing-stop', (payload: TypingPayload) => {
    const { roomId } = payload;
    const username = socket.user?.username || 'Unknown';

    // Broadcast to others in room (NOT including sender)
    socket.to(`room:${roomId}`).emit('user-typing', {
      userId: socket.user?.id,
      username,
      roomId,
      isTyping: false,
    });
  });
};
