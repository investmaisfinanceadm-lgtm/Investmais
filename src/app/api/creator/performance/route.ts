import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { subDays, format, parseISO } from 'date-fns'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.profile.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days') || '7'
    const days = parseInt(daysParam, 10)

    const startDate = subDays(new Date(), days)

    // @ts-ignore
    const leads = await prisma.contato.findMany({
      where: {
        user_id: user.id,
        created_at: {
          gte: startDate
        }
      },
      select: {
        canal_origem: true,
        created_at: true
      }
    })

    // Prepare structure for each day
    const resultMap = new Map<string, { day: string, leads: number }>()
    const originsMap = new Map<string, number>()

    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dayStr = format(d, 'dd/MM')
      resultMap.set(dayStr, { day: dayStr, leads: 0 })
    }

    // Populate data
    leads.forEach((l: any) => {
      const dayStr = format(new Date(l.created_at), 'dd/MM')
      if (resultMap.has(dayStr)) {
        const item = resultMap.get(dayStr)!
        item.leads += 1
      }

      const rawOrigin = l.canal_origem || 'Outros'
      const origin = rawOrigin.charAt(0).toUpperCase() + rawOrigin.slice(1).toLowerCase()
      originsMap.set(origin, (originsMap.get(origin) || 0) + 1)
    })

    const chartData = Array.from(resultMap.values())
    const originData = Array.from(originsMap.entries()).map(([name, value]) => ({ name, value }))

    return NextResponse.json({ chartData, originData })
  } catch (error) {
    console.error('[PERFORMANCE_API_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
