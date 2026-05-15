export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id

  const pipelines = await prisma.pipeline.findMany({
    where: { user_id: userId },
    include: { stages: { orderBy: { ordem: 'asc' } } },
    orderBy: { created_at: 'asc' },
  })

  if (pipelines.length === 0) {
    const created = await prisma.pipeline.create({
      data: {
        user_id: userId,
        nome: 'Vendas',
        stages: {
          createMany: {
            data: [
              { nome: 'Leads',        ordem: 0, cor: '#3B82F6' },
              { nome: 'Qualificação', ordem: 1, cor: '#F59E0B' },
              { nome: 'Proposta',     ordem: 2, cor: '#2563EB' },
              { nome: 'Fechado',      ordem: 3, cor: '#8B5CF6' },
            ],
          },
        },
      },
      include: { stages: { orderBy: { ordem: 'asc' } } },
    })
    // map stages → colunas so the frontend keeps working
    return NextResponse.json([{ ...created, colunas: created.stages }])
  }

  return NextResponse.json(pipelines.map(p => ({ ...p, colunas: p.stages })))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id

  const data = await req.json()
  const { type, nome, color, boardId } = data

  if (type === 'board') {
    const pipeline = await prisma.pipeline.create({
      data: {
        user_id: userId,
        nome,
        stages: { create: { nome: 'Início', ordem: 0, cor: '#3B82F6' } },
      },
      include: { stages: true },
    })
    return NextResponse.json({ ...pipeline, colunas: pipeline.stages })
  }

  if (type === 'column') {
    const last = await prisma.stage.findFirst({
      where: { pipeline_id: boardId },
      orderBy: { ordem: 'desc' },
    })
    const stage = await prisma.stage.create({
      data: {
        pipeline_id: boardId,
        nome,
        cor: color || '#3B82F6',
        probabilidade: data.probabilidade ?? 100,
        sla_horas: data.sla_horas,
        ordem: last ? last.ordem + 1 : 0,
      },
    })
    return NextResponse.json(stage)
  }

  return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
}
