import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const contacts = await prisma.contato.findMany({
      where: { user_id: userId },
      include: { atividades: { orderBy: { data: 'desc' } } },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(contacts)
  } catch (err) {
    console.error('CRM GET error:', err)
    return NextResponse.json({ error: 'Erro ao buscar contatos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const data = await req.json()
    const { 
      nome, email, telefone, empresa, cargo, canal_origem, 
      status_funil, tags, notas,
      cidade, estado, endereco, site, nicho 
    } = data

    const contact = await prisma.contato.create({
      data: {
        user_id: userId,
        nome,
        email,
        telefone,
        empresa,
        cargo,
        canal_origem: canal_origem || 'Site',
        status_funil: status_funil || 'lead',
        tags: tags || [],
        notas: notas || '',
        cidade,
        estado,
        endereco,
        site,
        nicho,
      },
    })

    return NextResponse.json(contact)
  } catch (err) {
    console.error('CRM POST error:', err)
    return NextResponse.json({ error: 'Erro ao criar contato' }, { status: 500 })
  }
}
