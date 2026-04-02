export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function handleCallback(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, lista_id } = body

    if (!event || !lista_id) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    if (event === 'lead_enviado') {
      await prisma.listaDisparo.update({
        where: { id: lista_id },
        data: { enviados: { increment: 1 }, status: 'em_progresso' },
      })
    } else if (event === 'lista_finalizada') {
      // n8n STATUS FINAL only sends event + lista_id, so use the stored total
      const lista = await prisma.listaDisparo.findUnique({ where: { id: lista_id } })
      await prisma.listaDisparo.update({
        where: { id: lista_id },
        data: {
          status: 'concluida',
          enviados: lista?.total ?? 0,
        },
      })
    }
    // lead_erro: just acknowledge, no state change needed

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Disparo callback error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Called by n8n after each WhatsApp message is sent / on list completion
// Accepts both POST and PATCH (STATUS FINAL node uses PATCH)
export async function POST(req: NextRequest) {
  return handleCallback(req)
}

export async function PATCH(req: NextRequest) {
  return handleCallback(req)
}
