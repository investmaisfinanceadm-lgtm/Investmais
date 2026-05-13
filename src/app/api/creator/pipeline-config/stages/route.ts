export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOrCreatePipeline(userId: string) {
  let pipeline = await prisma.pipeline.findFirst({ where: { user_id: userId } })
  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: { user_id: userId, nome: 'Pipeline Principal' },
    })
  }
  return pipeline
}

// POST — create stage
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id
  const { nome, cor } = await req.json()
  if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  const pipeline = await getOrCreatePipeline(userId)
  const count = await prisma.stage.count({ where: { pipeline_id: pipeline.id } })

  const stage = await prisma.stage.create({
    data: { pipeline_id: pipeline.id, nome, cor: cor || '#3B82F6', ordem: count },
  })
  return NextResponse.json(stage)
}

// PATCH — edit stage
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id
  const { id, nome, cor } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const pipeline = await prisma.pipeline.findFirst({ where: { user_id: userId } })
  if (!pipeline) return NextResponse.json({ error: 'Pipeline não encontrado' }, { status: 404 })

  const stage = await prisma.stage.updateMany({
    where: { id, pipeline_id: pipeline.id },
    data: { ...(nome && { nome }), ...(cor && { cor }) },
  })
  return NextResponse.json(stage)
}

// DELETE — delete stage (optionally move deals to another stage first)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const targetStageId = searchParams.get('target_column_id') || searchParams.get('target_stage_id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const pipeline = await prisma.pipeline.findFirst({ where: { user_id: userId } })
  if (!pipeline) return NextResponse.json({ error: 'Pipeline não encontrado' }, { status: 404 })

  // Count deals in this stage
  const dealCount = await prisma.deal.count({ where: { stage_id: id, status: 'open', deleted_at: null } })

  // If there are deals and no target specified, return the count so frontend can prompt
  if (dealCount > 0 && !targetStageId) {
    return NextResponse.json({ needsTarget: true, cardCount: dealCount }, { status: 409 })
  }

  // Move deals to target stage if specified
  if (targetStageId && dealCount > 0) {
    await prisma.deal.updateMany({
      where: { stage_id: id },
      data: { stage_id: targetStageId }
    })
  }

  await prisma.stage.deleteMany({ where: { id, pipeline_id: pipeline.id } })
  return NextResponse.json({ success: true })
}
