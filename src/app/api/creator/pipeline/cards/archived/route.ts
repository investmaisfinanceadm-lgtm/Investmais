import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const cards = await prisma.pipelineCard.findMany({
      where: {
        coluna: {
          board: {
            user_id: userId
          }
        },
        status: { in: ['won', 'lost'] }
      },
      include: {
        vendedor: { select: { nome: true } }
      },
      orderBy: { fechado_em: 'desc' }
    })

    return NextResponse.json(cards)
  } catch (err) {
    console.error('ARCHIVED GET error:', err)
    return NextResponse.json({ error: 'Erro ao buscar arquivados' }, { status: 500 })
  }
}
