export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// POST — add endpoint to an integration
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id

  const { tipo, path, tag, source, secret } = await req.json()
  if (!tipo || !path) return NextResponse.json({ error: 'tipo e path são obrigatórios' }, { status: 400 })

  const cleanPath = path.replace(/[^a-z0-9-_]/gi, '-').toLowerCase()
  const appUrl = process.env.NEXTAUTH_URL?.replace('http://localhost:3001', 'https://app.investmaisfinance.com.br') || 'https://app.investmaisfinance.com.br'
  const fullUrl = `${appUrl}/api/webhooks/${cleanPath}`

  const existing = await prisma.integracao.findUnique({
    where: { user_id_tipo: { user_id: userId, tipo } },
  })

  const currentConfig: any = (existing?.configuracoes as any) || {}
  const endpoints: any[] = currentConfig.endpoints || []

  // Check path uniqueness within user scope
  const allIntegrations = await prisma.integracao.findMany({ where: { user_id: userId } })
  const allPaths = allIntegrations.flatMap(i => ((i.configuracoes as any)?.endpoints || []).map((e: any) => e.path))
  if (allPaths.includes(cleanPath)) {
    return NextResponse.json({ error: 'Esse path já está em uso' }, { status: 409 })
  }

  const newEndpoint = {
    id: randomUUID(),
    path: cleanPath,
    tag: tag || cleanPath.replace(/-/g, '_'),
    source: source || '',
    secret: secret || '',
    full_url: fullUrl,
    created_at: new Date().toISOString(),
  }

  endpoints.push(newEndpoint)

  const integracao = await prisma.integracao.upsert({
    where: { user_id_tipo: { user_id: userId, tipo } },
    update: { configuracoes: { ...currentConfig, endpoints } },
    create: {
      user_id: userId,
      tipo,
      ativo: true,
      configuracoes: { ...currentConfig, endpoints },
    },
  })

  return NextResponse.json({ endpoint: newEndpoint, integracao })
}

// DELETE — remove endpoint from integration
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')
  const endpointId = searchParams.get('endpoint_id')
  if (!tipo || !endpointId) return NextResponse.json({ error: 'tipo e endpoint_id obrigatórios' }, { status: 400 })

  const integracao = await prisma.integracao.findUnique({
    where: { user_id_tipo: { user_id: userId, tipo } },
  })
  if (!integracao) return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 })

  const config: any = (integracao.configuracoes as any) || {}
  const endpoints = (config.endpoints || []).filter((e: any) => e.id !== endpointId)

  await prisma.integracao.update({
    where: { user_id_tipo: { user_id: userId, tipo } },
    data: { configuracoes: { ...config, endpoints } },
  })

  return NextResponse.json({ success: true })
}
