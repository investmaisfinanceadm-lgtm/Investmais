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
      select: {
        id: true,
        user_id: true,
        nome: true,
        email: true,
        telefone: true,
        empresa: true,
        cargo: true,
        canal_origem: true,
        status_funil: true,
        tags: true,
        notas: true,
        created_at: true,
        updated_at: true,
        atividades: { orderBy: { data: 'desc' } }
      },
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

    // Check if user exists in Profile (prevent FK violation if using dev bypass)
    const userExists = await prisma.profile.findUnique({ where: { id: userId } })
    if (!userExists) {
      console.error(`User ${userId} not found in database. Cannot create contact.`)
      return NextResponse.json({ 
        error: 'Usuario não encontrado no banco de dados. Tente fazer login novamente sem o modo bypass if possivel.' 
      }, { status: 400 })
    }

    const data = await req.json()
    const { 
      nome, email, telefone, empresa, cargo, canal_origem, 
      status_funil, tags, notas,
      cidade, estado, endereco, site, nicho, cnpj
    } = data

    // Ensure tags is always an array for Prisma if it's sent as something else
    const formattedTags = Array.isArray(tags) ? tags : (tags ? [tags] : [])

    let contact;
    try {
      // Primary attempt: All fields
      contact = await prisma.contato.create({
        data: {
          user_id: userId,
          nome, 
          email: email || null, 
          telefone: telefone || null, 
          empresa: empresa || null, 
          cargo: cargo || null,
          canal_origem: canal_origem || 'Site',
          status_funil: status_funil || 'lead',
          tags: formattedTags,
          notas: notas || '',
          cidade: cidade || null, 
          estado: estado || null, 
          endereco: endereco || null, 
          site: site || null, 
          nicho: nicho || null, 
          cnpj: cnpj || null,
        },
      })
    } catch (err: any) {
      console.error('Initial CRM POST failed:', err.message)
      
      // Secondary attempt: Minimal fields (fallback for older schema)
      // This handles cases where new columns like 'cidade' might be missing
      contact = await prisma.contato.create({
        data: {
          user_id: userId,
          nome,
          email: email || null,
          telefone: telefone || null,
          empresa: empresa || null,
          cargo: cargo || null,
          canal_origem: canal_origem || 'Site',
          status_funil: status_funil || 'lead',
          tags: formattedTags,
          notas: notas || ''
        },
      })
    }

    return NextResponse.json(contact)
  } catch (err: any) {
    console.error('CRM POST fatal error:', err)
    
    let errorMessage = 'Erro ao criar contato'
    if (err.code === 'P2003') errorMessage = 'Erro de integridade: Usuário não encontrado no banco.'
    if (err.code === 'P2002') errorMessage = 'Já existe um contato com estes dados.'
    
    return NextResponse.json({ 
      error: errorMessage, 
      details: err.message,
      code: err.code 
    }, { status: 500 })
  }
}
