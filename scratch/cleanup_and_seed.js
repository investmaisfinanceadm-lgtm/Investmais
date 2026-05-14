const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = '6cb75e0f-136e-4bb5-baf9-7325c3804d4f';
  const stageId = '7e16399e-7af5-4c1a-8bae-a1bac20c9d17'; // Novo Lead

  console.log('Cleaning up contacts and deals...');
  // Delete deals first due to foreign key constraints if any (though prisma handles it usually)
  await prisma.deal.deleteMany({ where: { stage: { pipeline: { user_id: userId } } } });
  await prisma.contato.deleteMany({ where: { user_id: userId } });

  console.log('Creating 5 new contacts and deals...');

  const contactsData = [
    {
      nome: 'Ricardo Oliveira',
      empresa: 'Oliveira Investimentos',
      email: 'ricardo@oliveira.com.br',
      telefone: '(11) 98888-7777',
      cargo: 'Diretor Executivo',
      nicho: 'Finanças',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    {
      nome: 'Ana Paula Santos',
      empresa: 'Santos Advogados Associados',
      email: 'ana.paula@santosadv.com',
      telefone: '(21) 97777-6666',
      cargo: 'Sócia',
      nicho: 'Advocacia',
      cidade: 'Rio de Janeiro',
      estado: 'RJ'
    },
    {
      nome: 'Marcos Vinícius',
      empresa: 'Tech Solution BR',
      email: 'marcos@techsolution.com',
      telefone: '(31) 96666-5555',
      cargo: 'Gerente de TI',
      nicho: 'Tecnologia',
      cidade: 'Belo Horizonte',
      estado: 'MG'
    },
    {
      nome: 'Juliana Ferreira',
      empresa: 'Clínica Sorriso Real',
      email: 'juliana@sorrisoreal.com',
      telefone: '(41) 95555-4444',
      cargo: 'Administradora',
      nicho: 'Saúde',
      cidade: 'Curitiba',
      estado: 'PR'
    },
    {
      nome: 'Fernando Costa',
      empresa: 'Construtora Horizonte',
      email: 'fernando@horizonte.eng.br',
      telefone: '(62) 94444-3333',
      cargo: 'Engenheiro Chefe',
      nicho: 'Construção Civil',
      cidade: 'Goiânia',
      estado: 'GO'
    }
  ];

  for (const data of contactsData) {
    const contato = await prisma.contato.create({
      data: {
        ...data,
        user_id: userId,
        status_funil: 'lead',
        canal_origem: 'Indicação'
      }
    });

    await prisma.deal.create({
      data: {
        stage_id: stageId,
        titulo: `Deal - ${contato.empresa}`,
        contato_id: contato.id,
        valor: Math.floor(Math.random() * 5000) + 1000,
        prioridade: 'alta',
        vendedor_id: userId
      }
    });
  }

  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
