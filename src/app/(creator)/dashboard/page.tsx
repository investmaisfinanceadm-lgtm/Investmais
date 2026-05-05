'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Video, Clock, Library, Plus, ArrowRight, TrendingUp, BarChart3, Activity, Zap, ChevronDown, Users, Globe, DollarSign, CheckCircle2, ArrowUpRight, Cpu, Shield, Layers, Target, Sparkles, Radio } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatDateTime } from '@/lib/utils'
import { formatCurrency as formatBRL } from '@/lib/crm-utils'

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
    totalLeads: number
    leadsHoje: number
    totalFaturamento: number
    totalWon: number
    ticketMedio: number
    taxaConversao: number
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
    const [showFilters, setShowFilters] = useState(false)

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

    const greeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Strategic Morning'
        if (hour < 18) return 'Executive Afternoon'
        return 'Operational Night'
    }

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
            <div className="ambient-bg" />
            
            <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-16 pb-32">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/5 pb-16">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-sidebar-primary/5 border border-sidebar-primary/20 backdrop-blur-3xl">
                            <div className="w-2 h-2 rounded-full bg-sidebar-primary netlife-glow shadow-none animate-pulse" />
                            <span className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.5em] italic">Neural Network Operational</span>
                        </div>
                        
                        <div className="space-y-4">
                            <h1 className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tighter uppercase italic">
                                {greeting()}, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sidebar-primary to-blue-400">
                                    {stats?.nome?.split(' ')[0] || 'Executive'}
                                </span>
                            </h1>
                            <div className="flex items-center gap-4 text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic">
                                <Cpu className="w-4 h-4" /> System Synchronization v4.0.2 Active
                            </div>
                        </div>
                    </div>

                    <Link href="/criar" className="btn-primary px-12 py-7 netlife-glow shadow-none text-xs font-black uppercase tracking-[0.3em] italic group self-start lg:self-auto flex items-center gap-4">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" />
                        Initialize Production
                    </Link>
                </div>

                {/* Key Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: 'Total Revenue', value: formatBRL(stats?.totalFaturamento || 0), icon: DollarSign, color: 'text-sidebar-primary', status: 'Sustained', sub: 'Validated Sales' },
                        { label: 'Average Ticket', value: formatBRL(stats?.ticketMedio || 0), icon: Zap, color: 'text-blue-400', status: 'Optimized', sub: 'Neural Value' },
                        { label: 'Conversions (Won)', value: stats?.totalWon || 0, icon: CheckCircle2, color: 'text-emerald-400', status: 'Closed', sub: 'Protocol Success' },
                        { label: 'Win Efficiency', value: `${(stats?.taxaConversao || 0).toFixed(1)}%`, icon: TrendingUp, color: 'text-sidebar-primary', status: 'Active', sub: 'Conversion Pulse' }
                    ].map((metric, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="nl-glass p-10 rounded-[48px] border-white/5 space-y-8 relative overflow-hidden group hover:border-sidebar-primary/20 transition-all duration-700"
                        >
                            <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center justify-between">
                                <div className={cn("w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center transition-all duration-700 group-hover:scale-110", metric.color)}>
                                    <metric.icon className="w-7 h-7" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-white/10 uppercase tracking-widest block mb-1">Status</span>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest italic", metric.color)}>{metric.status}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">{metric.label}</p>
                                <h3 className="text-4xl font-black text-white tracking-tighter italic">
                                    {isLoading ? <div className="h-10 w-32 bg-white/5 animate-pulse rounded-xl" /> : metric.value}
                                </h3>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                <div className={cn("w-2 h-2 rounded-full animate-pulse", metric.color.replace('text-', 'bg-'))} />
                                <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">{metric.sub}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Analytics Matrix Section */}
                <div className="nl-glass p-12 lg:p-16 rounded-[64px] border-white/5 relative overflow-hidden shadow-[0_100px_200px_rgba(0,0,0,0.8)]">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sidebar-primary/5 rounded-full blur-[150px] -mr-40 -mt-40 pointer-events-none opacity-40" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20 relative z-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-sidebar-primary/10 border border-sidebar-primary/20 flex items-center justify-center text-sidebar-primary">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] italic">Acquisition Matrix</h2>
                                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Growth Propagation Feed</p>
                                </div>
                            </div>
                            <p className="text-white/20 text-xs font-black uppercase tracking-widest max-w-xl leading-relaxed italic">Real-time telemetry of lead infiltration across digital sectors.</p>
                        </div>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-8 bg-black/40 border border-white/5 hover:border-sidebar-primary/40 px-10 py-5 rounded-[24px] text-[10px] font-black text-white uppercase tracking-[0.3em] transition-all duration-700 group/btn italic"
                            >
                                <span className="text-sidebar-primary">Time Frame:</span>
                                <span>{chartScale} Days</span>
                                <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform duration-700", showFilters && "rotate-180")} />
                            </button>
                            
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute top-full right-0 mt-4 w-64 nl-glass border-white/10 rounded-[32px] shadow-2xl overflow-hidden z-50 p-3"
                                    >
                                        {[7, 30, 90].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => {
                                                    setChartScale(val as 7 | 30 | 90);
                                                    setShowFilters(false);
                                                }}
                                                className={cn(
                                                    "w-full px-8 py-5 text-[10px] font-black uppercase tracking-widest text-left rounded-2xl transition-all duration-500 flex items-center justify-between",
                                                    chartScale === val 
                                                        ? "bg-sidebar-primary text-black italic" 
                                                        : "text-white/20 hover:bg-white/[0.03] hover:text-white"
                                                )}
                                            >
                                                <span>Last {val} Days</span>
                                                {chartScale === val && <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 relative z-10">
                        <div className="lg:col-span-3 h-[450px]">
                            {isChartLoading ? (
                                <div className="w-full h-full flex items-end gap-6 px-10 pb-10">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="flex-1 bg-white/[0.02] border border-white/5 rounded-t-3xl animate-pulse" style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDelay: `${i * 100}ms` }}></div>
                                    ))}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white" opacity={0.02} />
                                        <XAxis 
                                            dataKey="day" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: 'rgba(255,255,255,0.1)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }} 
                                            dy={25}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: 'rgba(255,255,255,0.1)', fontSize: 9, fontWeight: 900 }} 
                                        />
                                        <Tooltip 
                                            cursor={{ fill: 'white', opacity: 0.02 }}
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', backdropFilter: 'blur(40px)', padding: '20px' }}
                                            itemStyle={{ fontWeight: 900, color: 'hsl(var(--primary))', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                                            labelStyle={{ color: 'rgba(255,255,255,0.2)', marginBottom: '8px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}
                                        />
                                        <Bar dataKey="leads" fill="url(#barGradient)" radius={[16, 16, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        
                        <div className="lg:col-span-1 space-y-12 border-l border-white/5 pl-16 hidden lg:block">
                            <div>
                                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                                    <Globe className="w-5 h-5 text-sidebar-primary" /> Sector Traffic
                                </h3>
                                <div className="space-y-8">
                                    {isChartLoading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="space-y-4">
                                                <div className="h-2 w-24 bg-white/5 rounded-full" />
                                                <div className="h-1.5 w-full bg-white/5 rounded-full" />
                                            </div>
                                        ))
                                    ) : originData.map((item, idx) => (
                                        <div key={idx} className="space-y-4">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                                                <span className="text-white/40">{item.name}</span>
                                                <span className="text-sidebar-primary">{item.value} Nodes</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(item.value / originData.reduce((acc, curr) => acc + curr.value, 1)) * 100}%` }}
                                                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                                                    className="h-full bg-sidebar-primary netlife-glow shadow-none rounded-full"
                                                    style={{ opacity: 1 - (idx * 0.15) }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pt-12 border-t border-white/5">
                                <div className="p-8 rounded-[32px] bg-sidebar-primary/5 border border-sidebar-primary/10">
                                    <p className="text-[9px] font-black text-sidebar-primary uppercase tracking-[0.3em] mb-4">AI Insight</p>
                                    <p className="text-[11px] font-black text-white leading-relaxed italic uppercase tracking-tighter">
                                        &quot;Strategic shifts in Sector 4 traffic suggest higher high-ticket potential.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pt-12">
                    {/* Intelligence Feed */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex items-center justify-between px-6">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                    <Radio className="w-6 h-6 text-sidebar-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] italic">Intelligence Feed</h2>
                                    <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Live Node Synchronization</p>
                                </div>
                            </div>
                            <Link href="/crm" className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.3em] hover:translate-x-4 transition-all duration-700 flex items-center gap-4 group italic">
                                Deep Analysis Matrix
                                <ArrowRight className="w-5 h-5 group-hover:scale-125 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-6">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-24 bg-white/[0.02] border border-white/5 rounded-[40px] animate-pulse" />
                                ))
                            ) : (stats?.contatosRecentes || []).map((contato, idx) => (
                                <motion.div 
                                    key={contato.id} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="nl-glass p-8 rounded-[48px] border-white/5 flex items-center gap-8 group hover:border-sidebar-primary/20 transition-all duration-700"
                                >
                                    <div className="w-16 h-16 rounded-[24px] bg-black border border-white/5 flex items-center justify-center flex-shrink-0 transition-all duration-700 group-hover:bg-sidebar-primary group-hover:text-black shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                        <span className="font-black text-lg uppercase italic">{contato.nome.substring(0, 2)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-sidebar-primary transition-colors duration-700 italic">
                                                {contato.nome}
                                            </p>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border italic",
                                                contato.status_funil === 'cliente' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                'bg-white/5 text-white/20 border-white/10'
                                            )}>
                                                {contato.status_funil}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-3.5 h-3.5 text-white/10" />
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{contato.empresa || 'Strategic Node'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-3.5 h-3.5 text-white/10" />
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{formatDateTime(contato.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-14 h-14 flex items-center justify-center rounded-[24px] bg-white/[0.02] border border-white/5 text-white/10 hover:text-white hover:border-sidebar-primary/40 transition-all duration-700">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Protocols */}
                    <div className="space-y-16">
                        <div className="space-y-8">
                            <h2 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] px-6">Executive Protocols</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <Link href="/criar" className="block group">
                                    <div className="nl-glass p-10 rounded-[56px] border-sidebar-primary/20 flex flex-col gap-10 group-hover:scale-[1.03] transition-all duration-700 bg-sidebar-primary shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
                                        <div className="w-16 h-16 rounded-[24px] bg-black/20 flex items-center justify-center shadow-2xl">
                                            <Zap className="w-8 h-8 text-black" />
                                        </div>
                                        <div className="space-y-3">
                                            <p className="font-black text-black uppercase tracking-[0.3em] text-sm italic">Neural Studio</p>
                                            <p className="text-[10px] text-black/40 font-black uppercase tracking-[0.2em] leading-relaxed">Ignite predictive production sequences</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/biblioteca" className="block group">
                                    <div className="nl-glass p-10 rounded-[56px] border-white/5 flex flex-col gap-10 group-hover:scale-[1.03] transition-all duration-700 hover:border-sidebar-primary/20">
                                        <div className="w-16 h-16 rounded-[24px] bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-sidebar-primary/5 transition-all duration-700">
                                            <Library className="w-8 h-8 text-white/10 group-hover:text-sidebar-primary transition-all duration-700" />
                                        </div>
                                        <div className="space-y-3">
                                            <p className="font-black text-white uppercase tracking-[0.3em] text-sm italic">Digital Asset Vault</p>
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] leading-relaxed">Secure optimized asset repository</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Synthesis Card */}
                        <div className="nl-glass p-12 rounded-[64px] space-y-10 relative overflow-hidden group border-sidebar-primary/20">
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 group-hover:scale-125 transition-all duration-[2000ms]">
                                <Target className="w-48 h-48 text-sidebar-primary" />
                            </div>
                            <div className="flex items-center gap-4">
                                 <div className="w-2 h-2 rounded-full bg-sidebar-primary netlife-glow shadow-none" />
                                 <p className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.4em] italic">Neural Synthesis</p>
                            </div>
                            <div className="space-y-8">
                                <p className="text-white font-black text-2xl leading-tight italic tracking-tighter uppercase">
                                    &quot;High-Velocity conversion nodes prioritize aesthetic fidelity as an institutional trust protocol.&quot;
                                </p>
                                <div className="pt-8 border-t border-white/5">
                                    <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.3em] italic leading-loose">Strategy optimized for InvestMais Global Core</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
