'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSession } from 'next-auth/react'
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
  Upload,
  Download,
  Settings,
  Trash2,
  Edit3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import React, { memo } from 'react'

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
  pendingTasksCount?: number
  anotacoes?: string
  boardId?: string
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
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  } catch {
    return '—'
  }
}

const TIPO_ACTIVITY: Record<string, { label: string; color: string; bg: string; border: string; Icon: any }> = {
  phone:   { label: 'Ligação',  color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    Icon: Phone },
  email:   { label: 'Email',    color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     Icon: Mail },
  message: { label: 'WhatsApp', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: MessageSquare },
  meeting: { label: 'Reunião',  color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  Icon: Users },
  note:    { label: 'Nota',     color: 'text-white/50',    bg: 'bg-white/5',        border: 'border-white/10',       Icon: FileText },
  task:    { label: 'Tarefa',   color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   Icon: CheckCircle2 },
}

// ─── Delete Deal Modal ────────────────────────────────────────────────────────

function DeleteDealModal({
  dealId,
  dealTitle,
  onClose,
  onDeleted,
}: {
  dealId: string
  dealTitle: string
  onClose: () => void
  onDeleted: () => void
}) {
  const [isLoading, setIsLoading] = useState<'archive' | 'permanent' | null>(null)

  const handleArchive = async () => {
    setIsLoading('archive')
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${dealId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Deal arquivado. Você pode restaurá-lo em Deals Arquivados.')
        onDeleted()
      } else {
        toast.error('Erro ao arquivar deal')
      }
    } finally {
      setIsLoading(null)
    }
  }

  const handlePermanent = async () => {
    setIsLoading('permanent')
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${dealId}?permanent=true`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Deal excluído permanentemente')
        onDeleted()
      } else {
        toast.error('Erro ao excluir deal')
      }
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.04]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white mb-1">Remover Deal</h2>
                <p className="text-xs text-white/40 leading-relaxed truncate">
                  <span className="text-white/60 font-medium">{dealTitle}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <button
              onClick={handleArchive}
              disabled={!!isLoading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all disabled:opacity-50 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                {isLoading === 'archive'
                  ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  : <Archive className="w-4 h-4 text-amber-400" />
                }
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white/80 group-hover:text-white">Arquivar</p>
                <p className="text-[10px] text-white/30">Pode ser restaurado depois em Deals Arquivados</p>
              </div>
            </button>
            <button
              onClick={handlePermanent}
              disabled={!!isLoading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-red-500/5 hover:border-red-500/20 transition-all disabled:opacity-50 group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                {isLoading === 'permanent'
                  ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                  : <Trash2 className="w-4 h-4 text-red-400" />
                }
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-red-400 group-hover:text-red-300">Excluir permanentemente</p>
                <p className="text-[10px] text-white/30">Ação irreversível — não poderá ser desfeita</p>
              </div>
            </button>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={onClose}
              disabled={!!isLoading}
              className="w-full py-2.5 rounded-xl border border-white/5 text-white/30 text-xs font-bold hover:text-white/60 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Card Component ───────────────────────────────────────────────────────────

const KanbanCardItem = memo(({
  card,
  onClick,
  isSelectMode,
  isSelected,
  onToggleSelect,
  index,
  isDragDisabled,
  vendedores,
  onUpdateVendedor,
  onRefreshBoard,
}: {
  card: KanbanCard
  onClick: () => void
  isSelectMode: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
  index: number
  isDragDisabled?: boolean
  vendedores?: Vendor[]
  onUpdateVendedor?: (cardId: string, vendedorId: string) => void
  onRefreshBoard?: () => void
}) => {
  const isEmerald = card.category === 'LEAD AP'
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  const handleMenuAction = async (action: 'won' | 'lost' | 'edit' | 'delete') => {
    setShowMenu(false)
    if (action === 'edit') { onClick(); return }
    if (action === 'won') {
      if (!confirm('Marcar este deal como GANHO?')) return
      await fetch(`/api/creator/pipeline/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'won', fechado_em: new Date().toISOString() }),
      })
      toast.success('Deal ganho!')
      onRefreshBoard?.()
    } else if (action === 'lost') {
      const reason = prompt('Motivo da perda?')
      if (!reason) return
      await fetch(`/api/creator/pipeline/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'lost', lost_reason: reason, fechado_em: new Date().toISOString() }),
      })
      toast.success('Deal perdido')
      onRefreshBoard?.()
    } else if (action === 'delete') {
      setShowDeleteModal(true)
    }
  }

  const handleClick = () => {
    if (isSelectMode) { onToggleSelect(card.id); return }
    onClick()
  }

  return (
    <>
    <Draggable draggableId={card.id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          className={cn(
            'relative cursor-pointer rounded-xl border bg-card p-4 transition-all duration-200 border-l-4',
            isSelected
              ? 'border-primary/60 bg-primary/5 shadow-lg'
              : 'border-border hover:border-border/60 hover:shadow-xl',
            snapshot.isDragging && 'z-50 shadow-2xl border-primary/40'
          )}
          style={{ 
            ...provided.draggableProps.style,
            borderLeftColor: isSelected ? undefined : isEmerald ? '#10B981' : '#F59E0B' 
          }}
        >
          {/* Selection checkbox */}
          {isSelectMode && (
            <div className={cn(
              'absolute top-3 right-3 w-5 h-5 rounded flex items-center justify-center border transition-all',
              isSelected ? 'bg-primary border-primary' : 'bg-muted border-border hover:border-primary/40'
            )}>
              {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn('mt-0.5 w-2 h-2 flex-shrink-0 rounded-full', isEmerald ? 'bg-emerald-500' : 'bg-amber-500')} />
              <h3 className="text-sm font-bold text-foreground leading-tight truncate">{card.title}</h3>
            </div>
            {!isSelectMode && (
              <div ref={menuRef} className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}
                  className="text-muted-foreground/20 hover:text-muted-foreground/60 transition-colors p-0.5"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-6 w-44 bg-[#111113] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={() => handleMenuAction('won')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ganho
                    </button>
                    <button
                      onClick={() => handleMenuAction('lost')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Perdido
                    </button>
                    <div className="h-px bg-white/5 mx-2" />
                    <button
                      onClick={() => handleMenuAction('edit')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleMenuAction('delete')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-0.5 mb-3">
            {card.linkedContact?.name && <p className="text-xs text-muted-foreground font-medium">{card.linkedContact.name}</p>}
            {card.linkedContact?.phone && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <Phone className="w-3 h-3" /><span>{card.linkedContact.phone}</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center gap-2 w-fit px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10 relative group">
              <div className="w-4 h-4 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center flex-shrink-0">
                {card.responsible?.avatar_url ? (
                  <img src={card.responsible.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-2.5 h-2.5 text-primary" />
                )}
              </div>
              <span className="text-[9px] font-bold text-primary uppercase tracking-wide">{card.responsible?.name || 'N/A'}</span>
              
              {/* Quick Vendor Select on Card */}
              {vendedores && onUpdateVendedor && (
                <select 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    if (e.target.value) onUpdateVendedor(card.id, e.target.value)
                  }}
                  value={(vendedores || []).find(v => v.nome === card.responsible?.name)?.id || ''}
                >
                  <option value="">Sem responsável</option>
                  {(vendedores || []).map(v => (
                    <option key={v.id} value={v.id}>{v.nome}</option>
                  ))}
                </select>
              )}
            </div>

            <div className={cn('flex items-center gap-2 w-fit px-2.5 py-1 rounded-full border', isEmerald ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')}>
              <div className={cn('w-1.5 h-1.5 rounded-full', isEmerald ? 'bg-emerald-500' : 'bg-amber-500')} />
              <span className="text-[9px] font-bold uppercase tracking-wide">{card.category}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-primary">{formatCurrency(card.value)}</span>
              {(card.pendingTasksCount ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Activity className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{card.pendingTasksCount}</span>
                </div>
              )}
            </div>
            <MessageSquare className="w-4 h-4 text-emerald-500/30" />
          </div>
        </div>
      )}
    </Draggable>
    <AnimatePresence>
      {showDeleteModal && (
        <DeleteDealModal
          dealId={card.id}
          dealTitle={card.title}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => { setShowDeleteModal(false); onRefreshBoard?.() }}
        />
      )}
    </AnimatePresence>
    </>
  )
})

// ─── Column Component ─────────────────────────────────────────────────────────

function KanbanColumnComponent({
  column,
  onCardClick,
  isSelectMode,
  selectedCards,
  onToggleSelect,
  isDragDisabled,
  vendedores,
  onUpdateVendedor,
  onNewCardClick,
  onRefreshBoard,
}: {
  column: KanbanColumn
  onCardClick: (card: KanbanCard) => void
  isSelectMode: boolean
  selectedCards: Set<string>
  onToggleSelect: (id: string) => void
  isDragDisabled?: boolean
  vendedores?: Vendor[]
  onUpdateVendedor?: (cardId: string, vendedorId: string) => void
  onNewCardClick?: (columnId: string) => void
  onRefreshBoard?: () => void
}) {
  const totalValue = (column.cards || []).reduce((sum, c) => sum + (c.value || 0), 0)

  return (
    <div className="flex-shrink-0 w-[280px] flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-bold text-foreground">{column.name}</span>
          <span className="text-[10px] font-bold text-muted-foreground bg-card/40 px-2 py-0.5 rounded-md">{(column.cards || []).length}</span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <DollarSign className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      <div className="h-[3px] w-full bg-card/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: '40%', backgroundColor: column.color }} />
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex flex-col gap-2.5 flex-1 min-h-[400px] pb-10 transition-colors rounded-2xl",
              snapshot.isDraggingOver && "bg-card/20"
            )}
          >
            <AnimatePresence>
              {(column.cards || []).map((card, index) => (
                <KanbanCardItem
                  key={card.id}
                  card={card}
                  index={index}
                  onClick={() => onCardClick(card)}
                  isSelectMode={isSelectMode}
                  isSelected={selectedCards.has(card.id)}
                  onToggleSelect={onToggleSelect}
                  isDragDisabled={isDragDisabled}
                  vendedores={vendedores}
                  onUpdateVendedor={onUpdateVendedor}
                  onRefreshBoard={onRefreshBoard}
                />
              ))}
            </AnimatePresence>
            {provided.placeholder}
            {!isSelectMode && (
              <button 
                onClick={() => {
                  if (onNewCardClick) onNewCardClick(column.id)
                }}
                className="w-full py-3.5 border border-dashed border-border/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-muted-foreground/60 hover:border-border transition-all">
                + Novo Card
              </button>
            )}
          </div>
        )}
      </Droppable>
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

  const handleRestore = async (id: string) => {
    const res = await fetch(`/api/creator/pipeline/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleted_at: null, status: 'open' }),
    })
    if (res.ok) {
      setCards(prev => prev.filter(c => c.id !== id))
      toast.success('Deal restaurado!')
    }
  }

  const handleDeletePermanent = async (id: string) => {
    if (!confirm('Excluir permanentemente este deal?')) return
    const res = await fetch(`/api/creator/pipeline/cards/${id}?permanent=true`, { method: 'DELETE' })
    if (res.ok) {
      setCards(prev => prev.filter(c => c.id !== id))
      toast.success('Excluído permanentemente')
    }
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
                  <div className="flex flex-col items-end gap-2">
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
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRestore(card.id)}
                        className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
                        title="Restaurar"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeletePermanent(card.id)}
                        className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                        title="Excluir Permanentemente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
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
      <div className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl">
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
  vendedores,
  boards,
  userPerfil,
  onClose,
  onUpdate,
}: {
  card: KanbanCard
  columns: KanbanColumn[]
  vendedores: Vendor[]
  boards: Board[]
  userPerfil?: string
  onClose: () => void
  onUpdate?: () => void
}) {
  const [activeTab, setActiveTab] = useState<string>('dados')
  const [activityFilter, setActivityFilter] = useState<string>('todas')
  const [cardActivities, setCardActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [newActivityTipo, setNewActivityTipo] = useState<string | null>(null)
  const [newActivityDesc, setNewActivityDesc] = useState('')
  const [newActivityData, setNewActivityData] = useState(new Date().toISOString().slice(0, 16))
  const [savingActivity, setSavingActivity] = useState(false)
  
  // States for editing fields
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(card.title || '')
  const [editedValue, setEditedValue] = useState((card.value || 0).toString())
  const [editedAnotacoes, setEditedAnotacoes] = useState(card.anotacoes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isUpdatingDeal, setIsUpdatingDeal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const PRIORITY_CFG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    alta:  { label: 'Alta',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    media: { label: 'Média', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-500'   },
    baixa: { label: 'Baixa', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    dot: 'bg-blue-500'    },
  }
  const prio = PRIORITY_CFG[card.priority] || PRIORITY_CFG.media
  const statusCfg = card.status === 'won'
    ? { label: 'Ganho',   cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' }
    : card.status === 'lost'
    ? { label: 'Perdido', cls: 'bg-red-500/10 border-red-500/20 text-red-400' }
    : { label: 'Aberto',  cls: 'bg-white/5 border-white/10 text-white/60' }
  const initials = (card.linkedContact?.name || '')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  useEffect(() => {
    if (activeTab !== 'atividades') return
    setActivitiesLoading(true)
    fetch(`/api/creator/atividades?deal_id=${card.id}`)
      .then(r => r.json())
      .then(data => setCardActivities(Array.isArray(data) ? data : []))
      .catch(() => setCardActivities([]))
      .finally(() => setActivitiesLoading(false))
  }, [activeTab, card.id])

  const filteredCardActivities = useMemo(() => cardActivities.filter(a => {
    if (activityFilter === 'pendentes') return a.status === 'pendente'
    if (activityFilter === 'concluidas') return a.status === 'concluida'
    return true
  }), [cardActivities, activityFilter])

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
          data: new Date(newActivityData).toISOString(),
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

  const handleUpdateDeal = async (updates: any) => {
    setIsUpdatingDeal(true)
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        toast.success('Deal atualizado!')
        if (onUpdate) onUpdate()
      }
    } catch (err) {
      toast.error('Erro ao atualizar deal')
    } finally {
      setIsUpdatingDeal(false)
      setIsEditing(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anotacoes: editedAnotacoes }),
      })
      if (res.ok) {
        toast.success('Anotações salvas!')
        if (onUpdate) onUpdate()
      }
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleSetStatus = async (status: 'won' | 'lost') => {
    let lost_reason = ''
    if (status === 'lost') {
      lost_reason = prompt('Motivo da perda?') || ''
      if (!lost_reason) return
    }
    
    await handleUpdateDeal({ status, lost_reason, fechado_em: new Date().toISOString() })
    onClose()
  }

  const handleDealDeleted = () => {
    setShowDeleteModal(false)
    onClose()
    if (onUpdate) onUpdate()
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
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editedTitle}
                        onChange={e => setEditedTitle(e.target.value)}
                        className="bg-white/5 border border-primary/30 rounded px-2 py-1 text-sm text-white outline-none focus:border-primary transition-all"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleUpdateDeal({ titulo: editedTitle })}
                        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-foreground tracking-tight">{card.title}</h2>
                      <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className="text-muted-foreground/40 hover:text-foreground transition-colors p-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{card.linkedContact?.name || 'Sem contato vinculado'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-card/40 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap mb-8">
            <span className="text-2xl font-bold text-primary mr-2">{formatCurrency(card.value)}</span>
            <span className={cn('px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest', statusCfg.cls)}>{statusCfg.label}</span>
            <span className={cn('px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5', prio.bg, prio.border, prio.color)}>
              <div className={cn('w-1.5 h-1.5 rounded-full', prio.dot)} />
              {prio.label}
            </span>
            <select
              value={card.columnId}
              onChange={e => handleUpdateDeal({ coluna_id: e.target.value })}
              className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest ml-auto outline-none focus:border-primary/40 transition-all cursor-pointer"
              style={{ backgroundColor: currentColumn?.color }}
            >
              {columns.map(col => (
                <option key={col.id} value={col.id} className="bg-[#0A0A0B]">{col.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Pipeline:</span>
            <select
              value={card.boardId || ''}
              onChange={e => handleUpdateDeal({ board_id: e.target.value })}
              className="bg-transparent text-[10px] font-bold text-white/60 uppercase tracking-widest outline-none cursor-pointer hover:text-white"
            >
              <option value="" className="bg-[#0A0A0B]">Mudar Pipeline...</option>
              {boards.map(b => (
                <option key={b.id} value={b.id} className="bg-[#0A0A0B]">{b.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{cardActivities.length} atividade{cardActivities.length !== 1 ? 's' : ''}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
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
                      <a 
                        href={`/crm?id=${card.linkedContact?.id}`}
                        className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/[0.05] flex items-center gap-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Ver
                      </a>
                      {card.linkedContact?.phone && (
                        <a 
                          href={`https://wa.me/55${card.linkedContact.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:bg-emerald-500/20 flex items-center gap-2"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    <Database className="w-3.5 h-3.5" /> Informações do Deal
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Prioridade</p>
                      <span className={cn('px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit', prio.bg, prio.border, prio.color)}>
                        <div className={cn('w-1.5 h-1.5 rounded-full', prio.dot)} />
                        {prio.label}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Status</p>
                      <span className={cn('px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest', statusCfg.cls)}>{statusCfg.label}</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Responsável</p>
                      <select
                        value={(vendedores || []).find(v => v.nome === card.responsible?.name)?.id || ''}
                        onChange={e => handleUpdateDeal({ vendedor_id: e.target.value })}
                        className="bg-transparent text-sm text-white/80 font-bold outline-none cursor-pointer hover:text-white"
                      >
                        <option value="" className="bg-[#0A0A0B]">Sem responsável</option>
                        {(vendedores || []).map(v => (
                          <option key={v.id} value={v.id} className="bg-[#0A0A0B]">{v.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Valor</p>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editedValue}
                            onChange={e => setEditedValue(e.target.value)}
                            className="bg-white/5 border border-primary/30 rounded px-2 py-1 text-sm text-white outline-none w-24"
                          />
                          <button 
                            onClick={() => handleUpdateDeal({ valor: parseFloat(editedValue) || 0 })}
                            className="p-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-primary font-bold">{formatCurrency(card.value)}</p>
                      )}
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
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Data e Hora</label>
                        <input 
                          type="datetime-local" 
                          value={newActivityData}
                          onChange={e => setNewActivityData(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-primary/40 transition-all"
                        />
                      </div>
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
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    <FileText className="w-3.5 h-3.5" /> Anotações do Deal
                  </div>
                  <textarea 
                    value={editedAnotacoes}
                    onChange={e => setEditedAnotacoes(e.target.value)}
                    className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all resize-none" 
                    placeholder="Registre informações importantes sobre este lead: dores, objeções, próximos passos..." 
                  />
                  <button 
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Salvar
                  </button>
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
        <div className="p-6 border-t border-border/40 bg-background/80 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {card.linkedContact?.phone && (
              <a
                href={`https://wa.me/55${card.linkedContact.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 text-xs font-bold transition-all"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleSetStatus('won')}
              disabled={isUpdatingDeal}
              className="px-6 py-2.5 rounded-xl border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Ganho
            </button>
            <button
              onClick={() => handleSetStatus('lost')}
              disabled={isUpdatingDeal}
              className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4" /> Perdido
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="ml-auto px-4 py-2.5 rounded-xl border border-white/5 text-white/30 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteDealModal
            dealId={card.id}
            dealTitle={card.title}
            onClose={() => setShowDeleteModal(false)}
            onDeleted={handleDealDeleted}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Create Deal Modal ────────────────────────────────────────────────────────

function CreateDealModal({ columns, defaultColumnId, onClose, onCreated }: { columns: KanbanColumn[]; defaultColumnId?: string; onClose: () => void; onCreated: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [valor, setValor] = useState('')
  const [colunaId, setColunaId] = useState(defaultColumnId || (columns && columns.length > 0 ? columns[0].id : ''))
  const [contatoSearch, setContatoSearch] = useState('')
  const [contatos, setContatos] = useState<any[]>([])
  const [selectedContato, setSelectedContato] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (contatoSearch.length < 2) { setContatos([]); return }
    fetch(`/api/creator/crm?search=${encodeURIComponent(contatoSearch)}`)
      .then(r => r.json()).then(d => setContatos(Array.isArray(d) ? d.slice(0, 8) : []))
      .catch(() => setContatos([]))
  }, [contatoSearch])

  const handleSave = async () => {
    if (!titulo.trim() || !colunaId) { toast.error('Título e estágio são obrigatórios'); return }
    setIsSaving(true)
    try {
      const res = await fetch('/api/creator/pipeline/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, valor: valor ? parseFloat(valor) : 0, coluna_id: colunaId, contato_id: selectedContato?.id || null }),
      })
      if (res.ok) { toast.success('Deal criado!'); onCreated(); onClose() }
      else { const e = await res.json(); toast.error(e.error || 'Erro ao criar deal') }
    } finally { setIsSaving(false) }
  }

  const inp = "w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all"
  const lbl = "block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2"

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border/50 shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold text-white">Novo Deal</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/5 text-white/40 hover:text-white transition-all"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div><label className={lbl}>Título *</label><input value={titulo} onChange={e => setTitulo(e.target.value)} className={inp} placeholder="Nome do deal" /></div>
            <div><label className={lbl}>Estágio *</label>
              <select value={colunaId} onChange={e => setColunaId(e.target.value)} className={inp + ' cursor-pointer'}>
                {columns.map(c => <option key={c.id} value={c.id} className="bg-[#0a0a0b]">{c.name}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Valor (R$)</label><input type="number" value={valor} onChange={e => setValor(e.target.value)} className={inp} placeholder="0,00" /></div>
            <div>
              <label className={lbl}>Contato</label>
              <input value={selectedContato ? selectedContato.nome : contatoSearch} onChange={e => { setContatoSearch(e.target.value); setSelectedContato(null) }} className={inp} placeholder="Buscar contato..." />
              {contatos.length > 0 && !selectedContato && (
                <div className="mt-1 bg-[#111113] border border-white/10 rounded-xl overflow-hidden">
                  {contatos.map(c => (
                    <button key={c.id} onClick={() => { setSelectedContato(c); setContatoSearch(''); setContatos([]) }} className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/5 transition-colors flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-white/30" />{c.nome}{c.empresa && <span className="text-white/30 text-xs">— {c.empresa}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => {
                  const nome = prompt('Nome do lead?')
                  const telefone = prompt('Telefone?')
                  if (nome && telefone) {
                    fetch('/api/creator/crm', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ nome, telefone, status_funil: 'lead' })
                    }).then(r => r.json()).then(data => {
                      setSelectedContato(data)
                      toast.success('Lead criado!')
                    })
                  }
                }}
                className="flex-1 py-3 rounded-xl border border-primary/20 text-primary text-sm font-bold hover:bg-primary/5 transition-all"
              >
                + Novo Lead
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/40 hover:text-white transition-all">Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Criar Deal
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Import Modal ──────────────────────────────────────────────────────────────

function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [preview, setPreview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'overwrite'>('skip')

  const handleFileChange = async (f: File) => {
    setFile(f)
    setIsLoading(true)
    const fd = new FormData(); fd.append('file', f); fd.append('mode', 'check')
    try {
      const res = await fetch('/api/creator/crm/import-excel', { method: 'POST', body: fd })
      const data = await res.json()
      setPreview(data); setStep('preview')
    } catch { toast.error('Erro ao analisar arquivo') }
    finally { setIsLoading(false) }
  }

  const handleImport = async () => {
    if (!file) return
    setIsLoading(true)
    const fd = new FormData(); fd.append('file', file); fd.append('mode', 'import'); fd.append('duplicateAction', duplicateAction)
    try {
      const res = await fetch('/api/creator/crm/import-excel', { method: 'POST', body: fd })
      const data = await res.json()
      toast.success(`${data.imported} contatos importados!`)
      setStep('done'); onImported()
    } catch { toast.error('Erro na importação') }
    finally { setIsLoading(false) }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border/50 shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Upload className="w-4 h-4 text-blue-400" /></div>
              <div><h2 className="text-base font-bold text-white">Importar Contatos</h2><p className="text-[11px] text-white/30">xlsx ou csv</p></div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/5 text-white/40 hover:text-white transition-all"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 space-y-5">
            {step === 'upload' && (
              <>
                <a href="/api/creator/crm/import-excel" download className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/50 hover:text-white hover:border-white/20 transition-all">
                  <Download className="w-4 h-4" /> Baixar modelo (.xlsx)
                </a>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center cursor-pointer hover:border-primary/40 transition-all group">
                  {isLoading ? <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" /> : <>
                    <Upload className="w-8 h-8 mx-auto text-white/20 group-hover:text-primary mb-3 transition-all" />
                    <p className="text-sm font-bold text-white/40 group-hover:text-white/70">Clique para selecionar arquivo</p>
                    <p className="text-[10px] text-white/20 mt-1">.xlsx ou .csv</p>
                  </>}
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }} />
                </div>
              </>
            )}
            {step === 'preview' && preview && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20"><span className="text-sm text-emerald-400 font-bold">{preview.valid} registros válidos</span></div>
                  {preview.errors?.length > 0 && <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20"><span className="text-sm text-red-400 font-bold">{preview.errors.length} erros encontrados</span></div>}
                  {preview.duplicates?.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                      <p className="text-sm text-amber-400 font-bold">{preview.duplicates.length} duplicatas</p>
                      <div className="flex gap-2">
                        <button onClick={() => setDuplicateAction('skip')} className={cn('flex-1 py-2 rounded-lg text-xs font-bold border transition-all', duplicateAction === 'skip' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/40 hover:text-white/60')}>Ignorar</button>
                        <button onClick={() => setDuplicateAction('overwrite')} className={cn('flex-1 py-2 rounded-lg text-xs font-bold border transition-all', duplicateAction === 'overwrite' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-white/5 text-white/40 hover:text-white/60')}>Sobrescrever</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('upload')} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/40 hover:text-white transition-all">Voltar</button>
                  <button onClick={handleImport} disabled={isLoading || preview.valid === 0} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Importar
                  </button>
                </div>
              </>
            )}
            {step === 'done' && (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
                <p className="text-base font-bold text-white">Importação concluída!</p>
                <button onClick={onClose} className="px-8 py-3 rounded-xl bg-primary text-white text-sm font-bold">Fechar</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Pipeline Management Modal ────────────────────────────────────────────────

function PipelineManagementModal({ boards, currentBoardId, onClose, onBoardChange }: { boards: Board[]; currentBoardId: string | null; onClose: () => void; onBoardChange: (id?: string) => void }) {
  const [localBoards, setLocalBoards] = useState<any[]>([])
  const [newBoardName, setNewBoardName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [boardDetails, setBoardDetails] = useState<Record<string, any[]>>({})

  useEffect(() => {
    fetch('/api/creator/pipeline-config').then(r => r.json()).then(d => setLocalBoards(Array.isArray(d) ? d : []))
  }, [])

  const loadStages = async (boardId: string) => {
    if (boardDetails[boardId]) { setExpandedId(expandedId === boardId ? null : boardId); return }
    const res = await fetch('/api/creator/pipeline-config')
    const data = await res.json()
    const board = Array.isArray(data) ? data.find((b: any) => b.id === boardId) : null
    if (board) setBoardDetails(prev => ({ ...prev, [boardId]: board.colunas || [] }))
    setExpandedId(expandedId === boardId ? null : boardId)
  }

  const handleCreate = async () => {
    if (!newBoardName.trim()) return
    setIsCreating(true)
    const res = await fetch('/api/creator/pipeline-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'board', nome: newBoardName }) })
    if (res.ok) { const b = await res.json(); setLocalBoards(prev => [...prev, b]); setNewBoardName(''); toast.success('Pipeline criado!'); onBoardChange(b.id) }
    setIsCreating(false)
  }

  const handleRename = async (id: string) => {
    if (!editingName.trim()) return
    const res = await fetch(`/api/creator/pipeline-config/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: editingName }) })
    if (res.ok) { setLocalBoards(prev => prev.map(b => b.id === id ? { ...b, nome: editingName } : b)); setEditingId(null); toast.success('Renomeado!') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este pipeline?')) return
    const res = await fetch(`/api/creator/pipeline-config/${id}`, { method: 'DELETE' })
    if (res.ok) { setLocalBoards(prev => prev.filter(b => b.id !== id)); onBoardChange(); toast.success('Pipeline removido') }
    else { const e = await res.json(); toast.error(e.error || 'Erro ao remover') }
  }

  const handleDeleteStage = async (boardId: string, stageId: string) => {
    const moveTarget = prompt('Para qual estágio (ID ou Nome Exato) deseja migrar os deals existentes antes de excluir este estágio?')
    if (!moveTarget) {
      toast.error('Operação cancelada: estágio de destino é obrigatório.')
      return
    }

    const res = await fetch(`/api/creator/pipeline-config/stages?id=${stageId}&move_to=${moveTarget}`, { method: 'DELETE' })
    if (res.ok) {
      setBoardDetails(prev => ({ ...prev, [boardId]: (prev[boardId] || []).filter((s: any) => s.id !== stageId) }))
      toast.success('Estágio removido e deals migrados!')
    } else {
      const e = await res.json()
      toast.error(e.error || 'Erro ao remover estágio. Verifique se o destino é válido.')
    }
  }

  const handleAddStage = async (boardId: string) => {
    const nome = prompt('Nome do novo estágio?')
    if (!nome) return
    const res = await fetch('/api/creator/pipeline-config/stages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board_id: boardId, nome, cor: '#3B82F6' })
    })
    if (res.ok) {
      const newStage = await res.json()
      setBoardDetails(prev => ({ ...prev, [boardId]: [...(prev[boardId] || []), newStage] }))
      toast.success('Estágio adicionado!')
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="fixed top-0 right-0 h-screen w-full max-w-[480px] bg-[#0A0A0B] border-l border-white/5 z-[70] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Settings className="w-4 h-4 text-primary" /></div>
            <div><h2 className="text-base font-bold text-white">Gerenciar Pipelines</h2><p className="text-[11px] text-white/30">Crie, edite e remova pipelines</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/5 text-white/40 hover:text-white transition-all"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-3 scrollbar-thin">
          {localBoards.map(board => (
            <div key={board.id} className={cn('bg-white/[0.02] border rounded-2xl overflow-hidden transition-all', board.id === currentBoardId ? 'border-primary/30' : 'border-white/5')}>
              <div className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Kanban className="w-4 h-4 text-primary" />
                </div>
                {editingId === board.id ? (
                  <input value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleRename(board.id); if (e.key === 'Escape') setEditingId(null) }} autoFocus className="flex-1 bg-white/5 border border-primary/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none" />
                ) : (
                  <span className="flex-1 text-sm font-bold text-white">{board.nome}</span>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => loadStages(board.id)} className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all"><ChevronRight className={cn('w-4 h-4 transition-transform', expandedId === board.id && 'rotate-90')} /></button>
                  {editingId === board.id ? (
                    <button onClick={() => handleRename(board.id)} className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"><Check className="w-3.5 h-3.5" /></button>
                  ) : (
                    <button onClick={() => { setEditingId(board.id); setEditingName(board.nome) }} className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                  )}
                  {localBoards.length > 1 && (
                    <button onClick={() => handleDelete(board.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/30 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
              {expandedId === board.id && (
                <div className="px-4 pb-4 space-y-1.5 border-t border-white/[0.04] pt-3">
                  {(boardDetails[board.id] || []).map((stage: any) => (
                    <div key={stage.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02]">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.cor || '#3B82F6' }} />
                      <span className="flex-1 text-xs font-bold text-white/70">{stage.nome}</span>
                      {stage.sla_horas && <span className="text-[10px] text-white/30">SLA {stage.sla_horas}h</span>}
                      <button onClick={() => handleDeleteStage(board.id, stage.id)} className="w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/20 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {(boardDetails[board.id] || []).length === 0 && <p className="text-xs text-white/20 py-2 text-center">Nenhum estágio</p>}
                  <button 
                    onClick={() => handleAddStage(board.id)}
                    className="w-full py-2 border border-dashed border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/40 hover:border-white/20 transition-all"
                  >
                    + Adicionar Estágio
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/[0.04] space-y-3">
          <div className="flex gap-2">
            <input value={newBoardName} onChange={e => setNewBoardName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="Nome do novo pipeline" className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all" />
            <button onClick={handleCreate} disabled={isCreating || !newBoardName.trim()} className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const { data: session } = useSession()
  const userPerfil = (session?.user as any)?.perfil

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

  // New modals
  const [showCreateDeal, setShowCreateDeal] = useState(false)
  const [createDealColumnId, setCreateDealColumnId] = useState<string | undefined>(undefined)
  const [showImport, setShowImport] = useState(false)
  const [showPipelineMgmt, setShowPipelineMgmt] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Optimistic update
    setColumns(prev => {
      if (!prev) return []
      const sourceCol = prev.find(c => c.id === source.droppableId)
      const destCol = prev.find(c => c.id === destination.droppableId)
      if (!sourceCol || !destCol) return prev

      const sourceCards = Array.from(sourceCol.cards || [])
      const [movedCard] = sourceCards.splice(source.index, 1)
      if (movedCard) movedCard.columnId = destination.droppableId

      if (source.droppableId === destination.droppableId) {
        if (movedCard) sourceCards.splice(destination.index, 0, movedCard)
        return prev.map(c => c.id === source.droppableId ? { ...c, cards: sourceCards } : c)
      } else {
        const destCards = Array.from(destCol.cards || [])
        if (movedCard) destCards.splice(destination.index, 0, movedCard)
        return prev.map(c => {
          if (c.id === source.droppableId) return { ...c, cards: sourceCards }
          if (c.id === destination.droppableId) return { ...c, cards: destCards }
          return c
        })
      }
    })

    try {
      await fetch(`/api/creator/pipeline/cards/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coluna_id: destination.droppableId, ordem: destination.index }),
      })
    } catch {
      toast.error('Erro ao mover card')
      loadPipeline(currentBoardId || undefined)
    }
  }

  const handleSelectAll = () => {
    const allIds = (columns || []).flatMap(c => (c.cards || []).map(card => card.id))
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
        const cardsToMove = (prev || []).flatMap(c => c.cards || []).filter(c => selectedCards.has(c.id))
        return prev.map(col => {
          if (col.id === value) {
            const existing = (col.cards || []).filter(c => !selectedCards.has(c.id))
            return { ...col, cards: [...existing, ...cardsToMove.map(c => ({ ...c, columnId: value }))] }
          }
          return { ...col, cards: (col.cards || []).filter(c => !selectedCards.has(c.id)) }
        })
      })
    } else if (field === 'vendedor_id') {
      const vendedor = (vendedores || []).find(v => v.id === value)
      if (vendedor) {
        setColumns(prev => (prev || []).map(col => ({
          ...col,
          cards: (col.cards || []).map(card =>
            selectedCards.has(card.id)
              ? { ...card, responsible: { name: vendedor.nome, initials: vendedor.nome.substring(0, 2).toUpperCase(), color: vendedor.cor, avatar_url: vendedor.avatar_url } }
              : card
          )
        })))
      }
    } else if (field === 'valor') {
      setColumns(prev => (prev || []).map(col => ({
        ...col,
        cards: (col.cards || []).map(card => selectedCards.has(card.id) ? { ...card, value: Number(value) } : card)
      })))
    } else if (field === 'status') {
      if (value !== 'open') {
        setColumns(prev => (prev || []).map(col => ({
          ...col,
          cards: (col.cards || []).filter(card => !selectedCards.has(card.id))
        })))
      }
    }

    toast.success(`${ids.length} deal${ids.length !== 1 ? 's' : ''} atualizado${ids.length !== 1 ? 's' : ''}!`)
    setSelectedCards(new Set())
    setIsSelectMode(false)
  }

  const currentBoard = boards.find(b => b.id === currentBoardId)
  
  const filteredColumns = useMemo(() => (columns || []).map(col => ({
    ...col,
    cards: (col.cards || []).filter(card => {
      const titleMatch = (card.title || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      const contactMatch = card.linkedContact?.name ? card.linkedContact.name.toLowerCase().includes((searchTerm || '').toLowerCase()) : false;
      const responsibleMatch = card.responsible?.name ? card.responsible.name.toLowerCase().includes((searchTerm || '').toLowerCase()) : false;
      return titleMatch || contactMatch || responsibleMatch;
    })
  })), [columns, searchTerm])

  const totalCards = useMemo(() => (columns || []).reduce((a, c) => a + (c.cards?.length || 0), 0), [columns])
  const totalValue = useMemo(() => (columns || []).reduce((a, c) => a + (c.cards || []).reduce((s, card) => s + (card.value || 0), 0), 0), [columns])

  const handleUpdateVendedorOnCard = async (cardId: string, vendedorId: string) => {
    try {
      const res = await fetch(`/api/creator/pipeline/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendedor_id: vendedorId }),
      })
      if (res.ok) {
        toast.success('Vendedor atualizado!')
        loadPipeline(currentBoardId || undefined)
      }
    } catch {
      toast.error('Erro ao atualizar vendedor')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="p-8 lg:p-10 pb-0 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Kanban className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
            </div>

            {/* Board dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBoardDropdown(v => !v)}
                className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl hover:border-white/10 transition-all"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm font-bold text-foreground/80">{currentBoard?.nome || 'Pipeline Padrão'}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
              </button>

              <AnimatePresence>
                {showBoardDropdown && (boards || []).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-[#111113] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {(boards || []).map(board => (
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

          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="Buscar deals..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all w-64"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

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
              onClick={() => setShowPipelineMgmt(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Pipeline
            </button>

            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" /> Importar
            </button>

            <button
              onClick={() => { setCreateDealColumnId(undefined); setShowCreateDeal(true) }}
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
            <span className="text-xs text-muted-foreground">{totalCards} deals ativos</span>
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
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto p-8 lg:p-10 scrollbar-none">
          {isLoading ? (
            <div className="flex gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex-shrink-0 w-[300px] h-[600px] bg-white/[0.01] border border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-8 min-w-max">
              {(filteredColumns || []).map(col => (
                <KanbanColumnComponent
                  key={col.id}
                  column={col}
                  onCardClick={setSelectedCard}
                  isSelectMode={isSelectMode}
                  selectedCards={selectedCards}
                  onToggleSelect={toggleSelect}
                  isDragDisabled={isSelectMode || !!searchTerm}
                  vendedores={vendedores}
                  onUpdateVendedor={handleUpdateVendedorOnCard}
                  onNewCardClick={(colId) => { setCreateDealColumnId(colId); setShowCreateDeal(true) }}
                  onRefreshBoard={() => loadPipeline(currentBoardId || undefined)}
                />
              ))}
            </div>
          )}
        </div>
      </DragDropContext>

      {/* Card Detail Drawer */}
      <AnimatePresence>
        {selectedCard && !isSelectMode && (
          <CardDetailModal
            card={selectedCard}
            columns={columns}
            vendedores={vendedores}
            boards={boards}
            userPerfil={userPerfil}
            onClose={() => setSelectedCard(null)}
            onUpdate={() => loadPipeline(currentBoardId || undefined)}
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

      {/* Create Deal Modal */}
      <AnimatePresence>
        {showCreateDeal && (
          <CreateDealModal
            columns={columns || []}
            defaultColumnId={createDealColumnId}
            onClose={() => setShowCreateDeal(false)}
            onCreated={() => loadPipeline(currentBoardId || undefined)}
          />
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImport && (
          <ImportModal
            onClose={() => setShowImport(false)}
            onImported={() => loadPipeline(currentBoardId || undefined)}
          />
        )}
      </AnimatePresence>

      {/* Pipeline Management */}
      <AnimatePresence>
        {showPipelineMgmt && (
          <PipelineManagementModal
            boards={boards}
            currentBoardId={currentBoardId}
            onClose={() => setShowPipelineMgmt(false)}
            onBoardChange={(id) => { loadPipeline(id); setShowPipelineMgmt(false) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
