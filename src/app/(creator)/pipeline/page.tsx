'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  ChevronDown,
  DollarSign,
  User,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Star,
  FileDown,
  Kanban,
  Check,
  Archive,
  LayoutGrid,
  Pencil,
  Activity,
  Clock,
  ExternalLink,
  Database,
  CheckCircle2,
  FileText,
  Mail,
  Calendar,
  ArrowRight,
  BarChart2,
  Users,
  Square,
  ChevronRight,
  Trophy,
  XCircle,
  Search,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkedContact {
  id?: string
  name: string
  phone: string
  email?: string
}

interface Responsible {
  name: string
  initials: string
  color: string
  avatar_url?: string
}

interface KanbanCard {
  id: string
  title: string
  category: string
  categoryColor: string
  priority: string
  responsible: Responsible
  dueDate: string
  value: number
  description: string
  columnId: string
  status: string
  createdAt?: string
  linkedContact?: LinkedContact
}

interface KanbanColumn {
  id: string
  name: string
  color: string
  probabilidade: number
  slaHoras?: number
  cards: KanbanCard[]
}

interface Vendor {
  id: string
  nome: string
  cor: string
  avatar_url?: string
}

interface Board {
  id: string
  nome: string
  is_default: boolean
}

interface Activity {
  id: string
  tipo: string
  titulo: string | null
  descricao: string
  status: string
  data: string
  contato: { id: string; nome: string }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const TIPO_ACTIVITY: Record<string, { label: string; color: string; bg: string; border: string; Icon: any }> = {
  phone:   { label: 'Ligação',  color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    Icon: Phone },
  email:   { label: 'Email',    color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     Icon: Mail },
  message: { label: 'WhatsApp', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: MessageSquare },
  meeting: { label: 'Reunião',  color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  Icon: Users },
  note:    { label: 'Nota',     color: 'text-white/50',    bg: 'bg-white/5',        border: 'border-white/10',       Icon: FileText },
  task:    { label: 'Tarefa',   color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   Icon: CheckCircle2 },
}

// ─── Card Component ───────────────────────────────────────────────────────────

function KanbanCardItem({
  card,
  onClick,
  isSelectMode,
  isSelected,
  onToggleSelect,
}: {
  card: KanbanCard
  onClick: () => void
  isSelectMode: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
}) {
  const isEmerald = card.category === 'LEAD AP'

  const handleClick = () => {
    if (isSelectMode) { onToggleSelect(card.id); return }
    onClick()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: isSelectMode ? 1 : 1.015, y: isSelectMode ? 0 : -3 }}
      onClick={handleClick}
      className={cn(
        'relative cursor-pointer rounded-2xl border bg-[#0D0D0E] p-5',
        'transition-all duration-200 border-l-4',
        isSelected
          ? 'border-primary/60 bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-white/5 hover:border-white/10 hover:shadow-xl'
      )}
      style={{ borderLeftColor: isSelected ? undefined : isEmerald ? '#10B981' : '#F59E0B' }}
    >
      {/* Selection checkbox */}
      {isSelectMode && (
        <div className={cn(
          'absolute top-3 right-3 w-5 h-5 rounded flex items-center justify-center border transition-all',
          isSelected ? 'bg-primary border-primary' : 'bg-white/5 border-white/20 hover:border-primary/40'
        )}>
          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('mt-0.5 w-2 h-2 flex-shrink-0 rounded-full', isEmerald ? 'bg-emerald-500' : 'bg-amber-500')} />
          <h3 className="text-sm font-bold text-white/90 leading-tight truncate">{card.title}</h3>
        </div>
        {!isSelectMode && (
          <button onClick={e => e.stopPropagation()} className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contact info */}
      <div className="space-y-1 mb-5">
        {card.linkedContact?.name && <p className="text-xs text-white/40 font-medium">{card.linkedContact.name}</p>}
        {card.linkedContact?.phone && (
          <div className="flex items-center gap-1.5 text-[11px] text-white/20">
            <Phone className="w-3 h-3" /><span>{card.linkedContact.phone}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2 w-fit px-2.5 py-1 rounded-full bg-[hsl(215_100%_50%/0.08)] border border-[hsl(215_100%_50%/0.15)]">
          <div className="w-4 h-4 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center flex-shrink-0">
            {card.responsible.avatar_url ? (
              <img src={card.responsible.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-2.5 h-2.5 text-primary" />
            )}
          </div>
          <span className="text-[9px] font-bold text-primary uppercase tracking-wide">{card.responsible.name}</span>
        </div>

        <div className={cn('flex items-center gap-2 w-fit px-2.5 py-1 rounded-full border', isEmerald ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')}>
          <div className={cn('w-1.5 h-1.5 rounded-full', isEmerald ? 'bg-emerald-500' : 'bg-amber-500')} />
          <span className="text-[9px] font-bold uppercase tracking-wide">{card.category}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
        <span className="text-sm font-bold text-primary">{formatCurrency(card.value)}</span>
        <MessageSquare className="w-4 h-4 text-emerald-500/30" />
      </div>
    </motion.div>
  )
}

// ─── Column Component ─────────────────────────────────────────────────────────

function KanbanColumnComponent({
  column,
  onCardClick,
  isSelectMode,
  selectedCards,
  onToggleSelect,
}: {
  column: KanbanColumn
  onCardClick: (card: KanbanCard) => void
  isSelectMode: boolean
  selectedCards: Set<string>
  onToggleSelect: (id: string) => void
}) {
  const totalValue = column.cards.reduce((sum, c) => sum + (c.value || 0), 0)

  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col gap-5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-bold text-white">{column.name}</span>
          <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-md">{column.cards.length}</span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <DollarSign className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      <div className="h-[3px] w-full bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: '40%', backgroundColor: column.color }} />
      </div>

      <div className="flex flex-col gap-3 flex-1 min-h-[400px] pb-10">
        <AnimatePresence>
          {column.cards.map(card => (
            <KanbanCardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
              isSelectMode={isSelectMode}
              isSelected={selectedCards.has(card.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </AnimatePresence>
        {!isSelectMode && (
          <button className="w-full py-3.5 border border-dashed border-white/[0.06] rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/10 hover:text-white/20 hover:border-white/10 transition-all">
            + Novo Card
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Archived Modal ───────────────────────────────────────────────────────────

function ArchivedModal({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/creator/pipeline/cards/archived')
      .then(r => r.json())
      .then(data => setCards(Array.isArray(data) ? data : []))
      .catch(() => setCards([]))
      .finally(() => setIsLoading(false))
  }, [])

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
        className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-[#0A0A0B] border-l border-white/5 z-[70] flex flex-col shadow-2xl"
      >
        <div className="p-8 pb-6 border-b border-white/[0.04] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Archive className="w-5 h-5 text-white/30" />
              Deals Arquivados
            </h2>
            <p className="text-xs text-white/30 mt-1">Deals ganhos e perdidos</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-3 scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-white/20">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <Archive className="w-10 h-10 text-white/5" />
              <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Nenhum deal arquivado</p>
            </div>
          ) : (
            cards.map(card => (
              <div key={card.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-white/90">{card.titulo}</p>
                    {card.fechado_em && (
                      <p className="text-[10px] text-white/30 mt-0.5">{formatDate(card.fechado_em)}</p>
                    )}
                  </div>
                  <span className={cn(
                    'px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border',
                    card.status === 'won'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  )}>
                    {card.status === 'won' ? (
                      <span className="flex items-center gap-1"><Trophy className="w-2.5 h-2.5" /> Ganho</span>
                    ) : (
                      <span className="flex items-center gap-1"><XCircle className="w-2.5 h-2.5" /> Perdido</span>
                    )}
                  </span>
                </div>
                {card.valor && (
                  <p className="text-sm font-bold text-primary">{formatCurrency(card.valor)}</p>
                )}
                {card.lost_reason && (
                  <p className="text-xs text-white/30 italic">"{card.lost_reason}"</p>
                )}
                {card.vendedor && (
                  <p className="text-[10px] text-white/30 uppercase font-bold">{card.vendedor.nome}</p>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </>
  )
}

// ─── Bulk Action Toolbar ──────────────────────────────────────────────────────

function BulkActionToolbar({
  selectedCount,
  columns,
  vendors,
  onApply,
  onCancel,
}: {
  selectedCount: number
  columns: KanbanColumn[]
  vendors: Vendor[]
  onApply: (field: string, value: any) => Promise<void>
  onCancel: () => void
}) {
  const [applyingField, setApplyingField] = useState<string | null>(null)
  const [valor, setValor] = useState('')
  const [origem, setOrigem] = useState('')

  const handleApply = async (field: string, value: any) => {
    if (!value && value !== 0) return
    setApplyingField(field)
    await onApply(field, value)
    setApplyingField(null)
    setValor('')
    setOrigem('')
  }

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
    >
      <div className="bg-[#0D0D0E] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
            </div>
            <span className="text-sm font-bold text-white">{selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="w-[1px] h-5 bg-white/10" />

          {/* Mudar Coluna */}
          <select
            onChange={e => { if (e.target.value) handleApply('coluna_id', e.target.value) }}
            disabled={!!applyingField}
            className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold text-white/60 outline-none hover:border-white/20 transition-all cursor-pointer disabled:opacity-40"
          >
            <option value="">Mudar Coluna</option>
            {columns.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
          </select>

          {/* Mudar Vendedor */}
          <select
            onChange={e => { if (e.target.value) handleApply('vendedor_id', e.target.value) }}
            disabled={!!applyingField}
            className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold text-white/60 outline-none hover:border-white/20 transition-all cursor-pointer disabled:opacity-40"
          >
            <option value="">Mudar Vendedor</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>

          {/* Mudar Status */}
          <select
            onChange={e => { if (e.target.value) handleApply('status', e.target.value) }}
            disabled={!!applyingField}
            className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold text-white/60 outline-none hover:border-white/20 transition-all cursor-pointer disabled:opacity-40"
          >
            <option value="">Mudar Status</option>
            <option value="open">Aberto</option>
            <option value="won">Ganho</option>
            <option value="lost">Perdido</option>
          </select>

          {/* Mudar Valor */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Valor R$"
              value={valor}
              onChange={e => setValor(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white/60 outline-none w-24 hover:border-white/20 transition-all"
            />
            {valor && (
              <button
                onClick={() => handleApply('valor', Number(valor))}
                disabled={!!applyingField}
                className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-2 rounded-lg hover:bg-primary/20 transition-all disabled:opacity-40"
              >
                OK
              </button>
            )}
          </div>

          {/* Mudar Origem */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="Origem"
              value={origem}
              onChange={e => setOrigem(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white/60 outline-none w-24 hover:border-white/20 transition-all"
            />
            {origem && (
              <button
                onClick={() => handleApply('origem', origem)}
                disabled={!!applyingField}
                className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-2 rounded-lg hover:bg-primary/20 transition-all disabled:opacity-40"
              >
                OK
              </button>
            )}
          </div>

          {applyingField && <Loader2 className="w-4 h-4 text-primary animate-spin" />}

          <button
            onClick={onCancel}
            className="ml-auto px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white text-[11px] font-bold transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Card Detail Modal ────────────────────────────────────────────────────────

function CardDetailModal({
  card,
  columns,
  onClose,
}: {
  card: KanbanCard
  columns: KanbanColumn[]
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<string>('dados')
  const [activityFilter, setActivityFilter] = useState<string>('todas')
  const [cardActivities, setCardActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [newActivityTipo, setNewActivityTipo] = useState<string | null>(null)
  const [newActivityDesc, setNewActivityDesc] = useState('')
  const [savingActivity, setSavingActivity] = useState(false)

  const isEmerald = card.category === 'LEAD AP'
  const initials = card.linkedContact?.name
    ? card.linkedContact.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  useEffect(() => {
    if (activeTab !== 'atividades') return
    setActivitiesLoading(true)
    fetch(`/api/creator/atividades?deal_id=${card.id}`)
      .then(r => r.json())
      .then(data => setCardActivities(Array.isArray(data) ? data : []))
      .catch(() => setCardActivities([]))
      .finally(() => setActivitiesLoading(false))
  }, [activeTab, card.id])

  const filteredCardActivities = cardActivities.filter(a => {
    if (activityFilter === 'pendentes') return a.status === 'pendente'
    if (activityFilter === 'concluidas') return a.status === 'concluida'
    return true
  })

  const handleCreateActivity = async () => {
    if (!newActivityTipo || !card.linkedContact?.id) return
    setSavingActivity(true)
    try {
      const res = await fetch('/api/creator/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contato_id: card.linkedContact.id,
          deal_id: card.id,
          tipo: newActivityTipo,
          descricao: newActivityDesc || `${TIPO_ACTIVITY[newActivityTipo]?.label} para ${card.linkedContact.name}`,
          status: 'pendente',
          data: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        const newAct = await res.json()
        setCardActivities(prev => [newAct, ...prev])
        setNewActivityTipo(null)
        setNewActivityDesc('')
        toast.success('Atividade criada!')
      }
    } finally {
      setSavingActivity(false)
    }
  }

  const handleToggleActivityStatus = async (activity: Activity) => {
    const newStatus = activity.status === 'concluida' ? 'pendente' : 'concluida'
    const res = await fetch(`/api/creator/atividades/${activity.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCardActivities(prev => prev.map(a => a.id === activity.id ? updated : a))
    }
  }

  const currentColumn = columns.find(c => c.id === card.columnId)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 right-0 h-full w-full max-w-[600px] bg-[#0A0A0B] border-l border-white/5 z-[70] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 pb-6 border-b border-white/[0.04] bg-white/[0.01]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-lg">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">{card.title}</h2>
                  <button className="text-white/20 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                </div>
                <p className="text-xs text-white/40">{card.linkedContact?.name || 'Sem contato vinculado'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap mb-8">
            <span className="text-2xl font-bold text-primary mr-2">{formatCurrency(card.value)}</span>
            <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white uppercase tracking-widest">Aberto</span>
            <span className={cn('px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5', isEmerald ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')}>
              <div className={cn('w-1.5 h-1.5 rounded-full', isEmerald ? 'bg-emerald-500' : 'bg-amber-500')} />
              {card.category}
            </span>
            {currentColumn && (
              <span className="px-4 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest ml-auto shadow-lg" style={{ backgroundColor: currentColumn.color }}>
                {currentColumn.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{cardActivities.length} atividade{cardActivities.length !== 1 ? 's' : ''}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {cardActivities.filter(a => a.status === 'pendente').length} pendentes
                </p>
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {card.createdAt ? Math.floor((Date.now() - new Date(card.createdAt).getTime()) / 86400000) : 0} dias
                </p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">neste estágio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-8 border-b border-white/[0.04] overflow-x-auto scrollbar-none">
          {(['dados', 'utm', 'atividades', 'historico', 'anotacoes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn('py-5 px-4 text-[11px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap', activeTab === tab ? 'text-primary' : 'text-white/30 hover:text-white/60')}
            >
              {tab}
              {tab === 'atividades' && cardActivities.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[9px] font-bold">{cardActivities.length}</span>
              )}
              {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <AnimatePresence mode="wait">

            {activeTab === 'dados' && (
              <motion.div key="dados" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    <User className="w-3.5 h-3.5" /> Contato Vinculado
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold">{initials}</div>
                      <div>
                        <p className="text-sm font-bold text-white">{card.linkedContact?.name}</p>
                        <p className="text-[11px] text-white/40 flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" />{card.linkedContact?.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/[0.05] flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5" /> Ver
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:bg-emerald-500/20 flex items-center gap-2">
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    <Database className="w-3.5 h-3.5" /> Informações do Deal
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Produto</p>
                      <p className="text-sm text-white/80 font-bold">Sistema/App</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Prioridade</p>
                      <span className={cn('px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit', isEmerald ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')}>
                        <div className={cn('w-1.5 h-1.5 rounded-full', isEmerald ? 'bg-emerald-500' : 'bg-amber-500')} />
                        {card.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Responsável</p>
                      <p className="text-sm text-white/80 font-bold">{card.responsible.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Valor</p>
                      <p className="text-sm text-primary font-bold">{formatCurrency(card.value)}</p>
                    </div>
                    {card.createdAt && (
                      <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Criado</p>
                        <p className="text-sm text-white/80 font-bold">{formatDate(card.createdAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'atividades' && (
              <motion.div key="atividades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Filter */}
                <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-1">
                  {(['todas', 'pendentes', 'concluidas'] as const).map(f => (
                    <button key={f} onClick={() => setActivityFilter(f)} className={cn('flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all', activityFilter === f ? 'bg-white/[0.05] text-white shadow-md' : 'text-white/30 hover:text-white/60')}>
                      {f === 'todas' ? `Todas (${cardActivities.length})` : f === 'pendentes' ? `Pendentes (${cardActivities.filter(a => a.status === 'pendente').length})` : `Concluídas (${cardActivities.filter(a => a.status === 'concluida').length})`}
                    </button>
                  ))}
                </div>

                {/* New Activity Type Selector */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TIPO_ACTIVITY).map(([key, cfg]) => {
                    const Icon = cfg.Icon
                    return (
                      <button
                        key={key}
                        onClick={() => setNewActivityTipo(prev => prev === key ? null : key)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all',
                          newActivityTipo === key
                            ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                            : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60 hover:border-white/10'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" /> {cfg.label}
                      </button>
                    )
                  })}
                </div>

                {/* Inline activity creation form */}
                <AnimatePresence>
                  {newActivityTipo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <textarea
                        placeholder={`Descreva a ${TIPO_ACTIVITY[newActivityTipo]?.label.toLowerCase()}...`}
                        value={newActivityDesc}
                        onChange={e => setNewActivityDesc(e.target.value)}
                        rows={2}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setNewActivityTipo(null); setNewActivityDesc('') }}
                          className="px-4 py-2 rounded-xl border border-white/10 text-white/40 text-xs font-bold hover:text-white transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleCreateActivity}
                          disabled={savingActivity || !card.linkedContact?.id}
                          className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          {savingActivity ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          Salvar Atividade
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Activity List */}
                {activitiesLoading ? (
                  <div className="flex items-center justify-center h-20 text-white/20">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : filteredCardActivities.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Calendar className="w-10 h-10 text-white/5" />
                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Nenhuma atividade</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCardActivities.map(activity => {
                      const cfg = TIPO_ACTIVITY[activity.tipo] || TIPO_ACTIVITY.note
                      const Icon = cfg.Icon
                      return (
                        <div key={activity.id} className={cn('flex items-start gap-3 p-4 rounded-2xl border transition-all', cfg.bg, cfg.border)}>
                          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg, cfg.border)}>
                            <Icon className={cn('w-4 h-4', cfg.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-bold', cfg.color, activity.status === 'concluida' && 'line-through opacity-50')}>
                              {activity.titulo || activity.descricao}
                            </p>
                            {activity.titulo && (
                              <p className="text-xs text-white/30 mt-0.5 truncate">{activity.descricao}</p>
                            )}
                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">
                              {new Date(activity.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {new Date(activity.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleToggleActivityStatus(activity)}
                            className={cn(
                              'w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0 transition-all',
                              activity.status === 'concluida'
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/5 border-white/10 text-white/20 hover:border-emerald-500/30 hover:text-emerald-400'
                            )}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'historico' && (
              <motion.div key="historico" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 pl-4">
                <div className="relative border-l border-white/10 pb-8 space-y-10">
                  <div className="relative pl-8">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                        <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5">Nova Lead</span>
                        <ArrowRight className="w-3 h-3 text-white/20" />
                        <span className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400">Qualificação</span>
                      </div>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                        {card.createdAt ? formatDate(card.createdAt) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                      <p className="text-sm font-bold text-white mb-1">Deal criado</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                        {card.createdAt ? formatDate(card.createdAt) : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'anotacoes' && (
              <motion.div key="anotacoes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    <FileText className="w-3.5 h-3.5" /> Anotações do Deal
                  </div>
                  <textarea className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all resize-none" placeholder="Registre informações importantes sobre este lead: dores, objeções, próximos passos..." />
                  <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 px-6 py-2 rounded-xl text-xs font-bold transition-all">Salvar</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'utm' && (
              <motion.div key="utm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center justify-center opacity-30">
                <BarChart2 className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Nenhuma UTM rastreada</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/[0.04] bg-[#0A0A0B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[Phone, MessageSquare, Mail].map((Icon, i) => (
              <button key={i} className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.05] transition-all">
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 rounded-xl border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 text-xs font-bold flex items-center gap-2 transition-all">
              <CheckCircle2 className="w-4 h-4" /> Ganho
            </button>
            <button className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold flex items-center gap-2 transition-all">
              <X className="w-4 h-4" /> Perdido
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Selection mode
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())

  // Archived
  const [showArchived, setShowArchived] = useState(false)

  // Pipeline board selector
  const [boards, setBoards] = useState<Board[]>([])
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null)
  const [showBoardDropdown, setShowBoardDropdown] = useState(false)

  // Vendors
  const [vendedores, setVendedores] = useState<Vendor[]>([])

  const loadPipeline = useCallback(async (boardId?: string) => {
    setIsLoading(true)
    try {
      const url = boardId ? `/api/creator/pipeline?board_id=${boardId}` : '/api/creator/pipeline'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.columns) setColumns(data.columns)
        if (data.boards) setBoards(data.boards)
        if (data.vendedores) setVendedores(data.vendedores)
        if (data.currentBoardId) setCurrentBoardId(data.currentBoardId)
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadPipeline() }, [loadPipeline])

  const toggleSelect = useCallback((id: string) => {
    setSelectedCards(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = () => {
    const allIds = columns.flatMap(c => c.cards.map(card => card.id))
    setSelectedCards(prev => prev.size === allIds.length ? new Set() : new Set(allIds))
  }

  const handleBulkApply = async (field: string, value: any) => {
    if (!value && value !== 0) return

    const ids = Array.from(selectedCards)
    const promises = ids.map(cardId =>
      fetch(`/api/creator/pipeline/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
    )

    await Promise.all(promises)

    if (field === 'coluna_id') {
      setColumns(prev => {
        const cardsToMove = prev.flatMap(c => c.cards).filter(c => selectedCards.has(c.id))
        return prev.map(col => {
          if (col.id === value) {
            const existing = col.cards.filter(c => !selectedCards.has(c.id))
            return { ...col, cards: [...existing, ...cardsToMove.map(c => ({ ...c, columnId: value }))] }
          }
          return { ...col, cards: col.cards.filter(c => !selectedCards.has(c.id)) }
        })
      })
    } else if (field === 'vendedor_id') {
      const vendedor = vendedores.find(v => v.id === value)
      if (vendedor) {
        setColumns(prev => prev.map(col => ({
          ...col,
          cards: col.cards.map(card =>
            selectedCards.has(card.id)
              ? { ...card, responsible: { name: vendedor.nome, initials: vendedor.nome.substring(0, 2).toUpperCase(), color: vendedor.cor, avatar_url: vendedor.avatar_url } }
              : card
          )
        })))
      }
    } else if (field === 'valor') {
      setColumns(prev => prev.map(col => ({
        ...col,
        cards: col.cards.map(card => selectedCards.has(card.id) ? { ...card, value: Number(value) } : card)
      })))
    } else if (field === 'status') {
      if (value !== 'open') {
        setColumns(prev => prev.map(col => ({
          ...col,
          cards: col.cards.filter(card => !selectedCards.has(card.id))
        })))
      }
    }

    toast.success(`${ids.length} deal${ids.length !== 1 ? 's' : ''} atualizado${ids.length !== 1 ? 's' : ''}!`)
    setSelectedCards(new Set())
    setIsSelectMode(false)
  }

  const currentBoard = boards.find(b => b.id === currentBoardId)
  const totalCards = columns.reduce((a, c) => a + c.cards.length, 0)
  const totalValue = columns.reduce((a, c) => a + c.cards.reduce((s, card) => s + (card.value || 0), 0), 0)

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#050505] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="p-8 lg:p-10 pb-0 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Kanban className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white">Pipeline</h1>
            </div>

            {/* Board dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBoardDropdown(v => !v)}
                className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl hover:border-white/10 transition-all"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm font-bold text-white/80">{currentBoard?.nome || 'Pipeline Padrão'}</span>
                <ChevronDown className="w-4 h-4 text-white/20" />
              </button>

              <AnimatePresence>
                {showBoardDropdown && boards.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-[#111113] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {boards.map(board => (
                      <button
                        key={board.id}
                        onClick={() => { loadPipeline(board.id); setShowBoardDropdown(false) }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors',
                          board.id === currentBoardId ? 'text-primary' : 'text-white/60'
                        )}
                      >
                        <Star className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-sm font-bold">{board.nome}</span>
                        {board.id === currentBoardId && <Check className="w-3.5 h-3.5 ml-auto" strokeWidth={3} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (isSelectMode) { setIsSelectMode(false); setSelectedCards(new Set()) }
                else setIsSelectMode(true)
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-colors',
                isSelectMode
                  ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'bg-white/[0.03] border-white/5 text-white/50 hover:text-white'
              )}
            >
              <Check className="w-3.5 h-3.5" />
              {isSelectMode ? `${selectedCards.size} sel.` : 'Selecionar'}
            </button>

            {isSelectMode && (
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                <Square className="w-3.5 h-3.5" /> Todos
              </button>
            )}

            <button
              onClick={() => setShowArchived(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              <Archive className="w-3.5 h-3.5" /> Arquivados
            </button>

            <button
              onClick={() => setShowBoardDropdown(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Pipeline
            </button>

            <button
              onClick={() => toast('Importação via CSV em breve', { icon: '🚧' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" /> Importar
            </button>

            <button
              onClick={() => toast('Criação rápida de deal em breve', { icon: '🚧' })}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Deal
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-white/40">{totalCards} deals ativos</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{formatCurrency(totalValue)} total</span>
          </div>
          {isSelectMode && selectedCards.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-bold">{selectedCards.size} selecionado{selectedCards.size !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-8 lg:p-10 scrollbar-none">
        {isLoading ? (
          <div className="flex gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-[300px] h-[600px] bg-white/[0.01] border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-8 min-w-max">
            {columns.map(col => (
              <KanbanColumnComponent
                key={col.id}
                column={col}
                onCardClick={setSelectedCard}
                isSelectMode={isSelectMode}
                selectedCards={selectedCards}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Detail Drawer */}
      <AnimatePresence>
        {selectedCard && !isSelectMode && (
          <CardDetailModal
            card={selectedCard}
            columns={columns}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>

      {/* Archived Drawer */}
      <AnimatePresence>
        {showArchived && <ArchivedModal onClose={() => setShowArchived(false)} />}
      </AnimatePresence>

      {/* Bulk Action Toolbar */}
      <AnimatePresence>
        {isSelectMode && selectedCards.size > 0 && (
          <BulkActionToolbar
            selectedCount={selectedCards.size}
            columns={columns}
            vendors={vendedores}
            onApply={handleBulkApply}
            onCancel={() => { setIsSelectMode(false); setSelectedCards(new Set()) }}
          />
        )}
      </AnimatePresence>

      {/* Board dropdown backdrop */}
      {showBoardDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowBoardDropdown(false)} />
      )}
    </div>
  )
}
