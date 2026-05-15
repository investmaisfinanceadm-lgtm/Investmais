'use client'

import { useState, useEffect } from 'react'
import {
  BarChart2,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ChevronDown,
  DollarSign,
  Target,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl space-y-3 hover:bg-white/[0.05] transition-all"
    >
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

export default function RelatoriosPage() {
  const [dias, setDias] = useState(7)
  const [isLoading, setIsLoading] = useState(true)
  const [perfData, setPerfData] = useState<any>(null)
  const [insightsData, setInsightsData] = useState<any>(null)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      fetch(`/api/creator/performance?days=${dias}`).then(r => r.json()),
      fetch('/api/creator/insights').then(r => r.json()),
    ])
      .then(([perf, insights]) => {
        setPerfData(perf)
        setInsightsData(insights)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [dias])

  const chartData: { day: string; leads: number }[] = perfData?.chartData || []
  const stats = insightsData?.stats || {}
  const totalWon: number = insightsData?.totalWon ?? 0
  const totalLost: number = insightsData?.totalLost ?? 0
  const totalOpen = Math.max(0, (stats.totalNegocios ?? 0) - totalWon - totalLost)
  const totalLeadsInPeriod = chartData.reduce((s, d) => s + d.leads, 0)
  const avgTicket = totalWon > 0 ? (stats.valorTotalGanho ?? 0) / totalWon : 0
  const stagesData: { id: string; nome: string; count: number; percent: number }[] =
    insightsData?.stagesData || []

  // Build SVG path for daily chart
  const maxLeads = Math.max(...chartData.map(d => d.leads), 1)
  const svgPoints = chartData.map((d, i) => {
    const x = chartData.length > 1 ? (i / (chartData.length - 1)) * 500 : 250
    const y = 190 - Math.round((d.leads / maxLeads) * 170)
    return `${x},${y}`
  })
  const linePath = svgPoints.length > 1 ? `M${svgPoints.join(' L')}` : ''

  const STAGE_COLORS = [
    'bg-primary', 'bg-blue-500', 'bg-amber-500',
    'bg-emerald-500', 'bg-red-500', 'bg-pink-500', 'bg-purple-500', 'bg-white/20',
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Período</p>
          <div className="relative group">
            <select
              value={dias}
              onChange={e => setDias(Number(e.target.value))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs font-bold text-white/60 appearance-none focus:border-primary/40 transition-all outline-none"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 90 dias</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl py-3 px-6 flex items-center gap-3 text-white/40 col-span-1 md:col-span-1 lg:col-start-4">
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-bold">Últimos {dias} dias</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Leads que entraram"
          value={totalLeadsInPeriod}
          icon={Activity}
          color="bg-primary/10 border-primary/20 text-primary"
        />
        <StatCard
          label={`Ganhos — ${stats.taxaConversao ? stats.taxaConversao.toFixed(1) : '0'}% de conversão`}
          value={totalWon}
          icon={Target}
          color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        />
        <StatCard
          label="Perdidos"
          value={totalLost}
          icon={ArrowDownRight}
          color="bg-red-500/10 border-red-500/20 text-red-500"
        />
        <StatCard
          label="Em aberto"
          value={totalOpen}
          icon={Layers}
          color="bg-amber-500/10 border-amber-500/20 text-amber-500"
        />
        <StatCard
          label="Valor ganho"
          value={(stats.valorTotalGanho ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={DollarSign}
          color="bg-blue-500/10 border-blue-500/20 text-blue-400"
        />
        <StatCard
          label="Ticket médio"
          value={avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={TrendingUp}
          color="bg-primary/10 border-primary/20 text-primary"
        />
      </div>

      {/* Chart + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Evolução Diária */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">Evolução diária</h3>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Novos contatos criados por dia</p>
          </div>

          {chartData.length > 0 ? (
            <>
              <div className="h-56 relative">
                <div className="absolute inset-0 border-l border-b border-white/10" />
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {svgPoints.map((pt, i) => {
                    const [x, y] = pt.split(',').map(Number)
                    return (
                      <circle key={i} cx={x} cy={y} r="3" className="text-primary fill-current"
                        vectorEffect="non-scaling-stroke" />
                    )
                  })}
                </svg>
              </div>
              <div className="flex justify-between mt-2 overflow-x-auto scrollbar-none">
                {chartData.map(d => (
                  <span key={d.day} className="text-[9px] font-bold text-white/20 uppercase tracking-widest whitespace-nowrap px-1">
                    {d.day}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-56 flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">
              Nenhum dado para o período selecionado
            </div>
          )}

          <div className="flex items-center gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Entraram</span>
            </div>
          </div>
        </div>

        {/* Funil Visual */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">Funil visual</h3>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Volume de deals por etapa</p>
          </div>

          {stagesData.length > 0 ? (
            <div className="space-y-3 pt-4">
              {stagesData.map((stage, i) => (
                <div key={stage.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-1.5 h-1.5 rounded-full', STAGE_COLORS[i % STAGE_COLORS.length])} />
                      <span className="text-white/60 truncate max-w-[120px]">{stage.nome}</span>
                    </div>
                    <span className="text-white/40">{stage.count} deals</span>
                  </div>
                  <div className="h-4 w-full bg-white/[0.02] rounded-md overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(stage.percent, 2)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={cn('h-full rounded-sm opacity-80', STAGE_COLORS[i % STAGE_COLORS.length])}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-white/20 text-xs font-bold uppercase tracking-widest">
              Nenhum estágio configurado
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
