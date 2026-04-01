export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Receives incoming webhook data from external systems (Facebook Ads, etc.)
export async function POST(
  req: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const incomingPath = params.path

    // Find the integration that has this endpoint path
    const allIntegrations = await prisma.integracao.findMany({
      where: { ativo: true },
    })

    let matchedInteg: any = null
    let matchedEndpoint: any = null

    for (const integ of allIntegrations) {
      const config: any = integ.configuracoes || {}
      const endpoints: any[] = config.endpoints || []
      const ep = endpoints.find((e: any) => e.path === incomingPath)
      if (ep) { matchedInteg = integ; matchedEndpoint = ep; break }
    }

    if (!matchedInteg) {
      return NextResponse.json({ error: 'Webhook path não encontrado' }, { status: 404 })
    }

    // Validate secret token if configured
    if (matchedEndpoint.secret) {
      const headerSecret =
        req.headers.get('x-webhook-secret') ||
        req.headers.get('authorization')?.replace(/^bearer\s+/i, '')
      if (headerSecret !== matchedEndpoint.secret) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
    }

    const body = await req.json().catch(() => ({}))

    // Log the received payload as a notification
    await prisma.notificacao.create({
      data: {
        user_id: matchedInteg.user_id,
        tipo: 'webhook',
        mensagem: `Webhook recebido em /${incomingPath} (${matchedEndpoint.tag}): ${JSON.stringify(body).slice(0, 200)}`,
      },
    })

    return NextResponse.json({ received: true, path: incomingPath })
  } catch (error) {
    console.error('Webhook receiver error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Facebook webhook verification (GET with hub.challenge)
export async function GET(
  req: NextRequest,
  { params }: { params: { path: string } }
) {
  const { searchParams } = new URL(req.url)
  const challenge = searchParams.get('hub.challenge')
  if (challenge) return new NextResponse(challenge, { status: 200 })
  return NextResponse.json({ status: 'ok', path: params.path })
}
