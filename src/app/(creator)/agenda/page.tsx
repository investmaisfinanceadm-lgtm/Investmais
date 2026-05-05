'use client'

import { useState, useEffect } from 'react'
import {
    Calendar,
    Brain,
    Clock,
    CheckCircle,
    Circle,
    AlertCircle,
    Plus,
    Shield,
    Target,
    Activity,
    Search,
    Loader2,
    Link2,
    Lock,
    Globe,
    Layout,
    Box,
    ChevronRight,
    Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type NotionConnectState = 'disconnected' | 'connecting' | 'connected'

export default function AgendaPage() {
    const [notionToken, setNotionToken] = useState('')
    const [connectState, setConnectState] = useState<NotionConnectState>('disconnected')
    const [ideaInput, setIdeaInput] = useState('')
    const [ideas, setIdeas] = useState<string[]>([])
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false)
    const [posts] = useState<{ id: string; titulo: string; status: string; data: string }[]>([])

    useEffect(() => {
        async function loadIntegration() {
            try {
                const res = await fetch('/api/creator/integracoes')
                if (!res.ok) return
                const data: Array<{ tipo: string; ativo: boolean }> = await res.json()
                const notion = data.find((i) => i.tipo === 'notion')
                if (notion?.ativo) setConnectState('connected')
            } catch {
                // ignore
            }
        }
        loadIntegration()
    }, [])

    const handleConnectNotion = async () => {
        if (!notionToken.trim()) {
            toast.error('Insira o token de integração do Notion')
            return
        }
        setConnectState('connecting')
        try {
            const res = await fetch('/api/creator/integracoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo: 'notion', token_acesso: notionToken, ativo: true, configuracoes: {} }),
            })
            if (!res.ok) throw new Error()
            toast.success('Notion conectado com sucesso')
            setConnectState('connected')
        } catch {
            toast.error('Falha ao conectar com o Notion')
            setConnectState('disconnected')
        }
    }

    if (connectState !== 'connected') {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="bg-white/[0.03] border border-white/5 p-12 rounded-[40px] text-center max-w-lg w-full relative z-10 space-y-8 backdrop-blur-xl"
                >
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                            <Box className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Conectar Notion</h2>
                        <p className="text-white/40 text-sm max-w-xs mx-auto">
                            Sincronize sua agenda de conteúdo e notas diretamente com seu workspace no Notion.
                        </p>
                    </div>

                    <div className="space-y-4 text-left">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Token de Integração (Secret)</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
                            <input 
                                type="password" 
                                placeholder="secret_..." 
                                value={notionToken} 
                                onChange={(e) => setNotionToken(e.target.value)} 
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 transition-all font-mono"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleConnectNotion} 
                        disabled={connectState === 'connecting'} 
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {connectState === 'connecting' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Conectando...</span>
                            </>
                        ) : (
                            <>
                                <Link2 className="w-5 h-5" />
                                <span>Estabelecer Conexão</span>
                            </>
                        )}
                    </button>
                    
                    <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest text-center">
                        Obtenha seu token em: notion.so/my-integrations
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Sincronização Ativa</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Agenda de Conteúdo</h1>
                    <p className="text-white/40 text-sm">Gerencie seu fluxo de produção e estratégias.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white/[0.03] border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                            <span className="text-[10px] font-bold text-white/40 uppercase block leading-none">Status da Conexão</span>
                            <span className="text-xs font-bold text-white">Notion Connected</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Workflow Card */}
                <div className="bg-white/[0.03] border border-white/5 rounded-[40px] p-8 space-y-8 flex flex-col shadow-xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Layout className="w-48 h-48 text-primary" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Calendário de Posts</h2>
                                <p className="text-xs text-white/40">Últimos registros do Notion</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin relative z-10">
                        {posts.length === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-20">
                                <Box className="w-12 h-12" />
                                <p className="text-xs font-bold uppercase tracking-widest">Nenhum registro encontrado</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all group">
                                     <div className="flex items-center gap-4">
                                         <div className="w-1 h-8 bg-white/10 rounded-full group-hover:bg-primary transition-colors" />
                                         <div>
                                             <p className="text-sm font-bold text-white">{post.titulo}</p>
                                             <p className="text-[10px] text-white/20 font-bold uppercase">{post.data}</p>
                                         </div>
                                     </div>
                                     <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[9px] font-bold text-white/40 uppercase">{post.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <button className="w-full py-4 text-xs font-bold text-white/20 hover:text-white transition-colors border-t border-white/5 pt-6">
                        Ver Agenda Completa no Notion
                    </button>
                </div>

                {/* Ideas Generator */}
                <div className="space-y-8">
                    <div className="bg-white/[0.03] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-xl backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Brain className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Gerador de Ideias (IA)</h2>
                                <p className="text-xs text-white/40">Conceitos narrativos inteligentes</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Qual o tema ou produto base?" 
                                    value={ideaInput} 
                                    onChange={(e) => setIdeaInput(e.target.value)} 
                                    className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder-white/20 outline-none focus:border-primary/50 transition-all"
                                />
                                <button className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95">
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto scrollbar-thin">
                                {ideas.length === 0 ? (
                                    <div className="py-16 flex flex-col items-center justify-center opacity-10 gap-4">
                                        <Zap className="w-8 h-8" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Aguardando tema base</p>
                                    </div>
                                ) : (
                                    ideas.map((idea, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, x: -10 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-bold text-white hover:border-primary/20 transition-all flex items-center gap-4"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {idea}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Insight */}
                    <div className="bg-primary/5 border border-primary/10 rounded-[40px] p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Insight Estratégico</h3>
                        </div>
                        <p className="text-white text-sm leading-relaxed font-medium italic">
                            &quot;Conteúdos com foco em Home Equity tendem a ter 35% mais engajamento nas terças-feiras de manhã.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
