export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
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
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const [profile, totalLeads, leadsHoje, conversoes, contatosRecentes] = await Promise.all([
        prisma.profile.findUnique({
          where: { id: userId },
          select: { nome: true, cota_mensal: true, cota_usada: true },
        }),
        // @ts-ignore
        prisma.contato.count({ where: { user_id: userId } }),
        // @ts-ignore
        prisma.contato.count({ 
          where: { 
            user_id: userId,
            created_at: { gte: startOfDay }
          } 
        }),
        // @ts-ignore
        prisma.contato.count({ 
          where: { 
            user_id: userId,
            status_funil: 'cliente'
          } 
        }),
        // @ts-ignore
        prisma.contato.findMany({
          where: { user_id: userId },
          select: { 
            id: true, 
            nome: true, 
            empresa: true, 
            status_funil: true, 
            canal_origem: true, 
            created_at: true 
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        }),
      ])

      return NextResponse.json({
        profile: profile
          ? {
              ...profile,
              totalLeads,
              leadsHoje,
              conversoes,
              contatosRecentes: contatosRecentes.map((c: any) => ({
                ...c,
                created_at: c.created_at.toISOString()
              }))
            }
          : null
      })
    } catch (dbError) {
      if (isDev) {
        console.warn('DB unreachable at Dashboard, returning mock data for dev mode.')
        return NextResponse.json({
          profile: {
            nome: 'Administrador (Mock)',
            totalLeads: 1250,
            leadsHoje: 42,
            conversoes: 156,
            contatosRecentes: [
              { id: '1', nome: 'Henrique Silva', empresa: 'InvestMais', status_funil: 'cliente', canal_origem: 'google', created_at: new Date().toISOString() },
              { id: '2', nome: 'Ana Costa', empresa: 'Tech Corp', status_funil: 'oportunidade', canal_origem: 'whatsapp', created_at: new Date().toISOString() },
            ]
          }
        })
      }
      throw dbError
    }
  } catch (error) {
    console.error('Creator dashboard error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
