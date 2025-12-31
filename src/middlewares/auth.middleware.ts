import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { UnauthorizedError } from '@/utils/errors';

/**
 * Authentication Middleware
 *
 * Protects routes by verifying JWT token
 *
 * How to use:
 * router.get('/protected', authenticate, handler);
 *
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token
 * 3. Attach user to request (req.user)
 * 4. Call next() to proceed to route handler
 */

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    // Format: "Bearer eyJhbGciOiJI..."
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No token provided');
    }

    // Extract token (remove "Bearer " prefix)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid token format. Expected: Bearer <token>');
    }

    const token = parts[1];

    // Verify token and get user data
    const user = await authService.verifyToken(token);

    // Attach user to request
    // Now route handlers can access req.user
    req.user = user;

    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

/**
 * Optional authentication middleware
 *
 * If token is present, verify and attach user
 * If not present, continue anyway (req.user will be undefined)
 *
 * Useful for routes that work differently for authenticated vs anonymous users
 * Example: Public rooms list shows "join" button for authenticated users
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const user = await authService.verifyToken(token);
        req.user = user;
      }
    }

    // Continue regardless of whether token was valid
    next();
  } catch (error) {
    // Ignore auth errors, just continue without user
    next();
  }
};
