export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).perfil !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    const user = await prisma.profile.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: 'Se o email existir, o link foi enviado.' })
    }

    const token = randomBytes(32).toString('hex')
    const expires_at = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.passwordResetToken.create({
      data: { user_id: user.id, token, expires_at },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${token}`
    console.log('Admin reset URL for', email, ':', resetUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin reset password error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
