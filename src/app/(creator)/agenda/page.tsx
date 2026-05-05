'use client'

import { useState, useEffect } from 'react'
import {
    Calendar,
    Brain,
    BarChart2,
    Clock,
    CheckCircle,
    Circle,
    AlertCircle,
    Send,
    Search,
    Loader2,
    Link2,
    Zap,
    ChevronRight,
    Target,
    Activity,
    Plus,
    Shield,
    Database,
    ZapOff,
    Terminal,
    ArrowRight,
    Layers,
    Cpu,
    Fingerprint,
    Lock,
    Globe,
    Maximize,
    ChevronDown,
    Layout,
    Box
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type NotionConnectState = 'disconnected' | 'connecting' | 'connected'

const MOCK_IDEIAS = [
    'Strategic Home Equity: Refinancing for Asset Expansion',
    'Real Estate Matrix: Financing vs. Consortium Analysis',
    'Secured Credit: 5 Benefits for High-Yield Investments',
    'Financial Synthesis: When to Pivot via Refinancing',
    'Approval Protocol: Complete Real Estate Credit Guide',
]

export default function AgendaPage() {
    const [notionToken, setNotionToken] = useState('')
    const [connectState, setConnectState] = useState<NotionConnectState>('disconnected')
    const [ideaInput, setIdeaInput] = useState('')
    const [ideas, setIdeas] = useState<string[]>([])
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false)
    const [concorrenteInput, setConcorrenteInput] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState('')
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
            toast.error('Insert Notion Integration Secret')
            return
        }
        setConnectState('connecting')
        await new Promise((r) => setTimeout(r, 2000))
        const res = await fetch('/api/creator/integracoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'notion', token_acesso: notionToken, ativo: true, configuracoes: {} }),
        })
        if (!res.ok) {
            toast.error('Failed to sync Notion protocol')
            setConnectState('disconnected')
        } else {
            toast.success('Notion Protocol Synchronized')
            setConnectState('connected')
        }
    }

    const handleGenerateIdeas = async () => {
        if (!ideaInput.trim()) {
            toast.error('Define base product for narrative generation')
            return
        }
        setIsGeneratingIdeas(true)
        await new Promise((r) => setTimeout(r, 2500))
        const customIdeas = MOCK_IDEIAS.map((idea) =>
            idea.replace('Home Equity', ideaInput.split(' ')[0] || 'Asset')
        )
        setIdeas(customIdeas)
        setIsGeneratingIdeas(false)
        toast.success('Narrative Matrix Distilled')
    }

    const handleAnalyzeCompetitor = async () => {
        if (!concorrenteInput.trim()) {
            toast.error('Profile handle or URL required for reconnaissance')
            return
        }
        setIsAnalyzing(true)
        await new Promise((r) => setTimeout(r, 3000))
        setAnalysisResult(`
RECON PROTOCOL: ${concorrenteInput}

[STRATEGIC FOOTPRINT]
High-resolution informational delivery. Heavy use of procedural infographics and rapid rendering sequences.

[OPERATIONAL FREQUENCY]
Average 0.8 posts/cycle. Engagement peak detected: THU/FRI at 18:00 UTC.

[CONTENT MATRIX]
- 40% Synthetic Educational Video (30-60s)
- 30% Financial Data Carousels
- 20% Direct Response Copy
- 10% Interactive Engagement Stories

[GAPS DETECTED]
Identified intelligence gap in long-term asset planning, comparative product logic, and high-trust social proof archives.
        `.trim())
        setIsAnalyzing(false)
        toast.success('Infiltration Data Decrypted')
    }

    const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
        'rascunho': { label: 'DRAFT', icon: Circle, color: 'text-white/20', bg: 'bg-white/[0.02] border-white/5' },
        'em revisão': { label: 'PENDING', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/5 border-amber-400/10' },
        'aprovado': { label: 'APPROVED', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/5 border-emerald-400/10' },
        'publicado': { label: 'LIVE', icon: Zap, color: 'text-sidebar-primary', bg: 'bg-sidebar-primary/5 border-sidebar-primary/10' },
    }

    if (connectState !== 'connected') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="ambient-bg" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="nl-glass p-20 rounded-[80px] text-center max-w-2xl border-white/5 shadow-[0_100px_200px_rgba(0,0,0,1)] relative z-10 space-y-16">
                    <div className="space-y-8">
                        <div className="w-24 h-24 rounded-[48px] bg-sidebar-primary/5 border border-sidebar-primary/20 flex items-center justify-center mx-auto group hover:scale-110 transition-all duration-1000 shadow-2xl">
                            <Shield className="w-10 h-10 text-sidebar-primary animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Notion <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sidebar-primary to-cyan-400">Synchronization</span></h2>
                            <p className="text-white/20 font-black uppercase tracking-[0.5em] text-[10px] italic">Initialize Strategy Architecture Protocol</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-left">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-10 italic">Secure Uplink Secret</label>
                            <div className="relative group">
                                <Lock className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 group-focus-within:text-sidebar-primary transition-all duration-700" />
                                <input type="password" placeholder="secret_..." value={notionToken} onChange={(e) => setNotionToken(e.target.value)} className="w-full h-24 bg-black border border-white/5 rounded-[48px] pl-24 pr-10 text-lg text-white outline-none focus:border-sidebar-primary/40 transition-all font-mono tracking-widest shadow-2xl" />
                            </div>
                        </div>
                        <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 italic"><Fingerprint className="w-4 h-4" /> notion.so/settings/connections/manage</p>
                    </div>

                    <button onClick={handleConnectNotion} disabled={connectState === 'connecting'} className="btn-primary w-full py-10 netlife-glow shadow-none text-sm font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-6 group">
                        {connectState === 'connecting' ? <><Loader2 className="w-8 h-8 animate-spin" /> Establishing Sync...</> : <><Link2 className="w-8 h-8 group-hover:rotate-45 transition-transform" /> Initialize Neural Hub</>}
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
            <div className="ambient-bg" />
            
            <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-16 pb-32">
                
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/5 pb-16">
                    <div className="space-y-6 flex-1 min-w-0">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-sidebar-primary/5 border border-sidebar-primary/20 backdrop-blur-3xl">
                            <Activity className="w-4 h-4 text-sidebar-primary" />
                            <span className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.5em] italic">Operational Flux Active</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tighter uppercase italic">Strategy Hub</h1>
                            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic flex items-center gap-4">
                                <Cpu className="w-4 h-4" /> Neural Content Orchestration v4.0.0
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="nl-glass px-10 py-5 rounded-[28px] border-emerald-500/20 flex items-center gap-6 shadow-2xl">
                             <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 netlife-glow shadow-none animate-pulse" />
                             <div className="space-y-1">
                                 <span className="text-[11px] text-white font-black uppercase tracking-widest italic">Uplink Stable</span>
                                 <p className="text-[9px] text-white/20 font-black uppercase tracking-widest italic leading-none">Notion Engine Connected</p>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    {/* Content Matrix */}
                    <div className="nl-glass p-16 border-white/5 rounded-[64px] space-y-12 relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.6)] flex flex-col">
                        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[2000ms]"> <Layout className="w-64 h-64 text-sidebar-primary" /> </div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-8">
                                <div className="w-14 h-14 rounded-[28px] bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20 shadow-2xl"> <Calendar className="w-7 h-7 text-sidebar-primary" /> </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] italic">Workflow Logs</h2>
                                    <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic">Temporal Content Architecture</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto max-h-[500px] pr-6 scrollbar-none relative z-10">
                            {posts.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center gap-8 opacity-10">
                                    <ZapOff className="w-16 h-16" />
                                    <p className="text-[12px] font-black uppercase tracking-[0.5em] italic">No Manifest Records Detected</p>
                                </div>
                            ) : posts.map((post) => (
                                <div key={post.id} className="p-8 rounded-[36px] bg-black border border-white/5 flex items-center gap-8 hover:border-sidebar-primary/20 transition-all duration-700 group/item italic">
                                     <div className="w-1.5 h-12 bg-white/5 rounded-full group-hover/item:bg-sidebar-primary transition-all duration-700" />
                                     <div className="flex-1 min-w-0 space-y-2">
                                         <p className="text-[13px] text-white font-black uppercase tracking-widest truncate">{post.titulo}</p>
                                         <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">{post.data} • MATRIX SECTOR 01</p>
                                     </div>
                                     <span className="px-5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest">{post.status.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                        
                        <button className="w-full py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all border-t border-white/5 relative z-10 italic">Export Temporal Archive</button>
                    </div>

                    <div className="space-y-16">
                        {/* Neural Idea Engine */}
                        <div className="nl-glass p-16 border-white/5 rounded-[64px] space-y-12 relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
                            <div className="flex items-center gap-8">
                                <div className="w-14 h-14 rounded-[28px] bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-2xl"> <Brain className="w-7 h-7 text-purple-400" /> </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] italic">Narrative Engine</h2>
                                    <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic">AI Concept Generation</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="relative flex-1 group">
                                         <Cpu className="absolute left-10 top-1/2 -translate-y-1/2 w-7 h-7 text-white/10 group-focus-within:text-purple-400 transition-all duration-700" />
                                         <input type="text" placeholder="SEED THEME..." value={ideaInput} onChange={(e) => setIdeaInput(e.target.value)} className="w-full h-24 bg-black border border-white/5 rounded-[48px] pl-24 pr-10 text-lg font-black text-white placeholder-white/5 tracking-[0.3em] outline-none focus:border-purple-400/40 transition-all italic duration-700 shadow-2xl" onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()} />
                                    </div>
                                    <button onClick={handleGenerateIdeas} disabled={isGeneratingIdeas} className="w-24 h-24 rounded-[48px] bg-purple-500 text-black shadow-2xl flex items-center justify-center hover:scale-105 transition-all active:scale-95 disabled:opacity-40"><Plus className={cn("w-10 h-10", isGeneratingIdeas && "animate-spin")} /></button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto scrollbar-none">
                                    {ideas.map((idea, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-8 rounded-[36px] bg-black/40 border border-white/5 text-[11px] font-black text-white uppercase tracking-widest italic flex items-center gap-8 group/idea hover:border-purple-400/20 transition-all duration-700">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 group-hover/idea:animate-ping shadow-none" />
                                            {idea}
                                        </motion.div>
                                    ))}
                                    {ideas.length === 0 && <div className="py-20 flex flex-col items-center justify-center opacity-10 gap-6"><Brain className="w-12 h-12" /><p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Awaiting Seed Protocol</p></div>}
                                </div>
                            </div>
                        </div>

                        {/* Infiltration Intelligence */}
                        <div className="nl-glass p-16 border-white/5 rounded-[64px] space-y-12 relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
                            <div className="flex items-center gap-8">
                                <div className="w-14 h-14 rounded-[28px] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-2xl"> <Target className="w-7 h-7 text-cyan-400" /> </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] italic">Recon Matrix</h2>
                                    <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic">Competitor Infiltration</p>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="relative flex-1 group">
                                         <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-7 h-7 text-white/10 group-focus-within:text-cyan-400 transition-all duration-700" />
                                         <input type="text" placeholder="@handle" value={concorrenteInput} onChange={(e) => setConcorrenteInput(e.target.value)} className="w-full h-24 bg-black border border-white/5 rounded-[48px] pl-24 pr-10 text-lg font-black text-white placeholder-white/5 tracking-[0.3em] outline-none focus:border-cyan-400/40 transition-all italic duration-700 shadow-2xl" />
                                    </div>
                                    <button onClick={handleAnalyzeCompetitor} disabled={isAnalyzing} className="w-24 h-24 rounded-[48px] bg-cyan-500 text-black shadow-2xl flex items-center justify-center hover:scale-105 transition-all active:scale-95 disabled:opacity-40"><Zap className={cn("w-10 h-10", isAnalyzing && "animate-spin")} /></button>
                                </div>

                                <AnimatePresence>
                                    {analysisResult && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 rounded-[40px] bg-black border border-cyan-500/20 text-[11px] font-black text-white/40 uppercase tracking-widest italic leading-relaxed whitespace-pre-line relative overflow-hidden shadow-2xl">
                                             <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent" />
                                             <div className="flex items-center gap-4 mb-8 text-cyan-400 not-italic">
                                                 <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                                                 DECRYPTED SIGNAL // INFILTRATION COMPLETE
                                             </div>
                                             {analysisResult}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
