export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { videoId, pastaId } = await req.json()

    if (userId === 'dev-admin-id') {
      return NextResponse.json({ success: true })
    }

    await prisma.video.update({
      where: { id: videoId, user_id: userId },
      data: { pasta_id: pastaId || null }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Move video error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
