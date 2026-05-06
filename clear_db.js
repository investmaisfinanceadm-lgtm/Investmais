const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clear() {
  console.log('Apagando histórico de deals...');
  await prisma.dealStageHistory.deleteMany();
  
  console.log('Apagando cards do pipeline...');
  await prisma.pipelineCard.deleteMany();
  
  console.log('Apagando colunas do pipeline...');
  await prisma.pipelineColuna.deleteMany();
  
  console.log('Apagando boards do pipeline...');
  await prisma.pipelineBoard.deleteMany();
  
  console.log('Apagando contatos...');
  await prisma.contato.deleteMany();
  
  console.log('Base de dados limpa com sucesso!');
}

clear().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
