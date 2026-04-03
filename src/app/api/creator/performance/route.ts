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
    const atividades = await prisma.atividadeCRM.findMany({
      where: {
        contato: {
           user_id: user.id
        },
        data: {
          gte: startDate
        }
      },
      select: {
        tipo: true,
        data: true
      }
    })

    // Prepare structure for each day
    const resultMap = new Map<string, { day: string, email: number, whatsapp: number, instagram: number }>()

    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dayStr = format(d, 'dd/MM')
      resultMap.set(dayStr, { day: dayStr, email: 0, whatsapp: 0, instagram: 0 })
    }

    // Populate data
    atividades.forEach((a: any) => {
      const dayStr = format(new Date(a.data), 'dd/MM')
      if (resultMap.has(dayStr)) {
        const item = resultMap.get(dayStr)!
        const t = a.tipo.toLowerCase()
        if (t.includes('email')) item.email += 1
        else if (t.includes('whatsapp') || t.includes('wpp')) item.whatsapp += 1
        else if (t.includes('instagram') || t.includes('ig')) item.instagram += 1
      }
    })

    const chartData = Array.from(resultMap.values())

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('[PERFORMANCE_API_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
