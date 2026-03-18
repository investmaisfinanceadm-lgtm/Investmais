import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken || resetToken.used || resetToken.expires_at < new Date()) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    await prisma.$transaction([
      prisma.profile.update({
        where: { id: resetToken.user_id },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({ message: 'Senha atualizada com sucesso' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
