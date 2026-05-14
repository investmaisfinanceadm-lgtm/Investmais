const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany();
  console.log('Profiles:', profiles.map(p => ({ id: p.id, nome: p.nome, email: p.email })));

  const contactsCount = await prisma.contato.count();
  console.log('Total Contacts:', contactsCount);

  const leadsCount = await prisma.leadCNPJ.count();
  console.log('Total Leads CNPJ:', leadsCount);

  const searches = await prisma.leadSearchHistory.findMany();
  console.log('Searches:', searches);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
