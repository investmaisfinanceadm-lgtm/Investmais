'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Video, Clock, Library, Plus, ArrowRight, TrendingUp, BarChart3, Activity, Zap, ChevronDown } from 'lucide-react'
import { cn, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const MOCK_DATA_7 = [
  { day: "Day 01", email: 42, whatsapp: 87, instagram: 31 },
  { day: "Day 02", email: 55, whatsapp: 93, instagram: 44 },
  { day: "Day 03", email: 38, whatsapp: 76, instagram: 52 },
  { day: "Day 04", email: 61, whatsapp: 110, instagram: 38 },
  { day: "Day 05", email: 49, whatsapp: 98, instagram: 61 },
  { day: "Day 06", email: 70, whatsapp: 125, instagram: 55 },
  { day: "Day 07", email: 58, whatsapp: 103, instagram: 47 }
]

const generateData = (days: number) => {
  if (days === 7) return MOCK_DATA_7;
  return Array.from({ length: days }).map((_, i) => ({
    day: `D${String(i + 1).padStart(2, '0')}`,
    email: 40 + Math.sin(i) * 15 + (i % 3) * 5,
    whatsapp: 80 + Math.cos(i) * 20 + (i % 2) * 10,
    instagram: 30 + Math.sin(i / 2) * 10 + (i % 4) * 5,
  }))
}

interface DashboardVideo {
    id: string
    nome_produto: string
    status: string
    created_at: string
    duracao: number
}

interface UserStats {
    nome: string
    cota_mensal: number
    cota_usada: number
    videosTotal: number
}

export default function DashboardPage() {
    const [stats, setStats] = useState<UserStats | null>(null)
    const [recentVideos, setRecentVideos] = useState<DashboardVideo[]>([])
    const [chartScale, setChartScale] = useState<7 | 30 | 90>(7)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch('/api/creator/dashboard')
                if (response.ok) {
                    const data = await response.json()
                    if (data.profile) setStats(data.profile)
                    setRecentVideos(data.recentVideos || [])
                }
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const quotaPercent = stats ? Math.min(Math.round((stats.cota_usada / stats.cota_mensal) * 100), 100) : 0

    const greeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Bom dia'
        if (hour < 18) return 'Boa tarde'
        return 'Boa noite'
    }

    return (
        <div className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 max-w-7xl mx-auto animate-fade-in pb-20">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 md:gap-8 pb-6 md:pb-8 border-b border-white/5">
                <div className="space-y-3 md:space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 transition-all hover:bg-accent/20">
                        <Activity className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Painel Operacional Ativo</span>
                    </div>
                    {isLoading ? (
                        <div className="shimmer h-10 w-64 rounded-2xl" />
                    ) : (
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            {greeting()}, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-accent">
                                {stats?.nome?.split(' ')[0] || 'Investidor'}
                            </span> ⚡
                        </h1>
                    )}
                    <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px]">
                        ESTÚDIO DE CONTEÚDO AI • STATUS OPERACIONAL: ONLINE
                    </p>
                </div>
                <Link href="/criar" className="btn-primary group flex items-center gap-3 px-6 py-3.5 md:px-10 md:py-5 shadow-accent/20 hover:shadow-accent-lg active:scale-95 transition-all bg-accent text-black font-black uppercase tracking-widest text-xs rounded-2xl self-start md:self-auto">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Iniciar Nova Produção</span>
                </Link>
            </div>

            {/* Metric Cards - High Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                <div className="card-hover group border-white/5 bg-white/[0.02] p-5 md:p-8 rounded-[32px] md:rounded-[40px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Video className="w-20 md:w-24 h-20 md:h-24" />
                    </div>
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform shadow-accent/10 shadow-lg">
                            <Video className="w-6 h-6 md:w-7 md:h-7 text-accent" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Cota Utilizada</p>
                            <p className="text-3xl font-black text-white leading-none mt-2">{isLoading ? '—' : stats?.cota_usada || 0}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Nível de Processamento</p>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">{quotaPercent}%</p>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-accent rounded-full transition-all duration-1000 ease-out" style={{ width: `${quotaPercent}%` }} />
                        </div>
                    </div>
                </div>

                <div className="card-hover group border-white/5 bg-white/[0.02] p-5 md:p-8 rounded-[32px] md:rounded-[40px] relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Zap className="w-20 md:w-24 h-20 md:h-24" />
                    </div>
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20 group-hover:scale-110 transition-transform shadow-amber-400/10 shadow-lg">
                            <Zap className="w-6 h-6 md:w-7 md:h-7 text-amber-400" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Créditos AI</p>
                            <p className="text-3xl font-black text-white leading-none mt-2">
                                {isLoading ? '—' : stats ? stats.cota_mensal - stats.cota_usada : 0}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                             Capacidade para geração imediata
                         </p>
                    </div>
                </div>

                <div className="card-hover group border-white/5 bg-white/[0.02] p-5 md:p-8 rounded-[32px] md:rounded-[40px] relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Library className="w-20 md:w-24 h-20 md:h-24" />
                    </div>
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-400/10 flex items-center justify-center border border-blue-400/20 group-hover:scale-110 transition-transform shadow-blue-400/10 shadow-lg">
                            <Library className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Acervo Ativo</p>
                            <p className="text-3xl font-black text-white leading-none mt-2">{isLoading ? '—' : stats?.videosTotal || 0}</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                        Total de ativos otimizados armazenados
                    </p>
                </div>
            </div>

            {/* Performance Analytics Section - NEW RECOMMENDATION */}
            <div className="card border-white/5 bg-white/[0.02] p-5 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 mb-8 md:mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <BarChart3 className="w-4 h-4 text-purple-400" />
                            </div>
                            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">Matriz de Performance (Simulada)</h2>
                        </div>
                        <p className="text-[11px] text-gray-600 font-bold uppercase tracking-widest">Fluxo de engajamento nos canais ativos</p>
                    </div>
                    <div className="flex gap-4">
                         <div className="relative">
                            <select 
                                value={chartScale}
                                onChange={(e) => setChartScale(Number(e.target.value) as 7 | 30 | 90)}
                                className="appearance-none bg-white/5 border border-white/5 hover:border-white/10 px-6 py-3 pl-4 pr-10 rounded-2xl text-[9px] font-black text-white uppercase tracking-widest cursor-pointer outline-none transition-colors"
                            >
                                <option className="bg-[#0A192F] text-white" value={7}>Escala: Últimos 7 Dias</option>
                                <option className="bg-[#0A192F] text-white" value={30}>Escala: Últimos 30 Dias</option>
                                <option className="bg-[#0A192F] text-white" value={90}>Escala: Últimos 90 Dias</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                         </div>
                    </div>
                </div>

                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateData(chartScale)} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} 
                                dy={10}
                                minTickGap={20}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }} 
                                dx={-10}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 700 }}
                                itemStyle={{ fontWeight: 800 }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                            />
                            <Legend 
                                iconType="circle" 
                                wrapperStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '16px' }}
                            />
                            <Line type="monotone" dataKey="email" name="Email" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="whatsapp" name="WhatsApp" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="instagram" name="Instagram" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 pt-4 md:pt-8">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                             <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Protocolos de Geração Recentes</h2>
                        </div>
                        <Link href="/biblioteca" className="text-[10px] font-black text-accent uppercase tracking-widest hover:translate-x-2 transition-all flex items-center gap-2 group">
                            Acessar Acervo
                            <ArrowRight className="w-3 h-3 group-hover:scale-125 transition-transform" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="card h-24 shimmer opacity-20 border-white/5 bg-white/[0.02] rounded-[32px]" />
                            ))}
                        </div>
                    ) : recentVideos.length === 0 ? (
                        <div className="card border-dashed border-white/10 bg-transparent py-24 text-center space-y-6 rounded-[56px] shadow-2xl">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5 transition-transform hover:scale-110">
                                <Video className="w-10 h-10 text-gray-800" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-500 uppercase tracking-[0.3em] font-black text-xs">Nenhum rastro de conteúdo detectado</p>
                                <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest italic">Aguardando comando de inicialização</p>
                            </div>
                            <Link href="/criar" className="btn-primary inline-flex items-center gap-4 px-10 py-5 bg-accent text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-accent/20">
                                <Plus className="w-4 h-4" />
                                <span>Configurar Primeira Campanha</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentVideos.map((video) => (
                                <div key={video.id} className="card-hover group flex items-center gap-4 md:gap-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] p-4 md:p-6 rounded-[24px] md:rounded-[32px] transition-all">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-accent/30 transition-all shadow-xl group-hover:shadow-accent/5">
                                        <Video className="w-6 h-6 md:w-7 md:h-7 text-gray-700 group-hover:text-accent transition-all duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-black text-xs md:text-sm uppercase tracking-tight truncate group-hover:text-accent transition-colors duration-500">
                                            {video.nome_produto}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-2 md:mt-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-gray-700" />
                                                <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                                                    {formatDateTime(video.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-3 h-3 text-gray-700" />
                                                <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                                                    Escala: {video.duracao}s
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all",
                                            video.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                            video.status === 'processando' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20 animate-pulse' : 
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", 
                                                video.status === 'concluido' ? 'bg-emerald-400' : 
                                                video.status === 'processando' ? 'bg-amber-400' : 'bg-red-500'
                                            )} />
                                            {getStatusLabel(video.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Quick Actions */}
                <div className="space-y-10">
                    <div className="space-y-6">
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] px-2">Comandos Operais</h2>
                        <div className="space-y-4">
                            <Link href="/criar" className="block group">
                                <div className="card-hover border-white/5 bg-accent p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-accent/20 rounded-[32px] md:rounded-[40px] group-hover:scale-[1.02] transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <p className="font-black text-black uppercase tracking-[0.2em] text-sm italic">Estúdio Criativo</p>
                                        <p className="text-[10px] text-black/70 font-bold mt-2 uppercase tracking-widest leading-relaxed">Gere ativos de alta conversão agora</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/biblioteca" className="block group">
                                <div className="card-hover border-white/5 bg-white/[0.02] p-5 md:p-8 flex flex-col gap-4 md:gap-6 hover:border-blue-500/30 rounded-[32px] md:rounded-[40px] group-hover:scale-[1.02] transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Library className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white uppercase tracking-[0.2em] text-sm italic">Gerenciador Hub</p>
                                        <p className="text-[10px] text-gray-600 font-bold mt-2 uppercase tracking-widest leading-relaxed">Acesse o seu repositório digital</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Pro Tip Card - ENHANCED */}
                    <div className="bg-gradient-to-br from-[#0D2447] to-transparent p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-white/5 space-y-4 md:space-y-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700">
                            <TrendingUp className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-3">
                             <Activity className="w-4 h-4 text-accent" />
                             <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">IA Insight Node</p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-white font-black text-base leading-tight italic tracking-tighter">
                                &quot;Ativos gerados em tom 'Persuasivo' apresentam CTR 45% maior para Home Equity.&quot;
                            </p>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Análise de Dados Consolidada</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
