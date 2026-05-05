'use client'

import { useState } from 'react'
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Target, 
  Download,
  Filter,
  ArrowUpRight,
  ChevronDown,
  Globe,
  PieChart,
  Activity,
  Zap,
  MousePointer2,
  DollarSign
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({ label, value, subtext, icon: Icon, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl space-y-4 hover:bg-white/[0.05] transition-all group"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{label}</p>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        {subtext && <p className="text-[10px] text-white/20 font-bold mt-1 uppercase tracking-widest">{subtext}</p>}
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UTMAnalyticsPage() {
  const [periodo, setPeriodo] = useState('Todos os produtos')

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics UTM</h1>
          <p className="text-white/40 text-sm">Performance das campanhas e anúncios de marketing</p>
        </div>
        
        <div className="relative group">
          <button className="bg-white/[0.03] border border-white/10 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-4 hover:border-primary/40 transition-all">
            {periodo}
            <ChevronDown className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Leads" value="353" subtext="Contatos com UTM" icon={Users} color="bg-primary/10 border-primary/20 text-primary" />
        <StatCard label="Deals Criados" value="288" subtext="Oportunidades abertas" icon={Target} color="bg-blue-500/10 border-blue-500/20 text-blue-400" />
        <StatCard label="Em Pipeline" value="280" subtext="R$ 1.400.000 em valor" icon={Activity} color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" />
        <StatCard label="Taxa de Conversão" value="0.3%" subtext="Lead → Deal ganho" icon={TrendingUp} color="bg-amber-500/10 border-amber-500/20 text-amber-500" />
        <StatCard label="Receita" value="R$ 5.000" subtext="Deals ganhos" icon={DollarSign} color="bg-primary/10 border-primary/20 text-primary" />
      </div>

      {/* Tabs */}
      <div className="bg-white/[0.02] border border-white/5 p-1 rounded-2xl flex items-center w-fit overflow-x-auto scrollbar-none">
        {['Visão Geral', 'Campanhas', 'Anúncios', 'Fontes', 'Timeline'].map((tab, i) => (
          <button key={tab} className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
            i === 0 ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white"
          )}>
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Funil de Conversão */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-12 flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-8 mb-4">
            <h3 className="text-xl font-bold">Funil de Conversão</h3>
          </div>
          
          <div className="relative w-full max-w-lg space-y-1">
            {/* Fontes */}
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="h-20 bg-primary relative flex items-center justify-center overflow-hidden" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}>
              <div className="text-center">
                <p className="text-[8px] font-bold uppercase text-black/60">Fontes</p>
                <p className="text-lg font-bold text-black">1</p>
              </div>
            </motion.div>
            
            {/* Leads */}
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.1 }} className="h-20 bg-blue-500 relative flex items-center justify-center overflow-hidden" style={{ clipPath: 'polygon(10% 0%, 90% 0%, 75% 100%, 25% 100%)' }}>
              <div className="text-center">
                <p className="text-[8px] font-bold uppercase text-black/60">Leads</p>
                <p className="text-lg font-bold text-black">353</p>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/40 px-4">35300%</div>
            </motion.div>

            {/* Deals */}
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 }} className="h-20 bg-emerald-500 relative flex items-center justify-center overflow-hidden" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 65% 100%, 35% 100%)' }}>
              <div className="text-center">
                <p className="text-[8px] font-bold uppercase text-black/60">Deals</p>
                <p className="text-lg font-bold text-black">288</p>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/40 px-4">82%</div>
            </motion.div>

            {/* Ganhos */}
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 }} className="h-20 bg-primary relative flex items-center justify-center overflow-hidden" style={{ clipPath: 'polygon(35% 0%, 65% 0%, 60% 100%, 40% 100%)' }}>
              <div className="text-center">
                <p className="text-[8px] font-bold uppercase text-black/60">Ganhos</p>
                <p className="text-lg font-bold text-black">1</p>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/40 px-4">0%</div>
            </motion.div>
          </div>

          <div className="w-full flex justify-around items-center pt-8 border-t border-white/5">
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-primary">82%</p>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Lead → Deal</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-primary">0%</p>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Deal → Ganho</p>
            </div>
          </div>
        </div>

        {/* Top Campanhas */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <Target className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-bold">Top Campanhas</h3>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-none pr-2">
            {[
              { id: 1, name: 'HMI - Meta Ads (WhatsApp)', leads: 288, deals: 288, value: 'R$ 5.000', conv: '0%', color: 'text-primary' },
              { id: 2, name: 'Direto', leads: 75, deals: 22, value: 'R$ 110.000', conv: '0%', status: 'Em pipeline' },
              { id: 3, name: 'CJ 03 [VID] SOFT', leads: 5, deals: 0, value: '0', conv: '0%' },
              { id: 4, name: 'PA', leads: 5, deals: 0, value: '0', conv: '0%' },
              { id: 5, name: 'CJ 02 [IMG] SOFT', leads: 2, deals: 0, value: '0', conv: '0%' },
            ].map((camp, i) => (
              <div key={camp.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col gap-4 group hover:border-primary/20 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-white/20 tracking-widest">#{camp.id}</span>
                    <h4 className="text-xs font-bold text-white">{camp.name}</h4>
                  </div>
                  <span className={cn("text-xs font-bold", camp.id === 1 ? 'text-primary' : camp.id === 2 ? 'text-amber-500' : 'text-white/40')}>{camp.value}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="bg-white/[0.03] border border-white/5 px-4 py-1 rounded-full text-[9px] font-bold text-white/40">{camp.leads} leads</span>
                    <span className="bg-white/[0.03] border border-white/5 px-4 py-1 rounded-full text-[9px] font-bold text-white/40">{camp.deals} deals</span>
                    {camp.id === 1 && <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-1 rounded-full text-[9px] font-bold">1 ganhos</span>}
                    {camp.status && <span className="bg-white/[0.03] border border-white/5 px-4 py-1 rounded-full text-[9px] font-bold text-white/20 italic">{camp.status}</span>}
                  </div>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{camp.conv} conv.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
