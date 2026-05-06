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
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

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
  card: KanbanCard;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>('dados');
  const [activityFilter, setActivityFilter] = useState<string>('todas');

  const isEmerald = card.category === 'LEAD AP';

  let initials = '?';
  if (card.linkedContact?.name) {
    const parts = card.linkedContact.name.split(' ');
    if (parts.length > 0) {
      initials = parts.map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    }
  }

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
        {/* Header Section */}
        <div className="p-8 pb-6 border-b border-white/[0.04] bg-white/[0.01]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-lg">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">{card.title}</h2>
                  <button className="text-white/20 hover:text-white transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-white/40">{card.linkedContact?.name || 'Sem contato vinculado'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap mb-8">
            <span className="text-2xl font-bold text-primary mr-2">{formatCurrency(card.value)}</span>
            <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white uppercase tracking-widest">
              Aberto
            </span>
            <span className={cn("px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5", isEmerald ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')}>
               <div className={cn('w-1.5 h-1.5 rounded-full', isEmerald ? 'bg-emerald-500' : 'bg-amber-500')} />
               {card.category}
            </span>
            <span className="px-4 py-1 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest ml-auto shadow-lg shadow-blue-500/20">
              Qualificação
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">0 atividades</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">0 pendentes</p>
                </div>
             </div>
             <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">0 dias</p>
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
              className={cn(
                "py-5 px-4 text-[11px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                activeTab === tab ? "text-primary" : "text-white/30 hover:text-white/60"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_10px_var(--primary)]" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <AnimatePresence mode="wait">
            
            {activeTab === 'dados' && (
              <motion.div key="dados" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                {/* Linked Contact */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    <User className="w-3.5 h-3.5" /> Contato Vinculado
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold">
                           {initials}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white">{card.linkedContact?.name}</p>
                           <p className="text-[11px] text-white/40 flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" /> {card.linkedContact?.phone}</p>
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

                {/* Deal Info Grid */}
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
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Ramo da Empresa</p>
                       <p className="text-sm text-white/40 font-bold">—</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Faturamento Mensal</p>
                       <p className="text-sm text-white/40 font-bold">—</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Origem</p>
                       <div className="flex items-center justify-between border-b border-white/10 pb-1 cursor-pointer group">
                          <span className="text-sm text-white/60 font-bold group-hover:text-white transition-colors">Selecionar origem</span>
                          <ChevronDown className="w-4 h-4 text-white/20" />
                       </div>
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Prioridade</p>
                       <span className={cn("px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit", isEmerald ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')}>
                         <div className={cn('w-1.5 h-1.5 rounded-full', isEmerald ? 'bg-emerald-500' : 'bg-amber-500')} />
                         {card.category}
                       </span>
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Vendedor</p>
                       <div className="flex items-center justify-between border-b border-white/10 pb-1 cursor-pointer group">
                          <span className="text-sm text-white/60 font-bold group-hover:text-white transition-colors">Sem vendedor</span>
                          <ChevronDown className="w-4 h-4 text-white/20" />
                       </div>
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Criado</p>
                       <p className="text-sm text-white/80 font-bold">04/05/2026</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1.5">Atualizado</p>
                       <p className="text-sm text-white/80 font-bold">há cerca de 12 horas</p>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'atividades' && (
              <motion.div key="atividades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                {/* Filter */}
                <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-1">
                   {(['todas', 'pendentes', 'concluidas'] as const).map(f => (
                      <button key={f} onClick={() => setActivityFilter(f)} className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all", activityFilter === f ? 'bg-white/[0.05] text-white shadow-md' : 'text-white/30 hover:text-white/60')}>
                         {f === 'todas' ? 'Todas (0)' : f === 'pendentes' ? 'Pendentes (0)' : 'Concluídas (0)'}
                      </button>
                   ))}
                </div>

                {/* Activity Buttons Grid */}
                <div className="grid grid-cols-3 gap-3">
                   <button className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 text-white/60 hover:text-primary transition-all group">
                      <Phone className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">Ligação</span>
                   </button>
                   <button className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 text-white/60 hover:text-primary transition-all group">
                      <Users className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">Reunião</span>
                   </button>
                   <button className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 text-white/60 hover:text-primary transition-all group">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">Tarefa</span>
                   </button>
                   <button className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 text-white/60 hover:text-primary transition-all group">
                      <FileText className="w-4 h-4 text-white/40 group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">Nota</span>
                   </button>
                   <button className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 text-white/60 hover:text-primary transition-all group">
                      <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">WhatsApp</span>
                   </button>
                   <button className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 text-white/60 hover:text-primary transition-all group">
                      <Mail className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">Email</span>
                   </button>
                </div>

                <div className="py-16 flex flex-col items-center justify-center space-y-4">
                   <Calendar className="w-10 h-10 text-white/5" />
                   <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Nenhuma atividade</p>
                   <button className="px-6 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/[0.06] transition-all flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Criar Atividade
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'historico' && (
              <motion.div key="historico" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pl-4">
                 <div className="relative border-l border-white/10 pb-8 space-y-10">
                    <div className="relative pl-8">
                       <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_var(--blue-500)]" />
                       <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                          <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                             <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5">Nova Lead</span>
                             <ArrowRight className="w-3 h-3 text-white/20" />
                             <span className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400">Qualificação</span>
                          </div>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">04/05/26 às 11:35</p>
                       </div>
                    </div>
                    <div className="relative pl-8">
                       <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/20" />
                       <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                          <p className="text-sm font-bold text-white mb-1">Deal criado</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">04/05/26 às 21:51</p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'anotacoes' && (
               <motion.div key="anotacoes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                 <div className="space-y-3">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                     <FileText className="w-3.5 h-3.5" /> Anotações do Deal
                   </div>
                   <textarea 
                     className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all resize-none"
                     placeholder="Registre aqui as informações importantes sobre este lead: dores, objeções, respostas, próximos passos..."
                   />
                   <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 px-6 py-2 rounded-xl text-xs font-bold transition-all w-full md:w-auto">
                      Salvar Anotações
                   </button>
                 </div>
                 <div className="space-y-3 pt-6 border-t border-white/[0.04]">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                     <Users className="w-3.5 h-3.5" /> Anotações da Reunião
                   </div>
                   <textarea 
                     className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all resize-none"
                     placeholder="O que foi discutido na reunião? Próximos passos, propostas a enviar, pontos fechados na negociação..."
                   />
                 </div>
               </motion.div>
            )}

            {activeTab === 'utm' && (
               <motion.div key="utm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="py-20 flex flex-col items-center justify-center opacity-30">
                     <BarChart2 className="w-12 h-12 mb-4" />
                     <p className="text-sm font-bold uppercase tracking-widest">Nenhuma UTM rastreada</p>
                  </div>
               </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Actions Fixed */}
        <div className="p-6 border-t border-white/[0.04] bg-[#0A0A0B] flex items-center justify-between">
           <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.05] transition-all">
                 <Phone className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.05] transition-all">
                 <MessageSquare className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.05] transition-all">
                 <Mail className="w-4 h-4" />
              </button>
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
            <button onClick={() => toast('Seleção em lote em desenvolvimento', { icon: '🚧' })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <Check className="w-3.5 h-3.5" /> Selecionar
            </button>
            <button onClick={() => toast('Arquivo de deals em desenvolvimento', { icon: '🚧' })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <Archive className="w-3.5 h-3.5" /> Arquivados
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <LayoutGrid className="w-3.5 h-3.5" /> Pipeline
            </button>
            <button onClick={() => toast('Importação via CSV em breve', { icon: '🚧' })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <FileDown className="w-3.5 h-3.5" /> Importar
            </button>
            <button onClick={() => toast('Criação rápida em breve', { icon: '🚧' })} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
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



