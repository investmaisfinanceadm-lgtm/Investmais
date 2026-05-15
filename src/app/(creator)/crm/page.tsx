'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
  ArrowUpRight,
  Copy,
  ExternalLink,
  MapPin,
  MessageCircle,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Download,
  Shield,
  Target,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  Radio,
  FileUp,
  Filter,
  BarChart3,
  Smartphone,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

import { 
  LeadDetailModal, 
  Contact, 
  FunilStatus, 
  Canal, 
  ActivityType, 
  ContactActivity,
  ContactAvatar,
  getStatusConfig,
  getCanalIcon,
  safeDistance
} from '@/components/crm/LeadDetailModal'

type ViewMode = 'list' | 'grid'
type FilterTab = 'todos' | 'leads' | 'clientes' | 'inativos'

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const addContactSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail institucional inválido'),
  telefone: z.string().min(10, 'Número de terminal inválido'),
  empresa: z.string().min(2, 'A organização deve ter pelo menos 2 caracteres'),
  cargo: z.string().min(2, 'O cargo operacional deve ter pelo menos 2 caracteres'),
  canal: z.enum(['Instagram', 'Site', 'Indicação', 'LinkedIn', 'WhatsApp']),
  tags: z.string().optional(),
  notas: z.string().optional(),
})

type AddContactFormData = z.infer<typeof addContactSchema>

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  iconColor,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: any
  iconColor: string
  label: string
  value: string | number
  sub?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="nl-glass p-6 rounded-[32px] group relative overflow-hidden border-white/5 hover:border-sidebar-primary/20 transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 bg-black group-hover:scale-110 transition-all duration-700 shadow-2xl', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        {sub && (
          <div className="px-4 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">
             {sub}
          </div>
        )}
      </div>
      
      <div className="relative z-10 space-y-0.5">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider ml-1">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </motion.div>
  )
}

// ─── Add Contact Modal ────────────────────────────────────────────────────────

function AddContactModal({ onClose, onAdd }: { onClose: () => void; onAdd: (contact: Contact) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddContactFormData>({ resolver: zodResolver(addContactSchema) })

  async function onSubmit(data: AddContactFormData) {
    try {
      const res = await fetch('/api/creator/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          empresa: data.empresa,
          cargo: data.cargo,
          canal_origem: data.canal,
          status_funil: 'lead',
          tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          notas: data.notas ?? '',
        }),
      })
      if (res.ok) {
        const saved = await res.json()
        const newContact: Contact = {
          id: saved.id,
          nome: saved.nome,
          email: saved.email || '',
          telefone: saved.telefone || '',
          empresa: saved.empresa || '',
          cargo: saved.cargo || '',
          canal: (saved.canal_origem || 'Site') as Canal,
          status: (saved.status_funil || 'lead') as FunilStatus,
          tags: saved.tags || [],
          notas: saved.notas || '',
          cidade: saved.cidade || '',
          estado: saved.estado || '',
          endereco: saved.endereco || '',
          site: saved.site || '',
          nicho: saved.nicho || '',
          createdAt: new Date(saved.created_at),
          lastActivity: new Date(saved.updated_at || saved.created_at),
          activities: [],
        }
        onAdd(newContact)
        toast.success('Contato adicionado!')
        onClose()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erro ao salvar contato')
      }
    } catch {
      toast.error('Erro de conexão')
    }
  }

  const inputCls = "w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all"
  const labelCls = "block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2"

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-[#0A0A0B] border border-white/[0.06] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-thin"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Novo Contato</h2>
              <p className="text-[11px] text-white/30">Preencha os dados do lead</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/5 text-white/40 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nome *</label>
              <input {...register('nome')} className={inputCls} placeholder="Nome completo" />
              {errors.nome && <p className="text-red-400 text-[10px] mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Empresa *</label>
              <input {...register('empresa')} className={inputCls} placeholder="Nome da empresa" />
              {errors.empresa && <p className="text-red-400 text-[10px] mt-1">{errors.empresa.message}</p>}
            </div>
            <div>
              <label className={labelCls}>E-mail *</label>
              <input {...register('email')} type="email" className={inputCls} placeholder="email@empresa.com" />
              {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Telefone *</label>
              <input {...register('telefone')} className={inputCls} placeholder="(11) 99999-9999" />
              {errors.telefone && <p className="text-red-400 text-[10px] mt-1">{errors.telefone.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Cargo *</label>
              <input {...register('cargo')} className={inputCls} placeholder="Ex: Diretor, CEO" />
              {errors.cargo && <p className="text-red-400 text-[10px] mt-1">{errors.cargo.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Canal de origem *</label>
              <select {...register('canal')} className={inputCls + ' cursor-pointer'}>
                <option value="" className="bg-[#0a0a0b]">Selecione</option>
                <option value="Instagram" className="bg-[#0a0a0b]">Instagram</option>
                <option value="Site" className="bg-[#0a0a0b]">Site</option>
                <option value="Indicação" className="bg-[#0a0a0b]">Indicação</option>
                <option value="LinkedIn" className="bg-[#0a0a0b]">LinkedIn</option>
                <option value="WhatsApp" className="bg-[#0a0a0b]">WhatsApp</option>
              </select>
              {errors.canal && <p className="text-red-400 text-[10px] mt-1">{errors.canal.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Tags</label>
            <input {...register('tags')} className={inputCls} placeholder="Ex: vip, quente, indicação (separadas por vírgula)" />
          </div>

          <div>
            <label className={labelCls}>Anotações</label>
            <textarea {...register('notas')} className={inputCls + ' resize-none'} rows={3} placeholder="Observações, contexto, próximos passos..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/40 hover:text-white transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Salvar Contato
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const router = useRouter()
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('todos')
  const [isLoading, setIsLoading] = useState(true)

  const totalContacts = contacts.length
  const clients = contacts.filter((c) => c.status === 'cliente').length
  const conversionRate = totalContacts > 0 ? Math.round((clients / totalContacts) * 100) : 0
  const activeLeads = contacts.filter(c => c.status !== 'inativo').length

  const fetchContacts = useCallback(async (): Promise<number> => {
    try {
      const res = await fetch('/api/creator/crm')
      if (res.ok) {
        const data = await res.json()
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
          cidade: c.cidade || '',
          estado: c.estado || '',
          endereco: c.endereco || '',
          site: c.site || '',
          nicho: c.nicho || '',
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          lastActivity: (c.updated_at || c.created_at) ? new Date(c.updated_at || c.created_at) : new Date(),
          activities: (c.atividades || []).map((a: any) => ({
            id: a.id,
            type: (a.tipo || 'note') as ActivityType,
            description: a.descricao || '',
            date: new Date(a.data || Date.now()),
          }))
        }))
        setContacts(formatted)
        return formatted.length
      }
    } catch (err) {
      console.error('Fetch protocol failure:', err)
    } finally {
      setIsLoading(false)
    }
    return 0
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const filteredContacts = contacts.filter((c) => {
    const matchFilter =
      activeFilter === 'todos' ? true :
      activeFilter === 'leads' ? (c.status === 'lead' || c.status === 'qualificado' || c.status === 'proposta' || c.status === 'oportunidade') :
      activeFilter === 'clientes' ? c.status === 'cliente' :
      activeFilter === 'inativos' ? c.status === 'inativo' : true

    const q = search.toLowerCase()
    const matchSearch = !q || [c.nome, c.empresa, c.email, c.telefone, c.canal].some((v) => (v || '').toLowerCase().includes(q))

    return matchFilter && matchSearch
  })

  function openDetail(contact: Contact) {
    setSelectedContact(contact)
    setIsDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
      <div className="ambient-bg" />
      
      <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-16 pb-32">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border pb-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-sidebar-primary/5 border border-sidebar-primary/20 backdrop-blur-3xl">
                <div className="w-2 h-2 rounded-full bg-sidebar-primary netlife-glow shadow-none animate-pulse" />
                <span className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.5em] italic">Lead Intelligence Active</span>
            </div>
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Gestão de Contatos</h1>
                <p className="text-white/40 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" /> CRM Seguro e Sincronizado
                </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => router.push('/cnpj')} className="px-6 py-3 rounded-xl bg-card/40 border border-border text-muted-foreground hover:text-foreground transition-all font-bold text-xs flex items-center gap-3">
                <Globe className="w-4 h-4" /> Busca de Leads
            </button>
            <button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90 px-8 py-4 rounded-2xl text-white text-xs font-bold flex items-center gap-3 transition-all">
                <Plus className="w-4 h-4" />
                Novo Contato
            </button>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard icon={Users} iconColor="text-primary" label="Total de Contatos" value={totalContacts} sub="Nodes" delay={0} />
            <MetricCard icon={Target} iconColor="text-blue-400" label="Leads Ativos" value={activeLeads} sub="Sinais" delay={0.1} />
            <MetricCard icon={Zap} iconColor="text-emerald-400" label="Clientes" value={clients} sub="Ganhos" delay={0.2} />
            <MetricCard icon={Activity} iconColor="text-primary" label="Conversão" value={`${conversionRate}%`} sub="Performance" delay={0.3} />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 border-b border-white/5 pb-10">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-none w-full lg:w-auto">
                {(['todos', 'leads', 'clientes', 'inativos'] as FilterTab[]).map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveFilter(tab)}
                        className={cn(
                            "px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                            activeFilter === tab 
                                ? "bg-primary text-white border-primary" 
                                : "bg-white/[0.03] border-white/5 text-white/40 hover:text-white"
                        )}
                    >
                        {tab === 'todos' ? 'Todos' : tab === 'leads' ? 'Leads' : tab === 'clientes' ? 'Clientes' : 'Inativos'}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/10 group-focus-within:text-sidebar-primary transition-all duration-700" />
                    <input 
                        type="text" 
                        placeholder="BUSCAR NO BANCO..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-background/40 border border-border rounded-2xl py-3 pl-12 pr-6 text-[10px] font-black text-foreground uppercase tracking-widest placeholder-foreground/5 focus:border-sidebar-primary/40 focus:bg-background/60 transition-all outline-none italic duration-700"
                    />
                </div>
                <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-2xl p-1.5">
                    <button onClick={() => setViewMode('list')} className={cn("p-3 rounded-xl transition-all duration-700", viewMode === 'list' ? "bg-sidebar-primary text-black" : "text-white/20 hover:text-white")}>
                        <LayoutList className="w-5 h-5" />
                    </button>
                    <button onClick={() => setViewMode('grid')} className={cn("p-3 rounded-xl transition-all duration-700", viewMode === 'grid' ? "bg-sidebar-primary text-black" : "text-white/20 hover:text-white")}>
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => <div key={i} className="h-64 nl-glass border-white/5 rounded-[48px] animate-pulse" />)}
            </div>
        ) : filteredContacts.length === 0 ? (
            <div className="py-40 text-center space-y-10">
                <div className="w-24 h-24 rounded-[48px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto group hover:border-sidebar-primary/20 transition-all duration-700">
                    <Users className="w-10 h-10 text-white/5 group-hover:text-sidebar-primary group-hover:scale-110 transition-all duration-700" />
                </div>
                <div className="space-y-4">
                    <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em] italic leading-none">Matrix Depleted</p>
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] italic">No identities synchronized for this sector.</p>
                </div>
                <button onClick={() => setIsAddOpen(true)} className="btn-primary px-10 py-5 netlife-glow shadow-none text-[10px] font-black uppercase tracking-[0.3em] italic inline-flex items-center gap-4">
                    <Plus className="w-5 h-5" /> Initialize First Identity
                </button>
            </div>
        ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredContacts.map((contact, idx) => (
                    <motion.div 
                        key={contact.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => openDetail(contact)}
                        className="nl-glass p-10 rounded-[56px] border-white/5 group hover:border-sidebar-primary/20 transition-all duration-700 cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-10">
                            <ContactAvatar name={contact.nome} size="lg" />
                            <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest italic group-hover:text-sidebar-primary group-hover:border-sidebar-primary/20 transition-all duration-700">
                                {contact.status}
                            </div>
                        </div>
                        <div className="space-y-2 mb-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic group-hover:text-sidebar-primary transition-colors duration-700 truncate">{contact.nome}</h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] truncate">{contact.empresa || 'Pessoa Física'}</p>
                        </div>
                        <div className="flex flex-col gap-4 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <Smartphone className="w-4 h-4 text-white/10" />
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest truncate">{contact.telefone || 'Sem Telefone'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="w-4 h-4 text-white/10" />
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest truncate">{contact.email || 'Sem E-mail'}</span>
                            </div>
                        </div>
                        <div className="absolute bottom-10 right-10 w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10 group-hover:text-sidebar-primary group-hover:border-sidebar-primary/20 group-hover:scale-110 transition-all duration-700">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : (
            <div className="nl-glass rounded-[64px] border-white/5 overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.6)]">
                <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-card/10 border-b border-border">
                                <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Identidade do Lead</th>
                                <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Organização</th>
                                <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic text-center">Status</th>
                                <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Atividade</th>
                                <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredContacts.map((contact, idx) => (
                                <motion.tr 
                                    key={contact.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => openDetail(contact)}
                                    className="group hover:bg-white/[0.03] transition-all duration-700 cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <ContactAvatar name={contact.nome} size="sm" />
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black text-foreground uppercase tracking-tighter italic group-hover:text-sidebar-primary transition-colors duration-700">{contact.nome}</p>
                                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{contact.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest italic">{contact.empresa || 'Pessoa Física'}</p>
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{contact.cargo || 'Operacional'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/40 border border-border">
                                            <div className={cn("w-1 h-1 rounded-full shadow-none", contact.status === 'cliente' ? 'bg-emerald-500 netlife-glow' : 'bg-sidebar-primary netlife-glow')} />
                                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic">{contact.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">
                                        {!isNaN(contact.lastActivity.getTime()) ? contact.lastActivity.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="w-10 h-10 rounded-xl bg-background border border-border text-muted-foreground group-hover:text-sidebar-primary group-hover:border-sidebar-primary/40 group-hover:scale-110 transition-all duration-700 flex items-center justify-center mx-auto">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddOpen && <AddContactModal onClose={() => setIsAddOpen(false)} onAdd={(c) => { setContacts([c, ...contacts]); setIsAddOpen(false); toast.success('Contato sincronizado.'); }} />}
        {/* isScrapeOpen && <ScrapeLeadsModal onClose={() => setIsScrapeOpen(false)} onProspected={() => fetchContacts()} /> */}
        {isDetailOpen && selectedContact && (
          <LeadDetailModal
            contact={selectedContact}
            onClose={() => setIsDetailOpen(false)}
            onUpdate={(u) => { setContacts(prev => prev.map(c => c.id === u.id ? u : c)); setSelectedContact(u); }}
            onDelete={(id) => { setContacts(prev => prev.filter(c => c.id !== id)); setIsDetailOpen(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
