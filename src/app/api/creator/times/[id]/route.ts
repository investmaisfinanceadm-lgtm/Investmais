export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, addMemberId, removeMemberId } = await req.json()

  if (nome !== undefined) {
    await prisma.team.update({ where: { id: params.id }, data: { nome } })
  }
  if (addMemberId) {
    await prisma.profile.update({ where: { id: addMemberId }, data: { time_id: params.id } })
  }
  if (removeMemberId) {
    await prisma.profile.update({ where: { id: removeMemberId }, data: { time_id: null } })
  }

  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      membros: { select: { id: true, nome: true, email: true, perfil: true, avatar_url: true } },
    },
  })

  return NextResponse.json(team)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await prisma.profile.updateMany({ where: { time_id: params.id }, data: { time_id: null } })
  await prisma.team.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
