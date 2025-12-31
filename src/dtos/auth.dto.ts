/**
 * Authentication DTOs (Data Transfer Objects)
 *
 * DTOs define the shape of data for:
 * - Requests (what client sends)
 * - Responses (what server returns)
 *
 * Benefits:
 * - Type safety for API contracts
 * - Validation schemas
 * - Documentation (you can see what data is expected)
 */

/**
 * Register Request Body
 * POST /api/auth/register
 */
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

/**
 * Login Request Body
 * POST /api/auth/login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Auth Response
 * Returned after successful register/login
 */
export interface AuthResponseDto {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
  };
  token: string;  // JWT token
}

/**
 * Authenticated User (attached to request after auth middleware)
 * This is what req.user looks like
 */
export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
}
