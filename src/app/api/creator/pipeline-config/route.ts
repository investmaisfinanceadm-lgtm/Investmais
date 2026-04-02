export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — returns all boards for the user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id

  const boards = await prisma.pipelineBoard.findMany({
    where: { user_id: userId },
    include: { 
      colunas: { 
        orderBy: { ordem: 'asc' },
        include: { cards: { orderBy: { ordem: 'asc' } } }
      } 
    },
  })

  // If no board, create the default one
  if (boards.length === 0) {
    const defaultBoard = await prisma.pipelineBoard.create({
      data: {
        user_id: userId,
        nome: 'Vendas',
        colunas: {
          createMany: {
            data: [
              { nome: 'Leads',        ordem: 0, cor: '#3B82F6' },
              { nome: 'Qualificação',   ordem: 1, cor: '#F59E0B' },
              { nome: 'Proposta',       ordem: 2, cor: '#2563EB' },
              { nome: 'Fechado',        ordem: 3, cor: '#8B5CF6' },
            ],
          },
        },
      },
      include: { colunas: { orderBy: { ordem: 'asc' }, include: { cards: true } } },
    })
    return NextResponse.json([defaultBoard])
  }

  return NextResponse.json(boards)
}

// POST — Create a new board or column
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id

  const data = await req.json()
  const { type, nome, color, boardId } = data

  if (type === 'board') {
    const board = await prisma.pipelineBoard.create({
      data: {
        user_id: userId,
        nome,
        colunas: {
            create: { nome: 'Início', ordem: 0, cor: '#3B82F6' }
        }
      },
      include: { colunas: true }
    })
    return NextResponse.json(board)
  }

  if (type === 'column') {
    const lastCol = await prisma.pipelineColuna.findFirst({
        where: { board_id: boardId },
        orderBy: { ordem: 'desc' }
    })
    const column = await prisma.pipelineColuna.create({
      data: {
        board_id: boardId,
        nome,
        cor: color || '#3B82F6',
        ordem: lastCol ? lastCol.ordem + 1 : 0
      },
      include: { cards: true }
    })
    return NextResponse.json(column)
  }

  return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
}
