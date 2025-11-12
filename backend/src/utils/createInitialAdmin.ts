import { prisma } from '../app';
import bcrypt from 'bcrypt';

export async function createInitialAdminIfNeeded(): Promise<void> {
  try {
    // 檢查環境變量
    const adminEmail = process.env.INIT_ADMIN_EMAIL;
    const adminPassword = process.env.INIT_ADMIN_PASSWORD;
    const adminFirstName = process.env.INIT_ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.INIT_ADMIN_LAST_NAME || 'User';

    // 如果沒有設置環境變量，跳過
    if (!adminEmail || !adminPassword) {
      console.log('ℹ️  INIT_ADMIN_EMAIL and INIT_ADMIN_PASSWORD not set, skipping initial admin creation');
      return;
    }

    // 檢查是否已有管理員
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin account already exists, skipping initial admin creation');
      return;
    }

    // 檢查 Email 是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log(`⚠️  User with email ${adminEmail} already exists, updating to ADMIN...`);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ User ${adminEmail} has been upgraded to ADMIN`);
      return;
    }

    // 驗證密碼長度
    if (adminPassword.length < 8) {
      console.warn('⚠️  INIT_ADMIN_PASSWORD must be at least 8 characters, skipping admin creation');
      return;
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // 創建管理員
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Initial admin account created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Role: ${admin.role}`);
    console.log('⚠️  Please remove INIT_ADMIN_* environment variables after first login for security');
  } catch (error: any) {
    console.error('❌ Failed to create initial admin:', error.message || error);
    // 不阻止服務器啟動
  }
}

