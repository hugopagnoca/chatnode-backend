import { Request, Response, NextFunction } from 'express';
import { messageService } from '@/services/message.service';
import { CreateMessageDto, GetMessagesQueryDto } from '@/dtos/message.dto';

export class MessageController {
  async createMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = req.user!.id;
      const createMessageDto: CreateMessageDto = req.body;

      const message = await messageService.createMessage(roomId, userId, createMessageDto);

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = req.user!.id;
      const query: GetMessagesQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      // Use fast version if no pagination requested (most common case)
      if (!query.page || query.page === 1) {
        const messages = await messageService.getMessagesFast(roomId, query.limit || 50);
        res.status(200).json({
          success: true,
          data: { messages },
        });
        return;
      }

      // Use full version with pagination when needed
      const result = await messageService.getMessages(roomId, userId, query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId } = req.params;
      const userId = req.user!.id;

      await messageService.deleteMessage(messageId, userId);

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();