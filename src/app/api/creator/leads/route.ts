import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)
    
    const nicho = searchParams.get('nicho')
    const cidade = searchParams.get('cidade')
    const estado = searchParams.get('estado')

    const leads = await prisma.lead.findMany({
      where: {
        user_id: userId,
        ...(nicho ? { nicho } : {}),
        ...(cidade ? { cidade } : {}),
        ...(estado ? { estado } : {}),
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(leads)
  } catch (err: any) {
    console.error('Error fetching leads:', err)
    return NextResponse.json({ error: 'Erro ao buscar leads' }, { status: 500 })
  }
}

// Endpoint to import a lead to CRM (Contato)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { leadId, stageId } = await req.json()
    const userId = (session.user as any).id

    const lead = await prisma.lead.findUnique({
      where: { id: leadId, user_id: userId }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Create Contato
    const contato = await prisma.contato.create({
      data: {
        user_id: userId,
        nome: lead.nome,
        empresa: lead.empresa,
        email: lead.email,
        telefone: lead.telefone || '',
        endereco: lead.endereco,
        site: lead.site,
        nicho: lead.nicho,
        cidade: lead.cidade,
        estado: lead.estado,
        canal_origem: lead.origem,
        status_funil: 'lead',
        notas: lead.notas,
      }
    })

    // Optionally create a Deal if stageId is provided
    if (stageId) {
      await prisma.deal.create({
        data: {
          stage_id: stageId,
          titulo: `Deal - ${contato.empresa || contato.nome}`,
          contato_id: contato.id,
          vendedor_id: userId,
          prioridade: 'media',
        }
      })
    }

    return NextResponse.json({ success: true, contactId: contato.id })
  } catch (err: any) {
    console.error('Error importing lead:', err)
    return NextResponse.json({ error: 'Erro ao importar lead' }, { status: 500 })
  }
}
