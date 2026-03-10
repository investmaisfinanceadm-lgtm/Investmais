import { NextResponse, type NextRequest } from 'next/server'
import { generateVideo } from '@/lib/api/nano-banana'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()

        // If Nano Banana API key not configured, simulate job
        if (!process.env.NANO_BANANA_API_KEY || process.env.NANO_BANANA_API_KEY === 'your_nano_banana_api_key_here') {
            // Simulate async job for demo purposes
            const mockJobId = `mock_job_${Date.now()}`
            return NextResponse.json({ job_id: mockJobId, simulated: true })
        }

        const result = await generateVideo({
            nome_produto: body.nome_produto,
            descricao_produto: body.descricao_produto,
            imagem_produto_url: body.imagem_produto_url,
            logo_empresa_url: body.logo_empresa_url,
            formato: body.formato,
            linha_editorial: body.linha_editorial,
            duracao: body.duracao,
            tom: body.tom,
        })

        return NextResponse.json({ job_id: result.job_id })
    } catch (error: unknown) {
        console.error('Video generation error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao gerar vídeo' },
            { status: 500 }
        )
    }
}
