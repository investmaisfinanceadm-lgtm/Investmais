export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — returns first board + its columns (stages)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id

  let board = await prisma.pipelineBoard.findFirst({
    where: { user_id: userId },
    include: { colunas: { orderBy: { ordem: 'asc' } } },
  })

  if (!board) {
    board = await prisma.pipelineBoard.create({
      data: {
        user_id: userId,
        nome: 'Pipeline Principal',
        colunas: {
          createMany: {
            data: [
              { nome: 'Novo Lead',      ordem: 0, cor: '#3B82F6' },
              { nome: 'Qualificação',   ordem: 1, cor: '#8B5CF6' },
              { nome: 'Reunião Marcada',ordem: 2, cor: '#F59E0B' },
              { nome: 'Proposta',       ordem: 3, cor: '#10B981' },
              { nome: 'Negociação',     ordem: 4, cor: '#EF4444' },
              { nome: 'Follow up',      ordem: 5, cor: '#6366F1' },
            ],
          },
        },
      },
      include: { colunas: { orderBy: { ordem: 'asc' } } },
    })
  }

  return NextResponse.json(board)
}
