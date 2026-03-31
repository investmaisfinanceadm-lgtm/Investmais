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
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

type NotionConnectState = 'disconnected' | 'connecting' | 'connected'

const MOCK_IDEIAS = [
    'Home Equity Estratégico: Refinanciamento para Crescimento de Ativos',
    'Matriz Imobiliária: Análise de Financiamento vs. Consórcio',
    'Crédito com Garantia: 5 Benefícios para Investimentos de Alto Rendimento',
    'Síntese Financeira: Quando Pivotar via Refinanciamento',
    'Protocolo de Aprovação: Guia Completo de Crédito Imobiliário',
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
    const [posts] = useState([
        { id: '1', titulo: 'Injeção de Capital — Benefícios MEI', status: 'rascunho', data: '2024-12-10' },
        { id: '2', titulo: 'Operações de Crédito: FAQ Global', status: 'em revisão', data: '2024-12-12' },
        { id: '3', titulo: 'Liquidez Imobiliária 2025', status: 'aprovado', data: '2024-12-15' },
        { id: '4', titulo: 'Impacto da SELIC na Carteira de Ativos', status: 'publicado', data: '2024-12-08' },
    ])

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
            toast.error('Insira o Segredo de Integração do Notion')
            return
        }
        setConnectState('connecting')

        await new Promise((r) => setTimeout(r, 1500))

        const res = await fetch('/api/creator/integracoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'notion', token_acesso: notionToken, ativo: true, configuracoes: {} }),
        })

        if (!res.ok) {
            toast.error('Falha ao sincronizar Notion')
            setConnectState('disconnected')
        } else {
            toast.success('Notion Sincronizado!')
            setConnectState('connected')
        }
    }

    const handleGenerateIdeas = async () => {
        if (!ideaInput.trim()) {
            toast.error('Configure o produto base para gerar narrativas')
            return
        }
        setIsGeneratingIdeas(true)
        await new Promise((r) => setTimeout(r, 2000))
        const customIdeas = MOCK_IDEIAS.map((idea) =>
            idea.replace('Home Equity', ideaInput.split(' ')[0] || 'Ativo')
        )
        setIdeas(customIdeas)
        setIsGeneratingIdeas(false)
    }

    const handleAnalyzeCompetitor = async () => {
        if (!concorrenteInput.trim()) {
            toast.error('Handle ou URL do perfil necessária')
            return
        }
        setIsAnalyzing(true)
        await new Promise((r) => setTimeout(r, 2500))
        setAnalysisResult(`
ANALISE DE PROTOCOLO: ${concorrenteInput}

📊 PEGADA ESTRATÉGICA
Informativo de alta resolução. Uso intenso de infográficos procedurais e sequências curtas de renderização.

📅 FREQUÊNCIA OPERACIONAL
Média de 0.8 posts/dia. Pico de engajamento detectado: QUI/SEX às 18:00 UTC.

🎯 MATRIZ DE CONTEÚDO
- 40% Vídeo Sintético Educativo (30-60s)
- 30% Carrosséis de Dados Financeiros
- 20% Copy de Resposta Direta
- 10% Stories de Engajamento Interativo

💡 OPORTUNIDADES DETECTADAS
Gap identificado em planejamento de ativos de longo prazo, lógica comparativa de produtos e arquivos de prova social de alta confiança.
        `.trim())
        setIsAnalyzing(false)
    }

    const statusConfig: Record<string, { label: string; icon: typeof Circle; color: string; bg: string }> = {
        'rascunho': { label: 'RASCUNHO', icon: Circle, color: 'text-gray-500', bg: 'bg-white/5 border-white/5' },
        'em revisão': { label: 'PENDENTE', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/5 border-amber-400/20' },
        'aprovado': { label: 'APROVADO', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/5 border-emerald-400/20' },
        'publicado': { label: 'PUBLICADO', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/5 border-blue-400/20' },
    }

    if (connectState !== 'connected') {
        return (
            <div className="p-8 lg:p-12 max-w-2xl mx-auto space-y-12 bg-primary min-h-[80vh] flex flex-col justify-center">
                <div className="space-y-4 text-center border-b border-white/5 pb-12">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4 transition-all hover:bg-accent/20">
                        <Calendar className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Sincronização de Protocolo</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Operações de <br /><span className="text-transparent bg-clip-text bg-gradient-accent">Estratégia</span></h1>
                    <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Inicialize a arquitetura de conteúdo via Notion Engine</p>
                </div>

                <div className="card text-center p-12 border-white/5 bg-white/[0.02] space-y-10 shadow-2xl rounded-[48px]">
                    <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-lg relative">
                         <Calendar className="w-10 h-10 text-gray-500" />
                         <div className="absolute -inset-2 rounded-[40px] border border-accent/10 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic">Sincronizar Banco <br />de Dados Externo</h2>
                        <p className="text-gray-500 font-medium text-[10px] leading-loose uppercase tracking-[0.2em] max-w-xs mx-auto">
                            Integre com o Notion para gerenciar fluxos de trabalho, aprovações e agendamentos em sua rede corporativa.
                        </p>
                    </div>

                    <div className="text-left space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Chave Secreta de Integração</label>
                        <input
                            type="text"
                            placeholder="secret_..."
                            value={notionToken}
                            onChange={(e) => setNotionToken(e.target.value)}
                            className="input-field h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-xs text-white outline-none focus:bg-white/[0.08]"
                        />
                        <div className="bg-white/5 p-4 rounded-xl">
                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                Protocolo: Vá para notion.so → Configurações → Conexões → Gerenciar Integrações
                            </p>
                        </div>
                        <button
                            onClick={handleConnectNotion}
                            disabled={connectState === 'connecting'}
                            className="btn-primary w-full py-5 flex items-center justify-center gap-3 transition-all hover:gap-4 bg-accent text-black font-black uppercase tracking-widest text-xs rounded-2xl"
                        >
                            {connectState === 'connecting' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Sincronizando...</span>
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-4 h-4" />
                                    <span>Verificar Integração Hub</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto bg-primary pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-12">
                <div className="space-y-4">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 transition-all hover:bg-accent/20">
                        <Activity className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Hub de Operações Ativo</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-none uppercase italic">Inteligência de <br /><span className="text-transparent bg-clip-text bg-gradient-accent">Conteúdo</span></h1>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Stream Ativo: Notion ID v2.4</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Content Hub */}
                <div className="card space-y-8 border-white/5 bg-white/[0.02] p-10 shadow-2xl relative overflow-hidden flex flex-col rounded-[48px]">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Calendar className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-accent">
                            <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">Comando de Pauta Hub</h2>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {posts.map((post) => {
                            const config = statusConfig[post.status]
                            const Icon = config.icon
                            return (
                                <div key={post.id} className={cn("flex items-center gap-4 p-5 rounded-2xl border transition-all group hover:scale-[1.02]", config.bg)}>
                                    <Icon className={cn("w-4 h-4", config.color)} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest truncate">{post.titulo}</p>
                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tight mt-1">{post.data} • REPOSITÓRIO CORE</p>
                                    </div>
                                    <span className={cn("text-[9px] font-black tracking-widest", config.color)}>
                                        {config.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <button
                        onClick={() => {
                            const header = 'Título,Status,Data'
                            const rows = posts.map(p => `"${p.titulo}","${p.status}","${p.data}"`)
                            const csv = [header, ...rows].join('\n')
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'manifesto-conteudo.csv'
                            a.click()
                            URL.revokeObjectURL(url)
                        }}
                        className="btn-secondary w-full py-4 text-[10px] font-black uppercase tracking-widest border-white/5 hover:border-accent/40 mt-4 rounded-xl">
                        Exportar Lista de Manifesto (CSV)
                    </button>
                </div>

                {/* Idea Generator */}
                <div className="card space-y-8 border-white/5 bg-white/[0.02] p-10 shadow-2xl flex flex-col rounded-[48px]">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                            <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">Motor de Núcleo Narrativo</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ponto de Entrada (Produto/Tema)</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="ex: Soluções de Dívida com Garantia"
                                    value={ideaInput}
                                    onChange={(e) => setIdeaInput(e.target.value)}
                                    className="input-field h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[10px] font-bold tracking-widest uppercase flex-1 focus:bg-white/[0.08] outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                                />
                                <button
                                    onClick={handleGenerateIdeas}
                                    disabled={isGeneratingIdeas}
                                    className="btn-primary px-8 rounded-2xl flex items-center justify-center bg-accent text-black"
                                >
                                    {isGeneratingIdeas ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {ideas.length > 0 && (
                            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                {ideas.map((idea, i) => (
                                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-400/40 transition-all cursor-pointer group">
                                        <span className="text-purple-400 text-[10px] font-black mt-1">#0{i + 1}</span>
                                        <p className="text-[11px] text-gray-400 font-medium group-hover:text-white transition-colors leading-relaxed uppercase tracking-tighter">{idea}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recon Análise */}
                <div className="card space-y-8 border-white/5 bg-white/[0.02] p-10 shadow-2xl relative overflow-hidden rounded-[48px]">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <Target className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">Reconhecimento de Inteligência</h2>
                    </div>

                    <div className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ponto de Infiltração (@handle ou URL)</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="@no_concorrente"
                                    value={concorrenteInput}
                                    onChange={(e) => setConcorrenteInput(e.target.value)}
                                    className="input-field h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-[10px] font-bold tracking-widest lowercase flex-1 focus:bg-white/[0.08] outline-none"
                                />
                                <button
                                    onClick={handleAnalyzeCompetitor}
                                    disabled={isAnalyzing}
                                    className="btn-primary px-8 rounded-2xl flex items-center justify-center bg-blue-500 text-white shadow-blue-500/20"
                                >
                                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {analysisResult && (
                            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-gray-500 whitespace-pre-line leading-relaxed italic animate-fade-in shadow-[0_0_50px_rgba(59,130,246,0.05)]">
                                <div className="text-blue-400 mb-4 not-italic font-black">DADOS DE RECON DESCRIPTOGRAFADOS // SOBREPOSIÇÃO DE ANÁLISE</div>
                                {analysisResult}
                            </div>
                        )}
                    </div>
                </div>

                {/* Agendamento Autônomo */}
                <div className="card space-y-8 border-white/5 bg-white/[0.02] p-10 shadow-2xl flex flex-col justify-between rounded-[48px]">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                                <Zap className="w-5 h-5 text-orange-400" />
                            </div>
                            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">Autopiloto de Disparo</h2>
                        </div>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
                            Inicialize sequências de distribuição automatizada para seus ativos de mídia em múltiplos nós sociais.
                        </p>
                    </div>
                    <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 text-center space-y-4 flex flex-col items-center justify-center min-h-[200px]">
                        <Activity className="w-10 h-10 text-gray-700 animate-pulse" />
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] max-w-xs leading-loose">
                            Configurações de protocolo social detectadas em <br />
                            <a href="/configuracoes" className="text-accent hover:text-white transition-colors underline decoration-accent/40 underline-offset-8">
                                Parâmetros → Integrações
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
