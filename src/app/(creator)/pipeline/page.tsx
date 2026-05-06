'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkedContact {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Card Component ───────────────────────────────────────────────────────────

function KanbanCardItem({
  card,
  onClick,
}: {
  card: KanbanCard
  onClick: () => void
}) {
  const isEmerald = card.category === 'LEAD AP'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015, y: -3 }}
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-2xl border border-white/5 bg-[#0D0D0E] p-5',
        'transition-all duration-200',
        'border-l-4',
        'hover:border-white/10 hover:shadow-xl'
      )}
      style={{ borderLeftColor: isEmerald ? '#10B981' : '#F59E0B' }}
    >
      {/* Header: title + menu */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              'mt-0.5 w-2 h-2 flex-shrink-0 rounded-full',
              isEmerald ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]' : 'bg-amber-500 shadow-[0_0_6px_#F59E0B]'
            )}
          />
          <h3 className="text-sm font-bold text-white/90 leading-tight truncate">
            {card.title}
          </h3>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Contact info */}
      <div className="space-y-1 mb-5">
        {card.linkedContact?.name && (
          <p className="text-xs text-white/40 font-medium">
            {card.linkedContact.name}
          </p>
        )}
        {card.linkedContact?.phone && (
          <div className="flex items-center gap-1.5 text-[11px] text-white/20">
            <Phone className="w-3 h-3" />
            <span>{card.linkedContact.phone}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-col gap-2 mb-5">
        {/* Vendedor */}
        <div className="flex items-center gap-2 w-fit px-2.5 py-1 rounded-full bg-[hsl(215_100%_50%/0.08)] border border-[hsl(215_100%_50%/0.15)]">
          <div className="w-4 h-4 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center flex-shrink-0">
            {card.responsible.avatar_url ? (
              <img src={card.responsible.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-2.5 h-2.5 text-primary" />
            )}
          </div>
          <span className="text-[9px] font-bold text-primary uppercase tracking-wide">
            {card.responsible.name}
          </span>
        </div>

        {/* Tag de origem */}
        <div
          className={cn(
            'flex items-center gap-2 w-fit px-2.5 py-1 rounded-full border',
            isEmerald
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          )}
        >
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isEmerald ? 'bg-emerald-500' : 'bg-amber-500'
            )}
          />
          <span className="text-[9px] font-bold uppercase tracking-wide">
            {card.category}
          </span>
          <ChevronDown className="w-3 h-3 opacity-40" />
        </div>
      </div>

      {/* Footer: value + chat icon */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
        <span className="text-sm font-bold text-primary">
          {formatCurrency(card.value)}
        </span>
        <MessageSquare className="w-4 h-4 text-emerald-500/30" />
      </div>
    </motion.div>
  )
}

// ─── Column Component ─────────────────────────────────────────────────────────

function KanbanColumnComponent({
  column,
  onCardClick,
}: {
  column: KanbanColumn
  onCardClick: (card: KanbanCard) => void
}) {
  const totalValue = column.cards.reduce((sum, c) => sum + (c.value || 0), 0)

  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col gap-5">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          <span className="text-sm font-bold text-white">{column.name}</span>
          <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
            {column.cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <DollarSign className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {/* Color bar */}
      <div className="h-[3px] w-full bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: '40%', backgroundColor: column.color }}
        />
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1 min-h-[400px] pb-10">
        <AnimatePresence>
          {column.cards.map((card) => (
            <KanbanCardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </AnimatePresence>
        <button className="w-full py-3.5 border border-dashed border-white/[0.06] rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/10 hover:text-white/20 hover:border-white/10 transition-all">
          + Novo Card
        </button>
      </div>
    </div>
  )
}

// ─── Card Detail Modal ────────────────────────────────────────────────────────

function CardDetailModal({
  card,
  onClose,
}: {
  card: KanbanCard
  onClose: () => void
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-[#0A0A0B] border-l border-white/5 z-[70] flex flex-col overflow-y-auto"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">
              Detalhe do Deal
            </p>
            <h2 className="text-lg font-bold text-white">{card.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Value */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Valor</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(card.value)}</p>
          </div>

          {/* Contact */}
          {card.linkedContact && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Contato</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{card.linkedContact.name}</p>
                  <p className="text-[11px] text-white/30">{card.linkedContact.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Vendedor */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Vendedor</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-white">{card.responsible.name}</p>
            </div>
          </div>

          {/* Descricao */}
          {card.description && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Descricao</p>
              <p className="text-sm text-white/40 leading-relaxed">{card.description}</p>
            </div>
          )}
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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/creator/pipeline')
        if (res.ok) {
          const data = await res.json()
          if (data.columns) setColumns(data.columns)
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const totalCards = columns.reduce((a, c) => a + c.cards.length, 0)
  const totalValue = columns.reduce(
    (a, c) => a + c.cards.reduce((s, card) => s + (card.value || 0), 0),
    0
  )

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* ── Header ── */}
      <div className="p-8 lg:p-10 pb-0 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Title + board selector */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Kanban className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white">Pipeline</h1>
            </div>

            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm font-bold text-white/80">Host Menos Imposto</span>
              <ChevronDown className="w-4 h-4 text-white/20" />
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <Check className="w-3.5 h-3.5" /> Selecionar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <Archive className="w-3.5 h-3.5" /> Arquivados
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <LayoutGrid className="w-3.5 h-3.5" /> Pipeline
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <FileDown className="w-3.5 h-3.5" /> Importar
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Deal
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-white/40">{totalCards} deals ativos</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{formatCurrency(totalValue)} total</span>
          </div>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 overflow-x-auto p-8 lg:p-10 scrollbar-none">
        {isLoading ? (
          <div className="flex gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[300px] h-[600px] bg-white/[0.01] border border-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-8 min-w-max">
            {columns.map((col) => (
              <KanbanColumnComponent
                key={col.id}
                column={col}
                onCardClick={setSelectedCard}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}


