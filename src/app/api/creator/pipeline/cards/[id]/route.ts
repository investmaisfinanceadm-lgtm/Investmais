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
    const { coluna_id, ordem, titulo, descricao, valor, vencimento, prioridade } = data

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
        descricao: descricao || undefined,
        valor: typeof valor === 'number' ? valor : undefined,
        vencimento: vencimento ? new Date(vencimento) : undefined,
        prioridade: prioridade || undefined,
      },
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

    await prisma.pipelineCard.delete({
      where: { 
        id: params.id,
        coluna: {
          board: {
            user_id: userId
          }
        }
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PIPELINE DELETE error:', err)
    return NextResponse.json({ error: 'Erro ao deletar card' }, { status: 500 })
  }
}
