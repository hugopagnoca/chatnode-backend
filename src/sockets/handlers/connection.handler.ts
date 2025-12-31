import { Server, Socket } from 'socket.io';
import { logger } from '@/utils/logger';

/**
 * Connection event handlers
 *
 * Manages user connections and disconnections
 */
export const setupConnectionHandlers = (io: Server, socket: Socket) => {
  /**
   * Handle user disconnect
   */
  socket.on('disconnect', (reason) => {
    const username = socket.user?.username || 'Unknown';
    logger.info(`User disconnected: ${username} (${socket.id}) - Reason: ${reason}`);

    // TODO: Broadcast to rooms that user went offline
    // We'll implement this when we add presence tracking
  });

  /**
   * Handle connection errors
   */
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.user?.username || 'Unknown'} (${socket.id}):`, error);
  });

  // Log successful connection
  const username = socket.user?.username || 'Unknown';
  logger.info(`User connected: ${username} (${socket.id})`);
};
