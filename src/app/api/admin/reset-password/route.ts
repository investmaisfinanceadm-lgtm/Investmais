import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { email } = body

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${request.nextUrl.origin}/redefinir-senha`,
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
