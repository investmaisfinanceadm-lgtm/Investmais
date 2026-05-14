const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany({
    orderBy: { last_activity: 'desc' },
    take: 5
  });
  console.log('Recent Profiles:', profiles.map(p => ({ id: p.id, nome: p.nome, email: p.email, last_activity: p.last_activity })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
