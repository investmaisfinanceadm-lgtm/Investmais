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
    let board = await prisma.pipelineBoard.findFirst({
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
      // Cria o board padrão
      const newBoard = await prisma.pipelineBoard.create({
        data: {
          user_id: userId,
          nome: 'Pipeline Padrão',
          colunas: {
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
        include: { colunas: { orderBy: { ordem: 'asc' } } }
      })

      // Gerar 50 contatos e cards
      const generatedCards = []
      for (let i = 1; i <= 50; i++) {
        // Distribui entre as colunas aleatoriamente
        const randomColIndex = Math.floor(Math.random() * newBoard.colunas.length)
        const column = newBoard.colunas[randomColIndex]

        const contato = await prisma.contato.create({
          data: {
            user_id: userId,
            nome: `Lead Fantasia ${i}`,
            email: `lead${i}@empresa.com`,
            telefone: `1199999${i.toString().padStart(4, '0')}`,
            empresa: `Empresa ${i} SA`,
            status_funil: 'lead',
            tags: i % 2 === 0 ? ['LEAD AP'] : ['LEAD FANTASIA']
          }
        })

        await prisma.pipelineCard.create({
          data: {
            coluna_id: column.id,
            titulo: `Oportunidade - ${contato.empresa}`,
            contato_id: contato.id,
            valor: Math.floor(Math.random() * 10000) + 1000,
            ordem: i,
          }
        })
      }

      // Buscar novamente após criar
      const refreshedBoard = await prisma.pipelineBoard.findFirst({
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
      
      if (!refreshedBoard) return NextResponse.json({ columns: [] })
      board = refreshedBoard
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
