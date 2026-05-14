export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const [totalLeads, wonDeals, allDeals, contacts] = await Promise.all([
      prisma.contato.count({ where: { user_id: userId, canal_origem: { not: null } } }),
      prisma.deal.aggregate({
        where: { stage: { pipeline: { user_id: userId } }, status: 'won' },
        _sum: { valor: true },
        _count: { id: true }
      }),
      prisma.deal.findMany({
        where: { stage: { pipeline: { user_id: userId } } },
        include: { contato: true }
      }),
      prisma.contato.findMany({
        where: { user_id: userId }
      })
    ])

    const totalFaturamento = wonDeals._sum.valor || 0
    const totalWon = wonDeals._count.id || 0
    const taxaConversao = allDeals.length > 0 ? (totalWon / allDeals.length) * 100 : 0

    // Agrupar por Origem
    const campaignsMap = new Map()

    allDeals.forEach(deal => {
      const origem = deal.origem || deal.contato?.canal_origem || 'Direto'
      if (!campaignsMap.has(origem)) {
        campaignsMap.set(origem, { leads: 0, deals: 0, won: 0, revenue: 0 })
      }
      const data = campaignsMap.get(origem)
      data.deals++
      if (deal.status === 'won') {
        data.won++
        data.revenue += deal.valor || 0
      }
    })

    contacts.forEach(contact => {
      const origem = contact.canal_origem || 'Direto'
      if (!campaignsMap.has(origem)) {
        campaignsMap.set(origem, { leads: 0, deals: 0, won: 0, revenue: 0 })
      }
      campaignsMap.get(origem).leads++
    })

    const campaigns = Array.from(campaignsMap.entries()).map(([name, data], i) => ({
      id: i + 1,
      name,
      leads: data.leads,
      deals: data.deals,
      won: data.won,
      value: data.revenue,
      conv: data.leads > 0 ? ((data.won / data.leads) * 100).toFixed(1) + '%' : '0%',
      status: data.deals > data.won ? 'Em pipeline' : 'Finalizado'
    })).sort((a, b) => b.value - a.value) // Sort by revenue

    return NextResponse.json({
      stats: {
        totalLeads,
        dealsCriados: allDeals.length,
        emPipeline: allDeals.filter(d => d.status === 'open').length,
        taxaConversao,
        totalFaturamento
      },
      campaigns
    })

  } catch (error) {
    console.error('UTM Analytics Error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
