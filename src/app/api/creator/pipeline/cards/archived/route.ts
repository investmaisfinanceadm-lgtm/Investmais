import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const deals = await prisma.deal.findMany({
      where: {
        stage: { pipeline: { user_id: userId } },
        OR: [
          { status: { in: ['won', 'lost'] }, deleted_at: null },
          { deleted_at: { not: null } },
        ],
      },
      include: {
        vendedor: { select: { nome: true } },
        contato: { select: { id: true, nome: true, telefone: true } },
        stage: { select: { nome: true } },
      },
      orderBy: { fechado_em: 'desc' },
      take: 200,
    })

    return NextResponse.json(deals)
  } catch (err) {
    console.error('ARCHIVED GET error:', err)
    return NextResponse.json({ error: 'Erro ao buscar arquivados' }, { status: 500 })
  }
}
