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
  ChevronRight,
  XCircle,
} from 'lucide-react'
import { format, parseISO, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

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
}

interface KanbanColumn {
  id: string
  name: string
  color: string
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
  { id: 'leads',       name: 'Leads',        color: '#3B82F6', cards: [] },
  { id: 'qualificacao',name: 'Qualificação', color: '#F59E0B', cards: [] },
  { id: 'proposta',    name: 'Proposta',     color: '#2563EB', cards: [] },
  { id: 'fechado',     name: 'Fechado',      color: '#8B5CF6', cards: [] },
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
      className={`${sizeClass} rounded-full flex items-center justify-center font-black text-white flex-shrink-0`}
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
}: {
  card: KanbanCard
  onClick: () => void
}) {
  const overdue = isOverdue(card.dueDate)
  const catClass = categoryColorMap[card.categoryColor] || categoryColorMap.blue

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className="bg-dark-muted border border-white/5 rounded-xl p-4 cursor-pointer hover:border-white/10 hover:shadow-card transition-all duration-200 group"
    >
      {/* Title & category */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-semibold text-white leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {card.title}
        </p>
        <span className={`badge ${catClass} whitespace-nowrap flex-shrink-0 text-[10px]`}>
          {card.category}
        </span>
      </div>

      {/* Priority */}
      <div className="mb-3">
        <PriorityDot priority={card.priority} />
      </div>

      {/* Value */}
      <div className="flex items-center gap-1.5 mb-3">
        <DollarSign className="w-3 h-3 text-accent flex-shrink-0" />
        <span className="text-xs font-black text-accent">{formatCurrency(card.value)}</span>
      </div>

      {/* Footer: responsible + due date */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar initials={card.responsible.initials} color={card.responsible.color} />
          <span className="text-[10px] text-gray-500 truncate">{card.responsible.name.split(' ')[0]}</span>
        </div>
        <div className={`flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-gray-500'}`}>
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
}: {
  column: KanbanColumn
  onCardClick: (card: KanbanCard) => void
  onAddCard: () => void
}) {
  const totalValue = column.cards.reduce((sum, c) => sum + c.value, 0)

  return (
    <div className="flex-shrink-0 w-72 flex flex-col gap-3">
      {/* Column header */}
      <div className="bg-dark-card border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: column.color, boxShadow: `0 0 8px ${column.color}60` }}
            />
            <span className="text-sm font-black text-white uppercase tracking-wider">{column.name}</span>
          </div>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px] font-black text-gray-300">
            {column.cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-accent" />
          <span className="text-[11px] font-bold text-accent">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex flex-col gap-2.5 min-h-[100px]">
        <AnimatePresence mode="popLayout">
          {column.cards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-xl text-gray-600"
            >
              <LayoutGrid className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs font-medium">Nenhum card</p>
            </motion.div>
          ) : (
            column.cards.map((card) => (
              <KanbanCardItem key={card.id} card={card} onClick={() => onCardClick(card)} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add card button */}
      <button onClick={onAddCard} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-gray-600 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-200 text-xs font-semibold">
        <Plus className="w-3.5 h-3.5" />
        Adicionar Card
      </button>
    </div>
  )
}

// ─── Card Detail Drawer ────────────────────────────────────────────────────────

type DrawerTab = 'dados' | 'historico' | 'comentarios'

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
  onUpdate: (cardId: string, data: Record<string, unknown>) => Promise<void>
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('dados')
  const [editMode, setEditMode] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [saving, setSaving] = useState(false)

  // Editable mirrors — synced from card prop
  const [editTitle, setEditTitle] = useState(card.title)
  const [editValue, setEditValue] = useState(String(card.value || 0))
  const [editDueDate, setEditDueDate] = useState(card.dueDate || '')
  const [editPriority, setEditPriority] = useState<Priority>(card.priority)
  const [editResponsible, setEditResponsible] = useState(card.responsible.name)
  const [editDescription, setEditDescription] = useState(card.description || '')
  const [editCategory, setEditCategory] = useState(card.category || '')

  // Comments (local only)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<{ id: string; text: string; user: string; date: string }[]>([])

  // Sync edit state when card prop updates (e.g. after save)
  useEffect(() => {
    setEditTitle(card.title)
    setEditValue(String(card.value || 0))
    setEditDueDate(card.dueDate || '')
    setEditPriority(card.priority)
    setEditResponsible(card.responsible.name)
    setEditDescription(card.description || '')
    setEditCategory(card.category || '')
  }, [card])

  const overdue = card.dueDate ? isOverdue(card.dueDate) : false
  const catClass = categoryColorMap[card.categoryColor] || categoryColorMap.blue
  const currentColIdx = columns.findIndex((c) => c.id === card.columnId)
  const nextCol = columns[currentColIdx + 1]

  function handleCancelEdit() {
    setEditTitle(card.title)
    setEditValue(String(card.value || 0))
    setEditDueDate(card.dueDate || '')
    setEditPriority(card.priority)
    setEditResponsible(card.responsible.name)
    setEditDescription(card.description || '')
    setEditCategory(card.category || '')
    setEditMode(false)
    setEditingTitle(false)
  }

  async function handleSave() {
    if (!editTitle.trim()) return
    setSaving(true)
    try {
      await onUpdate(card.id, {
        titulo: editTitle.trim(),
        valor: parseFloat(editValue.replace(',', '.')) || 0,
        vencimento: editDueDate || null,
        prioridade: editPriority,
        responsavel: editResponsible,
        descricao: editDescription,
        categoria: editCategory,
      })
      setEditMode(false)
      setEditingTitle(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleTitleSave() {
    if (!editTitle.trim()) { setEditTitle(card.title); setEditingTitle(false); return }
    if (editTitle === card.title) { setEditingTitle(false); return }
    setSaving(true)
    try {
      await onUpdate(card.id, { titulo: editTitle.trim() })
    } finally {
      setSaving(false)
      setEditingTitle(false)
    }
  }

  function handleSendComment() {
    if (!comment.trim()) return
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), text: comment.trim(), user: 'Você', date: new Date().toISOString() },
    ])
    setComment('')
  }

  async function handleGanho() {
    const lastCol = columns[columns.length - 1]
    if (lastCol && lastCol.id !== card.columnId) {
      await onMove(card.id, lastCol.id)
    }
    onClose()
  }

  function handlePerdido() {
    if (confirm('Marcar como perdido e excluir este card?')) {
      onDelete(card.id)
    }
  }

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'dados', label: 'Dados' },
    { key: 'historico', label: 'Histórico' },
    { key: 'comentarios', label: comments.length > 0 ? `Comentários (${comments.length})` : 'Comentários' },
  ]

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={editMode ? undefined : onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0D1117] border-l border-white/5 z-50 flex flex-col shadow-2xl"
      >

        {/* ── HEADER ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-white/5">
          {/* Top row: badges + actions */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`badge ${catClass} text-[10px]`}>{card.category}</span>
            <PriorityDot priority={editMode ? editPriority : card.priority} />
            {overdue && !editMode && (
              <span className="badge bg-red-500/10 border-red-500/20 text-red-400 text-[10px]">Vencido</span>
            )}
            <div className="ml-auto flex items-center gap-1.5">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-[11px] font-bold transition-all"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
              ) : (
                <span className="text-[11px] font-bold text-accent px-2">Modo edição</span>
              )}
              <button
                onClick={() => { if (confirm('Excluir este card?')) onDelete(card.id) }}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-400/20 transition-all"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={editMode ? handleCancelEdit : onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title with inline edit */}
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave()
                  if (e.key === 'Escape') { setEditTitle(card.title); setEditingTitle(false) }
                }}
                className="flex-1 text-lg font-black text-white bg-white/5 border border-accent/40 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleTitleSave}
                disabled={saving}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-black hover:opacity-90 transition-all flex-shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setEditTitle(card.title); setEditingTitle(false) }}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white transition-all flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 group">
              <h2 className="text-xl font-black text-white leading-tight flex-1">{editTitle}</h2>
              <button
                onClick={() => setEditingTitle(true)}
                className="w-6 h-6 flex items-center justify-center rounded text-gray-700 hover:text-accent opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* ── METRICS ROW ── */}
        <div className="flex-shrink-0 grid grid-cols-3 gap-2 px-5 py-3 border-b border-white/5">
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider mb-1">Valor</p>
            <p className="text-sm font-black text-accent truncate">{formatCurrency(card.value)}</p>
          </div>
          <div className={`bg-white/[0.03] rounded-xl p-3 border ${overdue ? 'border-red-500/20' : 'border-white/5'}`}>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider mb-1">Vencimento</p>
            <p className={`text-sm font-black truncate ${overdue ? 'text-red-400' : 'text-white'}`}>
              {card.dueDate ? formatDate(card.dueDate) : '—'}
            </p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider mb-1">Prioridade</p>
            <PriorityDot priority={card.priority} />
          </div>
        </div>

        {/* ── PIPELINE STAGES ── */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-white/5">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider mb-2">Estágio atual</p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {columns.map((col, idx) => {
              const isCurrent = col.id === card.columnId
              const isPast = idx < currentColIdx
              return (
                <div key={col.id} className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => { if (!isCurrent) onMove(card.id, col.id) }}
                    disabled={isCurrent}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                      isCurrent
                        ? 'bg-accent/15 text-accent border-accent/30 cursor-default'
                        : isPast
                        ? 'bg-accent/5 text-accent/40 border-accent/10 hover:bg-accent/10'
                        : 'bg-white/3 text-gray-600 border-white/5 hover:border-white/15 hover:text-gray-300'
                    }`}
                  >
                    {isCurrent && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-1 mb-px align-middle" />
                    )}
                    {col.name}
                  </button>
                  {idx < columns.length - 1 && (
                    <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isPast || isCurrent ? 'text-accent/25' : 'text-gray-700'}`} />
                  )}
                </div>
              )
            })}
          </div>
          {nextCol && !editMode && (
            <button
              onClick={() => onMove(card.id, nextCol.id)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-white/8 text-[10px] font-bold text-gray-600 hover:text-accent hover:border-accent/25 transition-all"
            >
              <MoveRight className="w-3 h-3" />
              Avançar para {nextCol.name}
            </button>
          )}
        </div>

        {/* ── TABS ── */}
        <div className="flex-shrink-0 flex border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab.key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BODY (scrollable) ── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* TAB: DADOS */}
            {activeTab === 'dados' && (
              <motion.div
                key="dados"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="p-5 space-y-5"
              >
                {/* Responsável + Categoria */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <User className="w-3 h-3" /> Responsável
                    </p>
                    {editMode ? (
                      <input
                        value={editResponsible}
                        onChange={(e) => setEditResponsible(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="Nome do responsável"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Avatar initials={card.responsible.initials} color={card.responsible.color} size="sm" />
                        <span className="text-sm text-white font-semibold truncate">{card.responsible.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Categoria
                    </p>
                    {editMode ? (
                      <input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="Ex: Lead, Produto..."
                      />
                    ) : (
                      <span className={`badge ${catClass} text-[10px]`}>{card.category}</span>
                    )}
                  </div>
                </div>

                {/* Prioridade (edit mode only — view mode já está nos metrics) */}
                {editMode && (
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Prioridade</p>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as Priority)}
                      className="input-field text-sm"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>
                )}

                {/* Valor + Vencimento (edit mode) */}
                {editMode && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Valor (R$)
                      </p>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Vencimento
                      </p>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="input-field py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Descrição */}
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Descrição
                  </p>
                  {editMode ? (
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={5}
                      className="input-field text-sm resize-none"
                      placeholder="Descreva a oportunidade em detalhes..."
                    />
                  ) : (
                    <div className="text-sm text-gray-300 leading-relaxed bg-white/[0.02] rounded-xl p-4 border border-white/5 min-h-[80px]">
                      {card.description
                        ? card.description
                        : <span className="text-gray-600 italic">Sem descrição</span>
                      }
                    </div>
                  )}
                </div>

                {/* Responsible card full (view mode) */}
                {!editMode && (
                  <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">Responsável pelo deal</p>
                    <div className="flex items-center gap-3">
                      <Avatar initials={card.responsible.initials} color={card.responsible.color} size="md" />
                      <div>
                        <p className="text-sm font-bold text-white">{card.responsible.name}</p>
                        <p className="text-[10px] text-gray-500">Vendedor</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: HISTÓRICO */}
            {activeTab === 'historico' && (
              <motion.div
                key="historico"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="p-5"
              >
                {MOCK_HISTORY.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-gray-700" />
                    </div>
                    <p className="text-sm font-bold text-gray-500">Nenhuma movimentação</p>
                    <p className="text-xs text-gray-700 mt-1 max-w-[200px]">
                      O histórico aparecerá conforme o card avançar no pipeline
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {MOCK_HISTORY.map((entry, idx) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                            {idx === MOCK_HISTORY.length - 1
                              ? <CheckCircle2 className="w-3 h-3 text-accent" />
                              : <Circle className="w-3 h-3 text-gray-600" />
                            }
                          </div>
                          {idx < MOCK_HISTORY.length - 1 && (
                            <div className="w-px flex-1 bg-white/5 my-1" />
                          )}
                        </div>
                        <div className="pb-3 min-w-0">
                          <p className="text-xs text-gray-300">
                            <span className="font-semibold text-white">{entry.user}</span>{' '}
                            {entry.action}
                            {entry.to && <span className="text-accent font-semibold"> {entry.to}</span>}
                            {entry.from && entry.to && (
                              <span className="text-gray-500"> (de {entry.from})</span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{formatDateTime(entry.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: COMENTÁRIOS */}
            {activeTab === 'comentarios' && (
              <motion.div
                key="comentarios"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="p-5 space-y-3"
              >
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-3">
                      <MessageSquare className="w-5 h-5 text-gray-700" />
                    </div>
                    <p className="text-sm font-bold text-gray-500">Nenhum comentário</p>
                    <p className="text-xs text-gray-700 mt-1">Use o campo abaixo para adicionar</p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{c.user}</span>
                        <span className="text-[10px] text-gray-600">{formatDateTime(c.date)}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── FOOTER (fixed) ── */}
        <div className="flex-shrink-0 p-4 border-t border-white/5">
          {activeTab === 'comentarios' ? (
            /* Comment input */
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder="Escreva um comentário..."
                className="input-field py-2.5 text-sm flex-1"
              />
              <button
                onClick={handleSendComment}
                disabled={!comment.trim()}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-accent text-black hover:opacity-90 disabled:opacity-30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : editMode ? (
            /* Edit mode actions */
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="flex-1 btn-secondary py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editTitle.trim()}
                className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving
                  ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  : <Check className="w-4 h-4" />
                }
                Salvar alterações
              </button>
            </div>
          ) : (
            /* Deal actions */
            <div className="flex gap-2">
              <button
                onClick={handlePerdido}
                className="flex-1 py-2.5 rounded-xl border border-red-500/25 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Perdido
              </button>
              <button
                onClick={handleGanho}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ganho
              </button>
            </div>
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
      iconBg: overdueCards > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5',
      accent: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="card-hover group border-white/5 bg-white/[0.02] p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0 ${s.iconBg} group-hover:scale-110 transition-transform`}>
            <s.icon className={`w-5 h-5 ${s.iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-0.5">{s.label}</p>
            <p className={`text-2xl font-black leading-none truncate ${s.accent ? 'text-accent' : 'text-white'}`}>
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
            className="absolute top-full left-0 mt-1 w-48 bg-dark-card border border-white/10 rounded-xl shadow-card-hover z-20 overflow-hidden"
          >
            {boards.map((b) => (
              <button
                key={b}
                onClick={() => { onChange(b); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 ${
                  b === selected
                    ? 'text-accent bg-accent/10'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
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
        <div className="bg-dark-card border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Nova Coluna</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white transition-all">
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
  onAdd: (card: KanbanCard) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const [responsible, setResponsible] = useState('')
  const [columnId, setColumnId] = useState(defaultColumnId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const initials = responsible.trim()
      ? responsible.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
      : 'US'
    onAdd({
      id: String(Date.now()),
      title: title.trim(),
      description: description.trim(),
      category: 'Novo',
      categoryColor: 'blue',
      priority,
      responsible: { name: responsible.trim() || 'Sem responsável', initials, color: '#30CB7B' },
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      value: parseFloat(value.replace(',', '.')) || 0,
      columnId,
    })
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
        <div className="bg-dark-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Novo Card</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Título *</label>
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Nome da oportunidade" />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-field resize-none" placeholder="Detalhes do card..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Valor (R$)</label>
                <input value={value} onChange={(e) => setValue(e.target.value)} className="input-field" placeholder="0,00" />
              </div>
              <div>
                <label className="label">Vencimento</label>
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
                <label className="label">Coluna</label>
                <select value={columnId} onChange={(e) => setColumnId(e.target.value)} className="input-field">
                  {columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Responsável</label>
              <input value={responsible} onChange={(e) => setResponsible(e.target.value)} className="input-field" placeholder="Nome do responsável" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancelar</button>
              <button type="submit" disabled={!title.trim()} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-40">Criar Card</button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}

// ─── New Board Modal ───────────────────────────────────────────────────────────

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
        <div className="bg-dark-card border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Novo Board</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white transition-all">
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
    cards: (col.cards || []).map((card: any) => ({
      id: card.id,
      title: card.titulo,
      description: card.descricao,
      value: card.valor || 0,
      dueDate: card.vencimento ? String(card.vencimento).split('T')[0] : '',
      priority: (card.prioridade as Priority) || 'media',
      columnId: card.coluna_id,
      category: card.categoria || 'Lead',
      categoryColor: 'blue',
      responsible: { name: card.responsavel || 'Sem responsável', initials: (card.responsavel || 'US').slice(0, 2).toUpperCase(), color: '#30CB7B' }
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

  async function handleUpdateCard(cardId: string, data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const updated = await res.json()
        const mappedCard: KanbanCard = {
          id: updated.id,
          title: updated.titulo || '',
          description: updated.descricao || '',
          value: updated.valor || 0,
          dueDate: updated.vencimento ? String(updated.vencimento).split('T')[0] : '',
          priority: ((updated.prioridade || 'media') as Priority),
          columnId: updated.coluna_id,
          category: updated.categoria || 'Lead',
          categoryColor: 'blue',
          responsible: {
            name: updated.responsavel || 'Sem responsável',
            initials: (updated.responsavel || 'SR').slice(0, 2).toUpperCase(),
            color: '#30CB7B',
          },
        }
        setBoardsData(prev => prev.map(b => ({
          ...b,
          colunas: (b.colunas || []).map((col: any) => ({
            ...col,
            cards: (col.cards || []).map((c: any) => c.id === cardId ? updated : c),
          })),
        })))
        setSelectedCard(mappedCard)
        toast.success('Card atualizado!')
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Erro ao atualizar card')
        throw new Error(err?.error || 'Erro')
      }
    } catch (err) {
      console.error('Error updating card:', err)
      throw err
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
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${cardId}`, { method: 'DELETE' })
      if (res.ok) {
        setBoardsData(prev => prev.map(b => ({
          ...b,
          colunas: (b.colunas || []).map((col: any) => ({
            ...col,
            cards: (col.cards || []).filter((c: any) => c.id !== cardId)
          }))
        })))
        handleCloseModal()
      }
    } catch (err) {
      console.error('Error deleting card:', err)
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
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6 pb-5 md:pb-6 border-b border-white/5">
        <div className="space-y-2 md:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Kanban className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Pipeline Comercial</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">
            Pipeline
          </h1>
          <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px]">
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
          <button onClick={() => setIsNewColumnOpen(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
            <Plus className="w-4 h-4" />
            Nova Coluna
          </button>
          <button onClick={() => setIsNewBoardOpen(true)} className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4">
            <Plus className="w-4 h-4" />
            Novo Board
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
            />
          ))}

          {/* Add column placeholder */}
          <div className="flex-shrink-0 w-72">
            <button onClick={() => setIsNewColumnOpen(true)} className="w-full h-full min-h-[180px] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 text-gray-600 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-200 group">
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
    </div>
  )
}
