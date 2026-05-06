import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const { tipo, titulo, descricao, status, data: activityDate } = await req.json()

    const activity = await prisma.atividadeCRM.update({
      where: {
        id: params.id,
        contato: { user_id: userId }
      },
      data: {
        tipo: tipo || undefined,
        titulo: titulo !== undefined ? (titulo || null) : undefined,
        descricao: descricao || undefined,
        status: status || undefined,
        data: activityDate ? new Date(activityDate) : undefined,
      },
      include: {
        contato: { select: { id: true, nome: true, empresa: true } },
        deal: { select: { id: true, titulo: true, valor: true } }
      }
    })

    return NextResponse.json(activity)
  } catch (err) {
    console.error('ATIVIDADE UPDATE error:', err)
    return NextResponse.json({ error: 'Erro ao atualizar atividade' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    await prisma.atividadeCRM.delete({
      where: {
        id: params.id,
        contato: { user_id: userId }
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('ATIVIDADE DELETE error:', err)
    return NextResponse.json({ error: 'Erro ao excluir atividade' }, { status: 500 })
  }
}
