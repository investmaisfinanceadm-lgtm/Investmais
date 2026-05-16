import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const data = await req.json()
    let {
      stage_id, pipeline_id, coluna_id, board_id, ordem, titulo, descricao, anotacoes, valor,
      vencimento, prioridade, categoria,
      vendedor_id, contato_id, status, lost_reason,
      deleted_at
    } = data

    // Handle old names
    const targetStageId = stage_id || coluna_id
    const targetPipelineId = pipeline_id || board_id

    // If pipeline_id is provided, find the first stage of that pipeline
    if (targetPipelineId && !targetStageId) {
      const firstStage = await prisma.stage.findFirst({
        where: { pipeline_id: targetPipelineId, pipeline: { user_id: userId } },
        orderBy: { ordem: 'asc' }
      })
      if (firstStage) stage_id = firstStage.id
    } else {
      stage_id = targetStageId
    }

    // Get current deal to check if stage changed
    const currentDeal = await prisma.deal.findUnique({
      where: { id: params.id },
      select: { stage_id: true }
    })

    const isMoving = stage_id && currentDeal && currentDeal.stage_id !== stage_id

    const deal = await prisma.deal.update({
      where: {
        id: params.id,
        stage: {
          pipeline: {
            user_id: userId
          }
        }
      },
      data: {
        stage_id: stage_id || undefined,
        ordem: typeof ordem === 'number' ? ordem : undefined,
        titulo: titulo || undefined,
        descricao: descricao !== undefined ? (descricao || null) : undefined,
        anotacoes: anotacoes !== undefined ? (anotacoes || null) : undefined,
        valor: typeof valor === 'number' ? valor : undefined,
        vencimento: vencimento === null ? null : vencimento ? new Date(vencimento) : undefined,
        prioridade: prioridade || undefined,
        categoria: categoria !== undefined ? (categoria || null) : undefined,
        vendedor_id: vendedor_id !== undefined ? (vendedor_id || null) : undefined,
        contato_id: contato_id !== undefined ? (contato_id || null) : undefined,
        status: status || undefined,
        lost_reason: lost_reason || undefined,
        deleted_at: deleted_at === null ? null : deleted_at ? new Date(deleted_at) : undefined,
        fechado_em: (status === 'won' || status === 'lost') ? new Date() : undefined,
        movimentacoes: isMoving ? {
          create: {
            etapa_origem_id: currentDeal.stage_id,
            etapa_destino_id: stage_id,
            user_id: userId,
            fonte: targetPipelineId ? 'pipeline_switch' : 'drag'
          }
        } : undefined
      },
      include: {
        contato: { select: { id: true, nome: true, telefone: true, email: true } },
        vendedor: { select: { id: true, nome: true, cor: true } }
      }
    })

    return NextResponse.json(deal)
  } catch (err) {
    console.error('DEAL UPDATE error:', err)
    return NextResponse.json({ error: 'Erro ao atualizar deal' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const { searchParams } = new URL(req.url)
    const permanent = searchParams.get('permanent') === 'true'

    // Fetch deal and verify ownership explicitly through the relation chain
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        stage: { select: { pipeline: { select: { user_id: true } } } },
      },
    })

    if (!deal) {
      console.warn(`DEAL DELETE: deal ${params.id} not found`)
      return NextResponse.json({ error: 'Deal não encontrado' }, { status: 404 })
    }

    if (deal.stage.pipeline.user_id !== userId) {
      console.warn(`DEAL DELETE: user ${userId} does not own deal ${params.id}`)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    if (permanent) {
      // Delete related records first to avoid FK constraint failures
      // (in case DB cascades aren't set — safe to run even if already cascading)
      await prisma.$transaction(async (tx) => {
        await tx.atividadeCRM.updateMany({
          where: { deal_id: params.id },
          data: { deal_id: null },
        })
        await tx.dealStageHistory.deleteMany({
          where: { deal_id: params.id },
        })
        await tx.deal.delete({ where: { id: params.id } })
      })
    } else {
      await prisma.deal.update({
        where: { id: params.id },
        data: { deleted_at: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DEAL DELETE error:', err)
    return NextResponse.json({ error: 'Erro ao deletar deal' }, { status: 500 })
  }
}
