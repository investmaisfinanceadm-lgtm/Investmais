'use client'

import { useState, useMemo } from 'react'
import {
  Send, Mail, Calendar, Plus, X, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, XCircle, Eye, Users,
  Settings, Trash2,
  Tag, ToggleLeft, ToggleRight, User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type DispatchStatus = 'enviado' | 'agendado' | 'falhou'
type RecipientSegment = 'todos' | 'leads' | 'clientes' | 'manual'
type ActiveTab = 'email' | 'agenda'

interface Dispatch {
  id: string
  subject: string
  recipientsCount: number
  status: DispatchStatus
  sentAt: string
  openRate: number
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  linkedContact: string
  description: string
  color: string
}

// ─────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────
const MOCK_DISPATCHES: Dispatch[] = [
  { id: '1', subject: 'Proposta exclusiva: Fundos de Renda Fixa', recipientsCount: 142, status: 'enviado', sentAt: '2026-03-28T09:30:00', openRate: 67.4 },
  { id: '2', subject: 'Relatório mensal de performance — Março/2026', recipientsCount: 89, status: 'enviado', sentAt: '2026-03-25T14:00:00', openRate: 54.2 },
  { id: '3', subject: 'Convite: Webinar Tesouro Direto ao Vivo', recipientsCount: 310, status: 'agendado', sentAt: '2026-04-05T10:00:00', openRate: 0 },
  { id: '4', subject: 'Alerta de oportunidade: FIIs com desconto', recipientsCount: 57, status: 'falhou', sentAt: '2026-03-20T08:15:00', openRate: 0 },
  { id: '5', subject: 'Boas-vindas à plataforma InvestMais', recipientsCount: 23, status: 'enviado', sentAt: '2026-03-15T11:00:00', openRate: 91.3 },
]

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Reunião de assessoria', date: '2026-04-03', time: '10:00', linkedContact: 'Rafael Mendonça', description: 'Revisão de carteira trimestral e ajuste de alocação.', color: '#2563EB' },
  { id: '2', title: 'Webinar: Renda Variável 2026', date: '2026-04-10', time: '19:30', linkedContact: 'Todos os leads', description: 'Transmissão ao vivo sobre perspectivas do mercado acionário.', color: '#DAAF37' },
  { id: '3', title: 'Follow-up proposta CDB', date: '2026-04-15', time: '14:00', linkedContact: 'Camila Torres', description: 'Retorno sobre proposta CDB 120% CDI enviada na semana anterior.', color: '#818cf8' },
]

const MOCK_CONTACTS = ['Rafael Mendonça', 'Camila Torres', 'Bruno Alves', 'Fernanda Lima', 'Lucas Souza', 'Todos os leads', 'Todos os clientes']

// ─────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────
const dispatchSchema = z.object({
  subject: z.string().min(3, 'Assunto obrigatório'),
  body: z.string().min(10, 'Corpo do e-mail obrigatório'),
  segment: z.enum(['todos', 'leads', 'clientes', 'manual'] as const),
  manualEmails: z.string().optional().refine((val) => {
    if (!val) return true
    return val.split(',').every(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()))
  }, { message: 'Um ou mais e-mails são inválidos' }),
  scheduleToggle: z.boolean(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
})

const eventSchema = z.object({
  title: z.string().min(2, 'Título obrigatório'),
  date: z.string().min(1, 'Data obrigatória'),
  time: z.string().min(1, 'Hora obrigatória'),
  description: z.string().optional(),
  linkedContact: z.string().optional(),
})

type DispatchFormValues = z.infer<typeof dispatchSchema>
type EventFormValues = z.infer<typeof eventSchema>

// ─────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────
function StatusBadge({ status }: { status: DispatchStatus }) {
  const map: Record<DispatchStatus, { label: string; icon: React.ReactNode; className: string }> = {
    enviado: { label: 'Enviado', icon: <CheckCircle2 className="w-3 h-3" />, className: 'badge-accent' },
    agendado: { label: 'Agendado', icon: <Clock className="w-3 h-3" />, className: 'badge-gold' },
    falhou: { label: 'Falhou', icon: <XCircle className="w-3 h-3" />, className: 'badge-red' },
  }
  const { label, icon, className } = map[status]
  return (
    <span className={`badge ${className} gap-1`}>
      {icon}
      {label}
    </span>
  )
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-card border border-dark-border rounded-2xl shadow-card-hover"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Dispatch Detail Modal
// ─────────────────────────────────────────────
function DispatchDetailModal({ dispatch, onClose }: { dispatch: Dispatch; onClose: () => void }) {
  const { label, className } = {
    enviado: { label: 'Enviado', className: 'badge-accent' },
    agendado: { label: 'Agendado', className: 'badge-gold' },
    falhou: { label: 'Falhou', className: 'badge-red' },
  }[dispatch.status]

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 border-b border-dark-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider">Detalhe do Disparo</h2>
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{dispatch.subject}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-muted rounded-xl p-4 border border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Status</p>
            <span className={`badge ${className}`}>{label}</span>
          </div>
          <div className="bg-dark-muted rounded-xl p-4 border border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Destinatários</p>
            <p className="text-base font-black text-white">{dispatch.recipientsCount.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-dark-muted rounded-xl p-4 border border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
              {dispatch.status === 'agendado' ? 'Agendado para' : 'Enviado em'}
            </p>
            <p className="text-sm font-semibold text-white">
              {format(parseISO(dispatch.sentAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="bg-dark-muted rounded-xl p-4 border border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Taxa de Abertura</p>
            <p className={`text-base font-black ${dispatch.openRate > 0 ? 'text-accent' : 'text-gray-600'}`}>
              {dispatch.openRate > 0 ? `${dispatch.openRate}%` : '—'}
            </p>
          </div>
        </div>

        <div className="bg-dark-muted rounded-xl p-4 border border-white/5">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Assunto</p>
          <p className="text-sm text-white font-semibold">{dispatch.subject}</p>
        </div>

        {dispatch.status === 'falhou' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Falha no envio</p>
              <p className="text-xs text-gray-500 mt-0.5">Verifique a conexão com o Google e tente novamente.</p>
            </div>
          </div>
        )}

        <button onClick={onClose} className="btn-secondary w-full">Fechar</button>
      </div>
    </ModalOverlay>
  )
}

// ─────────────────────────────────────────────
// New Dispatch Modal
// ─────────────────────────────────────────────
function NewDispatchModal({ onClose, onSave }: { onClose: () => void; onSave: (d: Dispatch) => void }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DispatchFormValues>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: { segment: 'todos', scheduleToggle: false },
  })

  const scheduleOn = watch('scheduleToggle')
  const subject = watch('subject') || ''
  const body = watch('body') || ''

  const TEMPLATES = [
    { label: 'Proposta Comercial', subject: 'Proposta exclusiva para {{nome}} da {{empresa}}', body: 'Olá, {{nome}}!\n\nTemos uma oportunidade especial para você na {{empresa}}.\n\nFique à vontade para entrar em contato.\n\nAtenciosamente,\nEquipe InvestMais' },
    { label: 'Follow-up', subject: 'Retorno sobre nossa conversa, {{nome}}', body: 'Olá, {{nome}}!\n\nPassando para saber se você teve a chance de analisar nossa proposta.\n\nAguardo seu retorno!\n\nAtt,\nInvestMais' },
  ]

  const segmentLabels: Record<RecipientSegment, string> = {
    todos: 'Todos do CRM',
    leads: 'Apenas Leads',
    clientes: 'Apenas Clientes',
    manual: 'E-mails manuais',
  }

  const onSubmit = (data: DispatchFormValues) => {
    const newDispatch: Dispatch = {
      id: String(Date.now()),
      subject: data.subject,
      recipientsCount: data.segment === 'manual' ? (data.manualEmails?.split(',').length || 1) : Math.floor(Math.random() * 200) + 10,
      status: data.scheduleToggle ? 'agendado' : 'enviado',
      sentAt: data.scheduleToggle && data.scheduledDate ? `${data.scheduledDate}T${data.scheduledTime || '09:00'}:00` : new Date().toISOString(),
      openRate: 0,
    }
    onSave(newDispatch)
    onClose()
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 border-b border-dark-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider">Novo Disparo de E-mail</h2>
          <p className="text-xs text-gray-400 mt-0.5">Configure o disparo e defina os destinatários</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Templates */}
        <div>
          <label className="label">Templates rápidos</label>
          <div className="flex gap-2 flex-wrap">
            {TEMPLATES.map(t => (
              <button key={t.label} type="button"
                onClick={() => { setValue('subject', t.subject); setValue('body', t.body) }}
                className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="label">Assunto *</label>
          <input {...register('subject')} className="input-field" placeholder="Ex: Proposta exclusiva para {{nome}}" />
          {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>}
          <p className="text-gray-500 text-xs mt-1">Use {'{{nome}}'}, {'{{empresa}}'} como variáveis dinâmicas</p>
        </div>

        {/* Body */}
        <div>
          <label className="label">Corpo do E-mail *</label>
          <textarea {...register('body')} rows={6} className="input-field resize-none"
            placeholder="Olá, {{nome}}! ..." />
          {errors.body && <p className="text-red-400 text-xs mt-1">{errors.body.message}</p>}
        </div>

        {/* Segmentation */}
        <div>
          <label className="label">Segmento de destinatários</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(segmentLabels) as RecipientSegment[]).map(seg => (
              <label key={seg} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${watch('segment') === seg ? 'border-accent/50 bg-accent/10' : 'border-dark-border bg-dark-muted hover:border-dark-border/70'}`}>
                <input type="radio" value={seg} {...register('segment')} className="sr-only" />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${watch('segment') === seg ? 'border-accent' : 'border-gray-600'}`}>
                  {watch('segment') === seg && <div className="w-2 h-2 rounded-full bg-accent" />}
                </div>
                <span className="text-sm text-white">{segmentLabels[seg]}</span>
              </label>
            ))}
          </div>
        </div>

        {watch('segment') === 'manual' && (
          <div>
            <label className="label">E-mails (separados por vírgula)</label>
            <input {...register('manualEmails')} className="input-field" placeholder="joao@email.com, maria@email.com" />
          </div>
        )}

        {/* Schedule Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-dark-muted border border-dark-border">
          <div>
            <p className="text-sm font-semibold text-white">Agendar envio</p>
            <p className="text-xs text-gray-400 mt-0.5">Defina data e hora para o disparo automático</p>
          </div>
          <button type="button" onClick={() => setValue('scheduleToggle', !scheduleOn)}
            className="text-accent transition-colors">
            {scheduleOn ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-500" />}
          </button>
        </div>

        {scheduleOn && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data</label>
              <input type="date" {...register('scheduledDate')} className="input-field" />
            </div>
            <div>
              <label className="label">Hora</label>
              <input type="time" {...register('scheduledTime')} className="input-field" />
            </div>
          </div>
        )}

        {/* Preview */}
        {(subject || body) && (
          <div className="p-4 rounded-xl bg-dark-muted border border-dark-border space-y-2">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" /> Pré-visualização
            </p>
            <p className="text-sm font-semibold text-white">{subject.replace(/\{\{nome\}\}/g, 'João Silva').replace(/\{\{empresa\}\}/g, 'Acme Corp') || '—'}</p>
            <p className="text-xs text-gray-400 whitespace-pre-line line-clamp-4">
              {body.replace(/\{\{nome\}\}/g, 'João Silva').replace(/\{\{empresa\}\}/g, 'Acme Corp') || '—'}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            {scheduleOn ? 'Agendar Disparo' : 'Enviar Agora'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

// ─────────────────────────────────────────────
// New Event Modal
// ─────────────────────────────────────────────
function NewEventModal({ onClose, onSave }: { onClose: () => void; onSave: (e: CalendarEvent) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { linkedContact: '' },
  })

  const EVENT_COLORS = ['#2563EB', '#DAAF37', '#818cf8', '#f87171', '#60a5fa']
  const [selectedColor, setSelectedColor] = useState('#2563EB')

  const onSubmit = (data: EventFormValues) => {
    onSave({
      id: String(Date.now()),
      title: data.title,
      date: data.date,
      time: data.time,
      description: data.description || '',
      linkedContact: data.linkedContact || '—',
      color: selectedColor,
    })
    onClose()
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 border-b border-dark-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider">Novo Evento</h2>
          <p className="text-xs text-gray-400 mt-0.5">Adicione ao Google Agenda</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        <div>
          <label className="label">Título *</label>
          <input {...register('title')} className="input-field" placeholder="Reunião de assessoria" />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Data *</label>
            <input type="date" {...register('date')} className="input-field" />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="label">Hora *</label>
            <input type="time" {...register('time')} className="input-field" />
            {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Contato vinculado</label>
          <select {...register('linkedContact')} className="input-field">
            <option value="">Selecione um contato...</option>
            {MOCK_CONTACTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Descrição</label>
          <textarea {...register('description')} rows={3} className="input-field resize-none"
            placeholder="Detalhes do evento..." />
        </div>

        <div>
          <label className="label">Cor do evento</label>
          <div className="flex gap-2">
            {EVENT_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setSelectedColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Criar Evento
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

// ─────────────────────────────────────────────
// Mini Calendar
// ─────────────────────────────────────────────
function MiniCalendar({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // pad start
  const startPad = monthStart.getDay() // 0=Sun
  const paddedDays: (Date | null)[] = [...Array(startPad).fill(null), ...days]

  const eventDates = events.map(e => parseISO(e.date))

  return (
    <div className="card-hover p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <button onClick={() => setCurrentDate(d => addMonths(d, 1))}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {paddedDays.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />
          const hasEvent = eventDates.some(ed => isSameDay(ed, day))
          const todayDay = isToday(day)
          const inMonth = isSameMonth(day, currentDate)
          return (
            <div key={day.toISOString()}
              className={`relative flex flex-col items-center justify-center h-9 w-full rounded-lg text-xs font-semibold transition-colors cursor-default
                ${todayDay ? 'bg-accent text-black font-black' : ''}
                ${!todayDay && inMonth ? 'text-gray-300 hover:bg-white/5' : ''}
                ${!inMonth ? 'text-gray-600' : ''}
              `}>
              {day.getDate()}
              {hasEvent && !todayDay && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function DisparosPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('email')
  const [dispatches, setDispatches] = useState<Dispatch[]>(MOCK_DISPATCHES)
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null)

  // Stats derived from dispatches
  const stats = useMemo(() => {
    const sent = dispatches.filter(d => d.status === 'enviado')
    const totalSent = sent.reduce((a, d) => a + d.recipientsCount, 0)
    const avgOpen = sent.length > 0 ? sent.reduce((a, d) => a + d.openRate, 0) / sent.length : 0
    const failed = dispatches.filter(d => d.status === 'falhou').length
    return { totalSent, avgOpen: avgOpen.toFixed(1), failed }
  }, [dispatches])

  // Upcoming events (sorted)
  const upcomingEvents = useMemo(() =>
    [...events].sort((a, b) => a.date.localeCompare(b.date)), [events])

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Send className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Canal de Comunicação</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
            Disparos
          </h1>
          <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px]">
            Gerencie e-mails em massa e eventos do Google Agenda
          </p>
        </div>

        {/* Connection chip */}
        {isConnected ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-accent text-xs font-black uppercase tracking-wider">Google Conectado</span>
            <button onClick={() => setIsConnected(false)}
              className="ml-2 text-gray-500 hover:text-white transition-colors">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsConnected(true)} className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider font-black">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Conectar Google
          </button>
        )}
      </div>

      {/* ── NOT CONNECTED State ── */}
      {!isConnected && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="card-hover max-w-lg w-full p-10 flex flex-col items-center text-center space-y-6">
            {/* Google logo area */}
            <div className="w-20 h-20 rounded-3xl bg-dark-muted border border-dark-border flex items-center justify-center shadow-card">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">Conecte sua conta Google</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Para usar os disparos de e-mail e gerenciar eventos, autorize o acesso via OAuth2. Seus dados ficam seguros e o acesso pode ser revogado a qualquer momento.
              </p>
            </div>

            <ul className="w-full space-y-3 text-left">
              {[
                { icon: <Mail className="w-4 h-4 text-blue-400" />, text: 'Gmail — Envio de e-mails em massa personalizados' },
                { icon: <Calendar className="w-4 h-4 text-accent" />, text: 'Google Agenda — Criação e sincronização de eventos' },
                { icon: <Users className="w-4 h-4 text-gold" />, text: 'Google Contacts — Importação de contatos (opcional)' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-3 p-3 rounded-xl bg-dark-muted border border-dark-border">
                  <div className="shrink-0">{icon}</div>
                  <span className="text-sm text-gray-300">{text}</span>
                </li>
              ))}
            </ul>

            <button onClick={() => setIsConnected(true)} className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-sm font-black uppercase tracking-wider">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#000" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#000" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#000" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#000" />
              </svg>
              Conectar com Google
            </button>

            <p className="text-gray-600 text-xs">
              Ao conectar, você concorda com os Termos de Serviço do Google e nossa Política de Privacidade.
            </p>
          </div>
        </div>
      )}

      {/* ── CONNECTED State ── */}
      {isConnected && (
        <div className="space-y-8 animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-dark-card border border-dark-border rounded-xl w-fit">
            {([
              { key: 'email', label: '📧 Disparos Email' },
              { key: 'agenda', label: '📅 Google Agenda' },
            ] as { key: ActiveTab; label: string }[]).map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${activeTab === tab.key
                  ? 'bg-accent text-black shadow-accent'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── EMAIL TAB ── */}
          <AnimatePresence mode="wait">
            {activeTab === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Enviados', value: stats.totalSent.toLocaleString('pt-BR'), icon: <Send className="w-6 h-6 text-accent" />, color: 'accent' },
                    { label: 'Taxa de Abertura', value: `${stats.avgOpen}%`, icon: <Eye className="w-6 h-6 text-gold" />, color: 'gold' },
                    { label: 'Falhas', value: String(stats.failed), icon: <XCircle className="w-6 h-6 text-red-400" />, color: 'red' },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className={`card-hover group p-6 rounded-2xl relative overflow-hidden`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${color === 'accent' ? 'bg-accent/10 border-accent/20' : color === 'gold' ? 'bg-gold/10 border-gold/20' : 'bg-red-500/10 border-red-500/20'}`}>
                          {icon}
                        </div>
                      </div>
                      <p className="text-3xl font-black text-white">{value}</p>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Table header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">Histórico de Disparos</h2>
                  <button onClick={() => setShowDispatchModal(true)} className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider font-black">
                    <Plus className="w-4 h-4" />
                    Novo Disparo
                  </button>
                </div>

                {/* Table */}
                <div className="card-hover overflow-hidden rounded-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-border">
                          <th className="table-header">Assunto</th>
                          <th className="table-header text-center">Destinatários</th>
                          <th className="table-header text-center">Status</th>
                          <th className="table-header">Data</th>
                          <th className="table-header text-center">Abertura</th>
                          <th className="table-header text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dispatches.map((d) => (
                          <tr key={d.id} className="table-row">
                            <td className="table-cell font-medium text-white max-w-xs truncate">{d.subject}</td>
                            <td className="table-cell text-center">
                              <span className="flex items-center justify-center gap-1">
                                <Users className="w-3 h-3 text-gray-500" />
                                {d.recipientsCount}
                              </span>
                            </td>
                            <td className="table-cell text-center">
                              <StatusBadge status={d.status} />
                            </td>
                            <td className="table-cell text-gray-400 text-xs">
                              {format(parseISO(d.sentAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </td>
                            <td className="table-cell text-center">
                              {d.status === 'enviado' ? (
                                <span className="text-accent font-black text-sm">{d.openRate}%</span>
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </td>
                            <td className="table-cell text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setSelectedDispatch(d)}
                                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setDispatches(prev => prev.filter(x => x.id !== d.id))}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── AGENDA TAB ── */}
            {activeTab === 'agenda' && (
              <motion.div key="agenda" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">Google Agenda</h2>
                  <button onClick={() => setShowEventModal(true)} className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider font-black">
                    <Plus className="w-4 h-4" />
                    Novo Evento
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Calendar: 2 cols */}
                  <div className="lg:col-span-2">
                    <MiniCalendar events={events} />
                  </div>

                  {/* Upcoming events: 3 cols */}
                  <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Próximos eventos</h3>
                    {upcomingEvents.length === 0 && (
                      <div className="card-hover flex flex-col items-center py-12 text-center rounded-2xl">
                        <Calendar className="w-10 h-10 text-gray-600 mb-3" />
                        <p className="text-gray-500 text-sm">Nenhum evento agendado</p>
                      </div>
                    )}
                    {upcomingEvents.map(ev => (
                      <div key={ev.id} className="card-hover p-5 rounded-2xl flex gap-4 group">
                        {/* Color stripe */}
                        <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-black text-white text-sm">{ev.title}</p>
                            <button onClick={() => setEvents(prev => prev.filter(x => x.id !== ev.id))}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(parseISO(ev.date), "dd 'de' MMMM", { locale: ptBR })} às {ev.time}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {ev.linkedContact}
                            </span>
                          </div>
                          {ev.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{ev.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {showDispatchModal && (
          <NewDispatchModal
            onClose={() => setShowDispatchModal(false)}
            onSave={(d) => setDispatches(prev => [d, ...prev])}
          />
        )}
        {showEventModal && (
          <NewEventModal
            onClose={() => setShowEventModal(false)}
            onSave={(e) => setEvents(prev => [e, ...prev])}
          />
        )}
        {selectedDispatch && (
          <DispatchDetailModal
            dispatch={selectedDispatch}
            onClose={() => setSelectedDispatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
