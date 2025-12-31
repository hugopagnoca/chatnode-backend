/**
 * TypeScript Declaration File
 *
 * .d.ts files extend existing types
 * This file adds custom properties to Express types
 */

import { AuthenticatedUser } from '@/dtos/auth.dto';

/**
 * Extend Express Request interface to include our authenticated user
 *
 * After auth middleware runs, req.user will contain the logged-in user
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;  // Optional because not all routes require auth
    }
  }
}
