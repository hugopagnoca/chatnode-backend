/**
 * Custom Error Classes
 *
 * Why create custom errors?
 * - You can attach HTTP status codes to errors
 * - Easier to handle different error types differently
 * - More semantic than throwing generic Error objects
 */

/**
 * Base application error class
 * All custom errors extend from this
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;  // true = expected error, false = programming error

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown (V8 only)
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly (needed for extending built-in classes in TypeScript)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 400 Bad Request - Client sent invalid data
 * Example: Missing required field, invalid email format
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Unauthorized - Authentication failed
 * Example: Invalid credentials, missing token
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden - Authenticated but not allowed
 * Example: User trying to delete someone else's message
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 * Example: Room with given ID doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict - Resource already exists or conflicting state
 * Example: Username already taken
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 * Example: Zod validation error
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', public errors?: any) {
    super(message, 422);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 500 Internal Server Error - Something went wrong on our end
 * Example: Database connection failed, unexpected exception
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, false);  // isOperational = false (programming error)
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
