const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const devProfile = await prisma.profile.findUnique({
    where: { id: 'dev-admin-id' }
  });
  console.log('Dev Admin Profile:', devProfile);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
