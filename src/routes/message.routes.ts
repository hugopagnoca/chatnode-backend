import { Router } from 'express';
import { messageController } from '@/controllers/message.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

// All message routes require authentication
router.use(authenticate);

/**
 * POST /api/rooms/:roomId/messages
 * Send a message to a room
 */
router.post('/:roomId/messages', messageController.createMessage.bind(messageController));

/**
 * GET /api/rooms/:roomId/messages
 * Get messages in a room (paginated)
 * Query params: page (default 1), limit (default 50, max 100)
 */
router.get('/:roomId/messages', messageController.getMessages.bind(messageController));

/**
 * DELETE /api/messages/:messageId
 * Delete a message (only author can delete)
 */
router.delete('/messages/:messageId', messageController.deleteMessage.bind(messageController));

export default router;
