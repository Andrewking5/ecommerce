import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { adminSetupLimiter } from '../middleware/rateLimiter';

const router = Router();
const prisma = new PrismaClient();

// 創建第一個管理員帳號（僅在沒有管理員時可用）
// 安全措施：需要 ADMIN_SETUP_SECRET 環境變數 + 嚴格 rate limit
router.post('/create-first-admin', adminSetupLimiter, async (req, res): Promise<void> => {
  try {
    // 驗證 setup secret（防止未授權存取）
    const setupSecret = process.env.ADMIN_SETUP_SECRET;
    if (!setupSecret) {
      res.status(403).json({
        success: false,
        message: 'Admin setup is disabled. Set ADMIN_SETUP_SECRET environment variable to enable.',
      });
      return;
    }

    const { setupKey } = req.body;
    if (!setupKey || setupKey !== setupSecret) {
      res.status(403).json({
        success: false,
        message: 'Invalid setup key.',
      });
      return;
    }

    // 檢查是否已有管理員
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      res.status(403).json({
        success: false,
        message: 'Admin account already exists. Please use the script to create additional admins.',
      });
      return;
    }

    const { email, password, firstName, lastName } = req.body;

    // 驗證輸入
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    // 檢查 Email 是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    // 創建管理員
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || 'Admin',
        lastName: lastName || 'User',
        role: 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
        role: admin.role,
      },
    });
    return;
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create admin account',
    });
    return;
  }
});

export default router;

