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
} from 'lucide-react'
import toast from 'react-hot-toast'

type NotionConnectState = 'disconnected' | 'connecting' | 'connected'

const SAMPLE_IDEAS = [
    'Como o Home Equity pode ajudar na reforma da sua casa',
    'Diferenças entre financiamento imobiliário e consórcio',
    '5 motivos para usar crédito com garantia de imóvel',
    'Planejamento financeiro: quando vale a pena refinanciar?',
    'Guia completo: aprovação de crédito imobiliário',
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
        { id: '1', titulo: 'Home Equity — Benefícios para MEI', status: 'rascunho', data: '2024-12-10' },
        { id: '2', titulo: 'Financiamento: Tire suas dúvidas', status: 'em revisão', data: '2024-12-12' },
        { id: '3', titulo: 'Crédito imobiliário em 2025', status: 'aprovado', data: '2024-12-15' },
        { id: '4', titulo: 'Taxa Selic e seus impactos', status: 'publicado', data: '2024-12-08' },
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
            toast.error('Insira o token de integração do Notion')
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
            toast.error('Erro ao conectar com Notion')
            setConnectState('disconnected')
        } else {
            toast.success('Notion conectado com sucesso!')
            setConnectState('connected')
        }
    }

    const handleGenerateIdeas = async () => {
        if (!ideaInput.trim()) {
            toast.error('Descreva o produto para gerar pautas')
            return
        }
        setIsGeneratingIdeas(true)
        // Simulate AI idea generation
        await new Promise((r) => setTimeout(r, 2000))
        const customIdeas = SAMPLE_IDEAS.map((idea) =>
            idea.replace('Home Equity', ideaInput.split(' ')[0] || 'Produto')
        )
        setIdeas(customIdeas)
        setIsGeneratingIdeas(false)
    }

    const handleAnalyzeCompetitor = async () => {
        if (!concorrenteInput.trim()) {
            toast.error('Insira o perfil para análise')
            return
        }
        setIsAnalyzing(true)
        await new Promise((r) => setTimeout(r, 2500))
        setAnalysisResult(`
**Análise do Perfil: ${concorrenteInput}**

📊 **Estilo de Conteúdo**
Predominantemente informativo com linguagem acessível. Uso frequente de infográficos e vídeos curtos.

📅 **Frequência de Postagens**
Média de 5-7 posts por semana. Maior atividade às terças e quintas-feiras.

🎯 **Tipos de Conteúdo**
- 40% Vídeos educativos (30-60s)
- 30% Carrosséis com dados financeiros
- 20% Posts de texto com dicas
- 10% Stories interativos

💡 **Oportunidades**
O concorrente não explora: conteúdo sobre planejamento de longo prazo, comparativos de produtos, e depoimentos de clientes.
    `.trim())
        setIsAnalyzing(false)
    }

    const statusConfig: Record<string, { label: string; icon: typeof Circle; color: string }> = {
        'rascunho': { label: 'Rascunho', icon: Circle, color: 'text-gray-400' },
        'em revisão': { label: 'Em revisão', icon: AlertCircle, color: 'text-yellow-400' },
        'aprovado': { label: 'Aprovado', icon: CheckCircle, color: 'text-emerald-400' },
        'publicado': { label: 'Publicado', icon: Zap, color: 'text-blue-400' },
    }

    if (connectState !== 'connected') {
        return (
            <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="section-title">Agenda de Conteúdo</h1>
                    <p className="section-subtitle">Gerencie sua estratégia de conteúdo com Notion</p>
                </div>

                <div className="card text-center py-10 space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-dark-muted border border-dark-border flex items-center justify-center mx-auto">
                        <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Conecte seu Notion</h2>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                            Integre com o Notion para gerenciar seu hub de conteúdo, aprovações e agendamento diretamente na plataforma.
                        </p>
                    </div>

                    <div className="text-left max-w-sm mx-auto space-y-3">
                        <label className="label">Token de Integração do Notion</label>
                        <input
                            type="text"
                            placeholder="secret_..."
                            value={notionToken}
                            onChange={(e) => setNotionToken(e.target.value)}
                            className="input-field"
                        />
                        <p className="text-xs text-gray-500">
                            Acesse notion.so → Configurações → Integrações → Criar integração
                        </p>
                        <button
                            onClick={handleConnectNotion}
                            disabled={connectState === 'connecting'}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {connectState === 'connecting' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Conectando...
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-4 h-4" />
                                    Conectar Notion
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="section-title">Agenda de Conteúdo</h1>
                    <p className="section-subtitle">Hub integrado com Notion</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Notion conectado</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Content Hub */}
                <div className="card space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gold" />
                        </div>
                        <h2 className="font-semibold text-white">Hub de Conteúdo</h2>
                    </div>

                    <div className="space-y-2">
                        {posts.map((post) => {
                            const config = statusConfig[post.status]
                            const Icon = config.icon
                            return (
                                <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-muted transition-colors group">
                                    <Icon className={`w-4 h-4 ${config.color} flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">{post.titulo}</p>
                                        <p className="text-xs text-gray-500">{post.data}</p>
                                    </div>
                                    <span className={`text-xs font-medium ${config.color} hidden group-hover:block`}>
                                        {config.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Idea Generator */}
                <div className="card space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-400/10 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="font-semibold text-white">Gerador de Pautas</h2>
                    </div>

                    <div>
                        <label className="label">Descreva o produto ou tema</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ex: Home Equity para autônomos"
                                value={ideaInput}
                                onChange={(e) => setIdeaInput(e.target.value)}
                                className="input-field flex-1"
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                            />
                            <button
                                onClick={handleGenerateIdeas}
                                disabled={isGeneratingIdeas}
                                className="btn-primary px-4 flex items-center gap-2"
                            >
                                {isGeneratingIdeas ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {ideas.length > 0 && (
                        <div className="space-y-2">
                            {ideas.map((idea, i) => (
                                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-dark-muted hover:bg-dark-border transition-colors cursor-pointer group">
                                    <span className="text-gold text-sm font-bold mt-0.5">{i + 1}</span>
                                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{idea}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Competitor Analysis */}
                <div className="card space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-400/10 flex items-center justify-center">
                            <Search className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="font-semibold text-white">Análise de Concorrentes</h2>
                    </div>

                    <div>
                        <label className="label">Perfil do concorrente (@handle ou URL)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="@banco_digital ou instagram.com/..."
                                value={concorrenteInput}
                                onChange={(e) => setConcorrenteInput(e.target.value)}
                                className="input-field flex-1"
                            />
                            <button
                                onClick={handleAnalyzeCompetitor}
                                disabled={isAnalyzing}
                                className="btn-primary px-4 flex items-center gap-2"
                            >
                                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {analysisResult && (
                        <div className="p-4 rounded-xl bg-dark-muted border border-dark-border text-sm text-gray-300 whitespace-pre-line">
                            {analysisResult}
                        </div>
                    )}
                </div>

                {/* Scheduling */}
                <div className="card space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="font-semibold text-white">Agendamento Automático</h2>
                    </div>
                    <p className="text-sm text-gray-400">
                        Agende a publicação automática dos seus vídeos nas redes sociais conectadas.
                    </p>
                    <div className="p-4 rounded-xl bg-dark-muted border border-dark-border text-center">
                        <p className="text-sm text-gray-500">
                            Configure suas redes sociais em{' '}
                            <a href="/configuracoes" className="text-gold hover:underline">
                                Configurações → Integrações
                            </a>{' '}
                            para habilitar o agendamento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
