export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Look up the disparo webhook URL from integrations
    const integracoes = await prisma.integracao.findMany({
      where: { user_id: userId },
    })
    const disparoInteg = integracoes.find((i: any) => i.tipo === 'disparo_whatsapp')
    const webhookUrl = (disparoInteg?.configuracoes as any)?.webhook_disparo || ''

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Webhook de disparo não configurado' },
        { status: 400 }
      )
    }

    const payload = await req.json()

    // Forward the request server-side (no CORS restrictions)
    const n8nRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!n8nRes.ok) {
      const text = await n8nRes.text().catch(() => '')
      return NextResponse.json(
        { error: `Webhook retornou ${n8nRes.status}`, detail: text },
        { status: n8nRes.status }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Proxy disparo error:', err)
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 })
  }
}
