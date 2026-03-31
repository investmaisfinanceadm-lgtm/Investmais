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
    const isDev = userId === 'dev-admin-id'

    try {
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
    } catch (dbError) {
      if (isDev) {
        return NextResponse.json([
          { id: 'v1', nome_produto: 'Intro de Investimentos', formato: 'instagram', duracao: 15, status: 'concluido', created_at: new Date().toISOString() },
          { id: 'v2', nome_produto: 'Dicas de Home Equity', formato: 'stories', duracao: 30, status: 'processando', created_at: new Date().toISOString() },
        ])
      }
      throw dbError
    }
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
    const isDev = userId === 'dev-admin-id'

    // Parse multipart form-data (logo file must be preserved as a File object)
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-type deve ser multipart/form-data' }, { status: 400 })
    }

    const formData = await req.formData()
    const nome_produto     = (formData.get('nome_produto')     as string) || ''
    const descricao_produto = (formData.get('descricao_produto') as string) || ''
    const formato          = (formData.get('formato')          as string) || 'stories'
    const linha_editorial  = (formData.get('linha_editorial')  as string) || ''
    const duracao          = parseInt((formData.get('duracao') as string) || '15')
    const tom              = (formData.get('tom')              as string) || ''
    const logoFile         = formData.get('logo_empresa') as File | null

    if (!nome_produto || !descricao_produto) {
      return NextResponse.json({ error: 'Nome e descrição do produto são obrigatórios' }, { status: 400 })
    }

    if (!logoFile || logoFile.size === 0) {
      return NextResponse.json({ error: 'Logo da empresa é obrigatória para gerar o vídeo' }, { status: 400 })
    }

    if (isDev) {
      return NextResponse.json({ id: 'mock-video-' + Date.now() })
    }

    // Check quota
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { cota_mensal: true, cota_usada: true },
    })
    if (profile && profile.cota_usada >= profile.cota_mensal) {
      return NextResponse.json({ error: 'Limite de cota mensal atingido' }, { status: 403 })
    }

    // Create video record in DB (status: processando)
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
      select: { id: true },
    })

    // Build multipart payload for n8n
    // n8n webhook expects: service_name, service_description, video_id as text fields
    // and the logo as a binary file in the "image" field
    const n8nForm = new FormData()
    n8nForm.append('service_name', nome_produto)
    n8nForm.append('service_description', descricao_produto)
    n8nForm.append('video_id', video.id)
    n8nForm.append('image', logoFile, logoFile.name || 'logo.png')

    const n8nUrl = process.env.N8N_VIDEO_WEBHOOK_URL
    if (!n8nUrl) {
      console.error('N8N_VIDEO_WEBHOOK_URL not configured')
      // Mark video as error since we can't process it
      await prisma.video.update({ where: { id: video.id }, data: { status: 'erro' } })
      return NextResponse.json({ error: 'Integração com n8n não configurada' }, { status: 500 })
    }

    // Fire-and-forget: n8n workflow is async and will callback when done
    fetch(n8nUrl, { method: 'POST', body: n8nForm }).catch((err) => {
      console.error('n8n webhook call failed:', err)
      // Mark as error in background
      prisma.video.update({ where: { id: video.id }, data: { status: 'erro' } }).catch(() => {})
    })

    return NextResponse.json({ id: video.id })
  } catch (error) {
    console.error('Create video error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })

        const userId = (session.user as any).id
        if (userId === 'dev-admin-id') return NextResponse.json({ success: true })

        await prisma.video.delete({ where: { id, user_id: userId }})
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
    }
}
