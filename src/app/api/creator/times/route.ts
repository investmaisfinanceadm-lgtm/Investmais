export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const teams = await prisma.team.findMany({
    include: {
      membros: {
        select: { id: true, nome: true, email: true, perfil: true, avatar_url: true, cor: true },
      },
    },
    orderBy: { created_at: 'asc' },
  })

  return NextResponse.json(teams)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome } = await req.json()
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  const team = await prisma.team.create({
    data: { nome: nome.trim() },
    include: {
      membros: { select: { id: true, nome: true, email: true, perfil: true, avatar_url: true } },
    },
  })

  return NextResponse.json(team)
}
