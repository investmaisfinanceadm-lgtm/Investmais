import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const history = await prisma.leadSearchHistory.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20
    })

    return NextResponse.json(history)
  } catch (err) {
    console.error('LeadSearchHistory GET error:', err)
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const data = await req.json()
    const { nicho, cidade, estado } = data

    const search = await prisma.leadSearchHistory.create({
      data: {
        user_id: userId,
        nicho,
        cidade,
        estado,
        status: 'processando'
      }
    })

    return NextResponse.json(search)
  } catch (err) {
    console.error('LeadSearchHistory POST error:', err)
    return NextResponse.json({ error: 'Erro ao registrar busca' }, { status: 500 })
  }
}
