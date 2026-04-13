import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

// GET: Gera e faz download do template .xlsx
export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'InvestMais CRM'
    workbook.created = new Date()

    // ── Aba 1: Importar Contatos ────────────────────────────────────────────
    const sheet = workbook.addWorksheet('Importar Contatos')

    sheet.columns = [
      { header: 'nome', key: 'nome', width: 32 },
      { header: 'empresa', key: 'empresa', width: 32 },
      { header: 'email', key: 'email', width: 38 },
      { header: 'telefone', key: 'telefone', width: 22 },
      { header: 'status', key: 'status', width: 16 },
      { header: 'canal', key: 'canal', width: 16 },
      { header: 'observacoes', key: 'observacoes', width: 52 },
    ]

    // Estilo do cabeçalho: fundo azul escuro, texto branco, negrito
    const headerRow = sheet.getRow(1)
    headerRow.height = 26
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A5F' },
      }
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 11,
        name: 'Calibri',
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF2563EB' } },
      }
    })

    // Exemplos de dados fictícios realistas
    const examples = [
      {
        nome: 'Dra. Ana Lima',
        empresa: 'Clínica Bem Estar',
        email: 'ana.lima@clinicabemestar.com.br',
        telefone: '(11) 98765-4321',
        status: 'Cliente',
        canal: 'Google',
        observacoes: 'Atendimento particular, interesse em gestão financeira da clínica',
      },
      {
        nome: 'Carlos Mendes',
        empresa: 'Mendes & Associados Advocacia',
        email: 'carlos@mendesadvocacia.com.br',
        telefone: '(21) 97654-3210',
        status: 'Lead',
        canal: 'Indicação',
        observacoes: 'Indicado pelo Dr. Paulo. Aguardando retorno para agendar reunião',
      },
      {
        nome: 'Patricia Oliveira',
        empresa: 'Studio Beleza Total',
        email: 'patricia@studiobtp.com.br',
        telefone: '(31) 96543-2109',
        status: 'Novo',
        canal: 'Instagram',
        observacoes: '',
      },
    ]

    examples.forEach((data, i) => {
      const row = sheet.addRow(data)
      row.height = 20
      // Linhas alternadas com fundo sutil
      if (i % 2 === 0) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } }
        })
      }
    })

    // Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 1 }]

    // ── Aba 2: Instruções ───────────────────────────────────────────────────
    const instrSheet = workbook.addWorksheet('Instruções')
    instrSheet.getColumn(1).width = 85

    type InstrRow = { text: string; style?: 'title' | 'section' | 'item' | 'normal' }
    const lines: InstrRow[] = [
      { text: 'INSTRUÇÕES DE PREENCHIMENTO — InvestMais CRM', style: 'title' },
      { text: '' },
      { text: 'COLUNAS OBRIGATÓRIAS:', style: 'section' },
      { text: '  • nome          → Nome completo ou razão social do contato', style: 'item' },
      { text: '  • empresa       → Nome da empresa ou negócio', style: 'item' },
      { text: '  • email         → Endereço de e-mail válido (usado para detectar duplicatas)', style: 'item' },
      { text: '  • telefone      → Formato recomendado: (XX) XXXXX-XXXX', style: 'item' },
      { text: '  • status        → Valores aceitos: Novo, Lead, Cliente, Inativo', style: 'item' },
      { text: '  • canal         → Valores aceitos: Google, Indicação, Instagram, Facebook, WhatsApp, Outro', style: 'item' },
      { text: '' },
      { text: 'COLUNAS OPCIONAIS:', style: 'section' },
      { text: '  • observacoes   → Texto livre com anotações sobre o contato', style: 'item' },
      { text: '' },
      { text: 'REGRAS IMPORTANTES:', style: 'section' },
      { text: '  • A linha 1 é o cabeçalho e será ignorada na importação', style: 'item' },
      { text: '  • A importação começa sempre a partir da linha 2', style: 'item' },
      { text: '  • Campos obrigatórios em branco resultarão em erro para aquela linha específica', style: 'item' },
      { text: '  • Contatos com e-mail já cadastrado serão identificados como duplicatas', style: 'item' },
      { text: '  • Você poderá escolher sobrescrever ou ignorar as duplicatas antes de confirmar', style: 'item' },
      { text: '' },
      { text: 'VALORES VÁLIDOS PARA STATUS:', style: 'section' },
      { text: '  Novo      → Contato recém-captado, sem qualificação prévia', style: 'item' },
      { text: '  Lead      → Contato qualificado, em processo de vendas ativo', style: 'item' },
      { text: '  Cliente   → Contato que já fechou negócio ou comprou', style: 'item' },
      { text: '  Inativo   → Contato sem interesse ou que saiu do funil', style: 'item' },
      { text: '' },
      { text: 'VALORES VÁLIDOS PARA CANAL:', style: 'section' },
      { text: '  Google, Indicação, Instagram, Facebook, WhatsApp, Outro', style: 'item' },
    ]

    lines.forEach(({ text, style }) => {
      const row = instrSheet.addRow([text])
      row.height = 18
      const cell = row.getCell(1)
      if (style === 'title') {
        cell.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' }, name: 'Calibri' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } }
        row.height = 28
      } else if (style === 'section') {
        cell.font = { bold: true, size: 11, color: { argb: 'FF1E3A5F' }, name: 'Calibri' }
        row.height = 22
      } else if (style === 'item') {
        cell.font = { size: 10, color: { argb: 'FF374151' }, name: 'Calibri' }
      }
    })

    const rawBuffer = await workbook.xlsx.writeBuffer()
    const buffer = rawBuffer instanceof Buffer ? rawBuffer : Buffer.from(rawBuffer as ArrayBuffer)

    return new NextResponse(buffer as unknown as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="modelo-importacao-contatos.xlsx"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('Template generation error:', err)
    return NextResponse.json({ error: 'Erro ao gerar template' }, { status: 500 })
  }
}

// POST: Valida ou importa contatos de um arquivo Excel
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const mode = (formData.get('mode') as string) || 'check' // 'check' | 'import'
    const duplicateAction = (formData.get('duplicateAction') as string) || 'skip' // 'skip' | 'overwrite'

    if (!file) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 400 })

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json({ error: 'Formato inválido. Envie um arquivo .xlsx ou .xls' }, { status: 400 })
    }

    const arrayBuf = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load(arrayBuf as any)

    // Usa a primeira aba que contenha dados (preferindo "Importar Contatos")
    const sheet =
      workbook.worksheets.find((ws) => ws.name === 'Importar Contatos') ||
      workbook.worksheets[0]

    if (!sheet) return NextResponse.json({ error: 'Nenhuma aba encontrada na planilha' }, { status: 400 })

    // Lê cabeçalho
    const headerRow = sheet.getRow(1)
    const headers: string[] = []
    headerRow.eachCell({ includeEmpty: true }, (cell, colIndex) => {
      headers[colIndex - 1] = String(cell.value ?? '').trim().toLowerCase()
    })

    const findIdx = (...terms: string[]) =>
      headers.findIndex((h) => terms.some((t) => h.includes(t)))

    const idx = {
      nome: findIdx('nome'),
      empresa: findIdx('empresa'),
      email: findIdx('email'),
      telefone: findIdx('telefone', 'fone', 'phone'),
      status: findIdx('status'),
      canal: findIdx('canal'),
      obs: findIdx('observ', 'obs', 'nota'),
    }

    type ParsedRow = {
      rowNumber: number
      nome: string
      empresa: string
      email: string
      telefone: string
      status_funil: string
      canal_origem: string
      notas: string
    }

    type RowError = { row: number; field: string; message: string }

    const parsedRows: ParsedRow[] = []
    const errors: RowError[] = []

    const getCellStr = (row: ExcelJS.Row, colIdx: number): string => {
      if (colIdx === -1) return ''
      const cell = row.getCell(colIdx + 1)
      if (cell.value === null || cell.value === undefined) return ''
      if (typeof cell.value === 'object') {
        if ('text' in cell.value) return String((cell.value as any).text ?? '').trim()
        if ('result' in cell.value) return String((cell.value as any).result ?? '').trim()
      }
      return String(cell.value).trim()
    }

    const STATUS_MAP: Record<string, string> = {
      novo: 'lead',
      lead: 'lead',
      qualificado: 'qualificado',
      cliente: 'cliente',
      inativo: 'inativo',
      proposta: 'proposta',
      reuniao: 'reuniao',
    }

    const VALID_CANAIS = ['Google', 'Indicação', 'Instagram', 'Facebook', 'WhatsApp', 'Outro', 'Site']

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return

      const nome = getCellStr(row, idx.nome)
      const empresa = getCellStr(row, idx.empresa)
      const email = getCellStr(row, idx.email)
      const telefone = getCellStr(row, idx.telefone)
      const statusRaw = getCellStr(row, idx.status)
      const canalRaw = getCellStr(row, idx.canal)
      const notas = getCellStr(row, idx.obs)

      const rowErrors: string[] = []
      if (!nome) rowErrors.push('nome')
      if (!empresa) rowErrors.push('empresa')
      if (!email) rowErrors.push('email')
      if (!telefone) rowErrors.push('telefone')
      if (!statusRaw) rowErrors.push('status')
      if (!canalRaw) rowErrors.push('canal')

      if (rowErrors.length > 0) {
        rowErrors.forEach((field) =>
          errors.push({ row: rowNumber, field, message: `Campo "${field}" obrigatório na linha ${rowNumber}` })
        )
        return
      }

      const status_funil = STATUS_MAP[statusRaw.toLowerCase()] ?? 'lead'
      const canal_origem =
        VALID_CANAIS.find((c) => c.toLowerCase() === canalRaw.toLowerCase()) ?? 'Outro'

      parsedRows.push({ rowNumber, nome, empresa, email, telefone, status_funil, canal_origem, notas })
    })

    // Busca duplicatas por email
    const emailList = parsedRows.map((r) => r.email).filter(Boolean)
    const existingByEmail = emailList.length
      ? await prisma.contato.findMany({
          where: { user_id: userId, email: { in: emailList } },
          select: { id: true, email: true, nome: true },
        })
      : []

    const existingEmailMap = new Map(existingByEmail.map((e) => [e.email, e]))

    const duplicates = parsedRows
      .filter((r) => existingEmailMap.has(r.email))
      .map((r) => {
        const ex = existingEmailMap.get(r.email)!
        return { row: r.rowNumber, email: r.email, existingName: ex.nome, existingId: ex.id }
      })

    // ── Modo: apenas verificação ─────────────────────────────────────────────
    if (mode === 'check') {
      return NextResponse.json({ valid: parsedRows.length, errors, duplicates })
    }

    // ── Modo: importação ──────────────────────────────────────────────────────
    let imported = 0
    let skipped = 0
    const importErrors: { row: number; message: string }[] = []

    for (const row of parsedRows) {
      const existing = existingEmailMap.get(row.email)

      if (existing) {
        if (duplicateAction === 'skip') {
          skipped++
          continue
        }
        if (duplicateAction === 'overwrite') {
          try {
            await prisma.contato.update({
              where: { id: existing.id },
              data: {
                nome: row.nome,
                empresa: row.empresa,
                telefone: row.telefone || null,
                status_funil: row.status_funil,
                canal_origem: row.canal_origem,
                notas: row.notas || '',
              },
            })
            imported++
          } catch (e: any) {
            importErrors.push({ row: row.rowNumber, message: e.message })
          }
          continue
        }
      }

      try {
        await prisma.contato.create({
          data: {
            user_id: userId,
            nome: row.nome,
            empresa: row.empresa || null,
            email: row.email || null,
            telefone: row.telefone || null,
            canal_origem: row.canal_origem,
            status_funil: row.status_funil,
            notas: row.notas || '',
            tags: [],
          },
        })
        imported++
      } catch (e: any) {
        importErrors.push({ row: row.rowNumber, message: e.message })
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors: [...errors, ...importErrors],
    })
  } catch (err: any) {
    console.error('Excel import error:', err)
    return NextResponse.json(
      { error: 'Erro ao processar arquivo Excel', details: err.message },
      { status: 500 }
    )
  }
}
