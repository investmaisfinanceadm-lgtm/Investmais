const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://auto.devnetlife.com/webhook/financeiro'

export interface N8NVideoResult {
  video: string
}

export async function generateVideoN8N(params: {
  service_name: string
  service_description: string
  imageBuffer?: Buffer
  imageType?: string
  imageName?: string
}): Promise<N8NVideoResult> {
  const formData = new FormData()
  formData.append('service_name', params.service_name)
  formData.append('service_description', params.service_description)

  if (params.imageBuffer) {
    const blob = new Blob([params.imageBuffer], { type: params.imageType || 'image/png' })
    formData.append('image', blob, params.imageName || 'logo.png')
  }

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(10 * 60 * 1000), // 10 minutos
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`Erro no webhook n8n: ${response.status} - ${text}`)
  }

  if (!text || text.trim() === '') {
    throw new Error('n8n retornou resposta vazia')
  }

  let result: N8NVideoResult
  try {
    result = JSON.parse(text)
  } catch {
    throw new Error(`n8n retornou resposta inválida: ${text.slice(0, 200)}`)
  }

  if (!result.video) {
    throw new Error('n8n não retornou URL do vídeo')
  }

  return result
}
