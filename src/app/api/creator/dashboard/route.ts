export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const pipelineId = searchParams.get('board_id') || searchParams.get('pipeline_id')
    const userId = (session.user as any).id
    const isDev = userId === 'dev-admin-id'

    try {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const stageWhere = pipelineId
        ? { pipeline: { id: pipelineId, user_id: userId } }
        : { pipeline: { user_id: userId } }

      // Contacts that belong to the user or are linked to the user's deals
      const contatoWhere = {
        OR: [
          { user_id: userId },
          { deals: { some: { stage: stageWhere, deleted_at: null } } },
        ],
      }

      const [
        profile,
        totalLeads,
        leadsHoje,
        allDealsStats,
        openDealsStats,
        wonDeals,
        contatosRecentes,
        recentDeals,
      ] = await Promise.all([
        prisma.profile.findUnique({
          where: { id: userId },
          select: { nome: true, cota_mensal: true, cota_usada: true },
        }),
        prisma.contato.count({ where: contatoWhere }),
        prisma.contato.count({
          where: {
            ...contatoWhere,
            created_at: { gte: startOfDay },
          },
        }),
        // All non-deleted deals (denominator for conversion rate)
        prisma.deal.aggregate({
          where: { stage: stageWhere, deleted_at: null },
          _count: { id: true },
        }),
        // Open deals — count + pipeline value
        prisma.deal.aggregate({
          where: { stage: stageWhere, status: 'open', deleted_at: null },
          _sum: { valor: true },
          _count: { id: true },
        }),
        // Won deals — revenue + count
        prisma.deal.aggregate({
          where: { stage: stageWhere, status: 'won', deleted_at: null },
          _sum: { valor: true },
          _count: { id: true },
        }),
        prisma.contato.findMany({
          where: contatoWhere,
          select: {
            id: true,
            nome: true,
            empresa: true,
            status_funil: true,
            canal_origem: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        }),
        prisma.deal.findMany({
          where: { stage: stageWhere, deleted_at: null },
          select: {
            id: true,
            titulo: true,
            valor: true,
            status: true,
            created_at: true,
            contato: { select: { nome: true } },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        }),
      ])

      const totalFaturamento = wonDeals._sum.valor ?? 0
      const totalWon = wonDeals._count.id
      const openDealsCount = openDealsStats._count.id
      const pipelineTotal = openDealsStats._sum.valor ?? 0
      const ticketMedio = totalWon > 0 ? totalFaturamento / totalWon : 0
      const taxaConversao =
        allDealsStats._count.id > 0
          ? (totalWon / allDealsStats._count.id) * 100
          : 0

      return NextResponse.json({
        profile: profile
          ? {
              ...profile,
              totalLeads,
              leadsHoje,
              totalFaturamento,
              totalWon,
              openDealsCount,
              pipelineTotal,
              ticketMedio,
              taxaConversao,
              contatosRecentes: contatosRecentes.map((c: any) => ({
                ...c,
                created_at: c.created_at.toISOString(),
              })),
              recentCards: recentDeals.map((c: any) => ({
                ...c,
                nome: c.contato?.nome || c.titulo,
                created_at: c.created_at.toISOString(),
              })),
            }
          : null,
      })
    } catch (dbError) {
      if (isDev) {
        console.warn('DB unreachable at Dashboard, returning mock data for dev mode.')
        return NextResponse.json({
          profile: {
            nome: 'Administrador (Mock)',
            totalLeads: 1250,
            leadsHoje: 42,
            openDealsCount: 38,
            pipelineTotal: 1405000,
            totalWon: 156,
            totalFaturamento: 980000,
            taxaConversao: 12.5,
            ticketMedio: 6282,
            contatosRecentes: [
              { id: '1', nome: 'Henrique Silva', empresa: 'InvestMais', status_funil: 'cliente', canal_origem: 'google', created_at: new Date().toISOString() },
              { id: '2', nome: 'Ana Costa', empresa: 'Tech Corp', status_funil: 'oportunidade', canal_origem: 'whatsapp', created_at: new Date().toISOString() },
            ],
            recentCards: [],
          },
        })
      }
      throw dbError
    }
  } catch (error) {
    console.error('Creator dashboard error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
