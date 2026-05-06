const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.profile.findUnique({
    where: { email: 'gabrielsousacj@gmail.com' }
  })

  if (!user) {
    console.log('Usuário não encontrado')
    return
  }

  // 1. Limpeza
  console.log('Limpando base de dados...')
  await prisma.dealStageHistory.deleteMany({ where: { user_id: user.id } })
  await prisma.pipelineCard.deleteMany({ where: { coluna: { board: { user_id: user.id } } } })
  await prisma.contato.deleteMany({ where: { user_id: user.id } })
  
  // 2. Garantir Pipeline Board e Colunas
  let board = await prisma.pipelineBoard.findFirst({
    where: { user_id: user.id, nome: 'Host Menos Imposto' }
  })

  if (!board) {
    board = await prisma.pipelineBoard.create({
      data: {
        user_id: user.id,
        nome: 'Host Menos Imposto',
        is_default: true,
        colunas: {
          create: [
            { nome: 'Nova Lead', ordem: 0, cor: '#3B82F6' },
            { nome: 'Qualificação', ordem: 1, cor: '#60A5FA' },
            { nome: 'Reunião Marcada', ordem: 2, cor: '#F59E0B' },
            { nome: 'Reunião Realizada', ordem: 3, cor: '#10B981' },
            { nome: 'Negociação', ordem: 4, cor: '#EF4444' },
            { nome: 'Follow up', ordem: 5, cor: '#8B5CF6' },
          ]
        }
      },
      include: { colunas: true }
    })
  } else {
    board = await prisma.pipelineBoard.findUnique({
      where: { id: board.id },
      include: { colunas: true }
    })
  }

  const novaLeadColuna = board.colunas.find(c => c.nome === 'Nova Lead')

  // 3. Gerar 50 contatos
  console.log('Gerando 50 contatos...')
  const nomes = [
    'Seu João', 'Maria Oliveira', 'Carlos Santos', 'Ana Costa', 'Pedro Souza',
    'Lucia Ferreira', 'Marcos Pereira', 'Fernanda Lima', 'Ricardo Rocha', 'Camila Alves',
    'Bruno Carvalho', 'Juliana Gomes', 'Gabriel Silva', 'Patrícia Ribeiro', 'Lucas Martins',
    'Bia Castro', 'Vitor Mendes', 'Clara Nunes', 'André Lopes', 'Sofia Almeida',
    'Ítalo Braga', 'Rômulo Dantas', 'Ana Beatriz', 'Narivaldo Silva', 'Lívia Pontes',
    'Josyelem Mara', 'Priscila Mota', 'Léo Valadares', 'Walton Rocha', 'Leonardo Aguiar',
    'Valéria Dornelas', 'Patrícia Aguiar', 'Evaldo Souza', 'Silvia Beleza', 'Maria Geralda',
    'Pri Molina', 'Maria Cecilia', 'Anita Bizarro', 'José Fortes', 'Lucineia Teles',
    'Helena Rezende', 'Gustavo Henrique', 'Thiago Lima', 'Cida Santos', 'Roberta Dias',
    'Marcelo Cunha', 'Edson Arantes', 'Marta Vieira', 'Júlia Lopes', 'Fábio Assunção'
  ]

  for (let i = 0; i < nomes.length; i++) {
    const nome = nomes[i]
    const contato = await prisma.contato.create({
      data: {
        user_id: user.id,
        nome: nome,
        telefone: `55119${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `${nome.toLowerCase().replace(/ /g, '.')}@email.com`,
        canal_origem: i % 2 === 0 ? 'Meta Ads' : 'Google Maps',
        tags: i < 5 ? ['LEAD AP'] : ['LEAD ZONA CINZA'],
        status_funil: 'lead'
      }
    })

    // Colocar os primeiros no pipeline (incluindo Seu João)
    if (i < 20 && novaLeadColuna) {
      await prisma.pipelineCard.create({
        data: {
          coluna_id: novaLeadColuna.id,
          titulo: `HMI - ${nome}`,
          contato_id: contato.id,
          valor: 5000,
          prioridade: i % 3 === 0 ? 'alta' : 'media',
          vendedor_id: user.id,
          ordem: i
        }
      })
    }
  }

  console.log('Banco de dados populado com sucesso!')
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
