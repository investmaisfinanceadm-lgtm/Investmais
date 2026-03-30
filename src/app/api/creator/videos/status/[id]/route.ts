export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const isDev = userId === 'dev-admin-id'

    if (isDev) {
      // Simulate slow processing and eventual success
      return NextResponse.json({ 
          status: 'concluido', 
          id: params.id,
          video_url: 'https://vjs.zencdn.net/v/oceans.mp4' // Mock video URL
      })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.id, user_id: userId },
      select: { status: true, video_url: true, id: true }
    })

    if (!video) return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Get status error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
