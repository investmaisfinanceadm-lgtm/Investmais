'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Kanban,
  Plus,
  X,
  ChevronDown,
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  Clock,
  MoveRight,
  AlertCircle,
  CheckCircle2,
  Circle,
  Tag,
  Send,
  LayoutGrid,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Pencil,
  Check,
  Building,
  Phone,
  ArrowUpRight,
  ListTodo,
  Layers,
  ShoppingBag,
  CreditCard,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { normalizeWhatsApp, formatCurrency as formatBRL, SELLER_COLORS } from '@/lib/crm-utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'alta' | 'media' | 'baixa'
type BoardName = string

interface KanbanCard {
  id: string
  title: string
  category: string
  categoryColor: string
  priority: Priority
  responsible: { name: string; initials: string; color: string }
  dueDate: string
  value: number
  description: string
  columnId: string
  status: 'open' | 'won' | 'lost'
  lostReason?: string
  closedAt?: string
  origin?: string
  createdAt: string
  updatedAt: string
  contactId?: string
  vendedorId?: string
  linkedContact?: { name: string; phone: string; email?: string }
}

interface KanbanColumn {
  id: string
  name: string
  color: string
  probabilidade: number
  slaHoras?: number
  cards: KanbanCard[]
}

interface HistoryEntry {
  id: string
  action: string
  from?: string
  to?: string
  user: string
  date: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DEFAULT_BOARDS: BoardName[] = ['Vendas', 'Projetos', 'Suporte']

const MOCK_HISTORY: HistoryEntry[] = []

const initialColumns: KanbanColumn[] = [
  { id: 'leads',       name: 'Leads',        color: '#3B82F6', probabilidade: 100, cards: [] },
  { id: 'qualificacao',name: 'Qualificação', color: '#F59E0B', probabilidade: 100, cards: [] },
  { id: 'proposta',    name: 'Proposta',     color: '#2563EB', probabilidade: 100, cards: [] },
  { id: 'fechado',     name: 'Fechado',      color: '#8B5CF6', probabilidade: 100, cards: [] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return dateStr
  }
}

function isOverdue(dateStr: string) {
  try {
    return isPast(parseISO(dateStr))
  } catch {
    return false
  }
}

const priorityConfig: Record<Priority, { label: string; color: string; dotClass: string; textClass: string; bgClass: string }> = {
  alta: {
    label: 'Alta',
    color: '#EF4444',
    dotClass: 'bg-red-500',
    textClass: 'text-red-400',
    bgClass: 'bg-red-500/10 border-red-500/20 text-red-400',
  },
  media: {
    label: 'Média',
    color: '#F59E0B',
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
  },
  baixa: {
    label: 'Baixa',
    color: '#2563EB',
    dotClass: 'bg-accent',
    textClass: 'text-accent',
    bgClass: 'bg-accent/10 border-accent/20 text-accent',
  },
}

const categoryColorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  accent: 'bg-accent/10 border-accent/20 text-accent',
  gold: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityDot({ priority }: { priority: Priority }) {
  const cfg = priorityConfig[priority] || priorityConfig['media']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bgClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  )
}

function Avatar({ initials, color, size = 'sm' }: { initials: string; color: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-xs'
  return (
    <span
      className={`${sizeClass} rounded-full flex items-center justify-center font-black text-[var(--text-main)] flex-shrink-0`}
      style={{ backgroundColor: color + '33', border: `1px solid ${color}55` }}
    >
      <span style={{ color }}>{initials}</span>
    </span>
  )
}

// ─── Card Component ────────────────────────────────────────────────────────────

function KanbanCardItem({
  card,
  onClick,
  onSelect,
  isSelected,
  selectionMode,
  columnSla,
}: {
  card: KanbanCard
  onClick: () => void
  onSelect: (id: string) => void
  isSelected: boolean
  selectionMode: boolean
  columnSla?: number
}) {
  const overdue = isOverdue(card.dueDate)
  const catClass = categoryColorMap[card.categoryColor] || categoryColorMap.blue

  // SLA Logic
  const createdAt = parseISO(card.createdAt)
  const hoursInStage = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))
  const slaStatus: 'normal' | 'near' | 'over' = !columnSla 
    ? 'normal' 
    : hoursInStage >= columnSla 
      ? 'over' 
      : hoursInStage >= columnSla * 0.8 
        ? 'near' 
        : 'normal'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={() => selectionMode ? onSelect(card.id) : onClick()}
      className={cn(
        "bg-[var(--bg-card)] border border-[var(--border-main)] shadow-light-card rounded-xl p-4 cursor-pointer hover:border-accent/40 hover:shadow-card transition-all duration-200 group relative overflow-hidden",
        isSelected && "border-accent ring-1 ring-accent",
        "border-l-[4px]"
      )}
      style={{ borderLeftColor: card.responsible.color }}
    >
      {selectionMode && (
        <div className="absolute top-2 right-2 z-10">
          <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-accent border-accent text-black" : "bg-black/20 border-white/20")}>
            {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
          </div>
        </div>
      )}

      {/* Title & category */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-[var(--text-main)] leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {card.title}
        </p>
        <span className={`badge ${catClass} whitespace-nowrap flex-shrink-0 text-[9px] py-0.5`}>
          {card.category}
        </span>
      </div>

      {/* Contact Info (NetLife Style) */}
      {card.linkedContact && (
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-main)] font-medium">
            <User className="w-3 h-3 text-gray-500" />
            {card.linkedContact.name}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
            <Phone className="w-3 h-3 text-gray-500" />
            {card.linkedContact.phone}
          </div>
        </div>
      )}

      {/* Value & SLA */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3 h-3 text-accent flex-shrink-0" />
          <span className="text-xs font-black text-accent">{formatCurrency(card.value)}</span>
        </div>
        
        {columnSla && (
          <div className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold",
            slaStatus === 'over' ? "bg-red-500/20 text-red-400 border border-red-500/30" : 
            slaStatus === 'near' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
            "bg-emerald-500/10 text-emerald-500"
          )}>
            <Clock className="w-2.5 h-2.5" />
            {hoursInStage}h
          </div>
        )}
      </div>

      {/* Footer: responsible + due date */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-main)]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar initials={card.responsible.initials} color={card.responsible.color} />
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-[var(--text-muted)] truncate">{card.responsible.name}</span>
            <PriorityDot priority={card.priority} />
          </div>
        </div>
        <div className={`flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-[var(--text-support)]'}`}>
          {overdue ? (
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
          ) : (
            <Calendar className="w-3 h-3 flex-shrink-0" />
          )}
          <span className="text-[10px] font-medium">{formatDate(card.dueDate)}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Column Component ──────────────────────────────────────────────────────────

function KanbanColumnComponent({
  column,
  onCardClick,
  onAddCard,
  selectionMode,
  selectedCardIds,
  onSelectCard,
}: {
  column: KanbanColumn
  onCardClick: (card: KanbanCard) => void
  onAddCard: () => void
  selectionMode: boolean
  selectedCardIds: string[]
  onSelectCard: (id: string) => void
}) {
  const totalValue = column.cards.reduce((sum, c) => sum + c.value, 0)

  return (
    <div className="flex-shrink-0 w-80 flex flex-col gap-3">
      {/* Column header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 shadow-sm border-t-[3px]" style={{ borderTopColor: column.color }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">{column.name}</span>
            {column.probabilidade < 100 && (
              <span className="text-[10px] text-[var(--text-muted)] font-bold">({column.probabilidade}%)</span>
            )}
          </div>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-primary)] text-[10px] font-black text-[var(--text-muted)]">
            {column.cards.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-accent" />
            <span className="text-[11px] font-bold text-accent">{formatCurrency(totalValue)}</span>
          </div>
          {column.slaHoras && (
            <div className="flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase tracking-widest">
              <Clock className="w-2.5 h-2.5" /> SLA: {column.slaHoras}h
            </div>
          )}
        </div>
      </div>

      {/* Cards list */}
      <div className="flex flex-col gap-2.5 min-h-[100px]">
        <AnimatePresence mode="popLayout">
          {column.cards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 border border-dashed border-[var(--border-main)] rounded-xl text-[var(--text-support)]"
            >
              <LayoutGrid className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs font-black uppercase tracking-widest">Vazio</p>
            </motion.div>
          ) : (
            column.cards.map((card) => (
              <KanbanCardItem 
                key={card.id} 
                card={card} 
                onClick={() => onCardClick(card)} 
                onSelect={onSelectCard}
                isSelected={selectedCardIds.includes(card.id)}
                selectionMode={selectionMode}
                columnSla={column.slaHoras}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add card button */}
      <button onClick={onAddCard} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[var(--border-main)] text-[var(--text-muted)] hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-200 text-xs font-semibold">
        <Plus className="w-3.5 h-3.5" />
        Adicionar Card
      </button>
    </div>
  )
}

// ─── Modal / Detail Drawer ────────────────────────────────────────────────────

type DrawerTab = 'dados' | 'atividades' | 'comentarios' | 'utm' | 'historico'

function EditableField({ 
  field, 
  label, 
  value, 
  type = 'text', 
  options = [],
  prefix = '',
  isEditingGlobal,
  editingField,
  setEditingField,
  handleSaveField
}: { 
  field: keyof KanbanCard | string, 
  label: string, 
  value: string | number | undefined, 
  type?: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  prefix?: string
  isEditingGlobal: boolean
  editingField: string | null
  setEditingField: (f: string | null) => void
  handleSaveField: (field: keyof KanbanCard, value: any) => void
}) {
  const isEditMode = isEditingGlobal || editingField === field
  const [localVal, setLocalVal] = useState(String(value ?? ''))

  useEffect(() => { setLocalVal(String(value ?? '')) }, [value])

  function onSaveInline() {
    const parsedVal = type === 'number' ? Number(localVal) : localVal
    handleSaveField(field as keyof KanbanCard, parsedVal)
  }

  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
        {label}
        {!isEditingGlobal && editingField !== field && (
          <button
            onClick={() => setEditingField(field)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </label>
      
      {isEditMode ? (
        <div className="flex items-center gap-2">
          {type === 'select' ? (
            <select
              value={localVal}
              onChange={e => setLocalVal(e.target.value)}
              className="input-field bg-[var(--bg-primary)] border-[var(--border-main)] text-sm py-1.5 h-9"
            >
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
             <div className="relative flex-1">
               {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>}
               <input 
                 type={type} 
                 value={localVal}
                 onChange={e => setLocalVal(e.target.value)}
                 className={cn("input-field bg-[var(--bg-primary)] border-[var(--border-main)] text-sm py-1.5 h-9", prefix && "pl-8")}
                 autoFocus={editingField === field && !isEditingGlobal}
               />
             </div>
          )}
          
          {!isEditingGlobal && (
            <div className="flex items-center gap-1">
              <button onClick={onSaveInline} className="p-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30"><Check className="w-4 h-4" /></button>
              <button onClick={() => { setEditingField(null); setLocalVal(String(value ?? '')) }} className="p-1.5 rounded-lg bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)]"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-main)] font-medium tracking-tight">
           {prefix} {value || <span className="text-gray-600 italic">Não informado</span>}
        </p>
      )}
    </div>
  )
}

function CardDetailModal({
  card,
  columns,
  onClose,
  onMove,
  onDelete,
  onUpdate,
}: {
  card: KanbanCard
  columns: KanbanColumn[]
  onClose: () => void
  onMove: (cardId: string, targetColumnId: string) => void
  onDelete: (cardId: string) => void
  onUpdate: (updatedCard: KanbanCard) => void
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('dados')
  const [isEditingGlobal, setIsEditingGlobal] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editedCard, setEditedCard] = useState<KanbanCard>(card)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<{ id: string; text: string; user: string; date: string }[]>([
    { id: '1', text: 'Cliente muito receptivo na última ligação. Próximo passo: agendar demo.', user: 'Ana Paula', date: new Date().toISOString() },
  ])
  const [moveTo, setMoveTo] = useState<string>(card.columnId)

  // Reset local state if card prop changes remotely
  useEffect(() => { setEditedCard(card) }, [card])

  const overdue = isOverdue(card.dueDate)
  const catClass = categoryColorMap[card.categoryColor] || categoryColorMap.blue

  // Activities logic
  const MOCK_ACTIVITIES = [
    { title: 'Enviar Proposta Comercial', date: new Date(Date.now() + 86400000).toISOString(), status: 'pending' },
    { title: 'Primeiro Contato', date: new Date(Date.now() - 86400000).toISOString(), status: 'done' },
  ]
  const pendingActivities = MOCK_ACTIVITIES.filter(a => a.status === 'pending').length

  // Calculate days in stage (mocking created at)
  const createdAtDate = card.createdAt ? parseISO(card.createdAt) : parseISO(card.dueDate || new Date().toISOString())
  const daysInStage = Math.max(0, Math.floor((Date.now() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24)))

  function handleSaveGlobal() {
    onUpdate(editedCard)
    setIsEditingGlobal(false)
    setEditingField(null)
  }

  function handleSaveField(field: keyof KanbanCard, value: any) {
    const updated = { ...editedCard, [field]: value }
    setEditedCard(updated)
    onUpdate(updated)
    setEditingField(null)
  }

  async function handleSendComment() {
    if (!comment.trim()) return
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), text: comment.trim(), user: 'Você', date: new Date().toISOString() },
    ])
    setComment('')
  }

  function handleMarkAsWon() {
    const wonColumn = columns.find(
      (col) => /ganho|won|fechado|concluíd/i.test(col.name)
    ) ?? columns[columns.length - 1]
    if (!wonColumn) return
    onMove(card.id, wonColumn.id)
    toast.success('Negócio marcado como GANHO!')
  }


  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40 cursor-pointer"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed top-0 right-0 h-screen w-full max-w-[480px] sm:max-w-[480px] bg-[var(--bg-card)] border-l border-[var(--border-main)] z-50 flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.25)]"
      >
        {/* ── Header ── */}
        <div className="p-6 border-b border-[var(--border-main)] flex-shrink-0 relative group bg-[var(--bg-card)]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex gap-2 items-center flex-wrap">
              <span className={`badge ${catClass}`}>{editedCard.category}</span>
              <PriorityDot priority={editedCard.priority} />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditingGlobal(!isEditingGlobal)} 
                className={cn("px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5", isEditingGlobal ? "bg-accent/10 border-accent/20 text-accent" : "border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-accent/40")}
              >
                <Pencil className="w-3 h-3" />
                {isEditingGlobal ? 'Editando' : 'Editar'}
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title Area */}
          <div className="flex items-center gap-3">
            {isEditingGlobal || editingField === 'title' ? (
              <div className="flex items-center gap-2 w-full">
                <input 
                   autoFocus
                   type="text" 
                   value={editedCard.title} 
                   onChange={e => setEditedCard({...editedCard, title: e.target.value})}
                   className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl px-4 py-2 text-xl font-black text-[var(--text-main)]"
                />
                {!isEditingGlobal && (
                   <div className="flex shrink-0 gap-1">
                      <button onClick={() => { onUpdate(editedCard); setEditingField(null) }} className="p-2 rounded-xl bg-accent text-black"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setEditedCard(card); setEditingField(null) }} className="p-2 rounded-xl bg-[var(--bg-primary)] text-gray-400"><X className="w-4 h-4" /></button>
                   </div>
                )}
              </div>
            ) : (
              <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter leading-tight flex items-center gap-3">
                {editedCard.title}
                {!isEditingGlobal && (
                  <button onClick={() => setEditingField('title')} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)] w-fit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </h2>
            )}
          </div>
        </div>

        {/* ── Featured Metrics Grid ── */}
        <div className="px-6 pt-6 pb-2 grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl p-4 flex flex-col gap-1 relative group/metric">
            <EditableField field="value" label="Valor Estimado" value={editedCard.value} type="number" prefix="R$" />
          </div>
          <div className={cn("bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl p-4 flex flex-col gap-1 relative group/metric", overdue && !isEditingGlobal && "border-red-500/20 bg-red-500/5")}>
             <EditableField field="dueDate" label="Vencimento" value={editedCard.dueDate} type="date" />
          </div>
          <div className="bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> No Estágio</span>
            <span className="text-lg font-black text-[var(--text-main)]">{daysInStage} dias</span>
          </div>
          <div className="bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><ListTodo className="w-3 h-3" /> Pendentes</span>
            <span className="text-lg font-black text-accent">{pendingActivities} ativ.</span>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="px-6 flex items-center gap-6 border-b border-[var(--border-main)] shrink-0 overflow-x-auto no-scrollbar">
          {(['dados', 'atividades', 'comentarios', 'utm', 'historico'] as DrawerTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-4 text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors whitespace-nowrap",
                activeTab === tab ? "text-accent" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              )}
            >
              {tab === 'dados' ? 'Visão Geral' : 
               tab === 'atividades' ? 'Atividades' : 
               tab === 'comentarios' ? 'Anotações' : 
               tab === 'utm' ? 'UTM' : 'Histórico'}
              {activeTab === tab && (
                <motion.div layoutId="drawer-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>

        {/* ── Drawer Body (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* TAB: DADOS */}
          {activeTab === 'dados' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 animate-fade-in">
              
              {/* Descrição */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2"><Layers className="w-4 h-4 text-gray-500" /> Sobre a Oportunidade</span>
                 </div>
                 {isEditingGlobal ? (
                   <textarea 
                     rows={3} 
                     value={editedCard.description} 
                     onChange={e => setEditedCard({...editedCard, description: e.target.value})}
                     className="input-field bg-[var(--bg-primary)] border-[var(--border-main)] w-full text-sm resize-none"
                   />
                 ) : (
                   <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                     {editedCard.description || 'Nenhuma descrição adicionada.'}
                   </div>
                 )}
              </div>

              {/* Grid 2 Column Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                 <EditableField field="product" label="Produto de Interesse" value={editedCard.product} options={['Consultoria PRO', 'Plataforma SaaS', 'Gestão de Tráfego', 'Mentoria']} type="select" />
                 <EditableField field="origin" label="Origem do Lead" value={editedCard.origin} options={['Site', 'Indicação', 'Instagram', 'LinkedIn', 'Outbound']} type="select" />
                 <EditableField field="companyBranch" label="Ramo da Empresa" value={editedCard.companyBranch} options={['Tecnologia', 'Saúde', 'Comércio', 'Imobiliário', 'Serviços']} type="select" />
                 <EditableField field="monthlyRevenue" label="Faturamento Mensal" value={editedCard.monthlyRevenue} prefix="R$" type="number" />
              </div>

              <div className="w-full h-px bg-[var(--border-main)] my-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                 <EditableField field="responsible" label="Vendedor / Owner" value={editedCard.responsible.name} options={['InvestMais Admin', 'Ana Paula', 'Carlos Eduardo', 'Rafael Silva']} type="select" />
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contato Vinculado</label>
                    {editedCard.linkedContact ? (
                      <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl cursor-pointer hover:border-accent/30 group transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs border border-blue-500/30">
                             {editedCard.linkedContact.name.substring(0,2).toUpperCase()}
                           </div>
                           <div>
                             <p className="text-xs font-bold text-[var(--text-main)]">{editedCard.linkedContact.name}</p>
                             <p className="text-[10px] text-gray-500">{editedCard.linkedContact.phone}</p>
                           </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-accent transition-colors" />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 font-medium py-1.5">Nenhum contato vinculado</p>
                    )}
                 </div>
              </div>

              {/* Move To Field */}
              <div className="pt-6 border-t border-[var(--border-main)] space-y-4">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estágio Atual (Mover pipeline)</label>
                 <div className="relative">
                   <select
                     value={moveTo}
                     onChange={(e) => setMoveTo(e.target.value)}
                     className="input-field appearance-none pr-10 text-sm font-semibold h-12 bg-[var(--bg-primary)] border-[var(--border-main)]"
                   >
                     {columns.map((col) => (
                       <option key={col.id} value={col.id}>
                         {col.name}
                       </option>
                     ))}
                   </select>
                   <MoveRight className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                 </div>
                 {moveTo !== card.columnId && (
                   <button
                     onClick={() => onMove(card.id, moveTo)}
                     className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                   >
                     <CheckCircle2 className="w-4 h-4" />
                     Confirmar Mudança de Estágio
                   </button>
                 )}
              </div>

            </motion.div>
          )}

          {/* TAB: ATIVIDADES */}
          {activeTab === 'atividades' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 animate-fade-in">
              {MOCK_ACTIVITIES.map((act, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl">
                    <div className="flex items-center gap-3">
                       <button className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", act.status === 'done' ? "bg-accent border-accent text-black" : "border-gray-600 text-transparent hover:border-gray-400")}>
                         <Check className="w-3 h-3" />
                       </button>
                       <span className={cn("text-sm font-medium", act.status === 'done' ? "text-[var(--text-muted)] line-through" : "text-[var(--text-main)]")}>{act.title}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-500 tracking-widest">{formatDate(act.date)}</span>
                 </div>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-[var(--border-main)] rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-accent hover:border-accent/30 transition-colors">
                <Plus className="w-4 h-4" /> Nova Atividade
              </button>
            </motion.div>
          )}

          {/* TAB: UTM */}
          {activeTab === 'utm' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 gap-6">
                <EditableField field="utm_source" label="Source (Origem)" value={editedCard.origin || 'Não identificado'} />
                <EditableField field="utm_medium" label="Medium (Meio)" value="cpc" />
                <EditableField field="utm_campaign" label="Campaign (Campanha)" value="Pesquisa_Branding_2024" />
                <EditableField field="utm_content" label="Content (Conteúdo)" value="Banner_A" />
                <EditableField field="utm_term" label="Term (Termo)" value="investimento cdi" />
              </div>
            </motion.div>
          )}

          {/* TAB: HISTÓRICO */}
          {activeTab === 'historico' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in pl-2 space-y-6 relative before:absolute before:inset-y-0 before:left-[17px] before:w-px before:bg-[var(--border-main)]">
              {MOCK_HISTORY.length === 0 ? (
                 <p className="text-gray-500 text-sm font-medium text-center py-10 w-full">Nenhum histórico registrado.</p>
              ) : (
                MOCK_HISTORY.map((entry, idx) => (
                  <div key={entry.id} className="relative pl-10 flex flex-col gap-1">
                    <div className="absolute left-[-5px] top-0 w-11 h-11 bg-[var(--bg-card)] flex items-start justify-center">
                       <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                         {idx === MOCK_HISTORY.length - 1 ? <CheckCircle2 className="w-3 h-3 text-accent" /> : <Circle className="w-3 h-3 text-gray-600" />}
                       </div>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] leading-snug">
                      <span className="font-semibold text-[var(--text-main)]">{entry.user}</span> {entry.action}
                    </p>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{formatDateTime(entry.date)}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* TAB: ANOTAÇÕES */}
          {activeTab === 'comentarios' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 animate-fade-in flex flex-col h-full">
              <div className="flex-1 space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest">{c.user}</span>
                      <span className="text-[9px] text-gray-500">{formatDateTime(c.date)}</span>
                    </div>
                    <p className="text-sm text-[var(--text-main)] leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-[var(--border-main)]">
                <div className="relative">
                  <textarea placeholder="Digite uma anotação..." value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl p-4 pr-14 text-sm resize-none" rows={3} />
                  <button onClick={handleSendComment} disabled={!comment.trim()} className="absolute bottom-4 right-4 p-2 bg-accent text-black rounded-xl disabled:opacity-40 hover:scale-105 active:scale-95 transition-all"><Send className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: ATIVIDADES */}
          {activeTab === 'atividades' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 animate-fade-in">
              {MOCK_ACTIVITIES.map((act, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl">
                    <span className={cn("text-sm font-medium", act.status === 'done' && "text-[var(--text-muted)] line-through")}>{act.title}</span>
                    <span className="text-[10px] font-black text-gray-500 tracking-widest">{formatDate(act.date)}</span>
                 </div>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-[var(--border-main)] rounded-2xl text-xs font-black uppercase text-[var(--text-muted)] hover:text-accent hover:border-accent/30 transition-colors">+ Nova Atividade</button>
            </motion.div>
          )}

          {/* TAB: UTM */}
          {activeTab === 'utm' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 animate-fade-in">
              <EditableField field="utm_source" label="Source (Origem)" value={editedCard.origin || 'Direto'} isEditingGlobal={isEditingGlobal} editingField={editingField} setEditingField={setEditingField} handleSaveField={handleSaveField} />
              <EditableField field="utm_medium" label="Medium (Meio)" value="cpc" isEditingGlobal={isEditingGlobal} editingField={editingField} setEditingField={setEditingField} handleSaveField={handleSaveField} />
              <EditableField field="utm_campaign" label="Campaign (Campanha)" value="Pesquisa_2024" isEditingGlobal={isEditingGlobal} editingField={editingField} setEditingField={setEditingField} handleSaveField={handleSaveField} />
            </motion.div>
          )}

          {/* TAB: HISTÓRICO */}
          {activeTab === 'historico' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in pl-2 space-y-6 relative before:absolute before:inset-y-0 before:left-[17px] before:w-px before:bg-[var(--border-main)]">
              {MOCK_HISTORY.length === 0 ? (
                 <p className="text-gray-500 text-sm font-medium text-center py-10 w-full">Nenhum histórico registrado.</p>
              ) : (
                MOCK_HISTORY.map((entry, idx) => (
                  <div key={entry.id} className="relative pl-10 flex flex-col gap-1">
                    <div className="absolute left-[-5px] top-0 w-11 h-11 bg-[var(--bg-card)] flex items-start justify-center">
                       <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                         {idx === MOCK_HISTORY.length - 1 ? <CheckCircle2 className="w-3 h-3 text-accent" /> : <Circle className="w-3 h-3 text-gray-600" />}
                       </div>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] leading-snug">
                      <span className="font-semibold text-[var(--text-main)]">{entry.user}</span> {entry.action}
                    </p>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{formatDateTime(entry.date)}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* TAB: ANOTAÇÕES */}
          {activeTab === 'comentarios' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 animate-fade-in flex flex-col h-full">
              <div className="flex-1 space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest">{c.user}</span>
                      <span className="text-[9px] text-gray-500">{formatDateTime(c.date)}</span>
                    </div>
                    <p className="text-sm text-[var(--text-main)] leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-[var(--border-main)]">
                <div className="relative">
                  <textarea
                    placeholder="Digite uma anotação..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl p-4 pr-14 text-sm resize-none focus:border-accent/40 transition-colors"
                    rows={3}
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!comment.trim()}
                    className="absolute bottom-4 right-4 p-2 bg-accent text-black rounded-xl disabled:opacity-40 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="sticky bottom-0 bg-[var(--bg-card)] border-t border-white/[0.08] flex shrink-0 gap-3 p-4 z-10">
           {isEditingGlobal ? (
              <>
                 <button onClick={() => { setEditedCard(card); setIsEditingGlobal(false); setEditingField(null); }} className="flex-1 min-h-[48px] rounded-xl border border-[var(--border-main)] text-sm font-black text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase tracking-wider transition-colors">Cancelar Modificações</button>
                 <button onClick={handleSaveGlobal} className="flex-1 min-h-[48px] rounded-xl bg-accent text-black text-sm font-black uppercase tracking-wider hover:opacity-90 transition-opacity">Salvar Alterações</button>
              </>
           ) : (
              <>
                 <button
                   type="button"
                   onClick={() => { if(confirm('Marcar como perdido e excluir do pipeline?')) onDelete(card.id) }}
                   className="flex-1 min-h-[48px] rounded-xl border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                 >
                   <Trash2 className="w-4 h-4" /> Perdido / Excluir
                 </button>
                 <button
                   type="button"
                   onClick={handleMarkAsWon}
                   className="flex-1 min-h-[48px] rounded-xl bg-emerald-500 text-black text-sm font-black uppercase tracking-widest hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   <CheckCircle2 className="w-4 h-4" /> Ganho Garantido
                 </button>
              </>
           )}
        </div>

      </motion.div>
    </>
  )
}


// ─── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ columns }: { columns: KanbanColumn[] }) {
  const allCards = columns.flatMap((c) => c.cards)
  const totalCards = allCards.length
  const totalValue = allCards.reduce((sum, c) => sum + (c.value || 0), 0)
  const overdueCards = allCards.filter((c) => isOverdue(c.dueDate)).length

  const stats = [
    {
      label: 'Total de Cards',
      value: String(totalCards),
      icon: LayoutGrid,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10 border-blue-400/20',
      accent: false,
    },
    {
      label: 'Valor Total',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10 border-accent/20',
      accent: true,
    },
    {
      label: 'Cards Vencidos',
      value: String(overdueCards),
      icon: AlertTriangle,
      iconColor: overdueCards > 0 ? 'text-red-400' : 'text-gray-500',
      iconBg: overdueCards > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-[var(--bg-primary)] border-[var(--border-main)]',
      accent: false,
    },
  ]

  return (
    <div className="flex gap-3 overflow-x-auto no-view pb-1">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="card-hover group border border-[var(--border-main)] bg-[var(--bg-card)] p-4 rounded-2xl flex items-center gap-3 relative overflow-hidden flex-shrink-0 min-w-[140px] sm:flex-1"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${s.iconBg} group-hover:scale-110 transition-transform`}>
            <s.icon className={`w-4 h-4 ${s.iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em] mb-0.5 whitespace-nowrap">{s.label}</p>
            <p className={`text-lg font-black leading-none truncate ${s.accent ? 'text-accent' : 'text-[var(--text-main)]'}`}>
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Board Selector ────────────────────────────────────────────────────────────

function BoardSelector({
  boards,
  selected,
  onChange,
}: {
  boards: BoardName[]
  selected: BoardName
  onChange: (b: BoardName) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4"
      >
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span className="font-semibold">{selected}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-card-hover z-20 overflow-hidden"
          >
            {boards.map((b) => (
              <button
                key={b}
                onClick={() => { onChange(b); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 ${
                  b === selected
                    ? 'text-accent bg-accent/10'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-main)]'
                }`}
              >
                {b === selected && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                {b}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── New Column Modal ──────────────────────────────────────────────────────────

const COLUMN_COLORS = ['#2563EB', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6']

function NewColumnModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, color: string) => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLUMN_COLORS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim(), color)
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[var(--text-main)] uppercase tracking-wider">Nova Coluna</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome da coluna</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Ex: Em Negociação"
              />
            </div>
            <div>
              <label className="label">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {COLUMN_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-all border-2"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? '#fff' : 'transparent',
                      boxShadow: color === c ? `0 0 0 3px ${c}40` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancelar</button>
              <button type="submit" disabled={!name.trim()} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-40">Criar Coluna</button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}

// ─── New Card Modal ────────────────────────────────────────────────────────────

function NewCardModal({
  columns,
  defaultColumnId,
  onClose,
  onAdd,
}: {
  columns: KanbanColumn[]
  defaultColumnId: string
  onClose: () => void
  onAdd: (card: any) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const [columnId, setColumnId] = useState(defaultColumnId)
  const [contactId, setContactId] = useState('')
  const [contacts, setContacts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(false)

  useEffect(() => {
    async function fetchContacts() {
      setLoadingContacts(true)
      try {
        const res = await fetch('/api/creator/crm')
        if (res.ok) setContacts(await res.json())
      } finally {
        setLoadingContacts(false)
      }
    }
    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) || 
    c.telefone?.includes(search)
  ).slice(0, 5)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !contactId) {
      toast.error('Título e Contato são obrigatórios!')
      return
    }
    
    onAdd({
      title: title.trim(),
      description: description.trim(),
      value: parseFloat(value.replace(',', '.')) || 0,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      priority,
      coluna_id: columnId,
      contato_id: contactId,
      categoria: 'Lead',
      origem: 'manual'
    })
    onClose()
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[var(--text-main)] uppercase tracking-wider">Nova Negociação</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-primary)]"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Título da Negociação *</label>
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Ex: Projeto Padaria Pão Quente" />
            </div>

            <div className="space-y-2">
              <label className="label">Contato Vinculado *</label>
              <div className="relative">
                <input 
                  value={search} 
                  onChange={(e) => { setSearch(e.target.value); if(!e.target.value) setContactId('') }} 
                  className="input-field pl-10" 
                  placeholder="Buscar por nome ou telefone..." 
                />
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                
                {search && !contactId && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-2xl z-20 overflow-hidden">
                    {loadingContacts ? (
                      <div className="p-4 text-center text-xs text-gray-500">Buscando...</div>
                    ) : filteredContacts.length > 0 ? (
                      filteredContacts.map(c => (
                        <button 
                          key={c.id} 
                          type="button"
                          onClick={() => { setContactId(c.id); setSearch(c.nome) }}
                          className="w-full text-left p-3 hover:bg-[var(--bg-primary)] border-b border-[var(--border-main)] last:border-0 transition-colors"
                        >
                          <p className="text-xs font-bold text-[var(--text-main)]">{c.nome}</p>
                          <p className="text-[10px] text-gray-500">{c.telefone || c.email}</p>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500">Nenhum contato encontrado.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Valor Estimado</label>
                <input value={value} onChange={(e) => setValue(e.target.value)} className="input-field" placeholder="0,00" />
              </div>
              <div>
                <label className="label">Expectativa de Fechamento</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prioridade</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="input-field">
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
              <div>
                <label className="label">Etapa Inicial</label>
                <select value={columnId} onChange={(e) => setColumnId(e.target.value)} className="input-field">
                  {columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 font-black uppercase text-[10px] tracking-widest">Cancelar</button>
              <button type="submit" disabled={!title.trim() || !contactId} className="btn-primary flex-1 py-3 font-black uppercase text-[10px] tracking-widest disabled:opacity-40">Criar Negociação</button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}

// ─── Lost Reason Dialog ──────────────────────────────────────────────────────
function LostReasonDialog({ 
  onClose, 
  onConfirm 
}: { 
  onClose: () => void; 
  onConfirm: (reason: string) => void 
}) {
  const [reason, setReason] = useState('')
  const reasons = ['Sem orçamento', 'Comprou do concorrente', 'Não respondeu', 'Fora do perfil', 'Outro']

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-wider mb-4">Motivo da Perda</h3>
          <p className="text-xs text-gray-500 mb-6">Por favor, selecione o motivo pelo qual esta negociação foi perdida.</p>
          
          <div className="space-y-2 mb-6">
            {reasons.map(r => (
              <button 
                key={r}
                onClick={() => setReason(r)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border text-xs font-bold transition-all",
                  reason === r ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-[var(--bg-primary)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-red-500/20"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-secondary py-2.5 text-[10px] font-black uppercase tracking-widest">Cancelar</button>
            <button 
              onClick={() => onConfirm(reason)} 
              disabled={!reason}
              className="flex-1 bg-red-500 text-black py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
            >
              Confirmar Perda
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── New Board Modal ───────────────────────────────────────────────────────────

// ─── Bulk Actions Bar ────────────────────────────────────────────────────────
function BulkActionBar({ 
  selectedCount, 
  onClose, 
  onAction 
}: { 
  selectedCount: number; 
  onClose: () => void; 
  onAction: (action: string) => void 
}) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-3 bg-[var(--bg-card)] border border-accent/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] rounded-2xl"
    >
      <div className="flex items-center gap-3 pr-6 border-r border-[var(--border-main)]">
        <div className="w-8 h-8 rounded-full bg-accent text-black flex items-center justify-center font-black text-sm">
          {selectedCount}
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">Selecionados</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => onAction('move')} className="p-2 hover:bg-accent/10 rounded-xl text-[var(--text-muted)] hover:text-accent transition-colors flex flex-col items-center gap-1">
          <MoveRight className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase">Mover</span>
        </button>
        <button onClick={() => onAction('user')} className="p-2 hover:bg-accent/10 rounded-xl text-[var(--text-muted)] hover:text-accent transition-colors flex flex-col items-center gap-1">
          <User className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase">Vendedor</span>
        </button>
        <button onClick={() => onAction('priority')} className="p-2 hover:bg-accent/10 rounded-xl text-[var(--text-muted)] hover:text-accent transition-colors flex flex-col items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase">Prioridade</span>
        </button>
        <button onClick={() => onAction('delete')} className="p-2 hover:bg-red-500/10 rounded-xl text-[var(--text-muted)] hover:text-red-400 transition-colors flex flex-col items-center gap-1">
          <Trash2 className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase">Excluir</span>
        </button>
      </div>

      <button onClick={onClose} className="ml-4 p-2 rounded-xl border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// ─── Archived Modal ──────────────────────────────────────────────────────────
function ArchivedModal({ 
  onClose,
  onRestore
}: { 
  onClose: () => void;
  onRestore: (cardId: string) => void;
}) {
  const [archived, setArchived] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArchived() {
      try {
        const res = await fetch('/api/creator/pipeline/cards/archived')
        if (res.ok) setArchived(await res.json())
      } finally {
        setLoading(false)
      }
    }
    fetchArchived()
  }, [])

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between">
            <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-wider flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-accent" /> Negociações Arquivadas
            </h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-primary)]"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
            ) : archived.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Nenhuma negociação arquivada encontrada.</p>
            ) : archived.map(card => (
              <div key={card.id} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl group">
                <div>
                  <p className="font-bold text-[var(--text-main)]">{card.titulo}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase", card.status === 'won' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                      {card.status === 'won' ? 'GANHO' : 'PERDIDO'}
                    </span>
                    <span className="text-[10px] text-gray-500">{card.vendedor?.nome}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onRestore(card.id)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all"
                >
                  Reabrir
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )
}

function NewBoardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string) => void }) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim())
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[var(--text-main)] uppercase tracking-wider">Novo Board</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome do board</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Ex: Marketing, Parcerias..."
              />
            </div>
            <p className="text-xs text-gray-500">O novo board começará vazio. Adicione colunas depois.</p>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancelar</button>
              <button type="submit" disabled={!name.trim()} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-40">Criar Board</button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const initialBoardColumns: Record<string, KanbanColumn[]> = {
  'Vendas': initialColumns,
  'Projetos': [],
  'Suporte': [],
}

export default function PipelinePage() {
  const [boardsData, setBoardsData] = useState<any[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<string>('')
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewColumnOpen, setIsNewColumnOpen] = useState(false)
  const [isNewCardOpen, setIsNewCardOpen] = useState(false)
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false)
  const [activeColumnId, setActiveColumnId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [isArchivedOpen, setIsArchivedOpen] = useState(false)
  const [defaultBoardId, setDefaultBoardId] = useState<string | null>(null)

  // Fetch boards and columns on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/creator/pipeline-config')
        if (res.ok) {
          const data = await res.json()
          setBoardsData(data)
          if (data.length > 0) {
            setSelectedBoardId(data[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to fetch pipeline data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const currentBoard = boardsData.find(b => b.id === selectedBoardId)
  const columns: KanbanColumn[] = currentBoard?.colunas?.map((col: any) => ({
    id: col.id,
    name: col.nome,
    color: col.cor,
    probabilidade: col.probabilidade ?? 100,
    slaHoras: col.sla_horas,
    cards: (col.cards || []).filter((c: any) => c.status === 'open' || !c.status).map((card: any) => ({
      id: card.id,
      title: card.titulo,
      description: card.descricao,
      value: card.valor || 0,
      dueDate: card.vencimento ? String(card.vencimento).split('T')[0] : '',
      priority: (card.prioridade as Priority) || 'media',
      columnId: card.coluna_id,
      status: card.status || 'open',
      category: card.categoria || 'Lead',
      categoryColor: 'blue',
      createdAt: card.created_at || new Date().toISOString(),
      updatedAt: card.updated_at || new Date().toISOString(),
      responsible: { 
        name: card.responsavel || 'Sem responsável', 
        initials: (card.responsavel || 'US').slice(0, 2).toUpperCase(), 
        color: card.vendedor?.cor || '#3B82F6' 
      },
      linkedContact: card.contato ? { name: card.contato.nome, phone: card.contato.telefone } : undefined
    }))
  })) || []

  function handleCardClick(card: KanbanCard) {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setTimeout(() => setSelectedCard(null), 300)
  }

  async function handleAddBoard(name: string) {
    try {
      const res = await fetch('/api/creator/pipeline-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'board', nome: name })
      })
      if (res.ok) {
        const newBoard = await res.json()
        setBoardsData(prev => [...prev, newBoard])
        setSelectedBoardId(newBoard.id)
      }
    } catch (err) {
      console.error('Error adding board:', err)
    }
  }

  async function handleAddColumn(name: string, color: string) {
    try {
      const res = await fetch('/api/creator/pipeline-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'column', nome: name, color, boardId: selectedBoardId })
      })
      if (res.ok) {
        const newCol = await res.json()
        setBoardsData(prev => prev.map(b =>
          b.id === selectedBoardId
            ? { ...b, colunas: [...(b.colunas || []), newCol] }
            : b
        ))
        toast.success('Coluna adicionada!')
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Erro ao criar coluna')
      }
    } catch (err) {
      console.error('Error adding column:', err)
      toast.error('Erro de conexão ao criar coluna')
    }
  }

  async function handleAddCard(cardData: any) {
    try {
      const res = await fetch('/api/creator/pipeline/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: cardData.title,
          descricao: cardData.description,
          valor: cardData.value,
          vencimento: cardData.dueDate,
          prioridade: cardData.priority,
          responsavel: cardData.responsible?.name || '',
          coluna_id: cardData.columnId,
          categoria: cardData.category
        })
      })
      if (res.ok) {
        const newCard = await res.json()
        setBoardsData(prev => prev.map(b => ({
          ...b,
          colunas: (b.colunas || []).map((col: any) =>
            col.id === newCard.coluna_id
              ? { ...col, cards: [...(col.cards || []), newCard] }
              : col
          )
        })))
        toast.success('Card adicionado!')
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Erro ao salvar card')
      }
    } catch (err) {
      console.error('Error adding card:', err)
      toast.error('Erro de conexão ao salvar card')
    }
  }

  async function handleMoveCard(cardId: string, targetColumnId: string) {
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coluna_id: targetColumnId })
      })
      if (res.ok) {
        const updatedCard = await res.json()
        setBoardsData(prev => prev.map(b => ({
          ...b,
          colunas: (b.colunas || []).map((col: any) => ({
            ...col,
            cards: col.id === targetColumnId
              ? [...(col.cards || []).filter((c: any) => c.id !== cardId), updatedCard]
              : (col.cards || []).filter((c: any) => c.id !== cardId)
          }))
        })))
        handleCloseModal()
      }
    } catch (err) {
      console.error('Error moving card:', err)
    }
  }

  async function handleDeleteCard(cardId: string) {
    setIsLostDialogOpen(true)
    setActiveCardId(cardId)
  }

  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)

  async function handleConfirmLost(reason: string) {
    if (!activeCardId) return
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${activeCardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'lost', lost_reason: reason })
      })
      if (res.ok) {
        setBoardsData(prev => prev.map(b => ({
          ...b,
          colunas: (b.colunas || []).map((col: any) => ({
            ...col,
            cards: (col.cards || []).filter((c: any) => c.id !== activeCardId)
          }))
        })))
        setIsLostDialogOpen(false)
        handleCloseModal()
        toast.success('Negociação marcada como PERDIDA.')
      }
    } catch (err) {
      console.error('Error marking as lost:', err)
    }
  }

  async function handleUpdateCard(updatedCard: KanbanCard) {
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${updatedCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: updatedCard.title,
          descricao: updatedCard.description,
          valor: updatedCard.value,
          vencimento: updatedCard.dueDate,
          prioridade: updatedCard.priority,
          responsavel: updatedCard.responsible.name,
          categoria: updatedCard.category
        })
      })
      if (res.ok) {
        setBoardsData(prev => prev.map(b => ({
          ...b,
          colunas: (b.colunas || []).map((col: any) => ({
            ...col,
            cards: (col.cards || []).map((c: any) => c.id === updatedCard.id ? updatedCard : c)
          }))
        })))
        setSelectedCard(updatedCard)
        toast.success('Card atualizado!')
      } else {
        toast.error('Erro ao atualizar o card')
      }
    } catch (err) {
      console.error('Error updating card:', err)
      toast.error('Erro de conexão ao atualizar card')
    }
  }

  function openNewCard(columnId: string) {
    setActiveColumnId(columnId)
    setIsNewCardOpen(true)
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 max-w-full animate-fade-in pb-20">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6 pb-5 md:pb-6 border-b border-[var(--border-main)]">
        <div className="space-y-2 md:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Kanban className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Pipeline Comercial</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-none">
            Pipeline
          </h1>
          <p className="text-[var(--text-muted)] font-bold tracking-wide uppercase text-[10px]">
            GESTÃO DE OPORTUNIDADES • VISÃO KANBAN
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BoardSelector 
            boards={boardsData.map(b => b.nome)} 
            selected={currentBoard?.nome || 'Vendas'} 
            onChange={(name) => {
                const b = boardsData.find(x => x.nome === name)
                if (b) setSelectedBoardId(b.id)
            }} 
          />
          
          <div className="h-10 w-px bg-[var(--border-main)] mx-1 hidden md:block" />

          <button 
            onClick={() => {
              setSelectionMode(!selectionMode)
              setSelectedCardIds([])
            }} 
            className={cn(
              "btn-secondary flex items-center gap-2 text-sm py-2.5 px-4",
              selectionMode && "bg-accent/20 border-accent/40 text-accent"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {selectionMode ? "Sair Seleção" : "Modo Seleção"}
          </button>

          <button onClick={() => setIsArchivedOpen(true)} className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4">
            <ShoppingBag className="w-4 h-4" />
            Arquivados
          </button>

          <button className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4">
            <ArrowUpRight className="w-4 h-4" />
            Importar
          </button>

          <button onClick={() => setIsNewColumnOpen(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
            <Plus className="w-4 h-4" />
            Nova Coluna
          </button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <StatsBar columns={columns} />

      {/* ── Kanban Board ── */}
      <div className="overflow-x-auto pb-4 -mx-6 lg:-mx-10 px-6 lg:px-10">
        <div className="flex gap-4 w-max min-w-full">
          {columns.map((col) => (
            <KanbanColumnComponent
              key={col.id}
              column={col}
              onCardClick={handleCardClick}
              onAddCard={() => openNewCard(col.id)}
              selectionMode={selectionMode}
              selectedCardIds={selectedCardIds}
              onSelectCard={(id) => {
                setSelectedCardIds(prev => 
                  prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                )
              }}
            />
          ))}

          {/* Add column placeholder */}
          <div className="flex-shrink-0 w-72">
            <button onClick={() => setIsNewColumnOpen(true)} className="w-full h-full min-h-[180px] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--border-main)] text-[var(--text-support)] hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider">Nova Coluna</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Card Detail Modal ── */}
      <AnimatePresence>
        {isModalOpen && selectedCard && (
          <CardDetailModal
            card={selectedCard}
            columns={columns}
            onClose={handleCloseModal}
            onMove={handleMoveCard}
            onDelete={handleDeleteCard}
            onUpdate={handleUpdateCard}
          />
        )}
      </AnimatePresence>

      {/* ── New Column Modal ── */}
      <AnimatePresence>
        {isNewColumnOpen && (
          <NewColumnModal
            onClose={() => setIsNewColumnOpen(false)}
            onAdd={handleAddColumn}
          />
        )}
      </AnimatePresence>

      {/* ── New Card Modal ── */}
      <AnimatePresence>
        {isNewCardOpen && (
          <NewCardModal
            columns={columns}
            defaultColumnId={activeColumnId}
            onClose={() => setIsNewCardOpen(false)}
            onAdd={handleAddCard}
          />
        )}
      </AnimatePresence>

      {/* ── New Board Modal ── */}
      <AnimatePresence>
        {isNewBoardOpen && (
          <NewBoardModal
            onClose={() => setIsNewBoardOpen(false)}
            onAdd={handleAddBoard}
          />
        )}
      </AnimatePresence>

      {/* ── Bulk Actions Bar ── */}
      <AnimatePresence>
        {selectionMode && selectedCardIds.length > 0 && (
          <BulkActionBar 
            selectedCount={selectedCardIds.length} 
            onClose={() => { setSelectionMode(false); setSelectedCardIds([]) }}
            onAction={(action) => {
              if (action === 'delete') {
                if (confirm(`Deseja excluir ${selectedCardIds.length} cards permanentemente?`)) {
                   // logic for bulk delete
                }
              }
              toast.success(`Ação "${action}" em massa implementada em breve!`)
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Archived Modal ── */}
      <AnimatePresence>
        {isArchivedOpen && (
          <ArchivedModal 
            onClose={() => setIsArchivedOpen(false)}
            onRestore={async (id) => {
              await handleUpdateCard({ id, status: 'open' } as any)
              setIsArchivedOpen(false)
              toast.success('Negociação reaberta!')
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Lost Reason Dialog ── */}
      <AnimatePresence>
        {isLostDialogOpen && (
          <LostReasonDialog 
            onClose={() => setIsLostDialogOpen(false)}
            onConfirm={handleConfirmLost}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
