export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).perfil !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const users = await prisma.profile.findMany({
      select: { id: true, nome: true, email: true, cota_mensal: true, cota_usada: true, avatar_url: true },
      orderBy: { nome: 'asc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Get cotas error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).perfil !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { userId, cota_mensal } = await req.json()

    await prisma.profile.update({
      where: { id: userId },
      data: { cota_mensal },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update quota error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).perfil !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { cota_mensal } = await req.json()

    await prisma.profile.updateMany({
      data: { cota_mensal },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update all quotas error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
