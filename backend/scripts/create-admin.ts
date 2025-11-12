import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log('\n🔐 創建管理員帳號\n');
  console.log('─'.repeat(50));

  try {
    // 獲取用戶輸入
    const email = process.argv[2] || await question('📧 請輸入 Email: ');
    
    if (!email || !email.includes('@')) {
      console.log('❌ 無效的 Email 地址');
      process.exit(1);
    }

    // 檢查用戶是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`\n⚠️  用戶已存在: ${email}`);
      console.log(`   當前角色: ${existingUser.role}`);
      
      if (existingUser.role === 'ADMIN') {
        console.log('✅ 該用戶已經是管理員');
        process.exit(0);
      }

      const update = process.argv[3] || await question('\n是否要將此用戶升級為管理員? (y/n): ');
      if (update.toLowerCase() === 'y' || update.toLowerCase() === 'yes') {
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' },
        });
        console.log('\n✅ 用戶已升級為管理員!');
        console.log('─'.repeat(50));
        console.log(`Email: ${updatedUser.email}`);
        console.log(`Name:  ${updatedUser.firstName} ${updatedUser.lastName}`);
        console.log(`Role:  ${updatedUser.role} ✅`);
        console.log('─'.repeat(50));
        console.log('\n⚠️  請重新登錄以使更改生效');
        process.exit(0);
      } else {
        console.log('❌ 操作已取消');
        process.exit(0);
      }
    }

    // 創建新管理員帳號
    const firstName = process.argv[3] || await question('👤 請輸入名字: ');
    const lastName = process.argv[4] || await question('👤 請輸入姓氏: ');
    const password = process.argv[5] || await question('🔒 請輸入密碼 (至少8字符): ');

    if (!password || password.length < 8) {
      console.log('❌ 密碼至少需要8個字符');
      process.exit(1);
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    // 創建用戶
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
        isActive: true,
        createdAt: true,
      },
    });

    console.log('\n✅ 管理員帳號創建成功!');
    console.log('─'.repeat(50));
    console.log(`ID:       ${admin.id}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Name:     ${admin.firstName} ${admin.lastName}`);
    console.log(`Role:     ${admin.role} ✅`);
    console.log(`Active:   ${admin.isActive ? '✅' : '❌'}`);
    console.log(`Created:  ${admin.createdAt.toLocaleString()}`);
    console.log('─'.repeat(50));
    console.log('\n📝 登錄信息:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   密碼: ${password}`);
    console.log('\n⚠️  請妥善保管登錄信息！');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log(`\n❌ Email 已被使用: ${error.meta?.target}`);
    } else {
      console.error('\n❌ 錯誤:', error.message || error);
    }
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// 支持命令行參數
if (process.argv.length >= 3) {
  createAdmin();
} else {
  createAdmin();
}

