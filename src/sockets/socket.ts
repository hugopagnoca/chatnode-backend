import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { socketAuthMiddleware } from './middlewares/auth.middleware';
import { setupConnectionHandlers } from './handlers/connection.handler';
import { setupMessageHandlers } from './handlers/message.handler';

/**
 * Initialize Socket.io server
 *
 * This creates a WebSocket server that works alongside the HTTP server
 * It enables real-time bidirectional communication with clients
 */
export const initializeSocketServer = (httpServer: HTTPServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  // Apply authentication middleware to all socket connections
  io.use(socketAuthMiddleware);

  logger.info('Socket.io server initialized');

  // Connection event - fired when a client connects (and passes auth)
  io.on('connection', (socket: Socket) => {
    // Setup all event handlers for this socket
    setupConnectionHandlers(io, socket);
    setupMessageHandlers(io, socket);
  });

  return io;
};
