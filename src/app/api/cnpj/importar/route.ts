import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const data = await req.json()

  const contato = await prisma.contato.create({
    data: {
      user_id: userId,
      nome: data.razaoSocial,
      email: data.email !== 'Não informado' ? data.email : null,
      telefone: data.telefone !== 'Não informado' ? data.telefone.split('/')[0].trim() : null,
      empresa: data.nomeFantasia || data.razaoSocial,
      cnpj: data.cnpj,
      cargo: 'Empresa',
      canal_origem: 'CNPJ',
      status_funil: 'lead',
      notas: `CNAE: ${data.cnaePrincipalDescricao}\nEndereço: ${data.logradouro}, ${data.numero} — ${data.municipio}/${data.uf}`,
    },
  })

  return NextResponse.json({ ok: true, contatoId: contato.id })
}
