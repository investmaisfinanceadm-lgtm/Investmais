export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { nome: true, email: true, avatar_url: true, cota_mensal: true, cota_usada: true },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()

    // If changing password, verify current password first
    if (body.novaSenha) {
      const user = await prisma.profile.findUnique({
        where: { id: userId },
        select: { password: true },
      })

      if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

      const valid = await bcrypt.compare(body.senhaAtual, user.password)
      if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })

      const hashed = await bcrypt.hash(body.novaSenha, 10)
      await prisma.profile.update({
        where: { id: userId },
        data: { password: hashed },
      })

      return NextResponse.json({ success: true })
    }

    // Update profile info
    const { nome, email } = body
    await prisma.profile.update({
      where: { id: userId },
      data: { nome, email },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
