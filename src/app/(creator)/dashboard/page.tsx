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
    MoreHorizontal, Filter, Download,
    X, Mail, FileText, CheckCircle2,
    Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatDateTime } from '@/lib/utils'
import { formatCurrency as formatBRL } from '@/lib/crm-utils'
import toast from 'react-hot-toast'

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
    recentCards: any[]
}

const TIPO_ACTIVITY: Record<string, { label: string; color: string; Icon: any }> = {
    phone:   { label: 'Ligação',  color: 'text-blue-400',    Icon: Phone },
    email:   { label: 'Email',    color: 'text-red-400',     Icon: Mail },
    message: { label: 'WhatsApp', color: 'text-emerald-400', Icon: MessageSquare },
    meeting: { label: 'Reunião',  color: 'text-purple-400',  Icon: Users },
    note:    { label: 'Nota',     color: 'text-white/50',    Icon: FileText },
    task:    { label: 'Tarefa',   color: 'text-amber-400',   Icon: CheckCircle2 },
}

function QuickActivityModal({ onClose, contacts }: { onClose: () => void; contacts: { id: string; nome: string }[] }) {
    const [tipo, setTipo] = useState('phone')
    const [descricao, setDescricao] = useState('')
    const [selectedContactId, setSelectedContactId] = useState('')
    const [contactSearch, setContactSearch] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const filteredContacts = contacts.filter(c =>
        c.nome.toLowerCase().includes(contactSearch.toLowerCase())
    ).slice(0, 5)

    const selectedContact = contacts.find(c => c.id === selectedContactId)

    const handleSave = async () => {
        if (!selectedContactId) { toast.error('Selecione um contato'); return }
        setIsSaving(true)
        try {
            const res = await fetch('/api/creator/atividades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contato_id: selectedContactId,
                    tipo,
                    descricao: descricao || `Nova ${TIPO_ACTIVITY[tipo]?.label}`,
                    status: 'pendente',
                    data: new Date().toISOString(),
                }),
            })
            if (res.ok) { toast.success('Atividade criada!'); onClose() }
            else toast.error('Erro ao criar atividade')
        } finally { setIsSaving(false) }
    }

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]" />
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            >
                <div className="w-full max-w-md bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
                        <h2 className="text-sm font-bold text-white">Nova Atividade Rápida</h2>
                        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(TIPO_ACTIVITY).map(([key, { label, Icon }]) => (
                                <button key={key} onClick={() => setTipo(key)} className={cn('flex items-center gap-2 p-2.5 rounded-xl border text-[10px] font-bold transition-all', tipo === key ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white/50')}>
                                    <Icon className="w-3.5 h-3.5" />{label}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                            {selectedContact ? (
                                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                                    <span className="text-sm text-white flex-1">{selectedContact.nome}</span>
                                    <button onClick={() => { setSelectedContactId(''); setContactSearch('') }} className="text-white/20 hover:text-white/60"><X className="w-3.5 h-3.5" /></button>
                                </div>
                            ) : (
                                <input type="text" placeholder="Buscar contato..." value={contactSearch} onChange={e => setContactSearch(e.target.value)} className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40" />
                            )}
                            {!selectedContact && contactSearch && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#111113] border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden">
                                    {filteredContacts.map(c => (
                                        <button key={c.id} onClick={() => { setSelectedContactId(c.id); setContactSearch('') }} className="w-full text-left px-4 py-3 hover:bg-white/[0.04] text-sm text-white/60 hover:text-white">
                                            {c.nome}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <textarea placeholder="Descrição da atividade..." value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 resize-none" />
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-xs font-bold hover:text-white">Cancelar</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            Criar
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

export default function DashboardPage() {
    const [stats, setStats] = useState<UserStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [boards, setBoards] = useState<{ id: string; nome: string }[]>([])
    const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
    const [greeting, setGreeting] = useState('Bem-vindo')
    const [showQuickActivity, setShowQuickActivity] = useState(false)
    const [contacts, setContacts] = useState<{ id: string; nome: string }[]>([])

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Bom dia')
        else if (hour < 18) setGreeting('Boa tarde')
        else setGreeting('Boa noite')
    }, [])

    useEffect(() => {
        async function loadBoards() {
            try {
                const res = await fetch('/api/creator/pipeline-config')
                if (res.ok) {
                    const data = await res.json()
                    setBoards(data)
                }
            } catch (err) { console.error('Error loading boards:', err) }
        }
        loadBoards()
    }, [])

    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            try {
                const url = selectedBoardId 
                    ? `/api/creator/dashboard?board_id=${selectedBoardId}` 
                    : '/api/creator/dashboard'
                
                const [dashRes, crmRes] = await Promise.all([
                    fetch(url),
                    fetch('/api/creator/crm'),
                ])
                if (dashRes.ok) {
                    const data = await dashRes.json()
                    if (data.profile) setStats(data.profile)
                }
                if (crmRes.ok) {
                    const data = await crmRes.json()
                    if (Array.isArray(data)) setContacts(data.map((c: any) => ({ id: c.id, nome: c.nome })))
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [selectedBoardId])

    return (
        <div className="min-h-screen bg-background text-foreground p-6 lg:p-8 space-y-8 transition-colors duration-300">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Buscar contatos, deals..." 
                        className="w-full bg-card/40 border border-border rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-card/60 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-border text-[10px] text-foreground/20 font-mono">
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
                    <Link href="/configuracoes" className="flex items-center gap-3 cursor-pointer group hover:bg-white/[0.02] p-1.5 rounded-2xl transition-all">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm group-hover:scale-105 transition-transform">
                            {stats?.nome?.substring(0, 2).toUpperCase() || 'CA'}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{stats?.nome || 'Usuário'}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Configurações</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-white/20 group-hover:text-white" />
                    </Link>
                </div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-xs">Visão geral do seu CRM</p>
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={selectedBoardId || ''} 
                        onChange={e => setSelectedBoardId(e.target.value || null)}
                        className="bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-all outline-none cursor-pointer"
                    >
                        <option value="" className="bg-[#0A0A0B]">Todos os produtos</option>
                        {boards.map(b => (
                            <option key={b.id} value={b.id} className="bg-[#0A0A0B]">{b.nome}</option>
                        ))}
                    </select>
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
                    <div key={i} className="bg-card/40 border border-border rounded-2xl p-5 space-y-3 hover:bg-card/60 transition-all group shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
                            <div className={cn("w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center", card.color)}>
                                <card.icon className="w-4.5 h-4.5" />
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-2xl font-bold tracking-tight">{isLoading ? '...' : card.value}</h3>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-[10px] font-bold", card.change.includes('+') ? card.color : 'text-muted-foreground')}>
                                    {card.change.includes('+') && '↗ '} {card.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Atividades de Hoje (Baseado nos Contatos Recentes) */}
                <div className="lg:col-span-4 bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-base font-bold">Atividades de Hoje</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowQuickActivity(true)}
                                className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                                title="Nova atividade"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[400px] scrollbar-thin">
                        {stats?.contatosRecentes?.map((contato, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <div>
                                        <p className="text-sm font-bold text-white/90">Novo Lead: {contato.nome}</p>
                                        <p className="text-[10px] text-white/30 font-medium">Entrou hoje no CRM</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-wider group-hover:text-white transition-colors">
                                    {contato.canal_origem || 'Direto'}
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

                {/* Deals Recentes (Baseado nos Contatos Recentes como Oportunidades) */}
                <div className="lg:col-span-4 bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-base font-bold">Deals Recentes</h2>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Target className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[400px] scrollbar-thin">
                        {stats?.recentCards?.map((deal, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                <div>
                                    <p className="text-sm font-bold text-white/90">{deal.nome}</p>
                                    <p className="text-[10px] text-white/30 truncate max-w-[150px]">{deal.titulo}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-primary">{formatBRL(deal.valor || 0)}</p>
                                    <span className={cn(
                                        "text-[9px] px-2 py-0.5 rounded border uppercase font-black",
                                        deal.status === 'won' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        deal.status === 'lost' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    )}>
                                        {deal.status === 'won' ? 'Ganho' : deal.status === 'lost' ? 'Perdido' : 'Aberto'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {(!stats?.recentCards || stats.recentCards.length === 0) && (
                            <div className="h-40 flex items-center justify-center text-white/20 text-xs italic">
                                Nenhum deal encontrado
                            </div>
                        )}
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
                                { label: 'Leads Rastreados', value: stats?.totalLeads || 0, icon: Users },
                                { label: 'Deals Ganhos', value: stats?.totalWon || 0, icon: Target },
                                { label: 'Conversão', value: `${(stats?.taxaConversao || 0).toFixed(1)}%`, icon: TrendingUp },
                                { label: 'Receita', value: formatBRL(stats?.totalFaturamento || 0), icon: DollarSign },
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
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Canais de Origem</p>
                            <div className="space-y-3">
                                {[
                                    { id: 1, name: 'Site / Orgânico', value: formatBRL((stats?.totalFaturamento || 0) * 0.6), color: 'bg-primary' },
                                    { id: 2, name: 'Instagram', value: formatBRL((stats?.totalFaturamento || 0) * 0.3), color: 'bg-white/10' },
                                    { id: 3, name: 'WhatsApp', value: formatBRL((stats?.totalFaturamento || 0) * 0.1), color: 'bg-white/10' },
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

            {/* Quick Activity Modal */}
            <AnimatePresence>
                {showQuickActivity && (
                    <QuickActivityModal
                        onClose={() => setShowQuickActivity(false)}
                        contacts={contacts}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
