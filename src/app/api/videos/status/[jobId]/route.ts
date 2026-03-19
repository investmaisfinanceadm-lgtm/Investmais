export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { jobId } = params

    const video = await prisma.video.findUnique({
      where: { id: jobId, user_id: userId },
    })

    if (!video) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: video.id,
      status: video.status,
      video_url: video.video_url,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
