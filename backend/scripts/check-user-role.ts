import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRole() {
  const email = process.argv[2];

  if (!email) {
    console.log('Usage: ts-node scripts/check-user-role.ts <email>');
    console.log('Example: ts-node scripts/check-user-role.ts user@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        provider: true,
      },
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log('\n📋 User Information:');
    console.log('─'.repeat(50));
    console.log(`ID:       ${user.id}`);
    console.log(`Email:    ${user.email}`);
    console.log(`Name:     ${user.firstName} ${user.lastName}`);
    console.log(`Role:     ${user.role} ${user.role === 'ADMIN' ? '✅' : '❌'}`);
    console.log(`Active:   ${user.isActive ? '✅' : '❌'}`);
    console.log(`Provider: ${user.provider || 'EMAIL'}`);
    console.log('─'.repeat(50));

    if (user.role !== 'ADMIN') {
      console.log('\n⚠️  This user does not have ADMIN role.');
      console.log('To update the role to ADMIN, run:');
      console.log(`  ts-node scripts/update-user-role.ts ${email} ADMIN`);
    } else {
      console.log('\n✅ User has ADMIN role.');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();



