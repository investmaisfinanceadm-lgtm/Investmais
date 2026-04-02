export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { triggerVideoN8N } from '@/lib/api/n8n'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const formData = await request.formData()
    const nome_produto = formData.get('nome_produto') as string
    const descricao_produto = formData.get('descricao_produto') as string
    const formato = formData.get('formato') as string
    const linha_editorial = formData.get('linha_editorial') as string
    const duracao = parseInt(formData.get('duracao') as string)
    const tom = formData.get('tom') as string
    const imageFile = formData.get('image') as File | null

    if (!nome_produto || !descricao_produto) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Criar registro do vídeo no banco com status processando
    const video = await prisma.video.create({
      data: {
        user_id: userId,
        nome_produto,
        descricao_produto,
        formato,
        linha_editorial,
        duracao,
        tom,
        status: 'processando',
      },
    })

    // Preparar imagem se fornecida
    let imageBuffer: Buffer | undefined
    let imageType: string | undefined
    let imageName: string | undefined

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
      imageType = imageFile.type || 'image/png'
      imageName = imageFile.name || 'logo.png'
    }

    // Dispara n8n em background sem aguardar — retorna imediatamente
    triggerVideoN8N({
      video_id: video.id,
      service_name: nome_produto,
      service_description: descricao_produto,
      video_duration: duracao,
      imageBuffer,
      imageType,
      imageName,
    })

    return NextResponse.json({ video_id: video.id })
  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao gerar vídeo' },
      { status: 500 }
    )
  }
}
