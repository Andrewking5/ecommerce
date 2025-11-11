import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

export class AuthController {
  // 用戶註冊
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // 在开发环境中记录请求数据
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Register request:', { email, firstName, lastName, phone: phone || 'not provided' });
      }

      // 檢查用戶是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ User already exists:', email);
        }
        res.status(400).json({
          success: false,
          message: 'User already exists',
        });
        return;
      }

      // 密碼雜湊
      const hashedPassword = await bcrypt.hash(password, 12);

      // 創建用戶
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: 'USER',
          provider: 'EMAIL', // 明确标记为邮箱注册
        },
      });

      // 生成 JWT tokens
      const tokens = AuthController.generateTokens(user.id, user.email, user.role);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: AuthController.sanitizeUser(user),
        ...tokens,
      });
      return;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // 提供更详细的错误信息（开发环境）
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error.message || 'Internal server error'
        : 'Internal server error';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        }),
      });
      return;
    }
  }

  // 用戶登入
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 查找用戶
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // 檢查是否為社交登錄用戶（沒有密碼）
      if (!user.password) {
        res.status(401).json({
          success: false,
          message: 'This account was created with social login. Please use social login to sign in.',
        });
        return;
      }

      // 驗證密碼
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // 生成 JWT tokens
      const tokens = AuthController.generateTokens(user.id, user.email, user.role);

      res.json({
        success: true,
        message: 'Login successful',
        user: AuthController.sanitizeUser(user),
        ...tokens,
      });
      return;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // 提供更详细的错误信息（开发环境）
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error.message || 'Internal server error'
        : 'Internal server error';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        }),
      });
      return;
    }
  }

  // 刷新 Token
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required',
        });
        return;
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        res.status(403).json({
          success: false,
          message: 'Invalid refresh token',
        });
        return;
      }

      const tokens = AuthController.generateTokens(user.id, user.email, user.role);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        ...tokens,
      });
      return;
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(403).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }
  }

  // 登出
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // 在實際應用中，這裡應該將 token 加入黑名單
      res.json({
        success: true,
        message: 'Logout successful',
      });
      return;
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 忘記密碼
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // 在實際應用中，這裡應該發送重置密碼的郵件
      res.json({
        success: true,
        message: 'Password reset email sent',
      });
      return;
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 重置密碼
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      // 在實際應用中，這裡應該驗證重置 token
      res.json({
        success: true,
        message: 'Password reset successfully',
      });
      return;
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 生成 JWT Tokens
  static generateTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // 清理用戶資料（移除敏感資訊）
  private static sanitizeUser(user: any) {
    const { password, ...sanitizedUser } = user;
    // 確保日期字段被序列化為字符串
    return {
      ...sanitizedUser,
      createdAt: sanitizedUser.createdAt instanceof Date 
        ? sanitizedUser.createdAt.toISOString() 
        : sanitizedUser.createdAt,
      updatedAt: sanitizedUser.updatedAt instanceof Date 
        ? sanitizedUser.updatedAt.toISOString() 
        : sanitizedUser.updatedAt,
    };
  }
}

// 確保 JWT secrets 存在
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('❌ JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}


