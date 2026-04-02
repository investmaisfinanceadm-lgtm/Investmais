const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://auto.devnetlife.com/webhook/financeiro'

export function triggerVideoN8N(params: {
  video_id: string
  service_name: string
  service_description: string
  video_duration?: number
  imageBuffer?: Buffer
  imageType?: string
  imageName?: string
}): void {
  const formData = new FormData()
  formData.append('video_id', params.video_id)
  formData.append('service_name', params.service_name)
  formData.append('service_description', params.service_description)
  if (params.video_duration !== undefined) {
    formData.append('video_duration', params.video_duration.toString())
  }

  if (params.imageBuffer) {
    const blob = new Blob([params.imageBuffer], { type: params.imageType || 'image/png' })
    formData.append('image', blob, params.imageName || 'logo.png')
  }

  // Dispara sem aguardar — n8n processará e chamará o callback quando terminar
  fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    body: formData,
  }).catch(err => console.error('n8n trigger error:', err))
}
