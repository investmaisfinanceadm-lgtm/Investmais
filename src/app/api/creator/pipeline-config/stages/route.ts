export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOrCreateBoard(userId: string) {
  let board = await prisma.pipelineBoard.findFirst({ where: { user_id: userId } })
  if (!board) {
    board = await prisma.pipelineBoard.create({
      data: { user_id: userId, nome: 'Pipeline Principal' },
    })
  }
  return board
}

// POST — create stage
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id
  const { nome, cor } = await req.json()
  if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  const board = await getOrCreateBoard(userId)
  const count = await prisma.pipelineColuna.count({ where: { board_id: board.id } })

  const coluna = await prisma.pipelineColuna.create({
    data: { board_id: board.id, nome, cor: cor || '#3B82F6', ordem: count },
  })
  return NextResponse.json(coluna)
}

// PATCH — edit stage
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id
  const { id, nome, cor } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const board = await prisma.pipelineBoard.findFirst({ where: { user_id: userId } })
  if (!board) return NextResponse.json({ error: 'Board não encontrado' }, { status: 404 })

  const coluna = await prisma.pipelineColuna.updateMany({
    where: { id, board_id: board.id },
    data: { ...(nome && { nome }), ...(cor && { cor }) },
  })
  return NextResponse.json(coluna)
}

// DELETE — delete stage (optionally move cards to another stage first)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const targetColumnId = searchParams.get('target_column_id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const board = await prisma.pipelineBoard.findFirst({ where: { user_id: userId } })
  if (!board) return NextResponse.json({ error: 'Board não encontrado' }, { status: 404 })

  // Count cards in this stage
  const cardCount = await prisma.pipelineCard.count({ where: { coluna_id: id, status: 'open', deleted_at: null } })

  // If there are cards and no target specified, return the count so frontend can prompt
  if (cardCount > 0 && !targetColumnId) {
    return NextResponse.json({ needsTarget: true, cardCount }, { status: 409 })
  }

  // Move cards to target column if specified
  if (targetColumnId && cardCount > 0) {
    await prisma.pipelineCard.updateMany({
      where: { coluna_id: id },
      data: { coluna_id: targetColumnId }
    })
  }

  await prisma.pipelineColuna.deleteMany({ where: { id, board_id: board.id } })
  return NextResponse.json({ success: true })
}
