import express, { Application } from 'express';
import path from 'path';
import { env } from '@/config/env';
import routes from '@/routes';
import { errorHandler, notFoundHandler } from '@/middlewares/errorHandler';

/**
 * Create and configure Express application
 *
 * Why separate app.ts from server.ts?
 * - Makes testing easier (you can import app without starting the server)
 * - Cleaner separation of concerns
 */
export const createApp = (): Application => {
  const app = express();

  /**
   * Built-in middleware
   */

  // Parse JSON request bodies
  // When client sends: { "username": "john" }
  // This makes it available as: req.body.username
  app.use(express.json());

  // Parse URL-encoded form data (e.g., from HTML forms)
  app.use(express.urlencoded({ extended: true }));

  /**
   * CORS (Cross-Origin Resource Sharing)
   *
   * Browsers block requests from different origins by default
   * This allows your frontend (e.g., http://localhost:3000) to call your API
   */
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', env.CORS_ORIGIN);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  });

  /**
   * Request logging middleware (development only)
   */
  if (env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Routes
   */
  app.use('/api', routes);  // All routes will be prefixed with /api

  /**
   * Serve test client (development only)
   */
  if (env.NODE_ENV === 'development') {
    app.get('/test-client', (_req, res) => {
      res.sendFile(path.join(__dirname, '..', 'test-client.html'));
    });
  }

  /**
   * Error handling
   * IMPORTANT: These must be registered LAST
   */
  app.use(notFoundHandler);   // Catches 404s
  app.use(errorHandler);      // Catches all errors

  return app;
};
