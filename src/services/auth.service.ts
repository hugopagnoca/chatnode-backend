import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { userRepository } from '@/repositories/user.repository';
import { RegisterDto, LoginDto, AuthResponseDto, AuthenticatedUser } from '@/dtos/auth.dto';
import { ConflictError, UnauthorizedError, BadRequestError } from '@/utils/errors';

/**
 * Authentication Service
 *
 * Responsibilities:
 * - User registration (hash password, create user)
 * - User login (verify password, generate JWT)
 * - Token generation
 * - Password hashing and verification
 */

export class AuthService {
  /**
   * How many rounds of salt for bcrypt
   * Higher = more secure but slower
   * 10 is a good balance for most applications
   */
  private readonly SALT_ROUNDS = 10;

  /**
   * Register a new user
   *
   * Steps:
   * 1. Validate input
   * 2. Check if email/username already exists
   * 3. Hash password
   * 4. Create user in database
   * 5. Generate JWT token
   * 6. Return user + token
   */
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const { username, email, password } = data;

    // Validate input
    this.validateRegisterInput(data);

    // Check if email exists
    if (await userRepository.emailExists(email)) {
      throw new ConflictError('Email already registered');
    }

    // Check if username exists
    if (await userRepository.usernameExists(username)) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = this.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // Return user data (without password!) + token
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Login existing user
   *
   * Steps:
   * 1. Find user by email
   * 2. Verify password
   * 3. Generate JWT token
   * 4. Return user + token
   */
  async login(data: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = data;

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // Return user data + token
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Verify JWT token
   * Used by auth middleware to check if request is authenticated
   */
  async verifyToken(token: string): Promise<AuthenticatedUser> {
    try {
      // Verify and decode token
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Hash password using bcrypt
   *
   * Bcrypt automatically handles:
   * - Generating a salt (random data)
   * - Combining password + salt
   * - Hashing the result
   *
   * Result format: $2b$10$[salt][hash]
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify password against hashed password
   *
   * Bcrypt extracts the salt from the hash and:
   * 1. Combines input password + salt
   * 2. Hashes it
   * 3. Compares with stored hash
   */
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT token
   *
   * JWT (JSON Web Token) has 3 parts:
   * 1. Header: Algorithm info
   * 2. Payload: User data (what we put in)
   * 3. Signature: Prevents tampering (uses JWT_SECRET)
   *
   * Format: header.payload.signature
   * Example: eyJhbGci...eyJ1c2Vy...SflKxwRJ...
   */
  private generateToken(user: AuthenticatedUser): string {
    return jwt.sign(
      user,                                  // Payload (user data)
      env.JWT_SECRET,                        // Secret key for signing
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions  // Token expires in 7 days
    );
  }

  /**
   * Validate registration input
   */
  private validateRegisterInput(data: RegisterDto): void {
    const { username, email, password } = data;

    // Username validation
    if (!username || username.length < 3) {
      throw new BadRequestError('Username must be at least 3 characters');
    }
    if (username.length > 30) {
      throw new BadRequestError('Username must be less than 30 characters');
    }
    if (!/^@?[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestError('Username can only contain letters, numbers, underscores, and optional @ at the start');
    }

    // Email validation (basic)
    if (!email || !email.includes('@')) {
      throw new BadRequestError('Invalid email address');
    }

    // Password validation
    if (!password || password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
