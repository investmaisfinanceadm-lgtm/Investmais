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
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Stats Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, trend, trendValue, icon: Icon, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl space-y-4 group hover:bg-white/[0.05] transition-all"
    >
      <div className="flex items-center justify-between">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", color)}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider", trend === 'up' ? 'text-emerald-500' : 'text-red-500')}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('Este Mês')

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Relatórios e Insights</h1>
          <p className="text-white/40 text-sm">Acompanhe o desempenho das suas operações em tempo real</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/[0.03] border border-white/5 p-1.5 rounded-2xl">
            {['Este Mês', 'Últimos 90 dias', 'Todo Período'].map(p => (
              <button 
                key={p} 
                onClick={() => setPeriodo(p)}
                className={cn(
                  "px-6 py-3 rounded-xl text-xs font-bold transition-all",
                  periodo === p ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="bg-white/[0.03] border border-white/5 p-4 rounded-xl text-white/40 hover:text-white transition-all">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total de Leads" 
          value="12.840" 
          trend="up" 
          trendValue="+14%" 
          icon={Users} 
          color="bg-primary/10 border-primary/20 text-primary" 
        />
        <StatCard 
          label="Mensagens Enviadas" 
          value="8.420" 
          trend="up" 
          trendValue="+22%" 
          icon={Send} 
          color="bg-blue-500/10 border-blue-500/20 text-blue-400" 
        />
        <StatCard 
          label="Taxa de Resposta" 
          value="18.5%" 
          trend="down" 
          trendValue="-2%" 
          icon={Activity} 
          color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
        />
        <StatCard 
          label="Novos Negócios" 
          value="42" 
          trend="up" 
          trendValue="+8" 
          icon={Zap} 
          color="bg-amber-500/10 border-amber-500/20 text-amber-500" 
        />
      </div>

      {/* Charts / Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Chart Mock */}
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Desempenho Semanal</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Conversão de Leads por Dia</p>
                </div>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-3 lg:gap-6">
              {[60, 45, 90, 65, 80, 50, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: `${h}%` }} 
                    className="w-full bg-primary/20 border-t-2 border-primary rounded-t-lg group-hover:bg-primary/40 transition-all cursor-pointer relative"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h*12}
                    </div>
                  </motion.div>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nichos Table */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Melhores Nichos</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Performance por setor</p>
                </div>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5">
                  <th className="px-10 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Setor / Atividade</th>
                  <th className="px-10 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">Volume</th>
                  <th className="px-10 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest text-right">Conversão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { n: 'Imobiliário', v: '2.450', c: '22%' },
                  { n: 'Tecnologia', v: '1.820', c: '18%' },
                  { n: 'Varejo', v: '1.240', c: '15%' },
                  { n: 'Saúde', v: '980', c: '12%' },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-10 py-6 text-sm font-bold text-white">{row.n}</td>
                    <td className="px-10 py-6 text-sm font-medium text-white/40 text-center">{row.v}</td>
                    <td className="px-10 py-6 text-sm font-bold text-primary text-right">{row.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Distribuição de Status</h3>
            <div className="aspect-square relative flex items-center justify-center">
              <PieChart className="w-32 h-32 text-white/5 absolute" />
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="180 251.2" className="text-primary" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="50 251.2" strokeDashoffset="-180" className="text-blue-500" />
              </svg>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Negociação', val: '65%', color: 'bg-primary' },
                { label: 'Agendado', val: '25%', color: 'bg-blue-500' },
                { label: 'Outros', val: '10%', color: 'bg-white/10' },
              ].map(st => (
                <div key={st.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", st.color)} />
                    <span className="text-xs font-medium text-white/40">{st.label}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{st.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Insight da IA</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              O nicho <strong>Imobiliário</strong> teve um crescimento de 22% em conversão esta semana. Recomendamos aumentar o volume de disparos para este setor.
            </p>
            <button className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-2 transition-transform">
              Ver Detalhes <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
