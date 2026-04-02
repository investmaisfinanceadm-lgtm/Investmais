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
        }
      },
      orderBy: { ordem: 'asc' }
    })

    return NextResponse.json(cards)
  } catch (err) {
    console.error('PIPELINE GET error:', err)
    return NextResponse.json({ error: 'Erro ao buscar cards' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const data = await req.json()
    const { titulo, descricao, responsavel, valor, vencimento, prioridade, categoria, coluna_id, ordem } = data

    const card = await prisma.pipelineCard.create({
      data: {
        coluna_id,
        titulo,
        descricao,
        responsavel,
        valor: parseFloat(valor) || 0,
        vencimento: vencimento ? new Date(vencimento) : null,
        prioridade: prioridade || 'media',
        categoria,
        ordem: ordem || 0,
      },
    })

    return NextResponse.json(card)
  } catch (err: any) {
    console.error('PIPELINE POST error:', err)
    return NextResponse.json({ error: err?.message || 'Erro ao criar card' }, { status: 500 })
  }
}
