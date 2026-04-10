import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    
    // Auth userId gets forwarded to N8N for later associating leads in DB
    const userId = (session.user as any).id

    const data = await req.json()
    const { estado, cidade, nicho } = data

    if (!estado || !cidade || !nicho) {
      return NextResponse.json({ error: 'Campos obrigatórios: estado, cidade, nicho' }, { status: 400 })
    }

    // Call the N8N webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://auto.devnetlife.com/webhook/investmais'
    
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estado,
        cidade,
        nicho,
        user_id: userId
      })
    })

    if (n8nResponse.ok) {
      return NextResponse.json({ success: true, message: 'Busca iniciada com sucesso via N8N' })
    } else {
      const errorText = await n8nResponse.text().catch(() => 'Failed to reach N8N')
      return NextResponse.json({ error: 'O webhook do N8N retornou um erro', details: errorText }, { status: 502 })
    }

  } catch (err) {
    console.error('N8N Scrape route error:', err)
    return NextResponse.json({ error: 'Erro interno ao iniciar a busca' }, { status: 500 })
  }
}
