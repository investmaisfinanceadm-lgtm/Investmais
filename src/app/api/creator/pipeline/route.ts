import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    // Busca o board padrão do usuário
    const board = await prisma.pipelineBoard.findFirst({
      where: { user_id: userId },
      include: {
        colunas: {
          orderBy: { ordem: 'asc' },
          include: {
            cards: {
              where: { status: 'open' },
              orderBy: { ordem: 'asc' },
              include: {
                contato: { select: { id: true, nome: true, telefone: true, email: true, tags: true } },
                vendedor: { select: { id: true, nome: true, cor: true, avatar_url: true } }
              }
            }
          }
        }
      }
    })

    if (!board) {
      return NextResponse.json({ columns: [] })
    }

    // Mapeia para o formato que o frontend espera (KanbanColumn)
    const columns = board.colunas.map(col => ({
      id: col.id,
      name: col.nome,
      color: col.cor,
      probabilidade: col.probabilidade,
      slaHoras: col.sla_horas,
      cards: col.cards.map(card => ({
        id: card.id,
        title: card.titulo,
        category: (card.contato as any)?.tags?.[0] || 'LEAD ZONA CINZA',
        categoryColor: (card.contato as any)?.tags?.[0] === 'LEAD AP' ? 'emerald' : 'orange',
        priority: card.prioridade || 'media',
        responsible: {
          name: card.vendedor?.nome || 'Sem vendedor',
          initials: card.vendedor?.nome ? card.vendedor.nome.split(' ').map(n => n[0]).join('').slice(0, 2) : '??',
          color: card.vendedor?.cor || '#3B82F6',
          avatar_url: (card.vendedor as any)?.avatar_url
        },
        dueDate: card.vencimento ? card.vencimento.toISOString() : new Date().toISOString(),
        value: card.valor || 0,
        description: card.descricao || '',
        columnId: col.id,
        status: card.status,
        createdAt: card.created_at.toISOString(),
        updatedAt: card.created_at.toISOString(),
        linkedContact: card.contato ? {
          name: card.contato.nome,
          phone: card.contato.telefone,
          email: card.contato.email
        } : null
      }))
    }))

    return NextResponse.json({ columns })
  } catch (err) {
    console.error('PIPELINE BOARD GET error:', err)
    return NextResponse.json({ error: 'Erro ao buscar pipeline' }, { status: 500 })
  }
}
