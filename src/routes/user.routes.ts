import { Router } from 'express';
import { userController } from '@/controllers/user.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users - Get all users (for DM list)
router.get('/', userController.getAllUsers.bind(userController));

export default router;
