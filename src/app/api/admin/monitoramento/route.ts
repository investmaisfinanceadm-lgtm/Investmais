export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).perfil !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const [videos, profiles] = await Promise.all([
      prisma.video.findMany({
        select: {
          id: true,
          nome_produto: true,
          formato: true,
          linha_editorial: true,
          duracao: true,
          status: true,
          video_url: true,
          created_at: true,
          user_id: true,
          user: { select: { nome: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.profile.findMany({
        select: { id: true, nome: true },
      }),
    ])

    return NextResponse.json({
      videos: videos.map((v) => ({
        id: v.id,
        nome_produto: v.nome_produto,
        formato: v.formato,
        linha_editorial: v.linha_editorial,
        duracao: v.duracao,
        status: v.status,
        video_url: v.video_url,
        created_at: v.created_at.toISOString(),
        user_id: v.user_id,
        user_nome: v.user?.nome || 'Desconhecido',
      })),
      users: profiles,
    })
  } catch (error) {
    console.error('Get monitoramento error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).perfil !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { videoId } = await req.json()

    await prisma.video.delete({ where: { id: videoId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
