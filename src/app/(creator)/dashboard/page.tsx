'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    AreaChart, Area
} from 'recharts'
import { 
    Plus, Search, Bell, Moon, Sun, 
    Users, TrendingUp, DollarSign, Target, 
    ArrowUpRight, ArrowDownRight, 
    Clock, Phone, MessageSquare, ChevronDown,
    MoreHorizontal, Filter, Download
} from 'lucide-react'
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
    const [greeting, setGreeting] = useState('Bem-vindo')

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Bom dia')
        else if (hour < 18) setGreeting('Boa tarde')
        else setGreeting('Boa noite')
    }, [])

    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch('/api/creator/dashboard')
                if (response.ok) {
                    const data = await response.json()
                    if (data.profile) setStats(data.profile)
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Buscar contatos, deals..." 
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-white/[0.05] transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-white/20 font-mono">
                        ⌘K
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white transition-colors">
                        <Moon className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {stats?.nome?.substring(0, 2).toUpperCase() || 'CA'}
                        </div>
                        <ChevronDown className="w-4 h-4 text-white/20" />
                    </div>
                </div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-white/40 text-sm">Visão geral do seu CRM</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-all">
                        Todos os produtos
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total de Contatos', value: stats?.totalLeads || 0, icon: Users, change: '+12%', color: 'text-primary' },
                    { label: 'Deals Abertos', value: stats?.totalWon || 0, icon: Target, change: 'R$ 1.405.000 em pipeline', color: 'text-primary' },
                    { label: 'Taxa de Conversão', value: `${(stats?.taxaConversao || 0).toFixed(0)}%`, icon: TrendingUp, change: '1 ganhos / 5 perdidos', color: 'text-primary' },
                    { label: 'Receita Fechada', value: formatBRL(stats?.totalFaturamento || 0), icon: DollarSign, change: '+8%', color: 'text-emerald-500' },
                ].map((card, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 hover:bg-white/[0.05] transition-all group">
                        <div className="flex items-center justify-between">
                            <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{card.label}</span>
                            <div className={cn("w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center", card.color)}>
                                <card.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold tracking-tight">{isLoading ? '...' : card.value}</h3>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-xs font-bold", card.change.includes('+') ? card.color : 'text-white/20')}>
                                    {card.change.includes('+') && '↗ '} {card.change}
                                </span>
                                {card.label === 'Total de Contatos' && <span className="text-white/20 text-[10px] font-medium">vs mês anterior</span>}
                                {card.label === 'Receita Fechada' && <span className="text-white/20 text-[10px] font-medium">vs mês anterior</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Atividades de Hoje */}
                <div className="lg:col-span-4 bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-base font-bold">Atividades de Hoje</h2>
                        <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-white/40 cursor-pointer hover:text-white" />
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[400px] scrollbar-thin">
                        {[
                            { name: '[GB] Follow UP - Norivaldo', sub: 'Norivaldo Vilela Souto', type: 'Whatsapp', color: 'bg-primary' },
                            { name: '[GB] Fazer ligação para Edmaura', sub: 'Edmaura Bruta', type: 'Call', color: 'bg-primary' },
                            { name: '[GB] Follow Up Lilia', sub: 'Lilia', type: 'Whatsapp', color: 'bg-primary' },
                        ].map((act, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", act.color)} />
                                    <div>
                                        <p className="text-sm font-bold text-white/90">{act.name}</p>
                                        <p className="text-[10px] text-white/30 font-medium">{act.sub}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-wider group-hover:text-white transition-colors">
                                    {act.type}
                                </span>
                            </div>
                        ))}
                        {(!stats?.contatosRecentes || stats.contatosRecentes.length === 0) && (
                            <div className="h-40 flex items-center justify-center text-white/20 text-xs italic">
                                Nenhuma atividade pendente
                            </div>
                        )}
                    </div>
                </div>

                {/* Deals Recentes */}
                <div className="lg:col-span-4 bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-base font-bold">Deals Recentes</h2>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Target className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[400px] scrollbar-thin">
                        {[
                            { name: 'HMI - Pri Molina', value: 'R$ 5.000', tag: 'media' },
                            { name: 'HMI - Maria Cecilia', value: 'R$ 5.000', tag: 'media' },
                            { name: 'HMI - Leonardo 👨‍💻', value: 'R$ 5.000', tag: 'media' },
                            { name: 'HMI - Temporada Peterle', value: 'R$ 5.000', tag: 'media' },
                        ].map((deal, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                <p className="text-sm font-bold text-white/90">{deal.name}</p>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-primary">{deal.value}</p>
                                    <span className="text-[9px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase font-black">
                                        {deal.tag}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance UTM */}
                <div className="lg:col-span-4 bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-base font-bold">Performance UTM</h2>
                        <TrendingUp className="w-5 h-5 text-white/20" />
                    </div>
                    <div className="p-6 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Leads Rastreados', value: '352', icon: Users },
                                { label: 'Deals Atribuídos', value: '287', icon: Target },
                                { label: 'Conversão', value: '0.3%', icon: TrendingUp },
                                { label: 'Receita', value: 'R$ 5k', icon: DollarSign },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center gap-2 text-white/20">
                                        <item.icon className="w-3 h-3" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                                    </div>
                                    <p className="text-lg font-bold">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Top Campanhas</p>
                            <div className="space-y-3">
                                {[
                                    { id: 1, name: 'HMI - Meta Ads (WhatsApp)', value: 'R$ 5.000', color: 'bg-primary' },
                                    { id: 2, name: 'Direto', value: 'R$ 0', color: 'bg-white/10' },
                                    { id: 3, name: 'CJ 03 [VID] SOFT', value: 'R$ 0', color: 'bg-white/10' },
                                ].map((camp, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", camp.color)}>
                                                {camp.id}
                                            </span>
                                            <span className="text-white/60 font-medium">{camp.name}</span>
                                        </div>
                                        <span className={cn("font-bold", camp.value !== 'R$ 0' ? 'text-primary' : 'text-white/20')}>
                                            {camp.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs font-bold text-white/40 hover:text-white hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 group">
                            Ver Analytics Completo
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-base font-bold">Top Vendedores</h2>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    {/* Placeholder for table */}
                    <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-2xl text-white/10 text-xs italic">
                        Dados de performance por vendedor em processamento...
                    </div>
                </div>
            </div>
        </div>
    )
}
