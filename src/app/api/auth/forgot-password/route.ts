import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const user = await prisma.profile.findUnique({ where: { email } })
    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({ message: 'Se o email existir, você receberá as instruções.' })
    }

    const token = randomBytes(32).toString('hex')
    const expires_at = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.passwordResetToken.create({
      data: { user_id: user.id, token, expires_at },
    })

    // TODO: send email - for now return token in dev
    const resetUrl = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${token}`
    console.log('Reset URL:', resetUrl)

    return NextResponse.json({ message: 'Se o email existir, você receberá as instruções.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
