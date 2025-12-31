import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * Global error handler middleware
 *
 * How Express error handling works:
 * 1. When you call next(error), Express skips all normal middleware
 * 2. It looks for error-handling middleware (4 parameters: err, req, res, next)
 * 3. This middleware catches all errors and sends appropriate responses
 *
 * This should be the LAST middleware you register in your Express app
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // Handle our custom AppError types
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err instanceof ValidationError && err.errors ? { details: err.errors } : {}),
    });
    return;
  }

  // Handle unexpected errors (programming errors)
  // In production, don't leak error details to clients
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment ? { stack: err.stack } : {}),
  });
};

/**
 * 404 Not Found handler
 * Catches requests to routes that don't exist
 * This should be registered AFTER all your routes but BEFORE the error handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
};
