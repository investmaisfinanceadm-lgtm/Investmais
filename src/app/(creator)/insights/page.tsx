'use client'

import { useState } from 'react'
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
  BarChart,
  PieChart as PieIcon,
  Clock,
  Zap,
  MousePointer2,
  DollarSign,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Stat Card Component ─────────────────────────────────────────────────────
function IAStatCard({ label, value, trend, trendValue, icon: Icon, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl space-y-4 hover:bg-white/[0.05] transition-all group relative overflow-hidden"
    >
      <div className="flex items-center justify-between relative z-10">
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{label}</p>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className={cn("flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider", trend === 'up' ? 'text-emerald-500' : 'text-red-500')}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            {trendValue}
          </div>
          <span className="text-[10px] text-white/10 font-bold uppercase tracking-widest">vs mês ant.</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function IAInsightsPage() {
  const [periodo, setPeriodo] = useState('Host Menos Imposto')

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de IA</h1>
          </div>
          <p className="text-white/40 text-sm">Insights inteligentes em tempo real para otimização de vendas</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="bg-white/[0.03] border border-white/10 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-4 hover:border-primary/40 transition-all">
              {periodo}
              <ChevronDown className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
            </button>
          </div>
          <button className="bg-white/[0.03] border border-white/10 p-3 rounded-xl text-white/40 hover:text-white transition-all"><RefreshCw className="w-5 h-5" /></button>
          <button className="bg-primary px-8 py-3 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* IA Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <IAStatCard label="Total de Negócios" value="288" trend="up" trendValue="+12%" icon={Target} color="bg-primary/10 border-primary/20 text-primary" />
        <IAStatCard label="Taxa de Conversão" value="12.5%" trend="down" trendValue="-3%" icon={TrendingUp} color="bg-blue-500/10 border-blue-500/20 text-blue-400" />
        <IAStatCard label="Valor Total Ganho" value="R$ 5.000" trend="up" trendValue="+15%" icon={DollarSign} color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" />
        <IAStatCard label="Negócios em Risco" value="0" trend="up" trendValue="Normal" icon={AlertCircle} color="bg-white/5 border-white/10 text-white/40" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/5">
        {['Métricas Precisas', 'Insights com IA'].map((tab, i) => (
          <button key={tab} className={cn(
            "px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative",
            i === 0 ? "text-primary border-b-2 border-primary" : "text-white/20 hover:text-white"
          )}>
            {tab}
          </button>
        ))}
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tendência Mensal */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold">Tendência Mensal</h3>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Negócios criados vs fechados</p>
          </div>
          <div className="h-64 relative mt-10">
            {/* Axis Mock */}
            <div className="absolute inset-0 border-l border-b border-white/10" />
            {/* Lines Mock - May peak as in screenshot */}
            <svg className="w-full h-full" viewBox="0 0 500 200">
               <path d="M0,180 L100,185 L200,180 L300,170 L400,20 L500,80" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
               <path d="M0,195 L100,198 L200,195 L300,190 L400,180 L500,185" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" />
            </svg>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
              <span>Dez.</span><span>Jan.</span><span>Fev.</span><span>Mar.</span><span>Abr.</span><span>Mai.</span>
            </div>
          </div>
          <div className="flex items-center gap-6 justify-center">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Criados</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Ganhos</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Perdidos</span></div>
          </div>
        </div>

        {/* Conversão por Estágio */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
           <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold">Conversão por Estágio</h3>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Taxa de conversão em cada fase</p>
          </div>
          <div className="h-64 flex items-end justify-around gap-4 pb-4">
             <div className="flex-1 flex flex-col items-center gap-4">
                <div className="w-full bg-primary/5 rounded-lg h-[5%]" />
                <span className="text-[8px] font-bold text-white/20 uppercase text-center">Nova Lead</span>
             </div>
             <div className="flex-1 flex flex-col items-center gap-4">
                <div className="w-full bg-primary/80 rounded-lg h-[65%] shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" />
                <span className="text-[8px] font-bold text-white/20 uppercase text-center">Reunião Marcada</span>
             </div>
             <div className="flex-1 flex flex-col items-center gap-4">
                <div className="w-full bg-primary/20 rounded-lg h-[15%]" />
                <span className="text-[8px] font-bold text-white/20 uppercase text-center">Negociação</span>
             </div>
             <div className="flex-1 flex flex-col items-center gap-4">
                <div className="w-full bg-primary/5 rounded-lg h-[5%]" />
                <span className="text-[8px] font-bold text-white/20 uppercase text-center">Base Lead</span>
             </div>
          </div>
        </div>
      </div>

      {/* Row 2: Stages and ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tempo Médio */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
           <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Tempo Médio por Estágio</h3>
           </div>
           <div className="space-y-6">
              {[
                { label: 'Nova Lead', val: '11.8 dias', p: 100 },
                { label: 'Qualificação', val: '4.2 dias', p: 40 },
                { label: 'Reunião Marcada', val: '2.5 dias', p: 25 },
                { label: 'Reunião Realizada', val: '1.4 dias', p: 15 },
                { label: 'Negociação', val: '1.9 dias', p: 20 },
                { label: 'Follow up', val: '6 dias', p: 60 },
              ].map((stage, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-white/60">{stage.label}</span>
                    <span className="text-white">{stage.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${stage.p}%` }} className="h-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* ROI por Origem */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
           <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold uppercase tracking-widest">ROI por Origem</h3>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Melhores fontes de leads</p>
          </div>
          <div className="space-y-6 pt-4">
             {[
               { label: 'Meta Ads', val: '1.244 ganhos', color: 'bg-emerald-500' },
               { label: 'Desconhecido', val: '0 ganhos', color: 'bg-blue-500' },
               { label: 'meta_ads', val: '0 ganhos', color: 'bg-amber-500' },
             ].map((roi, i) => (
               <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", roi.color)} />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{roi.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-white">0%</span>
               </div>
             ))}
          </div>
        </div>

        {/* Motivos de Perda */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
           <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold uppercase tracking-widest">Motivos de Perda</h3>
          </div>
          <div className="aspect-square relative flex items-center justify-center">
             <div className="w-full h-full rounded-full border-[15px] border-white/5" />
             <div className="absolute inset-0 p-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="15" strokeDasharray="144 251.2" className="text-emerald-500" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="15" strokeDasharray="107 251.2" strokeDashoffset="-144" className="text-blue-500" />
                </svg>
             </div>
             <div className="absolute flex flex-col items-center">
                <p className="text-3xl font-bold">57%</p>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Principal Motivo</p>
             </div>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-white/40">Não é o público-alvo</span></div>
               <span className="text-white">57%</span>
             </div>
             <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-white/40">Sem interesse</span></div>
               <span className="text-white">43%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
