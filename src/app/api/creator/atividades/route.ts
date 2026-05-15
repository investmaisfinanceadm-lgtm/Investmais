import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const { searchParams } = new URL(req.url)
    const dealId = searchParams.get('deal_id')
    const status = searchParams.get('status')

    const where: any = { contato: { user_id: userId } }
    if (dealId) where.deal_id = dealId
    if (status) where.status = status

    const activities = await prisma.atividadeCRM.findMany({
      where,
      include: {
        contato: { select: { id: true, nome: true, empresa: true } },
        deal: { select: { id: true, titulo: true, valor: true } }
      },
      orderBy: { data: 'asc' }
    })

    return NextResponse.json(activities)
  } catch (err) {
    console.error('ATIVIDADES GET error:', err)
    return NextResponse.json({ error: 'Erro ao buscar atividades' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const { contato_id, deal_id, tipo, titulo, descricao, data, status } = await req.json()

    if (!contato_id || !tipo) {
      return NextResponse.json({ error: 'contato_id e tipo são obrigatórios' }, { status: 400 })
    }

    const contato = await prisma.contato.findFirst({
      where: { id: contato_id, user_id: userId }
    })
    if (!contato) return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })

    const activity = await prisma.atividadeCRM.create({
      data: {
        contato_id,
        deal_id: deal_id || null,
        tipo,
        titulo: titulo || null,
        descricao: descricao || '',
        status: status || 'pendente',
        data: data ? new Date(data) : new Date(),
      },
      include: {
        contato: { select: { id: true, nome: true, empresa: true } },
        deal: { select: { id: true, titulo: true, valor: true } }
      }
    })

    return NextResponse.json(activity)
  } catch (err) {
    console.error('ATIVIDADES POST error:', err)
    return NextResponse.json({ error: 'Erro ao criar atividade' }, { status: 500 })
  }
}

