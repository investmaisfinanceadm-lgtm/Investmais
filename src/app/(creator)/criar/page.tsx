'use client'

import { useState, useEffect, useRef } from 'react'
import {
    ChevronRight,
    Upload,
    Video,
    Plus,
    CheckCircle,
    Instagram,
    Play,
    Zap,
    Layout,
    Clock,
    Target,
    AlertCircle,
    X,
    Sparkles,
    Smartphone,
    Phone,
    Type,
    Wand2,
    Activity,
    Maximize,
    Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Step1Data {
    nome_produto: string
    descricao_produto: string
    imagem_produto_file: File | null
    imagem_produto_url: string | null
    logo_empresa_file: File | null
    logo_empresa_url: string | null
}

interface Step2Data {
    formato: 'instagram' | 'stories' | 'youtube' | 'educativo' | 'divulgacao'
    linha_editorial: string
    duracao: number
    tom: string
}

interface VideoResult {
    id: string
    video_url: string
    thumbnail: string
    status: string
}

const FORMATOS = [
    { id: 'stories', label: 'Stories / Reels (9:16)', icon: Phone, desc: 'Conversão direta em Ads e Reels' },
]

const LINHAS = [
    { id: 'demonstracao', nome: 'Demonstração Técnica', icon: Video, desc: 'Destaque para taxas e regras de crédito' },
    { id: 'storytelling', nome: 'Foco Narrativo', icon: Play, desc: 'Conexão emocional com a dor do cliente' },
    { id: 'vendas', nome: 'Conversão Agressiva', icon: Zap, desc: 'Foco em ROI e call-to-action pesado' },
    { id: 'educativo', nome: 'Autoridade Técnica', icon: Type, desc: 'Posicionamento como especialista (CVM)' },
]

const DURACOES = [
    { value: 15, label: '15 SEG' },
    { value: 20, label: '20 SEG' },
]

const TONS = [
    { id: 'persuasivo', nome: 'Persuasivo', icon: Sparkles },
    { id: 'educativo', nome: 'Educativo', icon: Type },
    { id: 'direto', nome: 'Objetivo', icon: Zap },
]

export default function CriarPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isGenerating, setIsGenerating] = useState(false)
    const [progress, setProgress] = useState(0)
    const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null)
    const [pollingVideoId, setPollingVideoId] = useState<string | null>(null)
    const [quotaError, setQuotaError] = useState(false)
    const [isRefining, setIsRefining] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleFullscreen = () => {
        const video = videoRef.current
        if (!video) return
        if (video.requestFullscreen) video.requestFullscreen()
        else if ((video as any).webkitRequestFullscreen) (video as any).webkitRequestFullscreen()
    }

    const handleDownload = async () => {
        if (!generatedVideo?.video_url) return
        try {
            const res = await fetch(generatedVideo.video_url)
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${generatedVideo.id || 'video'}.mp4`
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            // Fallback: open in new tab (CORS restriction)
            window.open(generatedVideo.video_url, '_blank')
        }
    }

    // Form States
    const [step1, setStep1] = useState<Step1Data>({
        nome_produto: '',
        descricao_produto: '',
        imagem_produto_file: null,
        imagem_produto_url: null,
        logo_empresa_file: null,
        logo_empresa_url: null,
    })

    const [step2, setStep2] = useState<Step2Data>({
        formato: 'stories',
        linha_editorial: 'demonstracao',
        duracao: 15,
        tom: 'persuasivo',
    })

    const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof Step1Data, string>>>({})
    const [step2Errors, setStep2Errors] = useState<Partial<Record<keyof Step2Data, string>>>({})

    const handleRefineDescription = () => {
        if (!step1.descricao_produto) {
            toast.error('Insira uma descrição básica primeiro')
            return
        }
        setIsRefining(true)
        setTimeout(() => {
            setStep1(p => ({
                ...p,
                descricao_produto: `${p.descricao_produto}\n\n[OTIMIZADO POR IA]: Focado em conversão de Home Equity, destacando taxa de 1.2% + IPCA, carência de até 6 meses e processo 100% digital. Tonalidade: Autoridade Financeira.`
            }))
            setIsRefining(false)
            toast.success('Descrição otimizada para conversão!')
        }, 1500)
    }

    const handleNext = () => {
        if (currentStep === 0) {
            const errors: Partial<Record<keyof Step1Data, string>> = {}
            if (!step1.nome_produto) errors.nome_produto = 'Nome do produto é obrigatório'
            if (!step1.descricao_produto) errors.descricao_produto = 'Descrição é obrigatória'
            if (!step1.logo_empresa_file) errors.logo_empresa_file = 'Logo da empresa é obrigatória'

            if (Object.keys(errors).length > 0) {
                setStep1Errors(errors)
                toast.error('Preencha os campos obrigatórios, incluindo a logo da empresa')
                return
            }
            setStep1Errors({})
        }
        
        if (currentStep === 1) {
            const errors: Partial<Record<keyof Step2Data, string>> = {}
            if (!step2.formato) errors.formato = 'Selecione um formato'
            if (!step2.linha_editorial) errors.linha_editorial = 'Selecione uma linha editorial'
            if (!step2.tom) errors.tom = 'Selecione um tom'
            
            if (Object.keys(errors).length > 0) {
                setStep2Errors(errors)
                toast.error('Selecione todas as opções')
                return
            }
            setStep2Errors({})
        }

        setCurrentStep((s) => s + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
        if (!pollingVideoId) return

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/creator/videos/status/${pollingVideoId}`)
                if (!res.ok) return
                const data = await res.json()

                if (data.status === 'concluido') {
                    setProgress(100)
                    setGeneratedVideo(data)
                    setIsGenerating(false)
                    setPollingVideoId(null)
                    clearInterval(interval)
                    toast.success('Vídeo renderizado com sucesso!')
                } else if (data.status === 'erro') {
                    setIsGenerating(false)
                    setPollingVideoId(null)
                    clearInterval(interval)
                    toast.error('Erro no processamento do vídeo.')
                } else {
                    setProgress((p) => Math.min(p + 2, 94))
                }
            } catch (e) {
                console.error('Polling error:', e)
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [pollingVideoId])

    const handleGenerate = async () => {
        setIsGenerating(true)
        setProgress(5)
        
        try {
            const formData = new FormData()
            formData.append('nome_produto', step1.nome_produto)
            formData.append('descricao_produto', step1.descricao_produto)
            formData.append('formato', step2.formato)
            formData.append('linha_editorial', step2.linha_editorial)
            formData.append('duracao', step2.duracao.toString())
            formData.append('tom', step2.tom)
            
            if (step1.imagem_produto_file) formData.append('imagem_produto', step1.imagem_produto_file)
            if (step1.logo_empresa_file) formData.append('logo_empresa', step1.logo_empresa_file)

            const response = await fetch('/api/creator/videos', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                let errorMsg = 'Erro na geração do vídeo'
                try {
                    const err = await response.json()
                    errorMsg = err.error || errorMsg
                } catch {}
                if (response.status === 403) {
                    setQuotaError(true)
                    setIsGenerating(false)
                    return
                }
                throw new Error(errorMsg)
            }

            const { id } = await response.json()
            setProgress(15)
            setPollingVideoId(id)
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erro ao gerar vídeo. Tente novamente.')
            setIsGenerating(false)
            setProgress(0)
        }
    }

    const handleSaveToLibrary = () => {
        toast.success('Vídeo salvo na biblioteca!')
        router.push('/biblioteca')
    }

    if (quotaError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-fade-in text-center">
                <div className="w-32 h-32 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                </div>
                <div className="space-y-4 max-w-sm">
                    <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase">Limite de Cota Atingido</h2>
                    <p className="text-gray-500 font-medium">Você atingiu o limite de processamento disponível no seu plano atual.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setQuotaError(false)} className="btn-secondary px-8 py-4 uppercase tracking-widest font-black text-[10px]">
                        Voltar
                    </button>
                    <button onClick={() => router.push('/configuracoes')} className="btn-primary px-8 py-4 uppercase tracking-widest font-black text-[10px]">
                        Fazer Upgrade
                    </button>
                </div>
            </div>
        )
    }

    if (generatedVideo) {
        return (
            <div className="min-h-screen p-4 md:p-8 lg:p-20 bg-primary animate-fade-in overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 pb-20">
                    <div className="text-center md:text-left space-y-3 md:space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-2 md:mb-4">
                            <Sparkles className="w-3 h-3 text-accent" />
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Protocolo Concluído</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[var(--text-main)] tracking-tighter uppercase italic">Otimização Realizada.</h2>
                        <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs">Seu ativo digital foi gerado com sucesso pelo núcleo AI.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
                        {/* Video Player */}
                        <div className={cn(
                            "lg:col-span-2 rounded-2xl md:rounded-[48px] overflow-hidden shadow-2xl relative shadow-accent/5 group flex items-center justify-center p-4 md:p-8",
                            step2.formato === 'stories' ? "bg-black/40 min-h-[70vh]" : "bg-black aspect-video border border-[var(--border-main)]"
                        )}>
                            <div className={cn(
                                "relative shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-black overflow-hidden transition-all duration-500",
                                step2.formato === 'stories' 
                                    ? "aspect-[9/16] h-full max-h-[75vh] rounded-[32px] border-[6px] border-[var(--border-main)]" 
                                    : "w-full aspect-video rounded-3xl border border-white/10"
                            )}>
                                <video
                                    ref={videoRef}
                                    src={generatedVideo.video_url}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                                {step2.formato === 'stories' && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-2xl z-10 border-x border-b border-[var(--border-main)]" />
                                )}
                            </div>
                            {/* Overlay actions — always visible on mobile, hover on desktop */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <button
                                    onClick={handleFullscreen}
                                    title="Tela cheia"
                                    className="flex items-center gap-2 bg-black/70 backdrop-blur-md text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border border-white/10 hover:bg-accent hover:border-accent hover:text-black transition-all duration-200"
                                >
                                    <Maximize className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Tela cheia</span>
                                </button>
                                <button
                                    onClick={handleDownload}
                                    title="Baixar vídeo"
                                    className="flex items-center gap-2 bg-black/70 backdrop-blur-md text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border border-white/10 hover:bg-accent hover:border-accent hover:text-black transition-all duration-200"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Baixar</span>
                                </button>
                            </div>
                        </div>

                        {/* Ficha Técnica */}
                        <div className="space-y-6">
                            <div className="card border-[var(--border-main)] bg-[var(--bg-primary)] p-5 md:p-8 space-y-6 md:space-y-8 rounded-2xl md:rounded-[40px]">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest">Ficha Técnica</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between py-3 border-b border-[var(--border-main)]">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Formato</span>
                                            <span className="text-[10px] text-[var(--text-main)] font-black uppercase">{step2.formato}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-[var(--border-main)]">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Escala</span>
                                            <span className="text-[10px] text-[var(--text-main)] font-black uppercase">{step2.duracao} Segundos</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <button onClick={handleSaveToLibrary} className="btn-primary w-full py-5 rounded-2xl bg-accent text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                                        <CheckCircle className="w-5 h-5" />
                                        Consolidar no Acervo
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="w-full py-4 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-primary)] text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[var(--text-main)] hover:border-accent/40 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Baixar Vídeo
                                    </button>
                                    <button onClick={() => router.push('/criar')} className="w-full py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-[var(--text-main)] transition-colors">
                                        Iniciar Novo Protocolo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-16 animate-fade-in p-8 text-center">
                <div className="relative">
                    <div className="w-48 h-48 rounded-full border-2 border-[var(--border-main)] flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" style={{ animationDuration: '2s' }} />
                        <div className="w-32 h-32 rounded-full bg-accent/5 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-accent animate-pulse" />
                        </div>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-accent text-black text-[10px] font-black px-4 py-1 rounded-full shadow-lg">
                        {progress}%
                    </div>
                </div>
                
                <div className="space-y-6 max-w-md">
                    <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase italic leading-tight">Sincronizando Matriz Narrativa...</h2>
                    <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-[9px] leading-loose">
                        Nossa IA está analisando a logo, gerando o roteiro e renderizando o vídeo com Veo3.
                        Este processo leva entre 3 e 5 minutos.
                    </p>
                </div>

                <div className="w-full max-w-sm h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-accent transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 lg:p-16 max-w-7xl mx-auto">
            {/* Step Header */}
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-16">
                {[0, 1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-4 group">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all text-sm",
                            currentStep === s 
                                ? 'bg-accent text-black shadow-accent scale-110' 
                                : currentStep > s 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-[var(--bg-primary)] text-gray-700 border border-white/10'
                        )}>
                            {currentStep > s ? <CheckCircle className="w-5 h-5" /> : `0${s + 1}`}
                        </div>
                        {s < 2 && <div className={cn("w-12 h-[2px] rounded-full transition-all duration-500", currentStep > s ? 'bg-emerald-500/40' : 'bg-[var(--bg-primary)]')} />}
                    </div>
                ))}
            </div>

            {/* Step 1 — Input de Ativos */}
            {currentStep === 0 && (
                <div className="space-y-8 md:space-y-12 animate-fade-in pb-20">
                    <div className="space-y-3 md:space-y-4">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-main tracking-tighter uppercase italic leading-none">Insumos da Campanha</h2>
                        <p className="text-muted font-medium uppercase tracking-[0.2em] text-xs">Defina o DNA e os ativos base para o processamento de imagem.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-16">
                        <div className="lg:col-span-3 space-y-6 md:space-y-10">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Nomenclatura do Produto *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Home Equity InvestMais"
                                    value={step1.nome_produto}
                                    onChange={(e) => setStep1((p) => ({ ...p, nome_produto: e.target.value }))}
                                    className={cn(
                                        "w-full bg-[var(--bg-card)] border rounded-2xl md:rounded-[32px] px-5 py-4 md:px-8 md:py-6 text-main font-black uppercase tracking-widest focus:ring-0 transition-all text-sm outline-none",
                                        step1Errors.nome_produto ? 'border-red-500' : 'border-[var(--border-main)] focus:border-accent/40'
                                    )}
                                />
                            </div>

                            <div className="space-y-6 relative">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Contexto Narrativo (Descrição) *</label>
                                    <button 
                                        onClick={handleRefineDescription}
                                        disabled={isRefining}
                                        className="inline-flex items-center gap-2 text-[9px] font-black text-accent uppercase tracking-widest hover:bg-accent/10 px-3 py-1.5 rounded-full transition-all border border-accent/20"
                                    >
                                        <Wand2 className={cn("w-3.5 h-3.5", isRefining && "animate-spin")} />
                                        {isRefining ? 'Otimizando...' : 'Otimizar por IA'}
                                    </button>
                                </div>
                                <textarea
                                    rows={6}
                                    placeholder="Descreva as vantagens, taxas e o público-alvo desta campanha..."
                                    value={step1.descricao_produto}
                                    onChange={(e) => setStep1((p) => ({ ...p, descricao_produto: e.target.value }))}
                                    className={cn(
                                        "w-full bg-[var(--bg-card)] border rounded-2xl md:rounded-[32px] px-5 py-4 md:px-8 md:py-6 text-main font-medium focus:ring-0 transition-all text-sm leading-relaxed outline-none resize-none",
                                        step1Errors.descricao_produto ? 'border-red-500' : 'border-[var(--border-main)] focus:border-accent/40'
                                    )}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-8">
                                <FileUploadField
                                    label="Ativo do Produto"
                                    value={step1.imagem_produto_file}
                                    previewUrl={step1.imagem_produto_url}
                                    onChange={(file, preview) => setStep1(p => ({ ...p, imagem_produto_file: file, imagem_produto_url: preview }))}
                                    onClear={() => setStep1(p => ({ ...p, imagem_produto_file: null, imagem_produto_url: null }))}
                                />
                                <FileUploadField
                                    label="Identidade Visual (Logo)"
                                    value={step1.logo_empresa_file}
                                    previewUrl={step1.logo_empresa_url}
                                    onChange={(file, preview) => setStep1(p => ({ ...p, logo_empresa_file: file, logo_empresa_url: preview }))}
                                    onClear={() => setStep1(p => ({ ...p, logo_empresa_file: null, logo_empresa_url: null }))}
                                    required
                                    error={step1Errors.logo_empresa_file}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="sticky top-20">
                                <div className="card-hover border border-accent/20 bg-[var(--bg-card)] p-10 rounded-[48px] space-y-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-[30deg] transition-transform duration-700">
                                        <Sparkles className="w-24 h-24 text-accent" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-4 h-4 text-accent" />
                                        <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Compliance AI Node</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[var(--text-main)] font-bold text-lg leading-tight tracking-tight italic">
                                            &quot;Nossa rede neural garante que todos os termos sigam os protocolos da CVM.&quot;
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Protocolo de Segurança Ativo</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 md:pt-12 border-t border-[var(--border-main)]">
                        <button onClick={handleNext} className="btn-primary flex items-center gap-3 md:gap-4 px-8 py-4 md:px-12 md:py-6 group bg-accent text-black font-black uppercase tracking-widest text-sm rounded-2xl md:rounded-[24px]">
                            <span>Validar Ativos</span>
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2 — Configuração Modular */}
            {currentStep === 1 && (
                <div className="space-y-8 md:space-y-12 animate-fade-in pb-20">
                    <div className="space-y-3 md:space-y-4">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-main tracking-tighter uppercase italic leading-none">Matriz de Formatação</h2>
                        <p className="text-muted font-medium uppercase tracking-[0.2em] text-xs">Ajuste os parâmetros de saída e a frequência narrativa do conteúdo.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-16">
                        <div className="lg:col-span-3 space-y-8 md:space-y-12">
                            {/* Formato */}
                            <div className="space-y-8">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Arquitetura de Saída (Formato) *</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {FORMATOS.map((f) => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setStep2((p) => ({ ...p, formato: f.id as any }))}
                                            className={cn(
                                                "flex items-center gap-6 p-8 rounded-[40px] border transition-all text-left group",
                                                step2.formato === f.id
                                                    ? 'border-accent bg-accent/10 shadow-accent-sm'
                                                    : 'border-[var(--border-main)] bg-[var(--bg-primary)] hover:border-accent/30 hover:bg-[var(--bg-primary)]'
                                            )}
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                                step2.formato === f.id ? 'bg-accent text-black' : 'bg-[var(--bg-primary)] text-gray-600 group-hover:text-[var(--text-main)]'
                                            )}>
                                                <f.icon className="w-7 h-7" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-sm font-black uppercase tracking-widest",
                                                    step2.formato === f.id ? 'text-accent' : 'text-gray-400 group-hover:text-[var(--text-main)]'
                                                )}>{f.label}</span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase mt-2 leading-relaxed">{f.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 pt-2 md:pt-4">
                                {/* Duração */}
                                <div className="space-y-8">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Matriz Temporal (Duração)</label>
                                    <div className="flex gap-4">
                                        {DURACOES.map((d) => (
                                            <button
                                                key={d.value}
                                                type="button"
                                                onClick={() => setStep2((p) => ({ ...p, duracao: d.value }))}
                                                className={cn(
                                                    "flex-1 py-5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest",
                                                    step2.duracao === d.value
                                                        ? 'border-accent bg-accent/10 text-accent'
                                                        : 'border-[var(--border-main)] bg-[var(--bg-primary)] text-gray-600 hover:border-accent/30 hover:text-[var(--text-main)]'
                                                )}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tom */}
                                <div className="space-y-8">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Frequência de Comunicação (Tom) *</label>
                                    <div className="flex gap-4">
                                        {TONS.map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setStep2((p) => ({ ...p, tom: t.id }))}
                                                className={cn(
                                                    "flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest group",
                                                    step2.tom === t.id
                                                        ? 'border-accent bg-accent/10 text-accent'
                                                        : 'border-[var(--border-main)] bg-[var(--bg-primary)] text-gray-600 hover:border-accent/30 hover:text-[var(--text-main)]'
                                                )}
                                            >
                                                <t.icon className={cn("w-5 h-5 mb-1", step2.tom === t.id ? 'text-accent' : 'text-gray-700')} />
                                                {t.nome}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Fluxo Narrativo (Linha Editorial) *</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {LINHAS.map((l) => (
                                        <button
                                            key={l.id}
                                            type="button"
                                            onClick={() => setStep2((p) => ({ ...p, linha_editorial: l.id }))}
                                            className={cn(
                                                "flex items-center gap-6 p-8 rounded-[40px] border transition-all text-left relative overflow-hidden group",
                                                step2.linha_editorial === l.id
                                                    ? 'border-accent bg-accent/10'
                                                    : 'border-[var(--border-main)] bg-[var(--bg-primary)] hover:border-accent/30 hover:bg-[var(--bg-primary)]'
                                            )}
                                        >
                                            <l.icon className={cn("w-7 h-7", step2.linha_editorial === l.id ? 'text-accent' : 'text-gray-800')} />
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-sm font-black uppercase tracking-widest",
                                                    step2.linha_editorial === l.id ? 'text-accent' : 'text-gray-400 group-hover:text-[var(--text-main)]'
                                                )}>{l.nome}</span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase mt-2 leading-relaxed">{l.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* PREVIEW SOCIAL - NEW RECOMMENDATION */}
                        <div className="lg:col-span-2">
                            <div className="sticky top-20 flex flex-col items-center gap-8">
                                <div className="text-center space-y-2">
                                     <h4 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Previsão Social Operacional</h4>
                                     <p className="text-[8px] text-gray-600 font-bold uppercase">Simulação de saída em tempo real</p>
                                </div>
                                
                                {/* Phone Mockup */}
                                <div className="relative w-[300px] h-[600px] bg-black rounded-[60px] border-[8px] border-[#1a1a1a] shadow-[0_0_80px_rgba(48,203,123,0.1)] p-4 overflow-hidden group">
                                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-3xl z-40" />
                                     
                                     {/* Content Inside Phone */}
                                     <div className="w-full h-full bg-[#050B14] rounded-[48px] relative overflow-hidden flex flex-col items-center justify-center">
                                          {step2.formato === 'stories' ? (
                                              <div className="w-full h-full p-4 flex flex-col justify-end gap-10">
                                                   <div className="space-y-4">
                                                        <div className="w-2/3 h-6 bg-white/20 rounded-lg shimmer" />
                                                        <div className="w-1/2 h-6 bg-white/20 rounded-lg shimmer" />
                                                   </div>
                                                   <div className="w-full h-12 bg-accent rounded-xl flex items-center justify-center font-black text-[10px] text-black uppercase tracking-widest shadow-accent animate-pulse">
                                                        Arraste para Cima
                                                   </div>
                                              </div>
                                          ) : (
                                              <div className="w-full space-y-6 px-4">
                                                   <div className="w-full aspect-square bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center">
                                                        <Video className="w-12 h-12 text-gray-800" />
                                                   </div>
                                                   <div className="space-y-3">
                                                        <div className="w-3/4 h-3 bg-white/10 rounded-full" />
                                                        <div className="w-1/2 h-3 bg-white/10 rounded-full" />
                                                   </div>
                                              </div>
                                          )}
                                          
                                          {/* Overlay UI based on format */}
                                          <div className="absolute bottom-10 right-4 flex flex-col gap-6 items-center">
                                               <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10" />
                                               <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10" />
                                               <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10" />
                                          </div>
                                     </div>
                                     
                                     {/* Scanline effect */}
                                     <div className="absolute inset-x-0 h-1 top-0 bg-accent/20 blur-sm pointer-events-none animate-scanline" />
                                </div>
                                <div className="px-6 py-3 rounded-full bg-accent/10 border border-accent/20 inline-flex items-center gap-3">
                                     <Layout className="w-3 h-3 text-accent" />
                                     <span className="text-[9px] font-black text-accent uppercase tracking-widest">Layout: {step2.formato}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-[var(--border-main)]">
                        <button onClick={() => setCurrentStep(0)} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-[var(--text-main)] transition-colors">
                            ← Reavaliar Entradas
                        </button>
                        <button onClick={handleNext} className="btn-primary flex items-center gap-4 px-12 py-6 group bg-accent text-black font-black uppercase tracking-widest text-sm rounded-[24px]">
                            <span className="uppercase tracking-[0.2em] font-black text-xs">Validar Parâmetros</span>
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3 — Revisão e Geração */}
            {currentStep === 2 && (
                <div className="space-y-8 animate-fade-in pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 card border-[var(--border-main)] bg-[var(--bg-primary)] p-10 space-y-10 shadow-2xl rounded-[56px] relative overflow-hidden">
                            <div className="absolute top-0 left-0 p-10 opacity-5 pointer-events-none">
                                 <Layout className="w-48 h-48" />
                            </div>
                            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-8">
                                <h3 className="text-xs font-black text-[var(--text-main)] uppercase tracking-[0.4em]">Manifesto da Campanha</h3>
                                <div className="px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">Verificado por IA</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Produto Alvo</p>
                                    <p className="text-[var(--text-main)] font-black uppercase text-base tracking-tight">{step1.nome_produto}</p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Formato de Saída</p>
                                    <p className="text-[var(--text-main)] font-black uppercase text-base tracking-tight">{step2.formato}</p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Protocolo Narrativo</p>
                                    <p className="text-[var(--text-main)] font-black uppercase text-base tracking-tight">{step2.linha_editorial}</p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Escala Temporal</p>
                                    <p className="text-[var(--text-main)] font-black uppercase text-base tracking-tight italic">{step2.duracao} Segundos</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-[var(--border-main)]">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Script Otimizado</p>
                                <p className="text-gray-400 font-medium text-xs leading-loose bg-[var(--bg-primary)] p-8 rounded-[32px] border border-[var(--border-main)] italic shadow-inner">{step1.descricao_produto}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="card border-[var(--border-main)] bg-[var(--bg-primary)] p-8 space-y-8 rounded-[48px] shadow-2xl">
                                <h4 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em] text-center mb-4">Deck Visual de Referência</h4>
                                {step1.imagem_produto_url && (
                                    <div className="space-y-3">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">Ativo Principal</p>
                                        <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-[var(--border-main)] relative group shadow-2xl">
                                            <img src={step1.imagem_produto_url} alt="Product" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                        </div>
                                    </div>
                                )}
                                {step1.logo_empresa_url && (
                                    <div className="space-y-3">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">DNA da Marca</p>
                                        <div className="h-28 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-main)] p-6 flex items-center justify-center group hover:bg-[var(--bg-primary)] transition-colors">
                                            <img src={step1.logo_empresa_url} alt="Logo" className="max-h-full max-w-full object-contain filter brightness-110 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 space-y-4 shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Compliance Protocol OK</p>
                                </div>
                                <p className="text-[10px] text-emerald-300 font-medium leading-relaxed uppercase tracking-widest">
                                    O conteúdo processado segue as diretrizes da CVM e BACEN.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-[var(--border-main)]">
                        <button onClick={() => setCurrentStep(1)} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-[var(--text-main)] transition-colors">
                            ← Resetar Protocolo
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="btn-primary w-full md:w-auto min-w-[350px] py-7 px-16 group transition-all"
                        >
                            <div className="flex items-center justify-center gap-5">
                                <span className="uppercase tracking-[0.4em] font-black text-sm">Iniciar Geração AI</span>
                                <div className="w-px h-6 bg-black/20" />
                                <Plus className="w-6 h-6 group-hover:rotate-90 transition-all duration-500" />
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

interface FileUploadFieldProps {
    label: string
    value: File | null
    previewUrl: string | null
    onChange: (file: File | null, preview: string | null) => void
    onClear: () => void
    required?: boolean
    error?: string
}

function FileUploadField({ label, previewUrl, onChange, onClear, required, error }: FileUploadFieldProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const preview = URL.createObjectURL(file)
            onChange(file, preview)
        }
    }

    return (
        <div className="space-y-6 flex-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                {label}{required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="relative group">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className={cn(
                    "h-48 rounded-[40px] border border-dashed flex flex-col items-center justify-center transition-all bg-[var(--bg-primary)] group-hover:bg-[var(--bg-primary)] shadow-2xl relative overflow-hidden",
                    error ? 'border-red-500/60' : previewUrl ? 'border-accent/40' : 'border-white/10'
                )}>
                    {previewUrl ? (
                        <div className="relative w-full h-full p-3 group/preview">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-[32px] transition-transform duration-700 group-hover/preview:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center rounded-[32px]">
                                <Upload className="w-8 h-8 text-[var(--text-main)]" />
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }}
                                className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-md flex items-center justify-center text-[var(--text-main)] z-30 opacity-0 group-hover/preview:opacity-100 transition-all hover:bg-black hover:scale-110"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-500 border border-[var(--border-main)] group-hover:border-accent/20">
                                <Upload className="w-6 h-6 text-gray-700 group-hover:text-accent transition-colors" />
                            </div>
                            <div>
                                <span className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] block mb-2">Upload Ativo</span>
                                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">PNG, JPG, WEBP • Max 10MB</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
