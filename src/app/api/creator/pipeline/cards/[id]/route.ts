import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const data = await req.json()
    let {
      coluna_id, board_id, ordem, titulo, descricao, anotacoes, valor,
      vencimento, prioridade, categoria,
      vendedor_id, contato_id, status, lost_reason,
      deleted_at
    } = data

    // If board_id is provided, find the first column of that board
    if (board_id && !coluna_id) {
      const firstColumn = await prisma.pipelineStage.findFirst({
        where: { board_id, board: { user_id: userId } },
        orderBy: { ordem: 'asc' }
      })
      if (firstColumn) coluna_id = firstColumn.id
    }

    // Get current card to check if stage changed
    const currentCard = await prisma.pipelineCard.findUnique({
      where: { id: params.id },
      select: { coluna_id: true }
    })

    const isMoving = coluna_id && currentCard && currentCard.coluna_id !== coluna_id

    const card = await prisma.pipelineCard.update({
      where: {
        id: params.id,
        coluna: {
          board: {
            user_id: userId
          }
        }
      },
      data: {
        coluna_id: coluna_id || undefined,
        ordem: typeof ordem === 'number' ? ordem : undefined,
        titulo: titulo || undefined,
        descricao: descricao !== undefined ? (descricao || null) : undefined,
        anotacoes: anotacoes !== undefined ? (anotacoes || null) : undefined,
        valor: typeof valor === 'number' ? valor : undefined,
        vencimento: vencimento === null ? null : vencimento ? new Date(vencimento) : undefined,
        prioridade: prioridade || undefined,
        categoria: categoria !== undefined ? (categoria || null) : undefined,
        vendedor_id: vendedor_id !== undefined ? (vendedor_id || null) : undefined,
        contato_id: contato_id !== undefined ? (contato_id || null) : undefined,
        status: status || undefined,
        lost_reason: lost_reason || undefined,
        deleted_at: deleted_at === null ? null : deleted_at ? new Date(deleted_at) : undefined,
        fechado_em: (status === 'won' || status === 'lost') ? new Date() : undefined,
        movimentacoes: isMoving ? {
          create: {
            etapa_origem_id: currentCard.coluna_id,
            etapa_destino_id: coluna_id,
            user_id: userId,
            fonte: board_id ? 'pipeline_switch' : 'drag'
          }
        } : undefined
      },
      include: {
        contato: { select: { id: true, nome: true, telefone: true, email: true } },
        vendedor: { select: { id: true, nome: true, cor: true } }
      }
    })

    return NextResponse.json(card)
  } catch (err) {
    console.error('PIPELINE UPDATE error:', err)
    return NextResponse.json({ error: 'Erro ao atualizar card' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const { searchParams } = new URL(req.url)
    const permanent = searchParams.get('permanent') === 'true'

    if (permanent) {
      await prisma.pipelineCard.delete({
        where: { id: params.id, coluna: { board: { user_id: userId } } },
      })
    } else {
      await prisma.pipelineCard.update({
        where: { id: params.id, coluna: { board: { user_id: userId } } },
        data: { deleted_at: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PIPELINE DELETE error:', err)
    return NextResponse.json({ error: 'Erro ao deletar card' }, { status: 500 })
  }
}
