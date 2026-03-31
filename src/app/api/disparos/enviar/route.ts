import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { z } from 'zod'

const bodySchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  segment: z.enum(['todos', 'leads', 'clientes', 'manual']),
  manualEmails: z.string().optional(),
  scheduleToggle: z.boolean(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
})

function buildHtml(subject: string, body: string, recipientName: string, recipientCompany?: string): string {
  const resolvedBody = body
    .replace(/\{\{nome\}\}/g, recipientName)
    .replace(/\{\{empresa\}\}/g, recipientCompany ?? 'sua empresa')
    .replace(/\n/g, '<br/>')

  const resolvedSubject = subject
    .replace(/\{\{nome\}\}/g, recipientName)
    .replace(/\{\{empresa\}\}/g, recipientCompany ?? 'sua empresa')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${resolvedSubject}</title>
</head>
<body style="margin:0;padding:0;background:#0A192F;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A192F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#131B2B;border-radius:16px;border:1px solid #1E293B;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563EB,#1e3a8a);padding:32px 40px;">
              <p style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">INVESTMAIS</p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:3px;text-transform:uppercase;">Finance</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#e2e8f0;font-size:15px;line-height:1.7;">${resolvedBody}</p>
              <hr style="border:none;border-top:1px solid #1E293B;margin:32px 0;" />
              <p style="margin:0;color:#475569;font-size:12px;line-height:1.6;">
                Este e-mail foi enviado pela plataforma <strong style="color:#64748b;">InvestMais Finance</strong>.<br/>
                Caso não queira mais receber comunicações, entre em contato conosco.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0F172A;padding:20px 40px;border-top:1px solid #1E293B;">
              <p style="margin:0;color:#334155;font-size:11px;text-align:center;letter-spacing:1px;text-transform:uppercase;">
                © ${new Date().getFullYear()} InvestMais Finance • Todos os direitos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { subject, body, segment, manualEmails, scheduleToggle, scheduledDate, scheduledTime } = parsed.data

  // Build recipient list
  let recipients: { email: string; name: string; empresa?: string }[] = []

  if (segment === 'manual') {
    const emails = (manualEmails ?? '').split(',').map(e => e.trim()).filter(Boolean)
    recipients = emails.map(email => ({ email, name: email.split('@')[0] }))
  } else {
    const userId = (session.user as any).id
    const where: Record<string, unknown> = { user_id: userId, email: { not: null } }
    if (segment === 'leads') where.status_funil = 'lead'
    if (segment === 'clientes') where.status_funil = 'cliente'

    const contatos = await prisma.contato.findMany({ where, select: { email: true, nome: true, empresa: true } })
    recipients = contatos
      .filter(c => c.email)
      .map(c => ({ email: c.email!, name: c.nome, empresa: c.empresa ?? undefined }))
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'Nenhum destinatário encontrado para o segmento selecionado.' }, { status: 422 })
  }

  // Build scheduledAt for Resend
  let scheduledAt: string | undefined
  if (scheduleToggle && scheduledDate) {
    const time = scheduledTime ?? '09:00'
    scheduledAt = new Date(`${scheduledDate}T${time}:00`).toISOString()
  }

  const errors: string[] = []
  let sent = 0

  for (const r of recipients) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: r.email,
        subject: subject.replace(/\{\{nome\}\}/g, r.name).replace(/\{\{empresa\}\}/g, r.empresa ?? 'sua empresa'),
        html: buildHtml(subject, body, r.name, r.empresa),
        ...(scheduledAt ? { scheduledAt } : {}),
      })
      sent++
    } catch (err: any) {
      errors.push(`${r.email}: ${err?.message ?? 'erro desconhecido'}`)
    }
  }

  if (sent === 0) {
    return NextResponse.json({ error: 'Falha ao enviar para todos os destinatários.', details: errors }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    sent,
    scheduled: !!scheduledAt,
    failed: errors.length,
    errors: errors.length ? errors : undefined,
  })
}
