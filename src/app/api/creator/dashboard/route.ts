export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const [profile, recentVideos, totalVideos] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: userId },
        select: { nome: true, cota_mensal: true, cota_usada: true },
      }),
      prisma.video.findMany({
        where: { user_id: userId },
        select: { id: true, nome_produto: true, status: true, created_at: true, duracao: true },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      prisma.video.count({ where: { user_id: userId } }),
    ])

    return NextResponse.json({
      profile: profile
        ? {
            ...profile,
            videosTotal: totalVideos,
          }
        : null,
      recentVideos: recentVideos.map((v) => ({
        ...v,
        created_at: v.created_at.toISOString(),
        status: v.status as string,
      })),
    })
  } catch (error) {
    console.error('Creator dashboard error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
