import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { authService } from '@/services/auth.service';
import { logger } from '@/utils/logger';
import { AuthenticatedUser } from '@/dtos/auth.dto';

/**
 * Extend Socket interface to include user data
 */
declare module 'socket.io' {
  interface Socket {
    user?: AuthenticatedUser;
  }
}

/**
 * Socket.io authentication middleware
 *
 * How it works:
 * 1. Client connects with: socket = io(url, { auth: { token: 'jwt-here' } })
 * 2. This middleware intercepts the connection
 * 3. Verifies the JWT token
 * 4. If valid: attaches user to socket.user and allows connection
 * 5. If invalid: rejects connection with error
 *
 * Usage in socket.ts:
 *   io.use(socketAuthMiddleware);
 */
export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token as string;

    if (!token) {
      logger.warn(`Socket connection rejected: No token provided (${socket.id})`);
      return next(new Error('Authentication token required'));
    }

    // Verify token using existing auth service
    const user = await authService.verifyToken(token);

    // Attach user to socket
    socket.user = user;

    logger.info(`Socket authenticated: ${user.username} (${socket.id})`);

    // Allow connection
    next();
  } catch (error) {
    logger.warn(`Socket authentication failed: ${error instanceof Error ? error.message : 'Unknown error'} (${socket.id})`);
    next(new Error('Invalid or expired token'));
  }
};
