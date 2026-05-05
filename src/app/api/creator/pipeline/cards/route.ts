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
        status: 'open'
      },
      include: {
        contato: { select: { id: true, nome: true, telefone: true, email: true } },
        vendedor: { select: { id: true, nome: true, cor: true } }
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
    const { 
      titulo, descricao, valor, vencimento, 
      prioridade, categoria, coluna_id, 
      contato_id, vendedor_id, origem, ordem 
    } = data

    const card = await prisma.pipelineCard.create({
      data: {
        coluna_id,
        titulo,
        descricao,
        valor: parseFloat(valor) || 0,
        vencimento: vencimento ? new Date(vencimento) : null,
        prioridade: prioridade || 'media',
        categoria,
        contato_id,
        vendedor_id: vendedor_id || userId,
        origem: origem || 'manual',
        ordem: ordem || 0,
        status: 'open',
        movimentacoes: {
          create: {
            etapa_destino_id: coluna_id,
            user_id: userId,
            fonte: 'manual'
          }
        }
      },
      include: {
        contato: { select: { id: true, nome: true, telefone: true, email: true } },
        vendedor: { select: { id: true, nome: true, cor: true } }
      }
    })

    return NextResponse.json(card)
  } catch (err: any) {
    console.error('PIPELINE POST error:', err)
    return NextResponse.json({ error: err?.message || 'Erro ao criar card' }, { status: 500 })
  }
}
