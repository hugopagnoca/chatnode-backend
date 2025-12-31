import { Request, Response, NextFunction } from 'express';
import { roomService } from '@/services/room.service';
import { CreateRoomDto, UpdateRoomDto } from '@/dtos/room.dto';

export class RoomController {
  async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createRoomDto: CreateRoomDto = req.body;
      const userId = req.user!.id;  // ! means "I know it's not undefined"

      const room = await roomService.createRoom(createRoomDto, userId);

      res.status(201).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRooms(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rooms = await roomService.getAllRooms();

      res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;

      const room = await roomService.getRoomById(roomId);

      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      // Return all public rooms + user's DMs
      const rooms = await roomService.getAvailableRooms(userId);

      res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const updateRoomDto: UpdateRoomDto = req.body;

      const room = await roomService.updateRoom(roomId, updateRoomDto);

      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;

      await roomService.deleteRoom(roomId);

      res.status(200).json({
        success: true,
        message: 'Room deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async joinRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = req.user!.id;

      await roomService.joinRoom(roomId, userId);

      res.status(200).json({
        success: true,
        message: 'Joined room successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async leaveRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = req.user!.id;

      await roomService.leaveRoom(roomId, userId);

      res.status(200).json({
        success: true,
        message: 'Left room successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async createDirectMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId: targetUserId } = req.params;
      const { username: targetUsername } = req.body;
      const currentUserId = req.user!.id;

      const room = await roomService.getOrCreateDirectMessage(
        currentUserId,
        targetUserId,
        targetUsername
      );

      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = req.user!.id;

      await roomService.markAsRead(roomId, userId);

      res.status(200).json({
        success: true,
        message: 'Room marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const roomController = new RoomController();
