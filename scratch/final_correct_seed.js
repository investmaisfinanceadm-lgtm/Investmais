const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting COMPLETE reset and CORRECT seed...');

  // 1. GLOBAL CLEANUP
  await prisma.dealStageHistory.deleteMany({});
  await prisma.atividadeCRM.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.contato.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.leadCNPJ.deleteMany({});
  await prisma.leadSearchHistory.deleteMany({});
  await prisma.stage.deleteMany({});
  await prisma.pipeline.deleteMany({});
  console.log('Cleanup finished.');

  // 2. Identify all users
  const profiles = await prisma.profile.findMany();
  console.log(`Seeding for ${profiles.length} users...`);

  const contactsData = [
    { nome: 'Ricardo Oliveira', empresa: 'Oliveira Investimentos', email: 'ricardo@oliveira.com.br', telefone: '11988887777', cargo: 'Diretor', nicho: 'Finanças', cidade: 'São Paulo', estado: 'SP' },
    { nome: 'Ana Paula Santos', empresa: 'Santos Advogados', email: 'ana@santos.com', telefone: '21977776666', cargo: 'Sócia', nicho: 'Advocacia', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { nome: 'Marcos Vinícius', empresa: 'Tech Solution', email: 'marcos@tech.com', telefone: '31966665555', cargo: 'Gerente TI', nicho: 'Tecnologia', cidade: 'Belo Horizonte', estado: 'MG' },
    { nome: 'Juliana Ferreira', empresa: 'Clínica Sorriso', email: 'juliana@sorriso.com', telefone: '41955554444', cargo: 'Adm', nicho: 'Saúde', cidade: 'Curitiba', estado: 'PR' },
    { nome: 'Fernando Costa', empresa: 'Construtora Horizonte', email: 'fernando@horizonte.com', telefone: '62944443333', cargo: 'Engenheiro', nicho: 'Construção', cidade: 'Goiânia', estado: 'GO' }
  ];

  for (const user of profiles) {
    console.log(`- Seeding for user: ${user.nome} (${user.id})`);

    // Create a default board for this user
    const board = await prisma.pipeline.create({
      data: {
        user_id: user.id,
        nome: 'Vendas Diretas',
        stages: {
          create: [
            { nome: 'Leads', ordem: 0, cor: '#3B82F6' },
            { nome: 'Qualificação', ordem: 1, cor: '#F59E0B' },
            { nome: 'Proposta', ordem: 2, cor: '#2563EB' },
            { nome: 'Fechado', ordem: 3, cor: '#8B5CF6' }
          ]
        }
      },
      include: { stages: true }
    });

    const firstStageId = board.stages[0].id;

    for (const data of contactsData) {
      const contato = await prisma.contato.create({
        data: {
          ...data,
          user_id: user.id,
          status_funil: 'lead',
          canal_origem: Math.random() > 0.5 ? 'Indicação' : 'Site'
        }
      });

      await prisma.deal.create({
        data: {
          stage_id: firstStageId,
          titulo: `Deal - ${contato.empresa}`,
          contato_id: contato.id,
          valor: Math.floor(Math.random() * 5000) + 1000,
          prioridade: 'alta',
          vendedor_id: user.id,
          status: 'open'
        }
      });
    }
  }

  console.log('COMPLETE Reset and Seed Done!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
