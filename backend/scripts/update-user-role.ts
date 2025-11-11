import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole() {
  const email = process.argv[2];
  const role = process.argv[3]?.toUpperCase();

  if (!email || !role) {
    console.log('Usage: ts-node scripts/update-user-role.ts <email> <role>');
    console.log('Example: ts-node scripts/update-user-role.ts user@example.com ADMIN');
    console.log('Roles: USER, ADMIN');
    process.exit(1);
  }

  if (role !== 'USER' && role !== 'ADMIN') {
    console.log('❌ Invalid role. Must be USER or ADMIN');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n📋 Current user role: ${user.role}`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: role as 'USER' | 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    console.log('\n✅ User role updated successfully!');
    console.log('─'.repeat(50));
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Name:  ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`Role:  ${updatedUser.role} ${updatedUser.role === 'ADMIN' ? '✅' : '❌'}`);
    console.log('─'.repeat(50));
    console.log('\n⚠️  Note: User needs to log out and log in again for changes to take effect.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();



