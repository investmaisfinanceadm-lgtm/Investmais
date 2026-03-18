export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).perfil !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const users = await prisma.profile.findMany({
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        perfil: u.perfil,
        status: u.status,
        cota_mensal: u.cota_mensal,
        cota_usada: u.cota_usada,
        created_at: u.created_at.toISOString(),
        last_activity: u.last_activity ? u.last_activity.toISOString() : null,
        avatar_url: u.avatar_url,
      }))
    )
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).perfil !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, email, senha, perfil, cota_mensal } = body

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const existing = await prisma.profile.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(senha, 10)
    const user = await prisma.profile.create({
      data: {
        nome,
        email,
        password: hashed,
        perfil: perfil || 'criador',
        cota_mensal: cota_mensal || 10,
        cota_usada: 0,
        status: 'ativo',
      },
    })

    return NextResponse.json({ success: true, user_id: user.id })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
