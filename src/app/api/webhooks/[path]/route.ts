export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const clean = (v: unknown): string | null => {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  if (s === '' || s === 'undefined' || s === 'null') return null
  return s
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const incomingPath = params.path

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

    if (matchedEndpoint.secret) {
      const headerSecret =
        req.headers.get('x-webhook-secret') ||
        req.headers.get('authorization')?.replace(/^bearer\s+/i, '')
      if (headerSecret !== matchedEndpoint.secret) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
    }

    const body = await req.json().catch(() => ({}))

    const stageId: string | null = matchedEndpoint.stage_id || null
    const userId: string = matchedInteg.user_id

    const nome     = clean(body.nome) || clean(body.name) || clean(body.empresa) || clean(body.company) || 'Lead'
    const telefone = clean(body.telefone) || clean(body.phone) || clean(body.whatsapp) || ''
    const email    = clean(body.email)
    const empresa  = clean(body.empresa) || clean(body.company)
    const cidade   = clean(body.cidade) || clean(body.city)
    const estado   = clean(body.estado) || clean(body.state) || clean(body.uf)
    const origem   = matchedEndpoint.source || matchedEndpoint.tag || 'webhook'

    // Deduplica por telefone dentro do usuário
    let contato: { id: string } | null = null
    if (telefone) {
      contato = await prisma.contato.findFirst({
        where: { user_id: userId, telefone },
        select: { id: true },
      })
    }

    if (!contato) {
      contato = await prisma.contato.create({
        data: {
          user_id: userId,
          nome,
          telefone,
          email,
          empresa,
          cidade,
          estado,
          canal_origem: origem,
          status_funil: 'lead',
        },
      })
    }

    let dealId: string | null = null

    if (stageId) {
      const stage = await prisma.stage.findUnique({ where: { id: stageId } })
      if (stage) {
        const deal = await prisma.deal.create({
          data: {
            stage_id: stageId,
            titulo: empresa ? `${nome} — ${empresa}` : nome,
            contato_id: contato.id,
            origem,
          },
        })
        dealId = deal.id
      }
    }

    await prisma.notificacao.create({
      data: {
        user_id: userId,
        tipo: 'webhook',
        mensagem: `Lead recebido via /${incomingPath} (${matchedEndpoint.tag}): ${nome}${dealId ? ' — deal criado no pipeline' : ''}`,
      },
    })

    return NextResponse.json({
      received: true,
      path: incomingPath,
      contato_id: contato.id,
      deal_id: dealId,
    })
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
