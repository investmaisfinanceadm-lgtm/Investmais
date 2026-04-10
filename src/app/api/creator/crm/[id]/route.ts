import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    await prisma.contato.delete({
      where: { id: params.id, user_id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('CRM DELETE error:', err)
    return NextResponse.json({ error: 'Erro ao excluir contato' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const data = await req.json()
    const { 
      status_funil, notas, tags, activity,
      cidade, estado, endereco, site, nicho, cnpj
    } = data

    // Se houver uma nova atividade para registrar
    if (activity) {
      await prisma.atividadeCRM.create({
        data: {
          contato_id: params.id,
          tipo: activity.type,
          descricao: activity.description,
          data: activity.date || new Date(),
        },
      })
    }

    let updated;
    try {
      updated = await prisma.contato.update({
        where: { id: params.id, user_id: userId },
        data: {
          status_funil: status_funil || undefined,
          notas: notas || undefined,
          tags: tags || undefined,
          cidade: cidade !== undefined ? cidade : undefined,
          estado: estado !== undefined ? estado : undefined,
          endereco: endereco !== undefined ? endereco : undefined,
          site: site !== undefined ? site : undefined,
          nicho: nicho !== undefined ? nicho : undefined,
          cnpj: cnpj !== undefined ? cnpj : undefined,
          updated_at: new Date(),
        },
        include: { atividades: { orderBy: { data: 'desc' } } }
      })
    } catch (err: any) {
      console.error('Initial CRM UPDATE failed, retrying safe version:', err.message)
      updated = await prisma.contato.update({
        where: { id: params.id, user_id: userId },
        data: {
          status_funil: status_funil || undefined,
          notas: notas || undefined,
          tags: tags || undefined,
          updated_at: new Date(),
        },
        include: { atividades: { orderBy: { data: 'desc' } } }
      })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('CRM UPDATE error:', err)
    return NextResponse.json({ error: 'Erro ao atualizar contato' }, { status: 500 })
  }
}
