'use client'

import { useState } from 'react'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Clock,
  List,
  LayoutGrid
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Constants ───────────────────────────────────────────────────────────────
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const ACTIVITIES = [
  { day: 30, month: 3, label: 'LEAD AP', type: 'green' },
  { day: 1, month: 4, label: 'Follow up', type: 'green' },
  { day: 4, month: 4, label: 'HMI - Ítalo', type: 'green' },
  { day: 4, month: 4, label: 'HMI - Rômulo', type: 'green' },
  { day: 4, month: 4, label: 'HMI - Ana Beatriz', type: 'green' },
  { day: 5, month: 4, label: 'Follow UP - Narivaldo', type: 'green' },
  { day: 5, month: 4, label: 'Fazer ligação para Edm...', type: 'blue' },
  { day: 5, month: 4, label: 'Follow Up Lívia', type: 'green' },
  { day: 6, month: 4, label: 'Follow Up Josyelem', type: 'green' },
  { day: 8, month: 4, label: 'Follow Up Priscila', type: 'green' },
  { day: 8, month: 4, label: 'HMI - Léo', type: 'green' },
  { day: 8, month: 4, label: 'GB - Follow Up - Walton', type: 'green' },
  { day: 11, month: 4, label: 'Mandar msg', type: 'green' },
  { day: 11, month: 4, label: 'Entrar em contato', type: 'green' },
  { day: 15, month: 4, label: 'Entrar em contato', type: 'green' },
  { day: 25, month: 4, label: 'Mandar mensagem', type: 'green' },
]

// ─── Component ───────────────────────────────────────────────────────────────
export default function AtividadesPage() {
  const [view, setView] = useState('Mês')

  // Create calendar grid for May 2026
  // May 1st 2026 is a Friday (index 5)
  // Total days: 31
  // We need to fill the grid (7 cols x 6 rows usually)
  const calendarDays = []
  
  // April days (prev month)
  for (let i = 26; i <= 30; i++) {
    calendarDays.push({ day: i, month: 3, isCurrentMonth: false })
  }
  
  // May days
  for (let i = 1; i <= 31; i++) {
    calendarDays.push({ day: i, month: 4, isCurrentMonth: true })
  }
  
  // June days (next month)
  for (let i = 1; i <= 6; i++) {
    calendarDays.push({ day: i, month: 5, isCurrentMonth: false })
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
          <div className="flex items-center gap-4">
            <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">7 atrasadas</span>
            <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">3 para hoje</span>
            <span className="text-white/20 text-[10px] font-bold uppercase tracking-wider">20 pendentes</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nova Atividade
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select className="bg-white/[0.02] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold text-white/60 appearance-none focus:border-primary/40 transition-all outline-none min-w-[140px]">
              <option>Pendentes</option>
              <option>Concluídas</option>
              <option>Todas</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 rotate-90" />
          </div>
          <div className="relative flex-1 md:flex-none">
            <select className="bg-white/[0.02] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold text-white/60 appearance-none focus:border-primary/40 transition-all outline-none min-w-[140px]">
              <option>Todos</option>
              <option>Vendas</option>
              <option>Suporte</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 rotate-90" />
          </div>
        </div>

        <div className="flex items-center bg-white/[0.02] border border-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setView('Mês')}
            className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", view === 'Mês' ? 'bg-primary text-white' : 'text-white/40 hover:text-white')}
          >
            Mês
          </button>
          <button 
            onClick={() => setView('Semana')}
            className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", view === 'Semana' ? 'bg-primary text-white' : 'text-white/40 hover:text-white')}
          >
            Semana
          </button>
          <div className="w-[1px] h-4 bg-white/5 mx-1" />
          <button className="p-2 text-white/40 hover:text-white transition-all"><List className="w-4 h-4" /></button>
          <button className="p-2 text-primary transition-all"><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        {/* Calendar Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h2 className="text-lg font-bold text-white">maio 2026</h2>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-primary/40 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="px-6 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all">
              Hoje
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-primary/40 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01]">
          {DAYS.map(day => (
            <div key={day} className="py-4 text-center">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{day}</span>
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="grid grid-cols-7 border-collapse">
          {calendarDays.map((date, idx) => (
            <div 
              key={idx} 
              className={cn(
                "min-h-[140px] border-r border-b border-white/5 p-4 transition-all relative group",
                !date.isCurrentMonth && "opacity-20",
                date.day === 5 && date.month === 4 && "bg-primary/5"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={cn(
                  "text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center transition-all",
                  date.day === 5 && date.month === 4 ? "bg-primary text-black" : "text-white/40 group-hover:text-white"
                )}>
                  {date.day}
                </span>
              </div>

              {/* Activities for this day */}
              <div className="space-y-1.5 overflow-hidden">
                {ACTIVITIES.filter(a => a.day === date.day && a.month === date.month).map((activity, aIdx) => (
                  <motion.div 
                    key={aIdx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight truncate border",
                      activity.type === 'green' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                    )}
                  >
                    {activity.label}
                  </motion.div>
                ))}
                
                {/* + More indicator like in screenshot */}
                {ACTIVITIES.filter(a => a.day === date.day && a.month === date.month).length > 3 && (
                  <p className="text-[9px] font-bold text-white/20 text-center mt-1">+2 mais</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
