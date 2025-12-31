import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { RegisterDto, LoginDto } from '@/dtos/auth.dto';

/**
 * Auth Controller
 *
 * Responsibilities:
 * - Handle HTTP requests/responses
 * - Extract data from req.body
 * - Call service methods
 * - Send responses
 *
 * Controllers DON'T contain business logic - that's in services!
 */

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   *
   * Request body: { username, email, password }
   * Response: { success: true, data: { user, token } }
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerDto: RegisterDto = req.body;

      // Call service
      const result = await authService.register(registerDto);

      // Send response
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      // Pass errors to error handler middleware
      next(error);
    }
  }

  /**
   * Login existing user
   * POST /api/auth/login
   *
   * Request body: { email, password }
   * Response: { success: true, data: { user, token } }
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginDto: LoginDto = req.body;

      // Call service
      const result = await authService.login(loginDto);

      // Send response
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   *
   * Requires authentication
   * Response: { success: true, data: { user } }
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.user is set by authenticate middleware
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const authController = new AuthController();
