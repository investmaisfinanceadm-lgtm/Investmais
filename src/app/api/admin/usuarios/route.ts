import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key',
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { nome, email, senha, perfil, cota_mensal } = body

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: senha,
            email_confirm: true,
            user_metadata: { nome, perfil },
        })

        if (authError || !authData.user) {
            return NextResponse.json(
                { error: authError?.message || 'Erro ao criar usuário' },
                { status: 400 }
            )
        }

        // Create profile record in im schema
        const { error: profileError } = await supabaseAdmin
            .schema('im')
            .from('profiles')
            .upsert({
                id: authData.user.id,
                nome,
                email,
                perfil,
                cota_mensal: cota_mensal || 10,
                cota_usada: 0,
                status: 'ativo',
            })

        if (profileError) {
            // Clean up auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 })
        }

        return NextResponse.json({ success: true, user_id: authData.user.id })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
