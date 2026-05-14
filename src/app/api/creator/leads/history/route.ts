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

    // Filtrar apenas aqueles que já tem leads suficientes (10+)
    const filteredHistory = await Promise.all(history.map(async (item) => {
      const count = await prisma.contato.count({
        where: {
          user_id: userId,
          cidade: item.cidade,
          estado: item.estado,
          nicho: item.nicho
        }
      })
      if (count >= 10) return { ...item, count }
      return null
    }))

    return NextResponse.json(filteredHistory.filter(Boolean))
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

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })

    await prisma.leadSearchHistory.delete({
      where: { id, user_id: userId }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('LeadSearchHistory DELETE error:', err)
    return NextResponse.json({ error: 'Erro ao excluir histórico' }, { status: 500 })
  }
}
