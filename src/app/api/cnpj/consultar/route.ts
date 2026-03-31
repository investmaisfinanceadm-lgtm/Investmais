import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ReceitaWS date format: "DD/MM/YYYY" → "YYYY-MM-DD"
function parseReceitaDate(d: string): string {
  if (!d || d === '00/00/0000') return new Date().toISOString().slice(0, 10)
  const [day, month, year] = d.split('/')
  if (!day || !month || !year) return new Date().toISOString().slice(0, 10)
  return `${year}-${month}-${day}`
}

function formatCapital(raw: string | number | undefined): string {
  if (!raw) return 'Não informado'
  const num = typeof raw === 'string' ? parseFloat(raw) : raw
  if (isNaN(num)) return String(raw)
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function maskCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

const SITUACAO_MAP: Record<string, 'ATIVA' | 'INATIVA' | 'SUSPENSA'> = {
  ATIVA: 'ATIVA',
  BAIXADA: 'INATIVA',
  INAPTA: 'INATIVA',
  SUSPENSA: 'SUSPENSA',
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const cnpjRaw = req.nextUrl.searchParams.get('cnpj')?.replace(/\D/g, '')
  if (!cnpjRaw || cnpjRaw.length !== 14) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const apiKey = process.env.RECEITAWS_API_KEY
  let receitaData: any

  try {
    const res = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjRaw}`, {
      headers: { Authorization: apiKey ?? '' },
      cache: 'no-store',
    })

    if (res.status === 404) {
      return NextResponse.json({ error: 'notfound' }, { status: 404 })
    }

    if (!res.ok) {
      return NextResponse.json({ error: 'apierror' }, { status: 502 })
    }

    receitaData = await res.json()
  } catch {
    return NextResponse.json({ error: 'apierror' }, { status: 502 })
  }

  if (receitaData.status === 'ERROR') {
    return NextResponse.json({ error: 'notfound' }, { status: 404 })
  }

  const result = {
    cnpj: maskCNPJ(cnpjRaw),
    razaoSocial: receitaData.nome ?? '',
    nomeFantasia: receitaData.fantasia || receitaData.nome,
    situacaoCadastral: SITUACAO_MAP[receitaData.situacao] ?? 'INATIVA',
    dataAbertura: parseReceitaDate(receitaData.abertura),
    cnaePrincipalCodigo: receitaData.atividade_principal?.[0]?.code ?? '',
    cnaePrincipalDescricao: receitaData.atividade_principal?.[0]?.text ?? '',
    logradouro: receitaData.logradouro ?? '',
    numero: receitaData.numero ?? '',
    complemento: receitaData.complemento ?? '',
    bairro: receitaData.bairro ?? '',
    municipio: receitaData.municipio ?? '',
    uf: receitaData.uf ?? '',
    cep: receitaData.cep ?? '',
    telefone: receitaData.telefone ?? 'Não informado',
    email: receitaData.email ?? 'Não informado',
    capitalSocial: formatCapital(receitaData.capital_social),
    socios: (receitaData.qsa ?? []).map((s: any) => ({
      nome: s.nome,
      qualificacao: s.qual,
      dataEntrada: parseReceitaDate(s.data_entrada),
    })),
  }

  // Save to DB (fire-and-forget, don't block the response)
  const userId = (session.user as any).id
  if (userId) {
    // Histórico de consultas (com dados completos)
    prisma.consultaCNPJ.create({
      data: {
        user_id: userId,
        cnpj: result.cnpj,
        razao_social: result.razaoSocial,
        nome_fantasia: result.nomeFantasia,
        situacao: result.situacaoCadastral,
        dados: result as any,
      },
    }).catch(() => {})

    // Tabela leads_cnpj — mesma estrutura do Supabase do n8n
    prisma.leadCNPJ.create({
      data: {
        cnpj: result.cnpj,
        nome: result.razaoSocial,
        telefone: result.telefone !== 'Não informado' ? result.telefone.split('/')[0].trim() : null,
        email: result.email !== 'Não informado' ? result.email : null,
        situacao: result.situacaoCadastral,
        cidade: result.municipio,
        estado: result.uf,
        endereco: `${result.logradouro}, ${result.numero}`.trim().replace(/^,\s*/, ''),
        cnae_descricao: result.cnaePrincipalDescricao,
        cnae_codigo: result.cnaePrincipalCodigo,
        user_id: userId,
      },
    }).catch(() => {})
  }

  return NextResponse.json(result)
}
