'use client'

import { useState } from 'react'
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Send, 
  Target, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Search,
  Filter,
  Download,
  Database,
  PieChart,
  Zap,
  ChevronRight,
  ChevronDown,
  DollarSign
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Stats Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, trend, trendValue, icon: Icon, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl space-y-3 group hover:bg-white/[0.05] transition-all"
    >
      <div className="flex items-center justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", color)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider", trend === 'up' ? 'text-emerald-500' : 'text-red-500')}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RelatoriosPage() {
  const [pipeline, setPipeline] = useState('Host Menos Imposto')
  const [periodo, setPeriodo] = useState('Últimos 7 dias')

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-10 space-y-10 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-white/40 text-sm">Acompanhe entradas, conversões e performance da equipe por pipeline e período.</p>
        </div>
        
        <button className="bg-primary px-8 py-3 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Download className="w-4 h-4" /> Baixar PDF
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Pipeline</p>
          <div className="relative group">
            <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs font-bold text-white/60 appearance-none focus:border-primary/40 transition-all outline-none">
              <option>Host Menos Imposto</option>
              <option>CRM Vendas</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Período</p>
          <div className="relative group">
            <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs font-bold text-white/60 appearance-none focus:border-primary/40 transition-all outline-none">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Vendedor</p>
          <div className="relative group">
            <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs font-bold text-white/60 appearance-none focus:border-primary/40 transition-all outline-none">
              <option>Todos os vendedores</option>
              <option>Gabriel Sousa</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
          </div>
        </div>
        <div className="space-y-2">
           <div className="bg-white/[0.03] border border-white/10 rounded-xl py-3 px-6 flex items-center justify-between text-white/40">
              <div className="flex items-center gap-3">
                 <Calendar className="w-4 h-4" />
                 <span className="text-xs font-bold">29/04/26 — 05/05/26</span>
              </div>
           </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Leads que entraram" value="121" icon={Activity} color="bg-primary/10 border-primary/20 text-primary" />
        <StatCard label="Ganhos" value="0" subtext="0.0% de conversão" icon={Target} color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" />
        <StatCard label="Perdidos" value="2" icon={ArrowDownRight} color="bg-red-500/10 border-red-500/20 text-red-500" />
        <StatCard label="Em aberto" value="119" icon={Layers} color="bg-amber-500/10 border-amber-500/20 text-amber-500" />
        <StatCard label="Valor ganho" value="R$ 0" icon={DollarSign} color="bg-blue-500/10 border-blue-500/20 text-blue-400" />
        <StatCard label="Ticket médio" value="R$ 0" icon={TrendingUp} color="bg-primary/10 border-primary/20 text-primary" />
      </div>

      {/* Main Content: Daily Evolution and Visual Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Evolução Diária */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
           <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">Evolução diária</h3>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Leads que entraram, ganhos e perdidos por dia.</p>
          </div>
          <div className="h-72 relative mt-10">
            <div className="absolute inset-0 border-l border-b border-white/10" />
            <svg className="w-full h-full" viewBox="0 0 500 200">
               <path d="M0,150 L100,165 L200,80 L300,75 L400,150 L500,180" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" />
               <path d="M0,195 L500,195" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500" />
            </svg>
            <div className="flex justify-between mt-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">
              <span>29/04</span><span>30/04</span><span>01/05</span><span>02/05</span><span>03/05</span><span>04/05</span><span>05/05</span>
            </div>
          </div>
          <div className="flex items-center gap-6 justify-center">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Entraram</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Ganhos</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Perdidos</span></div>
          </div>
        </div>

        {/* Funil Visual */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
           <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">Funil visual</h3>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Volume de entradas por etapa.</p>
           </div>
           
           <div className="space-y-3 pt-4">
              {[
                { label: 'Nova Lead', val: 0, color: 'bg-primary/20', t: 'text-primary' },
                { label: 'Qualificação', val: 117, color: 'bg-blue-500', t: 'text-blue-400', p: 90 },
                { label: 'Reunião Marcada', val: 24, color: 'bg-amber-500', t: 'text-amber-500', p: 40 },
                { label: 'Reunião Realizada', val: 12, color: 'bg-emerald-500', t: 'text-emerald-400', p: 30 },
                { label: 'Negociação', val: 7, color: 'bg-red-500', t: 'text-red-500', p: 20 },
                { label: 'Follow up', val: 8, color: 'bg-pink-500', t: 'text-pink-500', p: 25 },
                { label: 'Operação Caixa Rápido', val: 47, color: 'bg-purple-500', t: 'text-purple-400', p: 55 },
                { label: 'Base Lead', val: 122, color: 'bg-white/10', t: 'text-white/40', p: 95 },
              ].map((stage, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <div className={cn("w-1.5 h-1.5 rounded-full", stage.color)} />
                       <span className="text-white/60">{stage.label}</span>
                    </div>
                    <span className="text-white/40">{stage.val} leads</span>
                  </div>
                  <div className="h-4 w-full bg-white/[0.02] rounded-md overflow-hidden p-0.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${stage.p || 0}%` }} className={cn("h-full rounded-sm opacity-80", stage.color)} />
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  )
}
