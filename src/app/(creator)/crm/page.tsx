'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Users,
  Upload,
  Plus,
  Search,
  LayoutList,
  LayoutGrid,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Eye,
  Pencil,
  Trash2,
  X,
  Building2,
  Tag,
  ChevronRight,
  UserCheck,
  TrendingUp,
  Activity,
  Clock,
  Instagram,
  Globe,
  Linkedin,
  Briefcase,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type FunilStatus = 'lead' | 'qualificado' | 'proposta' | 'cliente' | 'inativo'
type Canal = 'Instagram' | 'Site' | 'Indicação' | 'LinkedIn' | 'WhatsApp' | 'Google'
type ActivityType = 'phone' | 'email' | 'message' | 'meeting' | 'note'
type ViewMode = 'list' | 'grid'
type FilterTab = 'todos' | 'leads' | 'clientes' | 'inativos'
type DetailTab = 'visao-geral' | 'atividades' | 'cnpj'

interface ContactActivity {
  id: string
  type: ActivityType
  description: string
  date: Date
}

interface Contact {
  id: string
  nome: string
  empresa: string
  email: string
  telefone: string
  cargo: string
  canal: Canal
  status: FunilStatus
  tags: string[]
  cnpj?: string
  notas: string
  createdAt: Date
  lastActivity: Date
  activities: ContactActivity[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    nome: 'Rafael Mendonça',
    empresa: 'Vortex Capital',
    email: 'rafael.mendonca@vortexcapital.com.br',
    telefone: '(11) 99182-4455',
    cargo: 'Diretor de Investimentos',
    canal: 'LinkedIn',
    status: 'cliente',
    tags: ['VIP', 'Fundos', 'B2B'],
    cnpj: '12.345.678/0001-90',
    notas: 'Cliente premium. Prefere contato por WhatsApp após as 18h. Investidor ativo em FIIs.',
    createdAt: new Date('2024-08-15'),
    lastActivity: new Date('2026-03-20'),
    activities: [
      { id: 'a1', type: 'phone', description: 'Ligação para discutir carteira Q1 2026', date: new Date('2026-03-20') },
      { id: 'a2', type: 'meeting', description: 'Reunião presencial - Escritório SP', date: new Date('2026-02-10') },
      { id: 'a3', type: 'email', description: 'Envio de relatório mensal de performance', date: new Date('2026-01-05') },
    ],
  },
  {
    id: '2',
    nome: 'Camila Souza',
    empresa: 'Nexum Consultoria',
    email: 'camila@nexumconsultoria.com.br',
    telefone: '(21) 98765-3322',
    cargo: 'Sócia-Fundadora',
    canal: 'Indicação',
    status: 'qualificado',
    tags: ['Consultoria', 'Renda Fixa'],
    notas: 'Indicada pelo Rafael Mendonça. Grande interesse em renda fixa e CDBs pós-fixados.',
    createdAt: new Date('2025-11-20'),
    lastActivity: new Date('2026-03-25'),
    activities: [
      { id: 'b1', type: 'message', description: 'WhatsApp: enviou dúvidas sobre CDB IPCA+', date: new Date('2026-03-25') },
      { id: 'b2', type: 'email', description: 'Proposta de plano Investmais Pro enviada', date: new Date('2026-03-10') },
    ],
  },
  {
    id: '3',
    nome: 'Bruno Almeida',
    empresa: 'AlmaTech Soluções',
    email: 'bruno.almeida@almatech.io',
    telefone: '(31) 97654-1100',
    cargo: 'CEO',
    canal: 'Instagram',
    status: 'lead',
    tags: ['Tech', 'Startups'],
    notas: 'Chegou via post do Instagram sobre Day Trade. Demonstrou interesse inicial.',
    createdAt: new Date('2026-03-01'),
    lastActivity: new Date('2026-03-28'),
    activities: [
      { id: 'c1', type: 'note', description: 'Comentou no post: "Quero saber mais"', date: new Date('2026-03-01') },
      { id: 'c2', type: 'message', description: 'DM enviada com material de boas-vindas', date: new Date('2026-03-02') },
    ],
  },
  {
    id: '4',
    nome: 'Juliana Ferreira',
    empresa: 'Grupo Ferreira Holding',
    email: 'juliana.ferreira@gfholding.com.br',
    telefone: '(41) 99911-8877',
    cargo: 'CFO',
    canal: 'Site',
    status: 'proposta',
    tags: ['Holding', 'Alto Valor', 'Fundos'],
    cnpj: '98.765.432/0001-11',
    notas: 'Preencheu formulário no site. Gestão de patrimônio familiar. Budget acima de R$ 500k.',
    createdAt: new Date('2025-12-10'),
    lastActivity: new Date('2026-03-15'),
    activities: [
      { id: 'd1', type: 'meeting', description: 'Call de qualificação - 45 min', date: new Date('2026-01-20') },
      { id: 'd2', type: 'email', description: 'Proposta personalizada enviada - R$ 12.000/ano', date: new Date('2026-03-01') },
      { id: 'd3', type: 'phone', description: 'Follow-up: aguardando aprovação do conselho', date: new Date('2026-03-15') },
    ],
  },
  {
    id: '5',
    nome: 'Thiago Nascimento',
    empresa: 'Freelancer',
    email: 'thiago.n@gmail.com',
    telefone: '(85) 98833-2255',
    cargo: 'Desenvolvedor Fullstack',
    canal: 'Instagram',
    status: 'inativo',
    tags: ['Individual', 'Pequeno Investidor'],
    notas: 'Cancelou assinatura em jan/26. Motivo: relocação para Portugal.',
    createdAt: new Date('2024-06-01'),
    lastActivity: new Date('2026-01-15'),
    activities: [
      { id: 'e1', type: 'email', description: 'Email de churn: confirmação de cancelamento', date: new Date('2026-01-15') },
      { id: 'e2', type: 'note', description: 'Motivo: mudança internacional', date: new Date('2026-01-16') },
    ],
  },
  {
    id: '6',
    nome: 'Fernanda Lima',
    empresa: 'Lima & Associados Advocacia',
    email: 'fernanda@limaadvocacia.adv.br',
    telefone: '(11) 98800-6677',
    cargo: 'Advogada Sócia',
    canal: 'Indicação',
    status: 'cliente',
    tags: ['Jurídico', 'Renda Fixa', 'Previdência'],
    cnpj: '45.678.901/0001-23',
    notas: 'Muito organizada. Prefere relatórios detalhados por email. Foca em previdência privada.',
    createdAt: new Date('2024-10-05'),
    lastActivity: new Date('2026-03-22'),
    activities: [
      { id: 'f1', type: 'email', description: 'Relatório trimestral Q4 2025 enviado', date: new Date('2026-01-10') },
      { id: 'f2', type: 'meeting', description: 'Revisão anual de carteira - Google Meet', date: new Date('2026-02-28') },
      { id: 'f3', type: 'note', description: 'Solicitou análise de PGBL vs VGBL', date: new Date('2026-03-22') },
    ],
  },
  {
    id: '7',
    nome: 'Rodrigo Carvalho',
    empresa: 'Carvalho Agro Negócios',
    email: 'rodrigo@carvalhoad.agr.br',
    telefone: '(67) 99777-4433',
    cargo: 'Proprietário',
    canal: 'WhatsApp',
    status: 'qualificado',
    tags: ['Agronegócio', 'CRA', 'Alto Valor'],
    notas: 'Contato via grupo de agro. Interesse em CRAs e fundos de agro. Ticket médio estimado R$ 200k.',
    createdAt: new Date('2026-01-20'),
    lastActivity: new Date('2026-03-27'),
    activities: [
      { id: 'g1', type: 'message', description: 'WhatsApp: primeiro contato no grupo', date: new Date('2026-01-20') },
      { id: 'g2', type: 'phone', description: 'Ligação de 20 min: apresentação da plataforma', date: new Date('2026-02-05') },
      { id: 'g3', type: 'email', description: 'Material sobre CRAs disponíveis enviado', date: new Date('2026-03-10') },
    ],
  },
  {
    id: '8',
    nome: 'Patricia Moura',
    empresa: 'Editora Moura Cultural',
    email: 'patricia.moura@editoramoura.com.br',
    telefone: '(19) 97722-9988',
    cargo: 'Diretora Executiva',
    canal: 'LinkedIn',
    status: 'lead',
    tags: ['Cultura', 'PME'],
    notas: 'Conectou via LinkedIn após artigo sobre investimentos para PMEs. Ainda no estágio inicial.',
    createdAt: new Date('2026-02-14'),
    lastActivity: new Date('2026-02-20'),
    activities: [
      { id: 'h1', type: 'note', description: 'Conexão aceita no LinkedIn', date: new Date('2026-02-14') },
      { id: 'h2', type: 'message', description: 'InMail enviado com link para demo gratuita', date: new Date('2026-02-20') },
    ],
  },
  {
    id: '9',
    nome: 'Lucas Teixeira',
    empresa: 'Teixeira Imóveis',
    email: 'lucas@teixeiraimoveis.com.br',
    telefone: '(51) 98811-3344',
    cargo: 'Corretor Senior',
    canal: 'Site',
    status: 'cliente',
    tags: ['Imóveis', 'FII', 'Renda Passiva'],
    cnpj: '56.789.012/0001-34',
    notas: 'Especialista em FIIs. Usa a plataforma para acompanhar carteira de clientes dele.',
    createdAt: new Date('2024-07-22'),
    lastActivity: new Date('2026-03-29'),
    activities: [
      { id: 'i1', type: 'email', description: 'Renovação anual processada automaticamente', date: new Date('2026-01-22') },
      { id: 'i2', type: 'phone', description: 'Solicitou feature de comparativo entre FIIs', date: new Date('2026-03-29') },
    ],
  },
  {
    id: '10',
    nome: 'Ana Clara Rocha',
    empresa: 'Rocha & Partners',
    email: 'anaclara@rochap.com.br',
    telefone: '(47) 99933-7766',
    cargo: 'Gestora de Patrimônio',
    canal: 'Indicação',
    status: 'proposta',
    tags: ['Wealth Management', 'Multi-Family Office'],
    cnpj: '67.890.123/0001-45',
    notas: 'Indicada pela Fernanda Lima. Gerencia patrimônio de 12 famílias. Potencial B2B muito alto.',
    createdAt: new Date('2026-02-28'),
    lastActivity: new Date('2026-03-26'),
    activities: [
      { id: 'j1', type: 'meeting', description: 'Reunião de apresentação com parceira indicadora', date: new Date('2026-03-01') },
      { id: 'j2', type: 'email', description: 'Proposta white-label enviada', date: new Date('2026-03-15') },
      { id: 'j3', type: 'phone', description: 'Negociação de condições especiais B2B', date: new Date('2026-03-26') },
    ],
  },
]

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return (name || '')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '??'
}

function safeFormat(date: Date | string | null | undefined, fmt: string): string {
  try {
    if (!date) return '—'
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return '—'
    return format(d, fmt, { locale: ptBR })
  } catch { return '—' }
}

function safeDistance(date: Date | string | null | undefined): string {
  try {
    if (!date) return '—'
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return '—'
    return formatDistanceToNow(d, { locale: ptBR, addSuffix: true })
  } catch { return '—' }
}

const AVATAR_COLORS = [
  'bg-accent/20 text-accent',
  'bg-blue-500/20 text-blue-400',
  'bg-purple-500/20 text-purple-400',
  'bg-amber-500/20 text-amber-400',
  'bg-rose-500/20 text-rose-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-orange-500/20 text-orange-400',
  'bg-indigo-500/20 text-indigo-400',
]

function getAvatarColor(id: string): string {
  const index = parseInt(id, 10) % AVATAR_COLORS.length
  return AVATAR_COLORS[index] ?? AVATAR_COLORS[0]
}

function getStatusConfig(status: FunilStatus | undefined | null) {
  switch (status) {
    case 'lead':
      return { label: 'Lead', classes: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' }
    case 'qualificado':
      return { label: 'Qualificado', classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' }
    case 'proposta':
      return { label: 'Proposta', classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' }
    case 'cliente':
      return { label: 'Cliente', classes: 'bg-accent/10 text-accent border border-accent/20' }
    case 'inativo':
      return { label: 'Inativo', classes: 'bg-red-500/10 text-red-400 border border-red-500/20' }
    default:
      return { label: 'Lead', classes: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' }
  }
}

function getCanalIcon(canal: Canal | undefined | null) {
  switch (canal) {
    case 'Instagram': return <Instagram className="w-3 h-3" />
    case 'LinkedIn': return <Linkedin className="w-3 h-3" />
    case 'Site': return <Globe className="w-3 h-3" />
    case 'WhatsApp': return <MessageSquare className="w-3 h-3" />
    case 'Indicação': return <UserCheck className="w-3 h-3" />
    default: return <Globe className="w-3 h-3" />
  }
}

function getActivityIcon(type: ActivityType | undefined | null) {
  switch (type) {
    case 'phone': return <Phone className="w-4 h-4" />
    case 'email': return <Mail className="w-4 h-4" />
    case 'message': return <MessageSquare className="w-4 h-4" />
    case 'meeting': return <Calendar className="w-4 h-4" />
    case 'note': return <FileText className="w-4 h-4" />
    default: return <MessageSquare className="w-4 h-4" />
  }
}

function getActivityColor(type: ActivityType | undefined | null) {
  switch (type) {
    case 'phone': return 'bg-accent/10 text-accent border-accent/20'
    case 'email': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'message': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'meeting': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'note': return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
}

const FUNIL_STAGES: { key: FunilStatus; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'qualificado', label: 'Qualificado' },
  { key: 'proposta', label: 'Proposta' },
  { key: 'cliente', label: 'Cliente' },
]

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const addContactSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  empresa: z.string().min(2, 'Empresa deve ter pelo menos 2 caracteres'),
  cargo: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
  canal: z.enum(['Instagram', 'Site', 'Indicação', 'LinkedIn', 'WhatsApp']),
  tags: z.string().optional(),
  notas: z.string().optional(),
})

type AddContactFormData = z.infer<typeof addContactSchema>

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  label: string
  value: string | number
  sub?: string
  delay?: number
}) {
  return (
    <div
      className="card card-hover group border-dark-border bg-dark-card p-8 rounded-[32px] relative overflow-hidden shadow-light-card"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform shadow-lg', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-black text-main leading-none mb-2">{value}</p>
        {sub && <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">{sub}</p>}
      </div>
    </div>
  )
}

function ContactAvatar({ contact, size = 'md' }: { contact: Contact; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }
  return (
    <div className={cn('rounded-full flex items-center justify-center font-black shrink-0', sizeClasses[size], getAvatarColor(contact.id))}>
      {getInitials(contact.nome)}
    </div>
  )
}

// ─── Add Contact Modal ────────────────────────────────────────────────────────

function AddContactModal({ onClose, onAdd }: { onClose: () => void; onAdd: (contact: Contact) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddContactFormData>({ resolver: zodResolver(addContactSchema) })

  function onSubmit(data: AddContactFormData) {
    const newContact: Contact = {
      id: String(Date.now()),
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      empresa: data.empresa,
      cargo: data.cargo,
      canal: data.canal,
      status: 'lead',
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      notas: data.notas ?? '',
      createdAt: new Date(),
      lastActivity: new Date(),
      activities: [],
    }
    onAdd(newContact)
    onClose()
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-accent" />
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Novo Contato</h2>
            </div>
            <p className="text-xs text-gray-500">Preencha os dados para adicionar ao CRM</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome *</label>
              <input {...register('nome')} className="input-field" placeholder="João Silva" />
              {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="label">Empresa *</label>
              <input {...register('empresa')} className="input-field" placeholder="Empresa LTDA" />
              {errors.empresa && <p className="text-red-400 text-xs mt-1">{errors.empresa.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input {...register('email')} type="email" className="input-field" placeholder="joao@empresa.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Telefone *</label>
              <input {...register('telefone')} className="input-field" placeholder="(11) 99999-9999" />
              {errors.telefone && <p className="text-red-400 text-xs mt-1">{errors.telefone.message}</p>}
            </div>
            <div>
              <label className="label">Cargo *</label>
              <input {...register('cargo')} className="input-field" placeholder="CEO, CFO, Diretor..." />
              {errors.cargo && <p className="text-red-400 text-xs mt-1">{errors.cargo.message}</p>}
            </div>
            <div>
              <label className="label">Canal de Origem *</label>
              <select {...register('canal')} className="input-field bg-dark-muted">
                <option value="">Selecione...</option>
                <option value="Instagram">Instagram</option>
                <option value="Site">Site</option>
                <option value="Indicação">Indicação</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
              {errors.canal && <p className="text-red-400 text-xs mt-1">{errors.canal.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Tags</label>
            <input {...register('tags')} className="input-field" placeholder="VIP, Fundos, Alto Valor (separadas por vírgula)" />
          </div>

          <div>
            <label className="label">Notas</label>
            <textarea
              {...register('notas')}
              className="input-field resize-none"
              rows={3}
              placeholder="Informações adicionais sobre o contato..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Contato
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Scrape Leads Modal (N8N Google Maps) ───────────────────────────────────

function ScrapeLeadsModal({ onClose }: { onClose: () => void }) {
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [nicho, setNicho] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!estado || !cidade || !nicho) {
       toast.error('Preencha os três campos (Nicho, Cidade e Estado)')
       return
    }
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/creator/crm/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, cidade, nicho })
      })
      if (res.ok) {
        toast.success('Busca N8N iniciada! Seus novos leads vão começar a cair aqui na tabela em instantes.')
        onClose()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Erro ao comunicar com nossa automação.')
      }
    } catch (err) {
       toast.error('Erro de conexão ao iniciar raspe local.')
       console.error('Scraping submission error:', err)
    } finally {
       setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.1)]"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-accent" />
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Prospectar no Google Maps</h2>
            </div>
            <p className="text-xs text-gray-500">A nossa automação N8N irá extrair leads de empresas para você</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-all text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
              <label className="label">Nicho/Segmento de Empresa *</label>
              <input value={nicho} onChange={e => setNicho(e.target.value)} className="input-field bg-[#161B22]" placeholder="Ex: Clínica de Estética, Dentista, Advogado..." />
           </div>
           <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="label">Cidade *</label>
                 <input value={cidade} onChange={e => setCidade(e.target.value)} className="input-field bg-[var(--bg-primary)]" placeholder="Ex: São Paulo" />
               </div>
               <div>
                  <label className="label">Estado (Sigla) *</label>
                  <input value={estado} onChange={e => setEstado(e.target.value.toUpperCase())} maxLength={2} className="input-field" placeholder="Ex: SP" />
               </div>
           </div>

           <div className="flex gap-3 pt-4">
             <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">Cancelar</button>
             <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3 text-sm font-black flex items-center justify-center gap-2">
                 {isSubmitting ? 'Iniciando Rastreio...' : <><Search className="w-4 h-4"/> Iniciar Extração</>}
             </button>
           </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Contact Detail Modal ─────────────────────────────────────────────────────

function ContactDetailModal({
  contact,
  onClose,
  onUpdate,
  onDelete,
}: {
  contact: Contact
  onClose: () => void
  onUpdate: (updated: Contact) => void
  onDelete: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>('visao-geral')
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [activityDesc, setActivityDesc] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('note')

  const statusConfig = getStatusConfig(contact.status)
  const stageIndex = FUNIL_STAGES.findIndex((s) => s.key === contact.status)
  const isInFunil = stageIndex !== -1

  function updateStatus(newStatus: FunilStatus) {
    onUpdate({ ...contact, status: newStatus, lastActivity: new Date() })
  }

  function addActivity() {
    if (!activityDesc.trim()) return
    const newActivity: ContactActivity = {
      id: 'new-' + Date.now(), // Temporary ID until saved
      type: activityType,
      description: activityDesc,
      date: new Date(),
    }
    const updated: Contact = {
      ...contact,
      activities: [newActivity, ...contact.activities],
      lastActivity: new Date(),
    }
    onUpdate(updated)
    setActivityDesc('')
    setIsAddingActivity(false)
  }

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'visao-geral', label: 'Visão Geral' },
    { key: 'atividades', label: 'Atividades' },
    { key: 'cnpj', label: 'CNPJ Vinculado' },
  ]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative w-full sm:max-w-3xl bg-[var(--bg-card)] border border-[var(--border-main)] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--border-main)] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <ContactAvatar contact={contact} size="lg" />
              <div>
                <h2 className="text-xl font-black text-[var(--text-main)]">{contact.nome}</h2>
                <p className="text-sm text-[var(--text-muted)]">{contact.cargo} · {contact.empresa}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={cn('badge', statusConfig.classes)}>{statusConfig.label}</span>
                  {contact.tags.map((tag) => (
                    <span key={tag} className="badge badge-accent text-[10px]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { onDelete(contact.id); onClose() }}
                className="btn-danger p-2"
                title="Excluir contato"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-[var(--bg-primary)] rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                  activeTab === tab.key
                    ? 'bg-[var(--bg-card)] text-accent border border-[var(--border-main)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'visao-geral' && (
              <motion.div
                key="visao"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* Funil Progress */}
                <div className="bg-[var(--bg-primary)] rounded-2xl p-5 border border-[var(--border-main)]">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Estágio no Funil</p>
                  {contact.status === 'inativo' ? (
                    <div className="flex items-center gap-2">
                      <span className="badge bg-red-500/10 text-red-400 border border-red-500/20">Inativo</span>
                      <button
                        onClick={() => updateStatus('lead')}
                        className="text-xs text-accent underline underline-offset-2"
                      >
                        Reativar como Lead
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {FUNIL_STAGES.map((stage, idx) => {
                        const current = FUNIL_STAGES.findIndex((s) => s.key === contact.status)
                        const isPast = idx < current
                        const isActive = idx === current
                        return (
                          <div key={stage.key} className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => updateStatus(stage.key)}
                              className={cn(
                                'flex-1 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all border',
                                isActive && 'bg-accent/10 text-accent border-accent/30 shadow-accent/10 shadow-md',
                                isPast && 'bg-accent/5 text-accent/50 border-accent/10',
                                !isActive && !isPast && 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-white/10 hover:text-[var(--text-main)]'
                              )}
                            >
                              {isPast && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                              {isActive && <Circle className="w-3 h-3 inline mr-1 fill-accent text-accent" />}
                              {stage.label}
                            </button>
                            {idx < FUNIL_STAGES.length - 1 && (
                              <ArrowRight className={cn('w-3 h-3 shrink-0', isActive || isPast ? 'text-accent/40' : 'text-[var(--text-muted)]')} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Two columns data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Dados Pessoais</p>
                    <DataRow icon={<Mail className="w-4 h-4" />} label="Email" value={contact.email} />
                    <DataRow icon={<Phone className="w-4 h-4" />} label="Telefone" value={contact.telefone} />
                    <DataRow icon={<Briefcase className="w-4 h-4" />} label="Cargo" value={contact.cargo} />
                    <DataRow
                      icon={getCanalIcon(contact.canal)}
                      label="Canal Origem"
                      value={contact.canal}
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Dados da Empresa</p>
                    <DataRow icon={<Building2 className="w-4 h-4" />} label="Empresa" value={contact.empresa} />
                    {contact.cnpj && (
                      <DataRow icon={<FileText className="w-4 h-4" />} label="CNPJ" value={contact.cnpj} />
                    )}
                    <div>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Tags
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.length > 0 ? contact.tags.map((tag) => (
                          <span key={tag} className="badge badge-accent text-[10px]">{tag}</span>
                        )) : <span className="text-[var(--text-muted)] text-xs">—</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {contact.notas && (
                  <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border-main)]">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Notas</p>
                    <p className="text-sm text-[var(--text-main)] leading-relaxed">{contact.notas}</p>
                  </div>
                )}

                {/* Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border-main)] text-center">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Criado em</p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{safeFormat(contact.createdAt, 'dd/MM/yyyy')}</p>
                  </div>
                  <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border-main)] text-center">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Última Atividade</p>
                    <p className="text-sm font-bold text-[var(--text-main)]">
                      {safeDistance(contact.lastActivity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'atividades' && (
              <motion.div
                key="atividades"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <button
                  onClick={() => setIsAddingActivity(!isAddingActivity)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Registrar Atividade
                </button>

                <AnimatePresence>
                  {isAddingActivity && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[var(--bg-primary)] rounded-2xl p-5 border border-accent/10 space-y-4">
                        <p className="text-xs font-black text-accent uppercase tracking-widest">Nova Atividade</p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {(['phone', 'email', 'message', 'meeting', 'note'] as ActivityType[]).map((t) => (
                            <button
                              key={t}
                              onClick={() => setActivityType(t)}
                              className={cn(
                                'py-2 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-1 border transition-all',
                                activityType === t ? getActivityColor(t) + ' border-opacity-100' : 'border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                              )}
                            >
                              {getActivityIcon(t)}
                              <span className="hidden sm:block">{t}</span>
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="input-field resize-none"
                          rows={3}
                          placeholder="Descreva a atividade..."
                          value={activityDesc}
                          onChange={(e) => setActivityDesc(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <button onClick={() => setIsAddingActivity(false)} className="btn-secondary flex-1 text-sm py-2">
                            Cancelar
                          </button>
                          <button onClick={addActivity} className="btn-primary flex-1 text-sm py-2">
                            Salvar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--border-main)]" />
                  <div className="space-y-4">
                    {contact.activities.length === 0 && (
                      <p className="text-[var(--text-muted)] text-sm text-center py-8">Nenhuma atividade registrada ainda.</p>
                    )}
                    {contact.activities.map((activity, idx) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-4 pl-2"
                      >
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center border shrink-0 z-10', getActivityColor(activity.type))}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border-main)]">
                          <p className="text-sm text-[var(--text-main)]">{activity.description}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold uppercase tracking-wider">
                            {safeFormat(activity.date, "dd 'de' MMMM 'de' yyyy")}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'cnpj' && (
              <motion.div
                key="cnpj"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                {contact.cnpj ? (
                  <div className="space-y-4">
                    <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-main)]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider">{contact.empresa}</p>
                          <p className="text-xs text-[var(--text-muted)]">{contact.cnpj}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <DataRow icon={<FileText className="w-4 h-4" />} label="CNPJ" value={contact.cnpj} />
                        <DataRow icon={<Building2 className="w-4 h-4" />} label="Razão Social" value={contact.empresa} />
                        <DataRow icon={<Briefcase className="w-4 h-4" />} label="Responsável" value={contact.nome} />
                        <DataRow icon={<Tag className="w-4 h-4" />} label="Segmento" value={contact.tags[0] ?? '—'} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-accent/5 border border-accent/10">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      <p className="text-xs text-[var(--text-muted)]">CNPJ vinculado e validado no cadastro do contato.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-main)] flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <p className="text-[var(--text-muted)] text-sm font-medium">Nenhum CNPJ vinculado</p>
                    <p className="text-[var(--text-support)] text-xs mt-1">Este contato não possui CNPJ cadastrado.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DataRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5 flex items-center gap-1">
        <span className="text-[var(--text-muted)]">{icon}</span> {label}
      </p>
      <p className="text-sm text-[var(--text-main)] font-medium">{value}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isScrapeOpen, setIsScrapeOpen] = useState(false)
  const [isCsvOpen, setIsCsvOpen] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [csvError, setCsvError] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('todos')
  const [search, setSearch] = useState('')

  // Derived metrics
  const totalContacts = contacts.length
  const newThisMonth = contacts.filter((c) => {
    const now = new Date()
    return c.createdAt.getMonth() === now.getMonth() && c.createdAt.getFullYear() === now.getFullYear()
  }).length
  const clients = contacts.filter((c) => c.status === 'cliente').length
  const conversionRate = totalContacts > 0 ? Math.round((clients / totalContacts) * 100) : 0
  const upcomingActivities = contacts.filter((c) => {
    const diff = (new Date().getTime() - c.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    return diff > 7 && c.status !== 'inativo'
  }).length

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    const matchFilter =
      activeFilter === 'todos' ? true :
      activeFilter === 'leads' ? (c.status === 'lead' || c.status === 'qualificado' || c.status === 'proposta') :
      activeFilter === 'clientes' ? c.status === 'cliente' :
      activeFilter === 'inativos' ? c.status === 'inativo' : true

    const q = search.toLowerCase()
    const matchSearch = !q || [c.nome, c.empresa, c.email, c.telefone, c.canal].some((v) => (v || '').toLowerCase().includes(q))

    return matchFilter && matchSearch
  })

  // Fetch contacts on mount
  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/creator/crm')
        if (res.ok) {
          const data = await res.json()
          // Ensure dates are actual Date objects
          const formatted = data.map((c: any) => ({
            ...c,
            status: (c.status_funil || 'lead') as FunilStatus,
            canal: (c.canal_origem || 'Site') as Canal,
            tags: c.tags || [],
            notas: c.notas || '',
            empresa: c.empresa || '',
            email: c.email || '',
            telefone: c.telefone || '',
            cargo: c.cargo || '',
            createdAt: new Date(c.created_at),
            lastActivity: new Date(c.updated_at || c.created_at),
            activities: (c.atividades || []).map((a: any) => ({
              id: a.id,
              type: (a.tipo || 'note') as ActivityType,
              description: a.descricao || '',
              date: new Date(a.data || Date.now()),
            }))
          }))
          setContacts(formatted)
        }
      } catch (err) {
        console.error('Failed to fetch contacts:', err)
      }
    }
    fetchContacts()
  }, [])

  function openDetail(contact: Contact) {
    setSelectedContact(contact)
    setIsDetailOpen(true)
  }

  async function handleUpdate(updated: Contact) {
    try {
      // If we are updating just the status or notes, etc.
      // We also look if a new activity was added in the modal's internal state
      const res = await fetch(`/api/creator/crm/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_funil: updated.status,
          notas: updated.notas,
          tags: updated.tags,
          // Check if there's a new activity in the last item (just a heuristic for this mock-to-real transition)
          activity: updated.activities[0]?.id.startsWith('new-') ? {
              type: updated.activities[0].type,
              description: updated.activities[0].description,
              date: updated.activities[0].date
          } : null
        })
      })

      if (res.ok) {
        const data = await res.json()
        const formatted = {
          ...data,
          status: (data.status_funil || 'lead') as FunilStatus,
          canal: (data.canal_origem || 'Site') as Canal,
          tags: data.tags || [],
          notas: data.notas || '',
          empresa: data.empresa || '',
          email: data.email || '',
          telefone: data.telefone || '',
          cargo: data.cargo || '',
          createdAt: new Date(data.created_at),
          lastActivity: new Date(data.updated_at || data.created_at),
          activities: (data.atividades || []).map((a: any) => ({
            id: a.id,
            type: (a.tipo || 'note') as ActivityType,
            description: a.descricao || '',
            date: new Date(a.data || Date.now()),
          }))
        }
        setContacts((prev) => prev.map((c) => (c.id === formatted.id ? formatted : c)))
        setSelectedContact(formatted)
      }
    } catch (err) {
      console.error('Failed to update contact:', err)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/creator/crm/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id))
        setIsDetailOpen(false)
        setSelectedContact(null)
        toast.success('Contato excluído')
      } else {
        toast.error('Erro ao excluir contato')
      }
    } catch (err) {
      console.error('Failed to delete contact:', err)
      toast.error('Erro de conexão ao excluir contato')
    }
  }

  async function handleAdd(contactData: any) {
    try {
      const res = await fetch('/api/creator/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: contactData.nome,
            email: contactData.email,
            telefone: contactData.telefone,
            empresa: contactData.empresa,
            cargo: contactData.cargo,
            canal_origem: contactData.canal,
            tags: contactData.tags,
            notas: contactData.notas
        })
      })

      if (res.ok) {
        const data = await res.json()
        const formatted = {
          ...data,
          status: (data.status_funil || 'lead') as FunilStatus,
          canal: (data.canal_origem || 'Site') as Canal,
          tags: data.tags || [],
          notas: data.notas || '',
          empresa: data.empresa || '',
          email: data.email || '',
          telefone: data.telefone || '',
          cargo: data.cargo || '',
          createdAt: new Date(data.created_at),
          lastActivity: new Date(data.created_at),
          activities: []
        }
        setContacts((prev) => [formatted, ...prev])
        toast.success('Contato adicionado!')
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Erro ao salvar contato')
      }
    } catch (err) {
      console.error('Failed to add contact:', err)
      toast.error('Erro de conexão ao salvar contato')
    }
  }

  function handleImportCSV() {
    setCsvError('')
    const lines = csvText.trim().split('\n').filter(Boolean)
    if (lines.length < 2) { setCsvError('Cole o CSV com cabeçalho e ao menos 1 linha.'); return }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const nomeIdx = headers.findIndex(h => h.includes('nome'))
    const emailIdx = headers.findIndex(h => h.includes('email'))
    if (nomeIdx === -1) { setCsvError('Coluna "nome" não encontrada.'); return }
    const imported: Contact[] = lines.slice(1).map((line, i) => {
      const cols = line.split(',').map(c => c.trim().replace(/"/g, ''))
      return {
        id: `csv-${Date.now()}-${i}`,
        nome: cols[nomeIdx] || 'Sem nome',
        email: emailIdx !== -1 ? cols[emailIdx] : '',
        telefone: '',
        empresa: '',
        cargo: '',
        canal: 'Site' as Canal,
        status: 'lead' as FunilStatus,
        tags: [],
        notas: '',
        createdAt: new Date(),
        lastActivity: new Date(),
        activities: [],
      }
    })
    setContacts(prev => [...imported, ...prev])
    setIsCsvOpen(false)
    setCsvText('')
    import('react-hot-toast').then(({ default: toast }) => toast.success(`${imported.length} contato(s) importado(s)!`))
  }

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: contacts.length },
    { key: 'leads', label: 'Leads', count: contacts.filter((c) => ['lead', 'qualificado', 'proposta'].includes(c.status)).length },
    { key: 'clientes', label: 'Clientes', count: contacts.filter((c) => c.status === 'cliente').length },
    { key: 'inativos', label: 'Inativos', count: contacts.filter((c) => c.status === 'inativo').length },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8 md:space-y-12 max-w-7xl mx-auto animate-fade-in pb-20">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[var(--border-main)]">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <Users className="w-4 h-4 text-accent" />
            </div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">CRM de Contatos</h1>
          </div>
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Gerencie seus relacionamentos e pipeline de vendas</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setIsScrapeOpen(true)} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest py-2.5 px-5 rounded-xl border border-accent text-accent hover:bg-accent/10 transition-colors">
            <Globe className="w-4 h-4" />
            Prospectar Leads
          </button>
          <button onClick={() => setIsCsvOpen(true)} className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-5">
            <Upload className="w-4 h-4" />
            Importar CSV
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5"
          >
            <Plus className="w-4 h-4" />
            Novo Contato
          </button>
        </div>
      {/* Search + Filters + View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Buscar por nome, empresa, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-1 shadow-sm">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5',
                  activeFilter === tab.key ? 'bg-accent text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                )}
              >
                {tab.label}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-1 ml-auto">
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-accent/10 text-accent' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]')}
              title="Visualização em lista"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-accent/10 text-accent' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]')}
              title="Visualização em grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          iconColor="text-accent"
          iconBg="bg-accent/10 border-accent/20"
          label="Total de Contatos"
          value={totalContacts}
          sub={`${clients} clientes ativos`}
          delay={0}
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10 border-blue-500/20"
          label="Novos este Mês"
          value={newThisMonth}
          sub="Contatos adicionados"
          delay={0.05}
        />
        <MetricCard
          icon={<UserCheck className="w-6 h-6" />}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/20"
          label="Taxa de Conversão"
          value={`${conversionRate}%`}
          sub="Lead → Cliente"
          delay={0.1}
        />
        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          label="Próximas Atividades"
          value={upcomingActivities}
          sub="Follow-ups pendentes"
          delay={0.15}
        />
      </div>

      {/* ── Contact List / Grid ── */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[var(--text-support)]" />
          </div>
          <p className="text-[var(--text-muted)] font-semibold">Nenhum contato encontrado</p>
          <p className="text-[var(--text-support)] text-sm mt-1">Tente ajustar os filtros ou a busca</p>
        </div>
      ) : viewMode === 'list' ? (
        /* ── List View ── */
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2.5fr_2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--border-main)] bg-[var(--bg-primary)]">
            <span className="table-header">Contato</span>
            <span className="table-header">Email / Telefone</span>
            <span className="table-header">Status</span>
            <span className="table-header">Canal</span>
            <span className="table-header">Última Atividade</span>
            <span className="table-header">Ações</span>
          </div>

          <div className="divide-y divide-[var(--border-main)]">
            {filteredContacts.map((contact, idx) => {
              const statusConfig = getStatusConfig(contact.status)
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="table-row grid grid-cols-1 md:grid-cols-[2.5fr_2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center cursor-pointer"
                  onClick={() => openDetail(contact)}
                >
                  {/* Name + company */}
                  <div className="flex items-center gap-3">
                    <ContactAvatar contact={contact} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-main)] truncate">{contact.nome}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{contact.empresa}</p>
                    </div>
                  </div>

                  {/* Email / phone */}
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-main)] truncate">{contact.email}</p>
                    <p className="text-xs text-[var(--text-muted)]">{contact.telefone}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={cn('badge text-[10px]', statusConfig.classes)}>{statusConfig.label}</span>
                  </div>

                  {/* Canal */}
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
                    {getCanalIcon(contact.canal)}
                    <span>{contact.canal}</span>
                  </div>

                  {/* Last activity */}
                  <div className="text-xs text-[var(--text-muted)]">
                    {safeDistance(contact.lastActivity)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openDetail(contact)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-accent hover:bg-accent/10 transition-all"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDetail(contact)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredContacts.map((contact, idx) => {
            const statusConfig = getStatusConfig(contact.status)
            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="card card-hover group p-5 rounded-2xl cursor-pointer flex flex-col gap-4"
                onClick={() => openDetail(contact)}
              >
                <div className="flex items-start justify-between">
                  <ContactAvatar contact={contact} size="md" />
                  <span className={cn('badge text-[10px]', statusConfig.classes)}>{statusConfig.label}</span>
                </div>

                <div>
                  <p className="font-bold text-[var(--text-main)] text-sm">{contact.nome}</p>
                  <p className="text-xs text-[var(--text-muted)]">{contact.cargo}</p>
                  <p className="text-xs text-[var(--text-support)] mt-0.5 font-medium">{contact.empresa}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Phone className="w-3 h-3 shrink-0" />
                    <span>{contact.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    {getCanalIcon(contact.canal)}
                    <span>{contact.canal}</span>
                  </div>
                </div>

                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge badge-accent text-[9px]">{tag}</span>
                    ))}
                    {contact.tags.length > 3 && (
                      <span className="badge bg-white/5 text-gray-500 border border-white/5 text-[9px]">+{contact.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {safeDistance(contact.lastActivity)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openDetail(contact)}
                      className="p-1 rounded-lg text-gray-500 hover:text-accent hover:bg-accent/10 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Footer info ── */}
      <div className="flex items-center justify-between px-1 text-[11px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] border-t border-[var(--border-main)] pt-6">
        <span>Mostrando {filteredContacts.length} de {contacts.length} contatos</span>
        <span className="text-accent italic">CRM · Investmais</span>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {isScrapeOpen && <ScrapeLeadsModal onClose={() => setIsScrapeOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isDetailOpen && selectedContact && (
          <ContactDetailModal
            contact={selectedContact}
            onClose={() => { setIsDetailOpen(false); setSelectedContact(null) }}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddOpen && (
          <AddContactModal
            onClose={() => setIsAddOpen(false)}
            onAdd={handleAdd}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCsvOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCsvOpen(false)} />
            <motion.div className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl shadow-card-hover" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="p-5 border-b border-dark-border flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-wider">Importar CSV</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Cole o conteúdo do CSV ou o texto com colunas separadas por vírgula</p>
                </div>
                <button onClick={() => setIsCsvOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs text-accent font-medium">
                  Formato esperado: <code className="font-mono">nome,email,telefone,empresa</code> (cabeçalho na 1ª linha)
                </div>
                <textarea
                  className="input-field resize-none font-mono text-xs"
                  rows={8}
                  placeholder={'nome,email,telefone,empresa\nJoão Silva,joao@email.com,(11) 99999-9999,Acme Corp\nMaria Souza,maria@email.com,,Empresa XYZ'}
                  value={csvText}
                  onChange={e => { setCsvText(e.target.value); setCsvError('') }}
                />
                {csvError && <p className="text-red-400 text-xs">{csvError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setIsCsvOpen(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button onClick={handleImportCSV} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Importar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
