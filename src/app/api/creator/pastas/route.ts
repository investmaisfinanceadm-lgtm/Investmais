export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const pastas = await prisma.pasta.findMany({
      where: { user_id: userId },
      orderBy: { nome: 'asc' },
    })

    return NextResponse.json(
      pastas.map((p) => ({
        ...p,
        created_at: p.created_at.toISOString(),
      }))
    )
  } catch (error) {
    console.error('Get pastas error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { nome } = await req.json()

    const pasta = await prisma.pasta.create({
      data: { user_id: userId, nome },
    })

    return NextResponse.json({ ...pasta, created_at: pasta.created_at.toISOString() })
  } catch (error) {
    console.error('Create pasta error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
