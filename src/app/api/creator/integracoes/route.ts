export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const integracoes = await prisma.integracao.findMany({
      where: { user_id: userId },
    })

    return NextResponse.json(integracoes)
  } catch (error) {
    console.error('Get integracoes error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { tipo, token_acesso, configuracoes, ativo } = await req.json()

    const integracao = await prisma.integracao.upsert({
      where: { user_id_tipo: { user_id: userId, tipo } },
      update: { token_acesso, configuracoes, ativo },
      create: { user_id: userId, tipo, token_acesso, configuracoes, ativo },
    })

    return NextResponse.json(integracao)
  } catch (error) {
    console.error('Upsert integracao error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
