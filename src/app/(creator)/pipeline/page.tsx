'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { format, parseISO, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

const MOCK_HISTORY: HistoryEntry[] = [
  { id: '1', action: 'Criou o card', user: 'Lucas Mendes', date: '2026-03-10T09:15:00' },
  { id: '2', action: 'Moveu', from: 'Leads', to: 'Qualificação', user: 'Ana Paula', date: '2026-03-15T14:30:00' },
  { id: '3', action: 'Adicionou comentário', user: 'Lucas Mendes', date: '2026-03-18T11:00:00' },
  { id: '4', action: 'Alterou prioridade para', to: 'Alta', user: 'Fernanda Costa', date: '2026-03-22T16:45:00' },
]

const initialColumns: KanbanColumn[] = [
  {
    id: 'leads',
    name: 'Leads',
    color: '#3B82F6',
    cards: [
      {
        id: 'c1',
        title: 'Grupo Horizonte S.A.',
        category: 'Enterprise',
        categoryColor: 'blue',
        priority: 'alta',
        responsible: { name: 'Lucas Mendes', initials: 'LM', color: '#3B82F6' },
        dueDate: '2026-04-05',
        value: 48000,
        description: 'Prospect de grande porte interessado na solução completa de automação financeira. Reunião inicial agendada para a próxima semana.',
        columnId: 'leads',
      },
      {
        id: 'c2',
        title: 'Startup TechFlow',
        category: 'Startup',
        categoryColor: 'purple',
        priority: 'media',
        responsible: { name: 'Fernanda Costa', initials: 'FC', color: '#A855F7' },
        dueDate: '2026-04-12',
        value: 12000,
        description: 'Startup de tecnologia em fase de crescimento. Interesse no plano básico com possibilidade de upgrade.',
        columnId: 'leads',
      },
      {
        id: 'c3',
        title: 'Clínica Saúde Plena',
        category: 'Saúde',
        categoryColor: 'emerald',
        priority: 'baixa',
        responsible: { name: 'Rafael Lima', initials: 'RL', color: '#10B981' },
        dueDate: '2026-04-20',
        value: 8500,
        description: 'Clínica médica buscando solução de gestão financeira integrada.',
        columnId: 'leads',
      },
    ],
  },
  {
    id: 'qualificacao',
    name: 'Qualificação',
    color: '#F59E0B',
    cards: [
      {
        id: 'c4',
        title: 'Construtora Vega',
        category: 'Construção',
        categoryColor: 'orange',
        priority: 'alta',
        responsible: { name: 'Ana Paula', initials: 'AP', color: '#F97316' },
        dueDate: '2026-03-28',
        value: 75000,
        description: 'Construtora regional com alto volume de transações mensais. Necessidade de integração com ERP existente.',
        columnId: 'qualificacao',
      },
      {
        id: 'c5',
        title: 'E-commerce Modinha',
        category: 'Varejo',
        categoryColor: 'pink',
        priority: 'media',
        responsible: { name: 'Lucas Mendes', initials: 'LM', color: '#3B82F6' },
        dueDate: '2026-04-02',
        value: 22000,
        description: 'Loja virtual de moda feminina com operação omnichannel. Interesse em reconciliação automática de pagamentos.',
        columnId: 'qualificacao',
      },
    ],
  },
  {
    id: 'proposta',
    name: 'Proposta',
    color: '#30CB7B',
    cards: [
      {
        id: 'c6',
        title: 'Banco Digital Novu',
        category: 'Fintech',
        categoryColor: 'accent',
        priority: 'alta',
        responsible: { name: 'Fernanda Costa', initials: 'FC', color: '#A855F7' },
        dueDate: '2026-04-01',
        value: 180000,
        description: 'Fintech em expansão buscando parceiro estratégico. Proposta customizada enviada, aguardando retorno do board.',
        columnId: 'proposta',
      },
      {
        id: 'c7',
        title: 'Rede de Franquias Sabor+',
        category: 'Alimentação',
        categoryColor: 'gold',
        priority: 'media',
        responsible: { name: 'Rafael Lima', initials: 'RL', color: '#10B981' },
        dueDate: '2026-04-08',
        value: 35000,
        description: 'Rede com 45 unidades franqueadas. Proposta de centralização financeira em análise pelo franqueador.',
        columnId: 'proposta',
      },
    ],
  },
  {
    id: 'fechado',
    name: 'Fechado',
    color: '#8B5CF6',
    cards: [
      {
        id: 'c8',
        title: 'Distribuidora Nordeste',
        category: 'Distribuição',
        categoryColor: 'violet',
        priority: 'baixa',
        responsible: { name: 'Ana Paula', initials: 'AP', color: '#F97316' },
        dueDate: '2026-03-15',
        value: 54000,
        description: 'Contrato assinado com sucesso. Onboarding iniciado, equipe de implantação já alocada.',
        columnId: 'fechado',
      },
      {
        id: 'c9',
        title: 'Agro Sudeste Ltda.',
        category: 'Agronegócio',
        categoryColor: 'emerald',
        priority: 'media',
        responsible: { name: 'Lucas Mendes', initials: 'LM', color: '#3B82F6' },
        dueDate: '2026-03-20',
        value: 96000,
        description: 'Empresa rural de médio porte. Contrato anual fechado após 3 reuniões de negociação.',
        columnId: 'fechado',
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
    color: '#30CB7B',
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
  const cfg = priorityConfig[priority]
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

// ─── Modal / Detail Drawer ────────────────────────────────────────────────────

function CardDetailModal({
  card,
  columns,
  onClose,
  onMove,
}: {
  card: KanbanCard
  columns: KanbanColumn[]
  onClose: () => void
  onMove: (cardId: string, targetColumnId: string) => void
}) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<{ id: string; text: string; user: string; date: string }[]>([
    { id: '1', text: 'Cliente muito receptivo na última ligação. Próximo passo: enviar case de sucesso.', user: 'Ana Paula', date: '2026-03-19T10:20:00' },
  ])
  const [moveTo, setMoveTo] = useState(card.columnId)
  const overdue = isOverdue(card.dueDate)
  const catClass = categoryColorMap[card.categoryColor] || categoryColorMap.blue
  const priCfg = priorityConfig[card.priority]

  function handleSendComment() {
    if (!comment.trim()) return
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), text: comment.trim(), user: 'Você', date: new Date().toISOString() },
    ])
    setComment('')
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%', opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-dark-card border-l border-white/5 z-50 flex flex-col shadow-2xl"
      >
        {/* Drawer header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-white/5 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`badge ${catClass} text-[10px]`}>{card.category}</span>
              <PriorityDot priority={card.priority} />
              {overdue && (
                <span className="badge bg-red-500/10 border-red-500/20 text-red-400 text-[10px]">
                  Vencido
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white leading-tight">{card.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Key info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-muted rounded-xl p-3 border border-white/5">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Valor Estimado</p>
              <p className="text-base font-black text-accent">{formatCurrency(card.value)}</p>
            </div>
            <div className={`bg-dark-muted rounded-xl p-3 border ${overdue ? 'border-red-500/20' : 'border-white/5'}`}>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Vencimento</p>
              <p className={`text-base font-black ${overdue ? 'text-red-400' : 'text-white'}`}>{formatDate(card.dueDate)}</p>
            </div>
            <div className="bg-dark-muted rounded-xl p-3 border border-white/5 col-span-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Responsável</p>
              <div className="flex items-center gap-2">
                <Avatar initials={card.responsible.initials} color={card.responsible.color} size="md" />
                <span className="text-sm font-semibold text-white">{card.responsible.name}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Descrição</p>
            <p className="text-sm text-gray-300 leading-relaxed bg-dark-muted rounded-xl p-3 border border-white/5">
              {card.description}
            </p>
          </div>

          {/* Move to column */}
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Mover para</p>
            <div className="relative">
              <select
                value={moveTo}
                onChange={(e) => setMoveTo(e.target.value)}
                className="input-field appearance-none pr-10 text-sm"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
              <MoveRight className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {moveTo !== card.columnId && (
              <button
                onClick={() => onMove(card.id, moveTo)}
                className="mt-2 w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
              >
                <MoveRight className="w-4 h-4" />
                Confirmar Movimentação
              </button>
            )}
          </div>

          {/* Timeline / History */}
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Histórico
            </p>
            <div className="space-y-3">
              {MOCK_HISTORY.map((entry, idx) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                      {idx === MOCK_HISTORY.length - 1 ? (
                        <CheckCircle2 className="w-3 h-3 text-accent" />
                      ) : (
                        <Circle className="w-3 h-3 text-gray-600" />
                      )}
                    </div>
                    {idx < MOCK_HISTORY.length - 1 && (
                      <div className="w-px flex-1 bg-white/5 my-1" />
                    )}
                  </div>
                  <div className="pb-3 min-w-0">
                    <p className="text-xs text-gray-300">
                      <span className="font-semibold text-white">{entry.user}</span>{' '}
                      {entry.action}
                      {entry.to && (
                        <>
                          {' '}
                          <span className="text-accent font-semibold">{entry.to}</span>
                        </>
                      )}
                      {entry.from && entry.to && (
                        <span className="text-gray-500"> (de {entry.from})</span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{formatDateTime(entry.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" />
              Comentários ({comments.length})
            </p>
            <div className="space-y-3 mb-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-dark-muted border border-white/5 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">{c.user}</span>
                    <span className="text-[10px] text-gray-600">{formatDateTime(c.date)}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
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
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-accent text-black hover:opacity-90 disabled:opacity-30 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </>
  )
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ columns }: { columns: KanbanColumn[] }) {
  const allCards = columns.flatMap((c) => c.cards)
  const totalCards = allCards.length
  const totalValue = allCards.reduce((sum, c) => sum + c.value, 0)
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

const COLUMN_COLORS = ['#3B82F6', '#30CB7B', '#A855F7', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6']

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
  const [boards, setBoards] = useState<BoardName[]>(DEFAULT_BOARDS)
  const [selectedBoard, setSelectedBoard] = useState<BoardName>('Vendas')
  const [boardColumns, setBoardColumns] = useState<Record<string, KanbanColumn[]>>(initialBoardColumns)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewColumnOpen, setIsNewColumnOpen] = useState(false)
  const [isNewCardOpen, setIsNewCardOpen] = useState(false)
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false)
  const [activeColumnId, setActiveColumnId] = useState<string>('')

  const columns = boardColumns[selectedBoard] ?? []

  function setColumns(updater: (prev: KanbanColumn[]) => KanbanColumn[]) {
    setBoardColumns((prev) => ({
      ...prev,
      [selectedBoard]: updater(prev[selectedBoard] ?? []),
    }))
  }

  function handleCardClick(card: KanbanCard) {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setTimeout(() => setSelectedCard(null), 300)
  }

  function handleAddBoard(name: string) {
    setBoards((prev) => [...prev, name])
    setBoardColumns((prev) => ({ ...prev, [name]: [] }))
    setSelectedBoard(name)
  }

  function handleAddColumn(name: string, color: string) {
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    setColumns((prev) => [...prev, { id, name, color, cards: [] }])
  }

  function handleAddCard(card: KanbanCard) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === card.columnId ? { ...col, cards: [...col.cards, card] } : col
      )
    )
  }

  function handleMoveCard(cardId: string, targetColumnId: string) {
    setColumns((prev) => {
      const card = prev.flatMap((c) => c.cards).find((c) => c.id === cardId)
      if (!card) return prev
      const updated = { ...card, columnId: targetColumnId }
      return prev.map((col) => ({
        ...col,
        cards: col.id === targetColumnId
          ? [...col.cards.filter((c) => c.id !== cardId), updated]
          : col.cards.filter((c) => c.id !== cardId),
      }))
    })
    handleCloseModal()
  }

  function openNewCard(columnId: string) {
    setActiveColumnId(columnId)
    setIsNewCardOpen(true)
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-full animate-fade-in pb-20">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Kanban className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Pipeline Comercial</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">
            Pipeline
          </h1>
          <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px]">
            GESTÃO DE OPORTUNIDADES • VISÃO KANBAN
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BoardSelector boards={boards} selected={selectedBoard} onChange={setSelectedBoard} />
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
