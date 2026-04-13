/**
 * POST /api/creator/crm/n8n-leads
 *
 * Endpoint dedicado para receber leads do N8N (Google Maps scrape).
 * Mapeia corretamente os campos individuais — sem concatenar dados em notas.
 *
 * Payload esperado do N8N:
 * {
 *   user_id: string          // obrigatório — repassado pelo scrape route
 *   nome: string
 *   empresa?: string
 *   telefone?: string
 *   email?: string
 *   endereco?: string        // endereço completo (rua, número, bairro, cidade, UF, CEP)
 *   site?: string
 *   nicho?: string           // segmento/categoria de negócio
 *   cidade?: string
 *   estado?: string
 *   notas?: string           // anotações livres (NÃO usar para dados estruturados)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const clean = (v: unknown): string | null => {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  if (s === '' || s === 'undefined' || s === 'null') return null
  return s
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const user_id = clean(data.user_id)
    if (!user_id) {
      return NextResponse.json({ error: 'user_id obrigatório' }, { status: 400 })
    }

    // Valida se o usuário existe
    const userExists = await prisma.profile.findUnique({ where: { id: user_id } })
    if (!userExists) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const nome    = clean(data.nome) || clean(data.empresa) || 'Lead sem nome'
    const empresa = clean(data.empresa)
    const email   = clean(data.email)
    const tel     = clean(data.telefone) || clean(data.phone)
    const end     = clean(data.endereco) || clean(data.address) || clean(data.logradouro)
    const siteVal = clean(data.site) || clean(data.website)
    const nicho   = clean(data.nicho) || clean(data.segmento) || clean(data.categoria)
    const cidade  = clean(data.cidade) || clean(data.city)
    const estado  = clean(data.estado) || clean(data.uf) || clean(data.state)
    // notas livres — jamais dados estruturados
    const notas   = clean(data.notas) || clean(data.observacoes) || ''

    // Verifica duplicata por telefone ou email
    if (email || tel) {
      const existing = await prisma.contato.findFirst({
        where: {
          user_id,
          OR: [
            email ? { email } : {},
            tel   ? { telefone: tel } : {},
          ].filter(o => Object.keys(o).length > 0),
        },
        select: { id: true },
      })
      if (existing) {
        return NextResponse.json({ ok: true, skipped: true, id: existing.id })
      }
    }

    let contato
    try {
      contato = await prisma.contato.create({
        data: {
          user_id,
          nome,
          empresa,
          email,
          telefone: tel,
          endereco: end,
          site: siteVal,
          nicho,
          cidade,
          estado,
          canal_origem: 'Google',
          status_funil: 'lead',
          notas: notas || '',
          tags: [],
        },
      })
    } catch (err: any) {
      // Fallback sem campos opcionais que possam não existir no schema antigo
      contato = await prisma.contato.create({
        data: {
          user_id,
          nome,
          empresa,
          email,
          telefone: tel,
          canal_origem: 'Google',
          status_funil: 'lead',
          notas: notas || '',
          tags: [],
        },
      })
    }

    return NextResponse.json({ ok: true, id: contato.id })
  } catch (err: any) {
    console.error('N8N leads endpoint error:', err)
    return NextResponse.json(
      { error: 'Erro ao salvar lead', details: err.message },
      { status: 500 }
    )
  }
}
