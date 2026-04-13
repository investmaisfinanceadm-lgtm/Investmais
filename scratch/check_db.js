const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.profile.findUnique({
      where: { id: 'dev-admin-id' }
    });
    console.log('Dev user exists:', !!user);
    const count = await prisma.profile.count();
    console.log('Total profiles:', count);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
