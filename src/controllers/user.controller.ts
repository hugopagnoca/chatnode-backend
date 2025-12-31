import { Request, Response, NextFunction } from 'express';
import { userService } from '@/services/user.service';

export class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user!.id;
      const users = await userService.getAllUsers(currentUserId);

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
