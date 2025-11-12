import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// 創建第一個管理員帳號（僅在沒有管理員時可用）
router.post('/create-first-admin', async (req, res) => {
  try {
    // 檢查是否已有管理員
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin account already exists. Please use the script to create additional admins.',
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // 驗證輸入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    // 檢查 Email 是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
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
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create admin account',
    });
  }
});

export default router;

