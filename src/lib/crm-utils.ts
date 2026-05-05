/**
 * Normaliza o telefone para o formato 55+DDD+Número
 */
export function normalizeWhatsApp(phone: string): string {
  if (!phone) return ''
  // Remove tudo que não é número
  let clean = phone.replace(/\D/g, '')
  
  // Se começar com 0, remove
  if (clean.startsWith('0')) clean = clean.substring(1)
  
  // Se tiver 10 ou 11 dígitos (sem o 55), adiciona o 55
  if (clean.length === 10 || clean.length === 11) {
    clean = '55' + clean
  }
  
  return clean
}

/**
 * Formata moeda para BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Cores fixas para vendedores (NetLife style)
 */
export const SELLER_COLORS = [
  '#3B82F6', // azul
  '#10B981', // esmeralda
  '#F59E0B', // âmbar
  '#8B5CF6', // roxo
  '#EC4899', // rosa
  '#06B6D4', // ciano
]
