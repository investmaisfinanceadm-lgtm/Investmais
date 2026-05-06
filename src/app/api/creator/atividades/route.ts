import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const { searchParams } = new URL(req.url)
    const dealId = searchParams.get('deal_id')
    const status = searchParams.get('status')

    const existingCount = await prisma.atividadeCRM.count({
      where: { contato: { user_id: userId } }
    })

    if (existingCount === 0) {
      await seedActivities(userId)
    }

    const where: any = { contato: { user_id: userId } }
    if (dealId) where.deal_id = dealId
    if (status) where.status = status

    const activities = await prisma.atividadeCRM.findMany({
      where,
      include: {
        contato: { select: { id: true, nome: true, empresa: true } },
        deal: { select: { id: true, titulo: true, valor: true } }
      },
      orderBy: { data: 'asc' }
    })

    return NextResponse.json(activities)
  } catch (err) {
    console.error('ATIVIDADES GET error:', err)
    return NextResponse.json({ error: 'Erro ao buscar atividades' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const { contato_id, deal_id, tipo, titulo, descricao, data, status } = await req.json()

    if (!contato_id || !tipo) {
      return NextResponse.json({ error: 'contato_id e tipo são obrigatórios' }, { status: 400 })
    }

    const contato = await prisma.contato.findFirst({
      where: { id: contato_id, user_id: userId }
    })
    if (!contato) return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })

    const activity = await prisma.atividadeCRM.create({
      data: {
        contato_id,
        deal_id: deal_id || null,
        tipo,
        titulo: titulo || null,
        descricao: descricao || '',
        status: status || 'pendente',
        data: data ? new Date(data) : new Date(),
      },
      include: {
        contato: { select: { id: true, nome: true, empresa: true } },
        deal: { select: { id: true, titulo: true, valor: true } }
      }
    })

    return NextResponse.json(activity)
  } catch (err) {
    console.error('ATIVIDADES POST error:', err)
    return NextResponse.json({ error: 'Erro ao criar atividade' }, { status: 500 })
  }
}

async function seedActivities(userId: string) {
  const contatos = await prisma.contato.findMany({
    where: { user_id: userId },
    include: { deals: { take: 1 } },
    take: 15
  })

  if (contatos.length === 0) return

  const hoje = new Date()

  const seedData = [
    { offset: -6, tipo: 'message', titulo: 'Primeiro contato WhatsApp', descricao: 'Mensagem inicial de apresentação enviada pelo WhatsApp', status: 'concluida' },
    { offset: -5, tipo: 'phone', titulo: 'Ligação inicial', descricao: 'Primeiro contato por telefone para apresentação da plataforma InvestMais', status: 'concluida' },
    { offset: -4, tipo: 'note', titulo: 'Anotação de reunião', descricao: 'Lead demonstrou interesse em plano enterprise. Solicitar proposta personalizada.', status: 'concluida' },
    { offset: -3, tipo: 'meeting', titulo: 'Reunião de descoberta', descricao: 'Entender as dores e objetivos do lead. Foco em rentabilidade e gestão fiscal.', status: 'concluida' },
    { offset: -2, tipo: 'email', titulo: 'Envio de proposta', descricao: 'Proposta personalizada enviada por e-mail com todos os detalhes do plano', status: 'concluida' },
    { offset: -1, tipo: 'message', titulo: 'Follow up WhatsApp', descricao: 'Verificar se recebeu a proposta e tirar dúvidas iniciais', status: 'pendente' },
    { offset: 0, tipo: 'phone', titulo: 'Ligação de follow up', descricao: 'Discutir dúvidas sobre a proposta e negociar condições', status: 'pendente' },
    { offset: 0, tipo: 'meeting', titulo: 'Reunião de fechamento', descricao: 'Negociação final e assinatura do contrato de prestação de serviços', status: 'pendente' },
    { offset: 1, tipo: 'email', titulo: 'Contrato por e-mail', descricao: 'Envio do contrato digital para assinatura via DocuSign', status: 'pendente' },
    { offset: 2, tipo: 'phone', titulo: 'Confirmação de assinatura', descricao: 'Verificar se o contrato foi assinado e esclarecer dúvidas finais', status: 'pendente' },
    { offset: 3, tipo: 'meeting', titulo: 'Onboarding', descricao: 'Apresentação completa da plataforma e configuração inicial da conta', status: 'pendente' },
    { offset: 5, tipo: 'message', titulo: 'Check-in pós-onboarding', descricao: 'Verificar como está sendo a experiência inicial com a plataforma', status: 'pendente' },
    { offset: 7, tipo: 'phone', titulo: 'Acompanhamento semanal', descricao: 'Revisão dos resultados da primeira semana e suporte técnico', status: 'pendente' },
    { offset: 10, tipo: 'email', titulo: 'Newsletter e conteúdo', descricao: 'Envio de material educativo sobre investimentos e gestão tributária', status: 'pendente' },
    { offset: 14, tipo: 'meeting', titulo: 'Revisão quinzenal', descricao: 'Análise dos resultados da primeira quinzena e planejamento do próximo período', status: 'pendente' },
  ]

  for (let i = 0; i < Math.min(contatos.length, seedData.length); i++) {
    const contato = contatos[i]
    const seed = seedData[i]
    const date = new Date(hoje)
    date.setDate(date.getDate() + seed.offset)

    await prisma.atividadeCRM.create({
      data: {
        contato_id: contato.id,
        deal_id: contato.deals[0]?.id || null,
        tipo: seed.tipo,
        titulo: seed.titulo,
        descricao: seed.descricao,
        status: seed.status,
        data: date,
      }
    })
  }
}
