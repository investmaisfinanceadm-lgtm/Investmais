import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const userId = (session.user as any).id
  const listas = await prisma.listaDisparo.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json(listas)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { nome, telefones } = body

  if (!nome || !Array.isArray(telefones) || telefones.length === 0) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const lista = await prisma.listaDisparo.create({
    data: {
      user_id: userId,
      nome,
      telefones,
      total: telefones.length,
    },
  })

  return NextResponse.json(lista, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const userId = (session.user as any).id
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  await prisma.listaDisparo.deleteMany({ where: { id, user_id: userId } })
  return NextResponse.json({ ok: true })
}
