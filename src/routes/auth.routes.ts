import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';

/**
 * Authentication Routes
 *
 * All routes are prefixed with /api/auth (defined in main router)
 */

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 *
 * Request body:
 * {
 *   "username": "john",
 *   "email": "john@example.com",
 *   "password": "securepassword"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { "id": "...", "username": "john", "email": "john@example.com", "createdAt": "..." },
 *     "token": "eyJhbGc..."
 *   }
 * }
 */
router.post('/register', authController.register.bind(authController));

/**
 * POST /api/auth/login
 * Login existing user
 *
 * Request body:
 * {
 *   "email": "john@example.com",
 *   "password": "securepassword"
 * }
 *
 * Response: Same as register
 */
router.post('/login', authController.login.bind(authController));

/**
 * GET /api/auth/me
 * Get current authenticated user
 *
 * Requires: Authorization header with Bearer token
 * Example: Authorization: Bearer eyJhbGc...
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { "id": "...", "username": "john", "email": "john@example.com" }
 *   }
 * }
 */
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
