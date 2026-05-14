const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Prisma Models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
