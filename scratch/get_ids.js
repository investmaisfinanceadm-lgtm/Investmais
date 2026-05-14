const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.findFirst({
    where: { email: 'gabrielsousacj@gmail.com' }
  });
  
  if (!profile) {
    console.log('User Gabriel not found');
    return;
  }

  const pipeline = await prisma.pipeline.findFirst({
    where: { user_id: profile.id },
    include: { stages: { orderBy: { ordem: 'asc' } } }
  });

  if (!pipeline || !pipeline.stages.length) {
    console.log('No pipeline or stages found for Gabriel');
    return;
  }

  console.log('Profile ID:', profile.id);
  console.log('Pipeline ID:', pipeline.id);
  console.log('Stages:', pipeline.stages.map(s => ({ id: s.id, nome: s.nome })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
