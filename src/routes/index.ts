import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import roomRoutes from './room.routes';
import messageRoutes from './message.routes';

/**
 * Main router that combines all route modules
 *
 * This pattern keeps routes organized:
 * - Each feature has its own routes file
 * - This file imports and mounts them all
 */
const router = Router();

// Mount health check routes
router.use(healthRoutes);

// Mount auth routes
router.use('/auth', authRoutes);

// Mount user routes
router.use('/users', userRoutes);

// Mount room routes
router.use('/rooms', roomRoutes);

// Mount message routes (also under /rooms for room-specific messages)
router.use('/rooms', messageRoutes);

export default router;
