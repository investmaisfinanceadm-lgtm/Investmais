import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const userId = (session.user as any).id
  const leads = await prisma.leadCNPJ.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 200,
  })

  return NextResponse.json(leads)
}
