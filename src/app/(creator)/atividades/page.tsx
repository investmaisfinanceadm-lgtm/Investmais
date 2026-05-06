'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  List,
  LayoutGrid,
  Phone,
  Mail,
  MessageSquare,
  Users,
  FileText,
  CheckCircle2,
  X,
  Clock,
  Check,
  Trash2,
  ExternalLink,
  Search,
  ChevronDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Activity {
  id: string
  contato_id: string
  deal_id: string | null
  tipo: string
  titulo: string | null
  descricao: string
  status: string
  data: string
  contato: { id: string; nome: string; empresa: string | null }
  deal: { id: string; titulo: string; valor: number } | null
}

interface ContactOption {
  id: string
  nome: string
  empresa: string | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const TIPO_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: any }> = {
  phone:   { label: 'Ligação',  color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    Icon: Phone },
  email:   { label: 'Email',    color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     Icon: Mail },
  message: { label: 'WhatsApp', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: MessageSquare },
  meeting: { label: 'Reunião',  color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  Icon: Users },
  note:    { label: 'Nota',     color: 'text-white/50',    bg: 'bg-white/5',        border: 'border-white/10',       Icon: FileText },
  task:    { label: 'Tarefa',   color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   Icon: CheckCircle2 },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const m = month === 0 ? 11 : month - 1
    const y = month === 0 ? year - 1 : year
    days.push({ day: daysInPrevMonth - i, month: m, year: y, isCurrentMonth: false })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month, year, isCurrentMonth: true })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const m = month === 11 ? 0 : month + 1
    const y = month === 11 ? year + 1 : year
    days.push({ day: i, month: m, year: y, isCurrentMonth: false })
  }

  return days
}

function isToday(day: number, month: number, year: number) {
  const today = new Date()
  return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
}

function isSameDay(date: Date, day: number, month: number, year: number) {
  return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Activity Detail Drawer ───────────────────────────────────────────────────

function ActivityDetailDrawer({
  activity,
  onClose,
  onStatusChange,
  onDelete,
}: {
  activity: Activity
  onClose: () => void
  onStatusChange: (id: string, status: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const cfg = TIPO_CONFIG[activity.tipo] || TIPO_CONFIG.note
  const Icon = cfg.Icon
  const isConcluida = activity.status === 'concluida'

  const handleToggleStatus = () => {
    onStatusChange(activity.id, isConcluida ? 'pendente' : 'concluida')
  }

  const handleDelete = async () => {
    if (!confirm('Remover esta atividade?')) return
    await onDelete(activity.id)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-[#0A0A0B] border-l border-white/5 z-[70] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 pb-6 border-b border-white/[0.04]">
          <div className="flex items-start justify-between mb-6">
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center border', cfg.bg, cfg.border)}>
              <Icon className={cn('w-5 h-5', cfg.color)} />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={cn('px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border', cfg.bg, cfg.border, cfg.color)}>
                {cfg.label}
              </span>
              <span className={cn(
                'px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border',
                isConcluida
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              )}>
                {isConcluida ? 'Concluída' : 'Pendente'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {activity.titulo || activity.descricao}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
          {/* Date & time */}
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Clock className="w-4 h-4 text-white/20" />
            <span>{formatDate(activity.data)} às {formatTime(activity.data)}</span>
          </div>

          {/* Description */}
          {activity.titulo && activity.descricao && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Descrição</p>
              <p className="text-sm text-white/70 leading-relaxed">{activity.descricao}</p>
            </div>
          )}

          {/* Contact */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Contato</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{activity.contato.nome}</p>
                {activity.contato.empresa && (
                  <p className="text-xs text-white/40 mt-0.5">{activity.contato.empresa}</p>
                )}
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-bold text-primary/60 hover:text-primary transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Ver CRM
              </button>
            </div>
          </div>

          {/* Deal */}
          {activity.deal && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Deal Vinculado</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{activity.deal.titulo}</p>
                  <p className="text-xs text-primary mt-0.5">
                    {activity.deal.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-primary/60 hover:text-primary transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Pipeline
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/[0.04] flex items-center justify-between gap-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" /> Excluir
          </button>

          <button
            onClick={handleToggleStatus}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all border',
              isConcluida
                ? 'bg-white/[0.03] border-white/10 text-white/50 hover:border-white/20'
                : 'bg-emerald-500 border-emerald-500/0 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600'
            )}
          >
            <Check className="w-4 h-4" />
            {isConcluida ? 'Marcar pendente' : 'Marcar concluída'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ─── Nova Atividade Modal ─────────────────────────────────────────────────────

function NovaAtividadeModal({
  onClose,
  onSave,
  contacts,
  defaultContactId,
  defaultDealId,
}: {
  onClose: () => void
  onSave: (data: any) => Promise<void>
  contacts: ContactOption[]
  defaultContactId?: string
  defaultDealId?: string
}) {
  const [tipo, setTipo] = useState('phone')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(() => {
    const now = new Date()
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15)
    return now.toISOString().slice(0, 16)
  })
  const [contactSearch, setContactSearch] = useState('')
  const [selectedContactId, setSelectedContactId] = useState(defaultContactId || '')
  const [showContactDropdown, setShowContactDropdown] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const filteredContacts = contacts
    .filter(c => c.nome.toLowerCase().includes(contactSearch.toLowerCase()))
    .slice(0, 6)

  const selectedContact = contacts.find(c => c.id === selectedContactId)

  const handleSave = async () => {
    if (!selectedContactId) { toast.error('Selecione um contato'); return }
    if (!tipo) { toast.error('Selecione o tipo de atividade'); return }
    setIsSaving(true)
    try {
      await onSave({
        contato_id: selectedContactId,
        deal_id: defaultDealId || null,
        tipo,
        titulo: titulo || null,
        descricao,
        data,
        status: 'pendente',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const tipoOptions = [
    { key: 'phone', label: 'Ligação', Icon: Phone },
    { key: 'meeting', label: 'Reunião', Icon: Users },
    { key: 'message', label: 'WhatsApp', Icon: MessageSquare },
    { key: 'email', label: 'Email', Icon: Mail },
    { key: 'task', label: 'Tarefa', Icon: CheckCircle2 },
    { key: 'note', label: 'Nota', Icon: FileText },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.04]">
            <h2 className="text-base font-bold text-white">Nova Atividade</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {/* Tipo */}
            <div className="grid grid-cols-3 gap-2">
              {tipoOptions.map(({ key, label, Icon }) => {
                const cfg = TIPO_CONFIG[key]
                return (
                  <button
                    key={key}
                    onClick={() => setTipo(key)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border text-[11px] font-bold transition-all',
                      tipo === key
                        ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                        : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Título */}
            <input
              type="text"
              placeholder="Título da atividade (opcional)"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all"
            />

            {/* Contato */}
            <div className="relative">
              <div
                onClick={() => setShowContactDropdown(v => !v)}
                className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:border-white/10 transition-all"
              >
                <Search className="w-4 h-4 text-white/20 flex-shrink-0" />
                {selectedContact ? (
                  <span className="text-sm text-white font-medium flex-1">{selectedContact.nome}</span>
                ) : (
                  <input
                    type="text"
                    placeholder="Buscar contato..."
                    value={contactSearch}
                    onChange={e => { setContactSearch(e.target.value); setShowContactDropdown(true) }}
                    onClick={e => e.stopPropagation()}
                    className="bg-transparent text-sm text-white placeholder-white/20 outline-none flex-1"
                  />
                )}
                {selectedContact && (
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedContactId(''); setContactSearch('') }}
                    className="text-white/20 hover:text-white/60"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronDown className="w-4 h-4 text-white/20 flex-shrink-0" />
              </div>

              <AnimatePresence>
                {showContactDropdown && !selectedContact && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-[#111113] border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden"
                  >
                    {filteredContacts.length === 0 ? (
                      <div className="py-4 text-center text-xs text-white/20">Nenhum contato encontrado</div>
                    ) : (
                      filteredContacts.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedContactId(c.id); setShowContactDropdown(false); setContactSearch('') }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                            {c.nome.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{c.nome}</p>
                            {c.empresa && <p className="text-[10px] text-white/30">{c.empresa}</p>}
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Descrição */}
            <textarea
              placeholder="Descrição / notas sobre esta atividade..."
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all resize-none"
            />

            {/* Data */}
            <input
              type="datetime-local"
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/80 outline-none focus:border-primary/40 transition-all [color-scheme:dark]"
            />
          </div>

          <div className="px-8 pb-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {isSaving ? 'Salvando...' : 'Criar Atividade'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AtividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'Mês' | 'Semana'>('Mês')
  const [statusFilter, setStatusFilter] = useState('todas')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [contacts, setContacts] = useState<ContactOption[]>([])

  useEffect(() => {
    fetch('/api/creator/atividades')
      .then(r => r.json())
      .then(data => setActivities(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false))

    fetch('/api/creator/crm')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setContacts(data.map((c: any) => ({ id: c.id, nome: c.nome, empresa: c.empresa })))
        }
      })
      .catch(console.error)
  }, [])

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      if (statusFilter === 'pendentes') return a.status === 'pendente'
      if (statusFilter === 'concluidas') return a.status === 'concluida'
      return true
    })
  }, [activities, statusFilter])

  const stats = useMemo(() => {
    const today = new Date()
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const atrasadas = activities.filter(a => {
      const d = new Date(a.data)
      const dMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      return a.status === 'pendente' && dMidnight < todayMidnight
    }).length

    const paraHoje = activities.filter(a => {
      const d = new Date(a.data)
      return a.status === 'pendente' &&
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    }).length

    const pendentes = activities.filter(a => a.status === 'pendente').length

    return { atrasadas, paraHoje, pendentes }
  }, [activities])

  const calendarDays = buildCalendarDays(currentYear, currentMonth)

  const getActivitiesForDay = useCallback((day: number, month: number, year: number) => {
    return filteredActivities.filter(a => {
      const d = new Date(a.data)
      return isSameDay(d, day, month, year)
    })
  }, [filteredActivities])

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  const handleCreateActivity = async (data: any) => {
    const res = await fetch('/api/creator/atividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const newActivity = await res.json()
      setActivities(prev => [...prev, newActivity].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()))
      setShowNewActivity(false)
      toast.success('Atividade criada!')
    } else {
      toast.error('Erro ao criar atividade')
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/creator/atividades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setActivities(prev => prev.map(a => a.id === id ? updated : a))
      setSelectedActivity(updated)
      toast.success(status === 'concluida' ? 'Atividade concluída!' : 'Marcada como pendente')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/creator/atividades/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setActivities(prev => prev.filter(a => a.id !== id))
      setSelectedActivity(null)
      toast.success('Atividade removida')
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-6 w-48 bg-white/5 rounded-full animate-pulse" />
            ) : (
              <>
                {stats.atrasadas > 0 && (
                  <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {stats.atrasadas} atrasada{stats.atrasadas !== 1 ? 's' : ''}
                  </span>
                )}
                {stats.paraHoje > 0 && (
                  <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {stats.paraHoje} para hoje
                  </span>
                )}
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-wider">
                  {stats.pendentes} pendentes
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowNewActivity(true)}
          className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl text-white text-xs font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 self-start lg:self-auto"
        >
          <Plus className="w-4 h-4" /> Nova Atividade
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white/[0.02] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold text-white/60 appearance-none focus:border-primary/40 transition-all outline-none min-w-[140px]"
            >
              <option value="todas">Todas</option>
              <option value="pendentes">Pendentes</option>
              <option value="concluidas">Concluídas</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 rotate-90" />
          </div>
        </div>

        <div className="flex items-center bg-white/[0.02] border border-white/5 p-1 rounded-xl">
          {(['Mês', 'Semana'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                view === v ? 'bg-primary text-white' : 'text-white/40 hover:text-white'
              )}
            >
              {v}
            </button>
          ))}
          <div className="w-[1px] h-4 bg-white/5 mx-1" />
          <button className="p-2 text-white/40 hover:text-white transition-all"><List className="w-4 h-4" /></button>
          <button className="p-2 text-primary transition-all"><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        {/* Calendar Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h2 className="text-lg font-bold text-white capitalize">{MONTHS[currentMonth]} {currentYear}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-primary/40 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-6 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all"
            >
              Hoje
            </button>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-primary/40 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01]">
          {DAYS.map(day => (
            <div key={day} className="py-4 text-center">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{day}</span>
            </div>
          ))}
        </div>

        {/* Grid Body */}
        {isLoading ? (
          <div className="grid grid-cols-7">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="min-h-[120px] border-r border-b border-white/5 p-4 animate-pulse">
                <div className="w-7 h-7 rounded-full bg-white/5 mb-3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((date, idx) => {
              const dayActivities = getActivitiesForDay(date.day, date.month, date.year)
              const visibleActivities = dayActivities.slice(0, 3)
              const extraCount = dayActivities.length - 3
              const todayCell = isToday(date.day, date.month, date.year)

              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[140px] border-r border-b border-white/5 p-3 transition-all relative group',
                    !date.isCurrentMonth && 'opacity-20',
                    todayCell && 'bg-primary/5'
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn(
                      'text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center transition-all',
                      todayCell ? 'bg-primary text-white' : 'text-white/40 group-hover:text-white'
                    )}>
                      {date.day}
                    </span>
                    {date.isCurrentMonth && (
                      <button
                        onClick={() => setShowNewActivity(true)}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-primary transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 overflow-hidden">
                    {visibleActivities.map((activity) => {
                      const cfg = TIPO_CONFIG[activity.tipo] || TIPO_CONFIG.note
                      const Icon = cfg.Icon
                      return (
                        <motion.button
                          key={activity.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => setSelectedActivity(activity)}
                          className={cn(
                            'w-full text-left px-2 py-1.5 rounded-lg text-[9px] font-bold truncate border flex items-center gap-1.5 transition-all hover:opacity-80',
                            cfg.bg, cfg.border, cfg.color,
                            activity.status === 'concluida' && 'opacity-40'
                          )}
                        >
                          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className={cn('truncate', activity.status === 'concluida' && 'line-through')}>
                            {activity.titulo || activity.contato.nome}
                          </span>
                        </motion.button>
                      )
                    })}
                    {extraCount > 0 && (
                      <p className="text-[9px] font-bold text-white/20 text-center mt-1">
                        +{extraCount} mais
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Activity Detail Drawer */}
      <AnimatePresence>
        {selectedActivity && (
          <ActivityDetailDrawer
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      {/* Nova Atividade Modal */}
      <AnimatePresence>
        {showNewActivity && (
          <NovaAtividadeModal
            onClose={() => setShowNewActivity(false)}
            onSave={handleCreateActivity}
            contacts={contacts}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
