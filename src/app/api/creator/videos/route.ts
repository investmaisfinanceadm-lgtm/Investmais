export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
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

    const videos = await prisma.video.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        nome_produto: true,
        formato: true,
        duracao: true,
        status: true,
        video_url: true,
        pasta_id: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(
      videos.map((v) => ({
        ...v,
        created_at: v.created_at.toISOString(),
        status: v.status as string,
      }))
    )
  } catch (error) {
    console.error('Get videos error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()

    const video = await prisma.video.create({
      data: {
        user_id: userId,
        nome_produto: body.nome_produto,
        descricao_produto: body.descricao_produto,
        imagem_produto_url: body.imagem_produto_url || null,
        logo_empresa_url: body.logo_empresa_url || null,
        formato: body.formato,
        linha_editorial: body.linha_editorial,
        duracao: body.duracao,
        tom: body.tom,
        status: 'processando',
      },
      select: { id: true },
    })

    return NextResponse.json({ id: video.id })
  } catch (error) {
    console.error('Create video error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
