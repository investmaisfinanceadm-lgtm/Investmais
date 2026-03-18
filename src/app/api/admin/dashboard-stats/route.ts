export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).perfil !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      usersCount,
      monthVideos,
      todayVideos,
      profiles,
      recentVideos,
      topProfiles,
    ] = await Promise.all([
      prisma.profile.count({ where: { status: 'ativo' } }),
      prisma.video.count({ where: { created_at: { gte: startOfMonth } } }),
      prisma.video.count({ where: { created_at: { gte: today } } }),
      prisma.profile.findMany({ select: { cota_usada: true } }),
      prisma.video.findMany({
        select: {
          id: true,
          nome_produto: true,
          status: true,
          created_at: true,
          user: { select: { nome: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
      prisma.profile.findMany({
        select: { nome: true, cota_usada: true },
        orderBy: { cota_usada: 'desc' },
        take: 10,
      }),
    ])

    const totalQuota = profiles.reduce((sum, p) => sum + (p.cota_usada || 0), 0)

    return NextResponse.json({
      stats: {
        totalUsers: usersCount,
        videosThisMonth: monthVideos,
        videosToday: todayVideos,
        totalQuotaConsumed: totalQuota,
      },
      recentVideos: recentVideos.map((v) => ({
        id: v.id,
        nome_produto: v.nome_produto,
        status: v.status,
        created_at: v.created_at.toISOString(),
        user_nome: v.user?.nome || null,
      })),
      topUsers: topProfiles.map((p) => ({ nome: p.nome, total: p.cota_usada })),
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
