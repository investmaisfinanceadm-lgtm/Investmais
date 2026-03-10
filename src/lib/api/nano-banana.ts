export interface NanoBananaJobStatus {
    id: string
    status: 'queued' | 'processing' | 'completed' | 'failed'
    video_url?: string
    error?: string
    progress?: number
}

export interface GenerateVideoParams {
    nome_produto: string
    descricao_produto: string
    imagem_produto_url?: string
    logo_empresa_url?: string
    formato: string
    linha_editorial: string
    duracao: number
    tom: string
}

const API_URL = process.env.NANO_BANANA_API_URL || 'https://api.nanobanan.as'
const API_KEY = process.env.NANO_BANANA_API_KEY

async function nanoBananaFetch(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
            ...options?.headers,
        },
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Nano Banana API error: ${response.status} - ${error}`)
    }

    return response.json()
}

/**
 * Submit a video generation job to Nano Banana API
 */
export async function generateVideo(
    params: GenerateVideoParams
): Promise<{ job_id: string }> {
    // Map our internal format to Nano Banana API format
    const payload = {
        product_name: params.nome_produto,
        product_description: params.descricao_produto,
        product_image_url: params.imagem_produto_url,
        company_logo_url: params.logo_empresa_url,
        output_format: params.formato,
        editorial_style: params.linha_editorial,
        duration_seconds: params.duracao,
        tone: params.tom,
        language: 'pt-BR',
        market: 'financial',
    }

    return nanoBananaFetch('/v1/videos/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Get the status of a video generation job
 */
export async function getVideoStatus(
    jobId: string
): Promise<NanoBananaJobStatus> {
    return nanoBananaFetch(`/v1/videos/${jobId}/status`)
}

/**
 * Poll for job completion with exponential backoff
 */
export async function pollVideoStatus(
    jobId: string,
    onProgress?: (status: NanoBananaJobStatus) => void,
    maxAttempts = 60
): Promise<NanoBananaJobStatus> {
    let attempts = 0
    const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms))

    while (attempts < maxAttempts) {
        const status = await getVideoStatus(jobId)
        onProgress?.(status)

        if (status.status === 'completed' || status.status === 'failed') {
            return status
        }

        // Exponential backoff: 3s, 5s, 8s, 10s, 10s...
        const waitTime = Math.min(3000 + attempts * 2000, 10000)
        await delay(waitTime)
        attempts++
    }

    throw new Error('Timeout: Geração de vídeo excedeu o tempo máximo de espera')
}
