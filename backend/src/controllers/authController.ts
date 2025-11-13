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
          message: req.t('auth:errors.userAlreadyExists'),
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
        message: req.t('auth:success.registered'),
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
          message: req.t('auth:errors.invalidCredentials'),
        });
        return;
      }

      // 檢查是否為社交登錄用戶（沒有密碼）
      if (!user.password) {
        res.status(401).json({
          success: false,
          message: req.t('auth:errors.passwordRequired'),
        });
        return;
      }

      // 驗證密碼
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: req.t('auth:errors.invalidCredentials'),
        });
        return;
      }

      // 生成 JWT tokens
      const tokens = AuthController.generateTokens(user.id, user.email, user.role);

      res.json({
        success: true,
        message: req.t('auth:success.loggedIn'),
        user: AuthController.sanitizeUser(user),
        ...tokens,
      });
      return;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // 提供更详细的错误信息（开发环境）
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error.message || req.t('common:errors.internalServerError')
        : req.t('common:errors.internalServerError');
      
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
        console.warn('⚠️  Refresh token request without token');
        res.status(401).json({
          success: false,
          message: req.t('auth:errors.refreshTokenInvalid'),
        });
        return;
      }

      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      } catch (jwtError: any) {
        console.error('❌ Refresh token verification failed:', {
          error: jwtError?.name,
          message: jwtError?.message,
        });
        // Token 过期或无效应该返回 401
        res.status(401).json({
          success: false,
          message: req.t('auth:errors.refreshTokenInvalid'),
          code: jwtError?.name === 'TokenExpiredError' ? 'REFRESH_TOKEN_EXPIRED' : 'REFRESH_TOKEN_INVALID',
        });
        return;
      }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        console.error('❌ User not found for refresh token:', decoded.userId);
        res.status(401).json({
          success: false,
          message: req.t('auth:errors.refreshTokenInvalid'),
        });
        return;
      }

      if (!user.isActive) {
        console.error('❌ User is inactive:', decoded.userId);
        res.status(401).json({
          success: false,
          message: req.t('auth:errors.refreshTokenInvalid'),
        });
        return;
      }

      const tokens = AuthController.generateTokens(user.id, user.email, user.role);

      console.log('✅ Token refreshed successfully for user:', user.email);

      res.json({
        success: true,
        message: req.t('auth:success.tokenRefreshed'),
        ...tokens,
      });
      return;
    } catch (error: any) {
      console.error('❌ Refresh token error:', {
        message: error?.message,
        stack: error?.stack,
      });
      res.status(500).json({
        success: false,
        message: req.t('auth:errors.refreshTokenInvalid'),
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
        message: req.t('auth:success.loggedOut'),
      });
      return;
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: req.t('common:errors.internalServerError'),
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
          message: req.t('auth:errors.userNotFound'),
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
        message: req.t('common:errors.internalServerError'),
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
        message: req.t('common:errors.internalServerError'),
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

// 確保 JWT secrets 存在（僅在啟動時檢查，不阻止應用啟動）
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
  console.warn('⚠️  Authentication features will not work without these variables');
}


