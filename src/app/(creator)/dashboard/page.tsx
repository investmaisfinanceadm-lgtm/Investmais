'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Video, Clock, Library, Plus, ArrowRight, TrendingUp, BarChart3, Activity, Zap, ChevronDown, Users, Globe } from 'lucide-react'
import { cn, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'

interface DashboardVideo {
    id: string
    nome_produto: string
    status: string
    created_at: string
    duracao: number
}

interface DashboardContact {
    id: string
    nome: string
    empresa: string | null
    status_funil: string
    canal_origem: string | null
    created_at: string
}

interface UserStats {
    nome: string
    cota_mensal: number
    cota_usada: number
    videosTotal: number
    totalLeads: number
    leadsHoje: number
    conversoes: number
    contatosRecentes: DashboardContact[]
}

export default function DashboardPage() {
    const [stats, setStats] = useState<UserStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const [chartScale, setChartScale] = useState<7 | 30 | 90>(7)
    const [chartData, setChartData] = useState<any[]>([])
    const [originData, setOriginData] = useState<any[]>([])
    const [isChartLoading, setIsChartLoading] = useState(true)
    const [chartError, setChartError] = useState(false)

    const fetchChartData = useCallback(async () => {
        setIsChartLoading(true)
        setChartError(false)
        try {
            const r = await fetch(`/api/creator/performance?days=${chartScale}`)
            if (!r.ok) throw new Error('Data err')
            const d = await r.json()
            setChartData(d.chartData || [])
            setOriginData(d.originData || [])
        } catch (e) {
            setChartError(true)
        } finally {
            setIsChartLoading(false)
        }
    }, [chartScale])

    useEffect(() => {
        fetchChartData()
    }, [fetchChartData])

    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch('/api/creator/dashboard')
                if (response.ok) {
                    const data = await response.json()
                    if (data.profile) setStats(data.profile)
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

            {/* Metric Cards - Lead Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <div className="card-hover group border-white/5 bg-white/[0.02] p-6 rounded-[32px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                            <TrendingUp className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Base Leads</p>
                            <h3 className="text-2xl font-black text-white">{isLoading ? '—' : stats?.totalLeads || 0}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-emerald-400">+12%</span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">vs mês anterior</span>
                    </div>
                </div>

                <div className="card-hover group border-white/5 bg-white/[0.02] p-6 rounded-[32px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Plus className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Plus className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Novos Hoje</p>
                            <h3 className="text-2xl font-black text-white">{isLoading ? '—' : stats?.leadsHoje || 0}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Atividade em tempo real</span>
                    </div>
                </div>

                <div className="card-hover group border-white/5 bg-white/[0.02] p-6 rounded-[32px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Zap className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
                            <Zap className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Conversões</p>
                            <h3 className="text-2xl font-black text-white">{isLoading ? '—' : stats?.conversoes || 0}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400/60 uppercase text-[9px] font-black tracking-widest italic">
                        Win Rate Estável
                    </div>
                </div>

                <div className="card-hover group border-white/5 bg-white/[0.02] p-6 rounded-[32px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Activity className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Taxa de Conversão</p>
                            <h3 className="text-2xl font-black text-white">{isLoading ? '—' : stats ? ((stats.conversoes / (stats.totalLeads || 1)) * 100).toFixed(1) : 0}%</h3>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                        <div 
                            className="h-full bg-blue-400 transition-all duration-1000" 
                            style={{ width: stats ? `${(stats.conversoes / (stats.totalLeads || 1)) * 100}%` : '0%' }} 
                        />
                    </div>
                </div>
            </div>

            {/* Performance Analytics Section - NEW RECOMMENDATION */}
            <div className="card border-white/5 bg-white/[0.02] p-5 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 mb-8 md:mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                                <Users className="w-4 h-4 text-accent" />
                            </div>
                            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">Crescimento da Base</h2>
                        </div>
                        <p className="text-[11px] text-gray-600 font-bold uppercase tracking-widest">Aquisição de novos leads por período</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-4">
                    <div className="lg:col-span-3 h-[300px]">
                        {isChartLoading ? (
                            <div className="w-full h-full flex flex-col justify-end gap-2 pb-6 px-4">
                                <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-px bg-white" />)}
                                </div>
                                <div className="flex h-full items-end gap-2 px-6">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div key={i} className="flex-1 bg-white/5 shimmer rounded-t-lg" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                                ))}
                                </div>
                            </div>
                        ) : chartError ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-4">
                                <Activity className="w-10 h-10 text-red-500/50" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Erro ao carregar dados</p>
                                <button onClick={fetchChartData} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-black text-white uppercase transition-all">Tentar Novamente</button>
                            </div>
                        ) : chartData.length === 0 || chartData.every(d => d.leads === 0) ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-4">
                                <Users className="w-10 h-10 text-gray-700/50" />
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nenhum novo lead<br/>encontrado para o período</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }} 
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
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 700 }}
                                        itemStyle={{ fontWeight: 800, color: '#30CB7B' }}
                                        labelStyle={{ color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                                    />
                                    <Bar dataKey="leads" name="Novos Leads" fill="#30CB7B" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    
                    <div className="lg:col-span-1 flex flex-col justify-center border-l border-white/5 pl-8 hidden lg:flex">
                         <div className="space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> Origem dos Leads
                                </h3>
                                <div className="space-y-3">
                                    {isChartLoading ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="h-4 w-full shimmer bg-white/5 rounded-full" />
                                        ))
                                    ) : originData.length === 0 ? (
                                        <p className="text-[9px] font-bold text-gray-700 uppercase italic">Aguardando dados...</p>
                                    ) : (
                                        originData.map((item, idx) => (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                    <span className="text-gray-400">{item.name}</span>
                                                    <span className="text-white">{item.value}</span>
                                                </div>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-accent transition-all duration-1000" 
                                                        style={{ 
                                                            width: `${(item.value / originData.reduce((acc, curr) => acc + curr.value, 0)) * 100}%`,
                                                            opacity: 1 - (idx * 0.2)
                                                        }} 
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 pt-4 md:pt-8">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                             <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Últimos Contatos do CRM</h2>
                        </div>
                        <Link href="/crm" className="text-[10px] font-black text-accent uppercase tracking-widest hover:translate-x-2 transition-all flex items-center gap-2 group">
                            Ver Funil Completo
                            <ArrowRight className="w-3 h-3 group-hover:scale-125 transition-transform" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="card h-24 shimmer opacity-20 border-white/5 bg-white/[0.02] rounded-[32px]" />
                            ))}
                        </div>
                    ) : !stats?.contatosRecentes || stats.contatosRecentes.length === 0 ? (
                        <div className="card border-dashed border-white/10 bg-transparent py-24 text-center space-y-6 rounded-[56px] shadow-2xl">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5 transition-transform hover:scale-110">
                                <Activity className="w-10 h-10 text-gray-800" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-500 uppercase tracking-[0.3em] font-black text-xs">Sem contatos registrados</p>
                                <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest italic">Aguardando entrada de novos leads</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.contatosRecentes.map((contato) => (
                                <div key={contato.id} className="card-hover group flex items-center gap-4 md:gap-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] p-4 md:p-6 rounded-[24px] md:rounded-[32px] transition-all">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-accent/30 transition-all shadow-xl group-hover:shadow-accent/5 overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-accent font-black text-xs uppercase">
                                            {contato.nome.substring(0, 2)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-black text-xs md:text-sm uppercase tracking-tight truncate group-hover:text-accent transition-colors duration-500">
                                            {contato.nome}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-1 md:mt-2">
                                            <div className="flex items-center gap-2">
                                                <Library className="w-3 h-3 text-gray-700" />
                                                <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                                                    {contato.empresa || 'Empresa não inf.'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-gray-700" />
                                                <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                                                    {formatDateTime(contato.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all",
                                            contato.status_funil === 'cliente' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                            contato.status_funil === 'oportunidade' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 
                                            'bg-white/5 text-gray-400 border-white/10'
                                        )}>
                                            {contato.status_funil}
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
