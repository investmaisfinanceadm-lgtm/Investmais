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
    const pipelineId = searchParams.get('board_id') || searchParams.get('pipeline_id')

    const allPipelines = await prisma.pipeline.findMany({
      where: { user_id: userId },
      select: { id: true, nome: true, is_default: true },
      orderBy: { created_at: 'asc' }
    })

    const vendedores = await prisma.profile.findMany({
      select: { id: true, nome: true, cor: true, avatar_url: true },
      orderBy: { nome: 'asc' }
    })

    // Busca o pipeline padrão do usuário
    let pipeline = await prisma.pipeline.findFirst({
      where: pipelineId ? { id: pipelineId, user_id: userId } : { user_id: userId },
      include: {
        stages: {
          orderBy: { ordem: 'asc' },
          include: {
            deals: {
              where: { status: 'open', deleted_at: null },
              orderBy: { ordem: 'asc' },
              include: {
                contato: { select: { id: true, nome: true, telefone: true, email: true, tags: true } },
                vendedor: { select: { id: true, nome: true, cor: true, avatar_url: true } },
                _count: { select: { atividades: { where: { status: 'pendente' } } } }
              }
            }
          }
        }
      }
    })

    if (!pipeline) {
      // Cria o pipeline padrão
      const newPipeline = await prisma.pipeline.create({
        data: {
          user_id: userId,
          nome: 'Pipeline Padrão',
          stages: {
            create: [
              { nome: 'Novo Lead', cor: '#3B82F6', ordem: 0, probabilidade: 10 },
              { nome: 'Qualificação', cor: '#8B5CF6', ordem: 1, probabilidade: 25 },
              { nome: 'Reunião Marcada', cor: '#F59E0B', ordem: 2, probabilidade: 50 },
              { nome: 'Reunião Agendada', cor: '#F97316', ordem: 3, probabilidade: 60 },
              { nome: 'Reunião Realizada', cor: '#10B981', ordem: 4, probabilidade: 80 },
              { nome: 'Follow Up', cor: '#EC4899', ordem: 5, probabilidade: 90 },
            ]
          }
        },
        include: { stages: { orderBy: { ordem: 'asc' } } }
      })

      // Buscar novamente após criar
      const refreshedPipeline = await prisma.pipeline.findFirst({
        where: { user_id: userId },
        include: {
          stages: {
            orderBy: { ordem: 'asc' },
            include: {
              deals: {
                where: { status: 'open', deleted_at: null },
                orderBy: { ordem: 'asc' },
                include: {
                  contato: { select: { id: true, nome: true, telefone: true, email: true, tags: true } },
                  vendedor: { select: { id: true, nome: true, cor: true, avatar_url: true } },
                  _count: { select: { atividades: { where: { status: 'pendente' } } } }
                }
              }
            }
          }
        }
      })
      
      if (!refreshedPipeline) return NextResponse.json({ columns: [], vendedores, boards: allPipelines, currentBoardId: null })
      pipeline = refreshedPipeline
    }

    // Mapeia para o formato que o frontend espera (KanbanColumn)
    const columns = pipeline.stages.map(stage => ({
      id: stage.id,
      name: stage.nome,
      color: stage.cor,
      probabilidade: stage.probabilidade,
      slaHoras: stage.sla_horas,
      cards: stage.deals.map(deal => ({
        id: deal.id,
        title: deal.titulo,
        category: (deal.contato as any)?.tags?.[0] || 'LEAD ZONA CINZA',
        categoryColor: (deal.contato as any)?.tags?.[0] === 'LEAD AP' ? 'emerald' : 'orange',
        priority: deal.prioridade || 'media',
        responsible: {
          name: deal.vendedor?.nome || 'Sem vendedor',
          initials: deal.vendedor?.nome ? deal.vendedor.nome.split(' ').map(n => n[0]).join('').slice(0, 2) : '??',
          color: deal.vendedor?.cor || '#3B82F6',
          avatar_url: (deal.vendedor as any)?.avatar_url
        },
        dueDate: deal.vencimento ? deal.vencimento.toISOString() : new Date().toISOString(),
        value: deal.valor || 0,
        description: deal.descricao || '',
        anotacoes: (deal as any).anotacoes || '',
        columnId: stage.id,
        status: deal.status,
        createdAt: deal.created_at.toISOString(),
        updatedAt: deal.created_at.toISOString(),
        pendingTasksCount: (deal as any)._count?.atividades ?? 0,
        linkedContact: deal.contato ? {
          id: deal.contato.id,
          name: deal.contato.nome,
          phone: deal.contato.telefone,
          email: deal.contato.email
        } : null
      }))
    }))

    return NextResponse.json({ columns, vendedores, boards: allPipelines, currentBoardId: pipeline.id })
  } catch (err) {
    console.error('PIPELINE BOARD GET error:', err)
    return NextResponse.json({ error: 'Erro ao buscar pipeline' }, { status: 500 })
  }
}
