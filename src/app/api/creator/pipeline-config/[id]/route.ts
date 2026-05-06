export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id

  const board = await prisma.pipelineBoard.findFirst({ where: { id: params.id, user_id: userId } })
  if (!board) return NextResponse.json({ error: 'Board não encontrado' }, { status: 404 })

  const data = await req.json()
  const updated = await prisma.pipelineBoard.update({
    where: { id: params.id },
    data: { ...(data.nome && { nome: data.nome }) },
    include: { colunas: { orderBy: { ordem: 'asc' } } },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id

  const board = await prisma.pipelineBoard.findFirst({ where: { id: params.id, user_id: userId } })
  if (!board) return NextResponse.json({ error: 'Board não encontrado' }, { status: 404 })

  const total = await prisma.pipelineBoard.count({ where: { user_id: userId } })
  if (total <= 1) return NextResponse.json({ error: 'Não é possível remover o único pipeline' }, { status: 400 })

  await prisma.pipelineBoard.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
