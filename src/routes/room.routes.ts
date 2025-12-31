import { Router } from 'express';
import { roomController } from '@/controllers/room.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

// All room routes require authentication
router.use(authenticate);

/**
 * POST /api/rooms
 * Create a new room
 */
router.post('/', roomController.createRoom.bind(roomController));

/**
 * GET /api/rooms
 * Get all rooms
 */
router.get('/', roomController.getAllRooms.bind(roomController));

/**
 * GET /api/rooms/my
 * Get rooms the user is a member of
 */
router.get('/my', roomController.getUserRooms.bind(roomController));

/**
 * GET /api/rooms/:roomId
 * Get room details with members
 */
router.get('/:roomId', roomController.getRoomById.bind(roomController));

/**
 * PUT /api/rooms/:roomId
 * Update room
 */
router.put('/:roomId', roomController.updateRoom.bind(roomController));

/**
 * DELETE /api/rooms/:roomId
 * Delete room
 */
router.delete('/:roomId', roomController.deleteRoom.bind(roomController));

/**
 * POST /api/rooms/:roomId/join
 * Join a room
 */
router.post('/:roomId/join', roomController.joinRoom.bind(roomController));

/**
 * POST /api/rooms/:roomId/leave
 * Leave a room
 */
router.post('/:roomId/leave', roomController.leaveRoom.bind(roomController));

/**
 * POST /api/rooms/direct/:userId
 * Create or get direct message with a user
 */
router.post('/direct/:userId', roomController.createDirectMessage.bind(roomController));

export default router;
