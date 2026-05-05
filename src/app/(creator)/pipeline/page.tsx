'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Briefcase,
  Zap,
  Shield,
  Activity,
  Cpu,
  Globe,
  Target,
  Sparkles
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined) {
  return (value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM dd", { locale: ptBR })
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
    label: 'Critical',
    color: '#EF4444',
    dotClass: 'bg-red-500',
    textClass: 'text-red-400',
    bgClass: 'bg-red-500/10 border-red-500/20 text-red-400',
  },
  media: {
    label: 'Standard',
    color: '#F59E0B',
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
  },
  baixa: {
    label: 'Latency',
    color: '#2563EB',
    dotClass: 'bg-sidebar-primary',
    textClass: 'text-sidebar-primary',
    bgClass: 'bg-sidebar-primary/10 border-sidebar-primary/20 text-sidebar-primary',
  },
}

const categoryColorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  accent: 'bg-sidebar-primary/10 border-sidebar-primary/20 text-sidebar-primary',
  gold: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = priorityConfig[priority] || priorityConfig['media']
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", cfg.bgClass)}>
      <div className={cn("w-1.5 h-1.5 rounded-full", cfg.dotClass)} />
      {cfg.label}
    </span>
  )
}

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => selectionMode ? onSelect(card.id) : onClick()}
      className={cn(
        "nl-glass p-6 cursor-pointer transition-all duration-700 group relative overflow-hidden rounded-[32px] border-white/5",
        isSelected && "border-sidebar-primary/40 shadow-[0_30px_60px_rgba(0,0,0,0.4)] scale-[1.02]",
        "border-l-[4px]"
      )}
      style={{ borderLeftColor: card.responsible.color }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {selectionMode && (
        <div className="absolute top-4 right-4 z-10">
          <div className={cn("w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-500", isSelected ? "bg-sidebar-primary border-sidebar-primary text-black" : "bg-black/40 border-white/10")}>
            {isSelected && <Check className="w-4 h-4 font-black" />}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4 mb-6 relative z-10">
        <div className="flex items-center justify-between gap-3">
             <span className={cn("inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", catClass)}>
                {card.category}
            </span>
            <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-lg bg-black border border-white/5 flex items-center justify-center p-1">
                     <Shield className="w-3 h-3 text-white/20" />
                </div>
            </div>
        </div>
        <p className="text-sm font-bold text-white leading-snug group-hover:text-primary transition-colors duration-300">
          {card.title}
        </p>
      </div>

      {/* Contact */}
      {card.linkedContact && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 mb-6 relative z-10 group-hover:bg-white/[0.04] transition-all duration-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
                <User className="w-4 h-4 text-sidebar-primary" />
            </div>
            <p className="text-[10px] text-white font-black uppercase tracking-widest truncate">{card.linkedContact.name}</p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <DollarSign className="w-3 h-3 text-sidebar-primary" />
          <span className="text-sm font-bold text-white">{formatCurrency(card.value)}</span>
        </div>
        
        {columnSla && (
          <div className={cn(
            <Activity className="w-3 h-3" />
            {hoursInStage}h no estágio
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-black border border-white/5 flex items-center justify-center shadow-lg">
                <span className="text-[9px] font-black text-sidebar-primary italic uppercase">{card.responsible.initials}</span>
          </div>
          <div className="flex flex-col min-w-0 gap-1">
            <span className="text-[8px] font-black text-white/20 truncate uppercase tracking-widest italic leading-none">{card.responsible.name}</span>
            <PriorityBadge priority={card.priority} />
          </div>
        </div>
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border transition-all duration-700 italic font-black uppercase text-[8px] tracking-widest", overdue ? 'text-red-500 border-red-500/20' : 'text-white/10 border-white/5 group-hover:text-white/40')}>
          <Calendar className="w-3 h-3" />
          {formatDate(card.dueDate)}
        </div>
      </div>
    </motion.div>
  )
}

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
    <div className="flex-shrink-0 w-[360px] flex flex-col gap-6">
      {/* Column header */}
      <div className="nl-glass p-8 rounded-[40px] border-white/5 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 w-full h-[4px] opacity-40 group-hover:opacity-100 transition-all duration-700" style={{ backgroundColor: column.color, boxShadow: `0 0 20px ${column.color}` }} />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: column.color }} />
            <div className="space-y-0.5">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] italic">{column.name}</h3>
                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em]">{column.cards.length} Active Nodes</p>
            </div>
          </div>
          {column.probabilidade < 100 && (
             <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
                <span className="text-[8px] text-sidebar-primary font-black tracking-[0.2em] uppercase italic">{column.probabilidade}% PROB</span>
             </div>
          )}
        </div>
        
        <div className="flex items-center justify-between relative z-10 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-sidebar-primary" />
            <span className="text-sm font-black text-white tracking-tighter italic">{formatCurrency(totalValue)}</span>
          </div>
          {column.slaHoras && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sidebar-primary/5 border border-sidebar-primary/10">
              <Activity className="w-3 h-3 text-sidebar-primary animate-pulse" />
              <span className="text-[8px] font-black text-sidebar-primary uppercase tracking-widest italic">SLA: {column.slaHoras}H</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 flex flex-col gap-5 min-h-[400px] pb-20">
        <AnimatePresence mode="popLayout">
          {column.cards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-white/[0.02] rounded-[48px] text-white/5 min-h-[300px]"
            >
              <Cpu className="w-12 h-12 mb-6 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Empty Stack</p>
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

        <button onClick={onAddCard} className="group w-full flex items-center justify-center gap-4 py-8 rounded-[40px] bg-white/[0.01] border-2 border-dashed border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/10 hover:text-sidebar-primary hover:border-sidebar-primary/20 hover:bg-sidebar-primary/5 transition-all duration-700 italic">
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 group-hover:scale-110" />
          Forge New Node
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const initialColumns: KanbanColumn[] = [
  { id: 'leads',       name: 'Leads',          color: '#3B82F6', probabilidade: 100, cards: [] },
  { id: 'qualificacao',name: 'Qualificação',   color: '#F59E0B', probabilidade: 100, cards: [] },
  { id: 'proposta',    name: 'Proposta',       color: '#2563EB', probabilidade: 100, cards: [] },
  { id: 'fechado',     name: 'Ganhos',         color: '#8B5CF6', probabilidade: 100, cards: [] },
]

export default function PipelinePage() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)
  const [activeBoard, setActiveBoard] = useState('Executive Sales')
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load board data from API
    const loadData = async () => {
        try {
            const res = await fetch('/api/creator/pipeline')
            if (res.ok) {
                const data = await res.json()
                if (data.columns) setColumns(data.columns)
            }
        } finally {
            setIsLoading(false)
        }
    }
    loadData()
  }, [])

  const handleCardClick = (card: KanbanCard) => setSelectedCard(card)

  const handleSelectCard = (id: string) => {
    setSelectedCardIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <div className="ambient-bg" />
      
      {/* Header */}
      <div className="relative z-10 p-8 lg:p-12 pb-6 border-b border-white/5 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-3">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-sidebar-primary/10 border border-sidebar-primary/20 flex items-center justify-center text-sidebar-primary">
                    <Kanban className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold text-white">Pipeline de Vendas</h1>
                    <p className="text-xs font-medium text-white/40">Visualize e gerencie seus deals</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/10 group-focus-within:text-sidebar-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="SCAN NODES..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl px-14 py-4 text-[10px] font-black text-white uppercase tracking-widest placeholder-white/10 focus:border-sidebar-primary/20 focus:bg-white/[0.04] transition-all outline-none w-64 italic"
                />
             </div>

                <Plus className="w-4 h-4" />
                Novo Deal
             </button>
          </div>
        </div>

        {/* Global Pipeline Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: 'Active Pipeline', value: formatCurrency(columns.reduce((acc, col) => acc + col.cards.reduce((sum, c) => sum + c.value, 0), 0)), icon: DollarSign, color: 'text-sidebar-primary' },
                { label: 'Live Nodes', value: columns.reduce((acc, col) => acc + col.cards.length, 0), icon: Layers, color: 'text-blue-400' },
                { label: 'Transmission Efficiency', value: '94.2%', icon: Activity, color: 'text-emerald-400' },
                { label: 'Neural Throughput', value: 'Sustained', icon: Zap, color: 'text-white' },
            ].map((stat, i) => (
                <div key={i} className="nl-glass p-6 rounded-[32px] border-white/5 flex items-center gap-6 group hover:border-white/10 transition-all duration-700">
                    <div className={cn("w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all duration-700 group-hover:scale-110", stat.color)}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">{stat.label}</p>
                        <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Kanban Area */}
      <div className="relative z-10 flex-1 overflow-x-auto scrollbar-none">
        <div className="flex h-full p-8 lg:p-12 gap-10 min-w-max">
           <AnimatePresence>
             {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-[360px] space-y-10 animate-pulse">
                        <div className="h-32 bg-white/[0.02] rounded-[40px] border border-white/5" />
                        <div className="space-y-6">
                            {[...Array(3)].map((_, j) => <div key={j} className="h-48 bg-white/[0.01] rounded-[48px] border border-white/5" />)}
                        </div>
                    </div>
                ))
             ) : (
                columns.map((col) => (
                    <KanbanColumnComponent 
                      key={col.id} 
                      column={col} 
                      onCardClick={handleCardClick}
                      onAddCard={() => {}}
                      selectionMode={isSelectionMode}
                      selectedCardIds={selectedCardIds}
                      onSelectCard={handleSelectCard}
                    />
                ))
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Detail Drawer - To be fully modernized similarly if needed, but the main UI is now consistent */}
      <AnimatePresence>
        {selectedCard && (
            <CardDetailModal 
                card={selectedCard}
                columns={columns}
                onClose={() => setSelectedCard(null)}
                onMove={(id, colId) => {
                    setColumns(prev => prev.map(col => ({
                        ...col,
                        cards: col.id === colId 
                            ? [...col.cards, { ...selectedCard, columnId: colId }]
                            : col.cards.filter(c => c.id !== id)
                    })))
                    setSelectedCard(null)
                    toast.success('Matrix synchronization complete')
                }}
                onDelete={() => {}}
                onUpdate={() => {}}
            />
        )}
      </AnimatePresence>
    </div>
  )
}

function CardDetailModal({ card, columns, onClose, onMove, onDelete, onUpdate }: any) {
    const [activeTab, setActiveTab] = useState('Overview')
    const [editedCard, setEditedCard] = useState(card)

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[60]" />
            <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 right-0 h-full w-full max-w-[600px] bg-black border-l border-white/5 z-[70] shadow-[-50px_0_100px_rgba(0,0,0,0.8)] flex flex-col p-12 overflow-y-auto scrollbar-none"
            >
                <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-5">
                    <Target className="w-64 h-64 text-sidebar-primary" />
                </div>

                <div className="space-y-12 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
                                <Cpu className="w-5 h-5 text-sidebar-primary" />
                            </div>
                            <span className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.4em] italic">Node Detail Protocol</span>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-sidebar-primary netlife-glow shadow-none animate-pulse" />
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] italic">Identification</span>
                        </div>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">{editedCard.title}</h2>
                        <div className="flex items-center gap-6">
                            <PriorityBadge priority={editedCard.priority} />
                            <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">{editedCard.category}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="nl-glass p-8 rounded-[40px] border-white/5 space-y-4">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Estimated Value</p>
                            <p className="text-3xl font-black text-sidebar-primary italic">{formatCurrency(editedCard.value)}</p>
                        </div>
                        <div className="nl-glass p-8 rounded-[40px] border-white/5 space-y-4">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Transmission Deadline</p>
                            <p className="text-3xl font-black text-white italic">{formatDate(editedCard.dueDate)}</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex border-b border-white/5">
                            {['Overview', 'Parameters', 'Sync Log'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative italic", activeTab === tab ? "text-sidebar-primary" : "text-white/10 hover:text-white")}>
                                    {tab}
                                    {activeTab === tab && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-sidebar-primary netlife-glow shadow-none" />}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[300px]">
                            {activeTab === 'Overview' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Strategic Intel</p>
                                        <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 text-sm text-white/40 font-black uppercase tracking-widest leading-loose italic">
                                            {editedCard.description || 'No strategic metadata recorded for this node.'}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="flex items-center justify-between p-8 rounded-[32px] bg-black border border-white/5 group hover:border-sidebar-primary/20 transition-all duration-700">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-sidebar-primary/10 flex items-center justify-center">
                                                    <User className="w-6 h-6 text-sidebar-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Lead Infiltration Agent</p>
                                                    <p className="text-sm font-black text-white uppercase tracking-tighter italic">{editedCard.responsible.name}</p>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/20 italic font-black text-[10px]">{editedCard.responsible.initials}</div>
                                        </div>

                                        <div className="flex items-center justify-between p-8 rounded-[32px] bg-black border border-white/5">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-sidebar-primary/10 flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-sidebar-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Protocol Origin</p>
                                                    <p className="text-sm font-black text-white uppercase tracking-tighter italic">{editedCard.origin || 'Neural Direct'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex gap-6">
                        <button onClick={() => onMove(card.id, columns[columns.length-1].id)} className="flex-1 btn-primary py-7 netlife-glow shadow-none text-xs font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-4">
                            <CheckCircle2 className="w-5 h-5" /> Execute Conversion
                        </button>
                        <button className="px-10 py-7 rounded-[32px] bg-white/[0.03] border border-white/5 text-white/20 hover:text-red-500 hover:border-red-500/20 transition-all font-black uppercase text-[10px] tracking-[0.3em] italic">
                            Purge Node
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

import { Search } from 'lucide-react'
