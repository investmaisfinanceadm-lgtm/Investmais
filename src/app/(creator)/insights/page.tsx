'use client'

import { useState, useEffect } from 'react'
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
  RefreshCw,
  CheckCircle2
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
  const [periodo, setPeriodo] = useState('Geral')
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = () => {
    setIsLoading(true)
    fetch('/api/creator/insights')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 lg:p-10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const { stats, stagesData, temposMedios, roiData, motivosData, totalLost } = data || {}
  const bgColors = ['bg-primary', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500']

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
          <button onClick={fetchData} className="bg-white/[0.03] border border-white/10 p-3 rounded-xl text-white/40 hover:text-white transition-all"><RefreshCw className="w-5 h-5" /></button>
          <button className="bg-primary px-8 py-3 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* IA Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <IAStatCard label="Total de Negócios" value={stats?.totalNegocios || 0} trend="up" trendValue="+0%" icon={Target} color="bg-primary/10 border-primary/20 text-primary" />
        <IAStatCard label="Taxa de Conversão" value={`${(stats?.taxaConversao || 0).toFixed(1)}%`} trend="up" trendValue="+0%" icon={TrendingUp} color="bg-blue-500/10 border-blue-500/20 text-blue-400" />
        <IAStatCard label="Valor Total Ganho" value={(stats?.valorTotalGanho || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} trend="up" trendValue="+0%" icon={DollarSign} color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" />
        <IAStatCard label="Negócios em Risco" value={stats?.negociosRisco || 0} trend={stats?.negociosRisco > 0 ? "down" : "up"} trendValue="Atenção" icon={AlertCircle} color="bg-white/5 border-white/10 text-white/40" />
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
          <div className="h-64 relative mt-10 flex items-center justify-center">
             <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Gráfico em desenvolvimento</p>
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
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Distribuição de deals em aberto</p>
          </div>
          <div className="h-64 flex items-end justify-around gap-4 pb-4 overflow-x-auto scrollbar-none">
             {stagesData?.map((stage: any, i: number) => (
                <div key={stage.id} className="flex-1 flex flex-col items-center gap-4 min-w-[50px]">
                  <div 
                    className={cn("w-full rounded-lg transition-all", bgColors[i % bgColors.length])} 
                    style={{ height: `${Math.max(5, stage.percent)}%` }}
                  />
                  <span className="text-[8px] font-bold text-white/20 uppercase text-center line-clamp-2" title={`${stage.nome} (${stage.count})`}>
                    {stage.nome}
                    <br/><span className="text-white">{stage.count}</span>
                  </span>
                </div>
             ))}
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
              {temposMedios?.map((stage: any, i: number) => (
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
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Melhores fontes de conversão</p>
          </div>
          <div className="space-y-6 pt-4">
             {roiData?.length > 0 ? roiData.map((roi: any, i: number) => (
               <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", bgColors[i % bgColors.length])} />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{roi.label}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-white">{roi.percent}%</span>
                    <span className="text-[8px] text-white/40">{roi.val}</span>
                  </div>
               </div>
             )) : (
               <p className="text-xs text-white/40 text-center py-4">Sem dados suficientes</p>
             )}
          </div>
        </div>

        {/* Motivos de Perda */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
           <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold uppercase tracking-widest">Motivos de Perda</h3>
          </div>
          
          {motivosData?.length > 0 ? (
            <>
              <div className="aspect-square relative flex items-center justify-center">
                 <div className="w-full h-full rounded-full border-[15px] border-white/5" />
                 <div className="absolute inset-0 p-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="15" strokeDasharray={`${(motivosData[0].percent / 100) * 251.2} 251.2`} className="text-emerald-500" />
                    </svg>
                 </div>
                 <div className="absolute flex flex-col items-center">
                    <p className="text-3xl font-bold">{motivosData[0].percent}%</p>
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center px-4">{motivosData[0].label}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 {motivosData.map((motivo: any, i: number) => (
                   <div key={i} className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                     <div className="flex items-center gap-2"><div className={cn("w-2 h-2 rounded-full", i===0 ? 'bg-emerald-500' : 'bg-blue-500')} /> <span className="text-white/40 truncate max-w-[150px]">{motivo.label}</span></div>
                     <span className="text-white">{motivo.percent}%</span>
                   </div>
                 ))}
              </div>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center h-full pb-10">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mb-4" />
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center">Nenhum deal perdido registrado!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
