import http from 'http';
import { createApp } from './app';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { disconnectDatabase } from '@/config/database';
import { initializeSocketServer } from '@/sockets/socket';

/**
 * Start the HTTP server with Socket.io
 *
 * This is the entry point of the application
 */
const startServer = async () => {
  try {
    // Create Express app
    const app = createApp();

    // Create HTTP server (needed for Socket.io)
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    initializeSocketServer(httpServer);

    // Start listening for requests
    // Listen on 0.0.0.0 to accept external connections (required for Railway/Docker)
    const server = httpServer.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`Health check available at: http://localhost:${env.PORT}/api/health`);
      logger.info(`WebSocket server ready for connections`);
    });

    /**
     * Graceful shutdown
     *
     * When you press Ctrl+C or the process receives a termination signal:
     * 1. Stop accepting new requests
     * 2. Wait for existing requests to complete
     * 3. Close database connections
     * 4. Exit cleanly
     */
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        // Close database connection
        await disconnectDatabase();
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Start the server
startServer();
