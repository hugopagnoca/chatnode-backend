import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * Used by load balancers, monitoring tools, etc. to check if server is alive
 *
 * GET /health
 * Response: { status: 'ok', timestamp: '2024-01-15T...' }
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),  // How long the server has been running (seconds)
  });
});

export default router;
