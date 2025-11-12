import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../app';
import { t } from '../utils/i18n';
import { isValidLanguage } from '../utils/i18n';

export class UserController {
  // 獲取用戶個人資料
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          preferredLanguage: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
      return;
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 更新用戶個人資料
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { firstName, lastName, phone, preferredLanguage } = req.body;

      // 验证语言代码
      if (preferredLanguage && !isValidLanguage(preferredLanguage)) {
        res.status(400).json({
          success: false,
          message: 'Invalid language code',
        });
        return;
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phone,
          ...(preferredLanguage && { preferredLanguage }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          preferredLanguage: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: t(req, 'success.userUpdated', 'Profile updated successfully'),
        data: user,
      });
      return;
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 修改密碼
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      // 獲取用戶當前密碼
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // 檢查是否為社交登錄用戶（沒有密碼）
      if (!user.password) {
        res.status(400).json({
          success: false,
          message: 'This account was created with social login. Password cannot be changed.',
        });
        return;
      }

      // 驗證當前密碼
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }

      // 雜湊新密碼
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // 更新密碼
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
      return;
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 獲取所有用戶（管理員）
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, role } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (role) {
        where.role = role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
      return;
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 獲取單一用戶（管理員）
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
      return;
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 更新用戶（管理員）
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
      return;
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 刪除用戶（管理員）
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // 軟刪除：設定 isActive 為 false
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
      return;
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 更新用戶語言偏好
  static async updateLanguage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { preferredLanguage } = req.body;

      // 验证语言代码
      if (!preferredLanguage || !isValidLanguage(preferredLanguage)) {
        res.status(400).json({
          success: false,
          message: 'Invalid language code. Supported languages: en, zh-TW, zh-CN, ja',
        });
        return;
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { preferredLanguage },
        select: {
          id: true,
          email: true,
          preferredLanguage: true,
        },
      });

      res.json({
        success: true,
        message: 'Language preference updated successfully',
        data: user,
      });
      return;
    } catch (error) {
      console.error('Update language error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }
}


