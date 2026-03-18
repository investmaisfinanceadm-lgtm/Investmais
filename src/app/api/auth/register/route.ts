import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { nome, email, password } = await req.json()

    if (!nome || !email || !password) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const existing = await prisma.profile.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.profile.create({
      data: {
        nome,
        email,
        password: hashed,
        perfil: 'criador',
        cota_mensal: 10,
        cota_usada: 0,
        status: 'ativo',
      },
    })

    return NextResponse.json({ id: user.id })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
