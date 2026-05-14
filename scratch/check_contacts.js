const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const contacts = await prisma.contato.findMany({
    take: 10,
    orderBy: { created_at: 'desc' }
  });
  console.log('Last 10 Contacts:', contacts.map(c => ({ nome: c.nome, empresa: c.empresa, created_at: c.created_at })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
