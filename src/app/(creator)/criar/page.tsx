'use client'

import { useState, useEffect, useRef } from 'react'
import {
    ChevronRight,
    Upload,
    Plus,
    CheckCircle,
    Instagram,
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
    Cpu,
    Radio,
    Shield,
    Globe,
    FileText,
    ArrowUpRight,
    Box,
    Layers,
    Play
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

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
    { id: 'stories', label: 'Stories / Reels (9:16)', icon: Phone, desc: 'Otimizado para Reels e Conversão' },
]

const DURACOES = [
    { value: 15, label: '15 Segundos' },
    { value: 20, label: '20 Segundos' },
]

const TONS = [
    { id: 'persuasivo', nome: 'Persuasivo', icon: Sparkles },
    { id: 'educativo', nome: 'Educativo', icon: Type },
    { id: 'direto', nome: 'Direto', icon: Zap },
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
            window.open(generatedVideo.video_url, '_blank')
        }
    }

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
        duracao: 15,
        tom: 'persuasivo',
    })

    const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof Step1Data, string>>>({})

    const handleRefineDescription = () => {
        if (!step1.descricao_produto) {
            toast.error('Insira uma descrição básica primeiro')
            return
        }
        setIsRefining(true)
        setTimeout(() => {
            setStep1(p => ({
                ...p,
                descricao_produto: `${p.descricao_produto}\n\nFoco em conversão de Home Equity, destacando taxas de 1.2% + IPCA, carência de 6 meses e processo 100% digital. Tom: Autoridade Financeira.`
            }))
            setIsRefining(false)
            toast.success('Descrição otimizada!')
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
                toast.error('Preencha os campos obrigatórios')
                return
            }
            setStep1Errors({})
        }
        
        setCurrentStep((s) => s + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        setProgress(5)
        
        try {
            const formData = new FormData()
            formData.append('nome_produto', step1.nome_produto)
            formData.append('descricao_produto', step1.descricao_produto)
            formData.append('formato', step2.formato)
            formData.append('duracao', step2.duracao.toString())
            formData.append('tom', step2.tom)
            
            if (step1.imagem_produto_file) formData.append('imagem_produto', step1.imagem_produto_file)
            if (step1.logo_empresa_file) formData.append('logo_empresa', step1.logo_empresa_file)

            const response = await fetch('/api/creator/videos', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                if (response.status === 403) {
                    setQuotaError(true)
                    setIsGenerating(false)
                    return
                }
                throw new Error('Falha ao iniciar geração')
            }

            const { id } = await response.json()
            setProgress(15)
            setPollingVideoId(id)
        } catch (err: unknown) {
            toast.error('Erro ao processar vídeo.')
            setIsGenerating(false)
            setProgress(0)
        }
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
                    toast.success('Vídeo gerado com sucesso!')
                } else if (data.status === 'erro') {
                    setIsGenerating(false)
                    setPollingVideoId(null)
                    clearInterval(interval)
                    toast.error('Erro no processamento.')
                } else {
                    setProgress((p) => Math.min(p + 2, 94))
                }
            } catch (e) {
                console.error('Polling failure')
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [pollingVideoId])

    if (quotaError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.03] p-16 rounded-[40px] text-center max-w-xl border border-white/10 shadow-2xl relative z-10">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Limite de Geração Atingido</h2>
                    <p className="text-white/40 text-sm mb-10">Você atingiu o limite de vídeos permitidos no seu plano atual.</p>
                    <div className="flex gap-4">
                        <button onClick={() => setQuotaError(false)} className="flex-1 py-4 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-bold text-white/40">Voltar</button>
                        <button onClick={() => router.push('/configuracoes')} className="flex-1 bg-primary py-4 rounded-xl text-white text-sm font-bold shadow-lg">Fazer Upgrade</button>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (generatedVideo) {
        return (
            <div className="min-h-screen bg-background p-6 lg:p-10 space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5 pb-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" /> Vídeo Gerado
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Seu vídeo está pronto!</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className={cn(
                        "lg:col-span-2 bg-white/[0.02] rounded-[40px] border border-white/5 flex items-center justify-center p-6 md:p-10 relative overflow-hidden",
                        step2.formato === 'stories' ? "min-h-[70vh]" : "aspect-video"
                    )}>
                        <div className={cn(
                            "relative shadow-2xl bg-black overflow-hidden transition-all duration-700",
                            step2.formato === 'stories' 
                                ? "aspect-[9/16] h-full max-h-[70vh] rounded-3xl border border-white/10" 
                                : "w-full aspect-video rounded-3xl border border-white/10"
                        )}>
                            <video ref={videoRef} src={generatedVideo.video_url} controls autoPlay playsInline className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute top-6 right-6 flex gap-3">
                            <button onClick={handleFullscreen} className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-primary transition-all"><Maximize className="w-5 h-5" /></button>
                            <button onClick={handleDownload} className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-primary transition-all"><Download className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <SectionCardPremium title="Resumo do Vídeo" icon={Cpu}>
                            <div className="space-y-6">
                                <div className="flex justify-between py-4 border-b border-white/5">
                                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Formato</span>
                                    <span className="text-xs text-white font-bold">{step2.formato === 'stories' ? 'Stories (9:16)' : 'Horizontal (16:9)'}</span>
                                </div>
                                <div className="flex justify-between py-4 border-b border-white/5">
                                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Duração</span>
                                    <span className="text-xs text-white font-bold">{step2.duracao} Segundos</span>
                                </div>
                                <div className="flex flex-col gap-4 pt-8">
                                    <button onClick={() => { toast.success('Vídeo salvo na biblioteca'); router.push('/biblioteca') }} className="bg-primary hover:bg-primary/90 w-full py-4 rounded-xl text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-3">
                                        <CheckCircle className="w-4 h-4" /> Salvar na Biblioteca
                                    </button>
                                    <button onClick={handleDownload} className="w-full py-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-bold text-white/40 hover:text-white transition-all flex items-center justify-center gap-3">
                                        <Download className="w-4 h-4" /> Baixar Vídeo
                                    </button>
                                    <button onClick={() => window.location.reload()} className="w-full py-3 text-[10px] font-bold text-white/10 uppercase tracking-widest hover:text-primary transition-all">Criar outro vídeo</button>
                                </div>
                            </div>
                        </SectionCardPremium>
                    </div>
                </div>
            </div>
        )
    }

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center">
                <div className="space-y-12 max-w-md">
                    <div className="relative">
                        <div className="w-48 h-48 rounded-full border-4 border-white/5 flex items-center justify-center relative mx-auto">
                            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" style={{ animationDuration: '2s' }} />
                            <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center">
                                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                            </div>
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-lg">
                            {progress}% PROCESSADO
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Criando seu vídeo...</h2>
                        <p className="text-white/40 text-xs leading-relaxed">
                            Nossa IA está analisando seu produto e gerando um vídeo otimizado para conversão. Isso pode levar alguns minutos.
                        </p>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-primary shadow-lg" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10 space-y-12">
            {/* Steps Header */}
            <div className="flex items-center gap-4 justify-center">
                {[0, 1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all text-xs",
                            currentStep === s ? 'bg-primary text-white shadow-lg scale-110' : currentStep > s ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.03] text-white/20 border border-white/5'
                        )}>
                            {currentStep > s ? <CheckCircle className="w-5 h-5" /> : s + 1}
                        </div>
                        {s < 2 && <div className={cn("w-12 h-px transition-all", currentStep > s ? 'bg-emerald-500/40' : 'bg-white/5')} />}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {currentStep === 0 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                        <div className="space-y-2 text-center">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Dados do Vídeo</h2>
                            <p className="text-white/40 text-sm">Preencha as informações básicas do seu produto ou serviço.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                            <div className="lg:col-span-2 space-y-8">
                                <Field label="Nome do Produto">
                                    <InputPremium placeholder="Ex: Investimento Imobiliário" value={step1.nome_produto} onChange={(e) => setStep1(p => ({ ...p, nome_produto: e.target.value }))} className={step1Errors.nome_produto ? 'border-red-500/50' : ''} />
                                </Field>

                                <Field label="Descrição / Benefícios">
                                    <div className="relative">
                                        <textarea rows={5} placeholder="Descreva as principais vantagens, taxas e o público alvo..." value={step1.descricao_produto} onChange={(e) => setStep1(p => ({ ...p, descricao_produto: e.target.value }))} className={cn("w-full bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-white text-sm font-medium leading-relaxed outline-none focus:border-primary/50 transition-all resize-none", step1Errors.descricao_produto ? 'border-red-500/50' : '')} />
                                        <button onClick={handleRefineDescription} disabled={isRefining} className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                            <Wand2 className={cn("w-3.5 h-3.5", isRefining && "animate-spin")} />
                                            {isRefining ? 'Otimizando...' : 'Otimizar com IA'}
                                        </button>
                                    </div>
                                </Field>

                                <div className="flex flex-col md:flex-row gap-8">
                                    <FileUploadField label="Imagem do Produto" value={step1.imagem_produto_file} previewUrl={step1.imagem_produto_url} onChange={(f, p) => setStep1(x => ({ ...x, imagem_produto_file: f, imagem_produto_url: p }))} onClear={() => setStep1(x => ({ ...x, imagem_produto_file: null, imagem_produto_url: null }))} />
                                    <FileUploadField label="Logo da Empresa" value={step1.logo_empresa_file} previewUrl={step1.logo_empresa_url} required error={step1Errors.logo_empresa_file} onChange={(f, p) => setStep1(x => ({ ...x, logo_empresa_file: f, logo_empresa_url: p }))} onClear={() => setStep1(x => ({ ...x, logo_empresa_file: null, logo_empresa_url: null }))} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <SectionCardPremium title="Dica do Especialista" icon={Shield}>
                                    <div className="space-y-4">
                                        <p className="text-lg font-medium text-white/80 leading-relaxed italic">&quot;Vídeos curtos e diretos convertem 3x mais no setor financeiro.&quot;</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            Dica de Performance
                                        </div>
                                    </div>
                                </SectionCardPremium>
                            </div>
                        </div>

                        <div className="flex justify-end pt-10 border-t border-white/5 max-w-6xl mx-auto">
                            <button onClick={handleNext} className="bg-primary hover:bg-primary/90 px-10 py-4 rounded-2xl text-white text-sm font-bold shadow-lg flex items-center gap-3 group">
                                Próximo Passo
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 1 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                        <div className="space-y-2 text-center">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Configuração do Vídeo</h2>
                            <p className="text-white/40 text-sm">Escolha o formato e o tom de voz da narração.</p>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-12">
                            <Field label="Formato de Saída">
                                <div className="grid grid-cols-1 gap-4">
                                    {FORMATOS.map((f) => (
                                        <button key={f.id} onClick={() => setStep2(p => ({ ...p, formato: f.id as any }))} className={cn("bg-white/[0.02] p-8 rounded-[32px] border border-white/10 flex items-center gap-6 transition-all text-left", step2.formato === f.id ? 'bg-primary/5 border-primary/40 shadow-lg' : 'hover:border-white/20')}>
                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl", step2.formato === f.id ? 'bg-primary text-white' : 'bg-white/[0.05] text-white/20')}>
                                                <f.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-bold transition-colors", step2.formato === f.id ? 'text-primary' : 'text-white/40')}> {f.label} </p>
                                                <p className="text-[10px] text-white/20 font-medium"> {f.desc} </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <Field label="Duração Estimada">
                                    <div className="flex gap-3">
                                        {DURACOES.map((d) => (
                                            <button key={d.value} onClick={() => setStep2(p => ({ ...p, duracao: d.value }))} className={cn("flex-1 py-4 rounded-xl border text-xs font-bold transition-all shadow-md", step2.duracao === d.value ? 'bg-primary text-white border-primary' : 'bg-white/[0.02] text-white/20 border-white/10 hover:border-white/20')}> {d.label} </button>
                                        ))}
                                    </div>
                                </Field>
                                <Field label="Tom de Voz">
                                    <div className="flex gap-3">
                                        {TONS.map((t) => (
                                            <button key={t.id} onClick={() => setStep2(p => ({ ...p, tom: t.id }))} className={cn("flex-1 py-4 rounded-xl border text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2", step2.tom === t.id ? 'bg-primary text-white border-primary' : 'bg-white/[0.02] text-white/20 border-white/10 hover:border-white/20')}>
                                                <t.icon className="w-4 h-4" /> {t.nome}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                            </div>

                            <div className="flex items-center justify-between pt-10 border-t border-white/5">
                                <button onClick={() => setCurrentStep(0)} className="text-xs font-bold text-white/20 hover:text-white transition-all">← Voltar</button>
                                <button onClick={() => setCurrentStep(2)} className="bg-primary hover:bg-primary/90 px-10 py-4 rounded-2xl text-white text-sm font-bold shadow-lg flex items-center gap-3 group">Continuar <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                        <div className="space-y-2 text-center">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Revisão Final</h2>
                            <p className="text-white/40 text-sm">Confira os dados antes de iniciar a geração do vídeo.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                            <div className="lg:col-span-2 space-y-8">
                                <SectionCardPremium title="Dados da Campanha" icon={FileText}>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Produto</p>
                                            <p className="text-lg font-bold text-white">{step1.nome_produto}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Formato</p>
                                            <p className="text-lg font-bold text-white">{step2.formato === 'stories' ? '9:16 (Vertical)' : '16:9 (Horizontal)'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-8 border-t border-white/5 space-y-3">
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Script Base</p>
                                        <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 text-white/60 text-sm leading-relaxed italic">
                                            {step1.descricao_produto}
                                        </div>
                                    </div>
                                </SectionCardPremium>
                            </div>

                            <div className="space-y-8">
                                <SectionCardPremium title="Referências Visuais" icon={Layers}>
                                    <div className="space-y-6">
                                        {step1.imagem_produto_url && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center">Imagem Base</p>
                                                <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-xl">
                                                    <img src={step1.imagem_produto_url} alt="Ref" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                        )}
                                        {step1.logo_empresa_url && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center">Logotipo</p>
                                                <div className="h-24 rounded-3xl bg-white/[0.02] border border-white/5 p-4 flex items-center justify-center">
                                                    <img src={step1.logo_empresa_url} alt="Logo" className="max-h-full max-w-full object-contain filter brightness-110" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </SectionCardPremium>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-white/5 max-w-6xl mx-auto">
                            <button onClick={() => setCurrentStep(1)} className="text-xs font-bold text-white/20 hover:text-white transition-all">← Alterar Configurações</button>
                            <button onClick={handleGenerate} disabled={isGenerating} className="bg-primary hover:bg-primary/90 min-w-[300px] py-5 rounded-2xl text-white text-sm font-bold shadow-lg flex items-center justify-center gap-4 group">
                                Gerar Vídeo com IA
                                <Zap className="w-5 h-5 fill-current" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{label}</label>
            {children}
        </div>
    )
}

function InputPremium({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input className={cn('w-full bg-white/[0.02] border border-white/10 text-white placeholder-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-sm font-medium', className)} {...props} />
    )
}

function SectionCardPremium({ title, subtitle, icon: Icon, children, className }: { title: string; subtitle?: string; icon?: any; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("bg-white/[0.03] p-8 border border-white/10 rounded-[40px] space-y-8 relative overflow-hidden group shadow-xl", className)}>
            <div className="flex items-center gap-4 relative z-10">
                {Icon && (
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <div>
                    <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-widest">{title}</h3>
                    {subtitle && <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{subtitle}</p>}
                </div>
            </div>
            <div className="relative z-10">{children}</div>
        </div>
    )
}

function FileUploadField({ label, previewUrl, onChange, onClear, required, error }: any) {
    return (
        <div className="space-y-3 flex-1">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1"> {label}{required && <span className="text-primary ml-1">*</span>} </label>
            <div className="relative group/upload">
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f, URL.createObjectURL(f)) }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                <div className={cn("h-48 rounded-[32px] border border-dashed flex flex-col items-center justify-center transition-all bg-white/[0.02] relative overflow-hidden shadow-lg", error ? 'border-red-500/40' : 'border-white/10 group-hover/upload:border-primary/50')}>
                    {previewUrl ? (
                        <div className="relative w-full h-full p-3">
                            <img src={previewUrl} alt="P" className="w-full h-full object-cover rounded-2xl" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-all flex items-center justify-center rounded-2xl backdrop-blur-sm">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }} className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-white z-30 opacity-0 group-hover/upload:opacity-100 transition-all"> <X className="w-5 h-5" /> </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-center px-6">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover/upload:border-primary/20 transition-all">
                                <Upload className="w-5 h-5 text-white/10 group-hover/upload:text-primary transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-white block">Enviar Arquivo</span>
                                <span className="text-[9px] text-white/10 font-bold uppercase tracking-widest">PNG, JPG ou WEBP</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
