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
    { id: 'stories', label: 'Stories / Reels (9:16)', icon: Phone, desc: 'Optimized for Conversion & Reels' },
]

const DURACOES = [
    { value: 15, label: '15 SEC' },
    { value: 20, label: '20 SEC' },
]

const TONS = [
    { id: 'persuasivo', nome: 'Persuasive', icon: Sparkles },
    { id: 'educativo', nome: 'Educational', icon: Type },
    { id: 'direto', nome: 'Direct', icon: Zap },
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
            toast.error('Insert basic description first')
            return
        }
        setIsRefining(true)
        setTimeout(() => {
            setStep1(p => ({
                ...p,
                descricao_produto: `${p.descricao_produto}\n\n[NEURAL OPTIMIZATION]: Focus on Home Equity conversion, highlighting 1.2% + IPCA rates, 6-month grace period, and 100% digital protocol. Tone: Financial Authority.`
            }))
            setIsRefining(false)
            toast.success('Description optimized for conversion!')
        }, 1500)
    }

    const handleNext = () => {
        if (currentStep === 0) {
            const errors: Partial<Record<keyof Step1Data, string>> = {}
            if (!step1.nome_produto) errors.nome_produto = 'Product name required'
            if (!step1.descricao_produto) errors.descricao_produto = 'Description required'
            if (!step1.logo_empresa_file) errors.logo_empresa_file = 'Corporate Logo required'

            if (Object.keys(errors).length > 0) {
                setStep1Errors(errors)
                toast.error('Complete required protocols')
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
                throw new Error('Generation protocol failure')
            }

            const { id } = await response.json()
            setProgress(15)
            setPollingVideoId(id)
        } catch (err: unknown) {
            toast.error('Automation protocol failed.')
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
                    toast.success('Video rendered successfully!')
                } else if (data.status === 'erro') {
                    setIsGenerating(false)
                    setPollingVideoId(null)
                    clearInterval(interval)
                    toast.error('Processing error.')
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
                <div className="ambient-bg" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="nl-glass p-20 rounded-[64px] text-center max-w-xl border-white/5 shadow-2xl relative z-10">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-10">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-4">Quota Matrix Depleted</h2>
                    <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px] mb-12">Upgrade protocol required to proceed.</p>
                    <div className="flex gap-6">
                        <button onClick={() => setQuotaError(false)} className="flex-1 py-6 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">Return</button>
                        <button onClick={() => router.push('/configuracoes')} className="flex-1 btn-primary py-6 netlife-glow shadow-none text-[10px] font-black uppercase tracking-widest italic">Upgrade Core</button>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (generatedVideo) {
        return (
            <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
                <div className="ambient-bg" />
                <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-16 pb-32">
                    <div className="text-center md:text-left space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-sidebar-primary/5 border border-sidebar-primary/20 backdrop-blur-3xl">
                            <Sparkles className="w-4 h-4 text-sidebar-primary" />
                            <span className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.5em] italic">Optimization Complete</span>
                        </div>
                        <h2 className="text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">Output Matrix</h2>
                        <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic">Asset generated by Neural Core v3.0</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className={cn(
                            "lg:col-span-2 nl-glass rounded-[64px] border-white/5 flex items-center justify-center p-8 md:p-16 relative overflow-hidden group",
                            step2.formato === 'stories' ? "min-h-[80vh]" : "aspect-video"
                        )}>
                            <div className={cn(
                                "relative shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-black overflow-hidden transition-all duration-[1500ms] group-hover:scale-[1.02]",
                                step2.formato === 'stories' 
                                    ? "aspect-[9/16] h-full max-h-[80vh] rounded-[48px] border-[8px] border-white/5" 
                                    : "w-full aspect-video rounded-[48px] border-white/5"
                            )}>
                                <video ref={videoRef} src={generatedVideo.video_url} controls autoPlay playsInline className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute top-8 right-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700">
                                <button onClick={handleFullscreen} className="p-5 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 text-white hover:text-sidebar-primary transition-all"><Maximize className="w-6 h-6" /></button>
                                <button onClick={handleDownload} className="p-5 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 text-white hover:text-sidebar-primary transition-all"><Download className="w-6 h-6" /></button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <SectionCardPremium title="Technical Protocol" icon={Cpu}>
                                <div className="space-y-8">
                                    <div className="flex justify-between py-6 border-b border-white/5">
                                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Format</span>
                                        <span className="text-[11px] text-white font-black uppercase tracking-widest italic">{step2.formato}</span>
                                    </div>
                                    <div className="flex justify-between py-6 border-b border-white/5">
                                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Temporal Scale</span>
                                        <span className="text-[11px] text-white font-black uppercase tracking-widest italic">{step2.duracao} Seconds</span>
                                    </div>
                                    <div className="flex flex-col gap-6 pt-12">
                                        <button onClick={() => { toast.success('Consolidated in Archive'); router.push('/biblioteca') }} className="btn-primary w-full py-7 netlife-glow shadow-none text-xs font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-4">
                                            <CheckCircle className="w-5 h-5" /> Consolidate Archive
                                        </button>
                                        <button onClick={handleDownload} className="w-full py-6 rounded-[32px] bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic hover:text-white transition-all flex items-center justify-center gap-4">
                                            <Download className="w-5 h-5" /> Download Asset
                                        </button>
                                        <button onClick={() => window.location.reload()} className="w-full py-4 text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic hover:text-sidebar-primary transition-all">Initialize New Sequence</button>
                                    </div>
                                </div>
                            </SectionCardPremium>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                <div className="ambient-bg" />
                <div className="relative z-10 space-y-20 max-w-2xl">
                    <div className="relative">
                        <div className="w-64 h-64 rounded-full border-4 border-white/5 flex items-center justify-center relative mx-auto group">
                            <div className="absolute inset-0 rounded-full border-t-4 border-sidebar-primary animate-spin shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)]" style={{ animationDuration: '3s' }} />
                            <div className="w-48 h-48 rounded-full bg-sidebar-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-[2000ms]">
                                <Sparkles className="w-20 h-20 text-sidebar-primary animate-pulse" />
                            </div>
                        </div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-sidebar-primary text-black text-[12px] font-black uppercase tracking-[0.5em] italic netlife-glow shadow-none">
                            {progress}% SYNC
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Syncing Narrative Matrix...</h2>
                        <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic leading-loose max-w-md mx-auto">
                            Neural Core analyzing logos, distilling script protocols, and rendering Veo3 output. Estimated cycle: 3-5m.
                        </p>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-sidebar-primary netlife-glow shadow-none" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
            <div className="ambient-bg" />
            <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-16 pb-32">
                
                {/* Steps Header */}
                <div className="flex items-center gap-6 justify-center">
                    {[0, 1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-6 group">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-700 text-sm italic",
                                currentStep === s ? 'bg-sidebar-primary text-black netlife-glow scale-110' : currentStep > s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-black text-white/20 border border-white/5 shadow-2xl'
                            )}>
                                {currentStep > s ? <CheckCircle className="w-7 h-7" /> : `0${s + 1}`}
                            </div>
                            {s < 2 && <div className={cn("w-16 h-0.5 rounded-full transition-all duration-1000", currentStep > s ? 'bg-emerald-500/40' : 'bg-white/5')} />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16">
                            <div className="space-y-6">
                                <h2 className="text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">Campaign Inputs</h2>
                                <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic">Define core DNA and baseline assets for Neural Core v3.0.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
                                <div className="lg:col-span-3 space-y-12">
                                    <Field label="Product Naming Protocol">
                                        <InputPremium placeholder="E.G. HOME EQUITY MATRIX" value={step1.nome_produto} onChange={(e) => setStep1(p => ({ ...p, nome_produto: e.target.value }))} className={step1Errors.nome_produto ? 'border-red-500' : ''} />
                                    </Field>

                                    <Field label="Narrative Context (Description)">
                                        <div className="relative">
                                            <textarea rows={6} placeholder="DESCRIBE CORE ADVANTAGES, RATES, AND TARGET PROTOCOLS..." value={step1.descricao_produto} onChange={(e) => setStep1(p => ({ ...p, descricao_produto: e.target.value }))} className={cn("w-full bg-black border border-white/5 rounded-[48px] p-10 text-white text-sm font-black uppercase tracking-widest leading-loose outline-none focus:border-sidebar-primary/40 transition-all resize-none italic", step1Errors.descricao_produto ? 'border-red-500' : '')} />
                                            <button onClick={handleRefineDescription} disabled={isRefining} className="absolute bottom-10 right-10 flex items-center gap-3 px-6 py-3 rounded-full bg-sidebar-primary/10 border border-sidebar-primary/20 text-sidebar-primary text-[9px] font-black uppercase tracking-widest hover:bg-sidebar-primary hover:text-black transition-all">
                                                <Wand2 className={cn("w-4 h-4", isRefining && "animate-spin")} />
                                                {isRefining ? 'Distilling...' : 'Neural Optimization'}
                                            </button>
                                        </div>
                                    </Field>

                                    <div className="flex flex-col md:flex-row gap-12">
                                        <FileUploadField label="Primary Visual Node" value={step1.imagem_produto_file} previewUrl={step1.imagem_produto_url} onChange={(f, p) => setStep1(x => ({ ...x, imagem_produto_file: f, imagem_produto_url: p }))} onClear={() => setStep1(x => ({ ...x, imagem_produto_file: null, imagem_produto_url: null }))} />
                                        <FileUploadField label="Brand DNA (Logo)" value={step1.logo_empresa_file} previewUrl={step1.logo_empresa_url} required error={step1Errors.logo_empresa_file} onChange={(f, p) => setStep1(x => ({ ...x, logo_empresa_file: f, logo_empresa_url: p }))} onClear={() => setStep1(x => ({ ...x, logo_empresa_file: null, logo_empresa_url: null }))} />
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="sticky top-12">
                                        <SectionCardPremium title="Compliance Protocol" subtitle="Institutional Logic Node" icon={Shield}>
                                            <div className="space-y-8">
                                                <p className="text-xl font-black text-white italic tracking-tight leading-relaxed uppercase">&quot;Rede Neural garantindo integridade CVM em tempo real.&quot;</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 netlife-glow shadow-none animate-pulse" />
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Security Overlay Active</p>
                                                </div>
                                            </div>
                                        </SectionCardPremium>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-16 border-t border-white/5">
                                <button onClick={handleNext} className="btn-primary flex items-center gap-6 px-16 py-8 netlife-glow shadow-none text-sm font-black uppercase tracking-[0.4em] italic group">
                                    Validate Inputs
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-all duration-700" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16">
                            <div className="space-y-6">
                                <h2 className="text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">Format Matrix</h2>
                                <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic">Adjust output parameters and narrative frequency.</p>
                            </div>

                            <div className="max-w-4xl mx-auto space-y-16">
                                <Field label="Output Architecture (Format)">
                                    <div className="grid grid-cols-1 gap-6">
                                        {FORMATOS.map((f) => (
                                            <button key={f.id} onClick={() => setStep2(p => ({ ...p, formato: f.id as any }))} className={cn("nl-glass p-10 rounded-[48px] border-white/5 flex items-center gap-8 transition-all duration-700 text-left group", step2.formato === f.id ? 'bg-sidebar-primary/5 border-sidebar-primary/40' : 'hover:border-white/20')}>
                                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-2xl", step2.formato === f.id ? 'bg-sidebar-primary text-black netlife-glow shadow-none' : 'bg-black text-white/20 border border-white/5')}>
                                                    <f.icon className="w-7 h-7" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={cn("text-sm font-black uppercase tracking-widest italic transition-colors duration-700", step2.formato === f.id ? 'text-sidebar-primary' : 'text-white/40')}> {f.label} </p>
                                                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] italic"> {f.desc} </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </Field>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <Field label="Temporal Scale">
                                        <div className="flex gap-4">
                                            {DURACOES.map((d) => (
                                                <button key={d.value} onClick={() => setStep2(p => ({ ...p, duracao: d.value }))} className={cn("flex-1 py-6 rounded-[32px] border font-black text-[10px] uppercase tracking-[0.4em] italic transition-all duration-700", step2.duracao === d.value ? 'bg-sidebar-primary text-black border-sidebar-primary netlife-glow shadow-none' : 'bg-black/20 text-white/20 border-white/5 hover:border-white/10')}> {d.label} </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label="Communication Frequency (Tone)">
                                        <div className="flex gap-4">
                                            {TONS.map((t) => (
                                                <button key={t.id} onClick={() => setStep2(p => ({ ...p, tom: t.id }))} className={cn("flex-1 py-6 rounded-[32px] border font-black text-[10px] uppercase tracking-[0.4em] italic transition-all duration-700 flex items-center justify-center gap-4", step2.tom === t.id ? 'bg-sidebar-primary text-black border-sidebar-primary netlife-glow shadow-none' : 'bg-black/20 text-white/20 border-white/5 hover:border-white/10')}>
                                                    <t.icon className="w-4 h-4" /> {t.nome}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                </div>

                                <div className="flex items-center justify-between pt-16 border-t border-white/5">
                                    <button onClick={() => setCurrentStep(0)} className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] italic hover:text-white transition-all">← Recalibrate Inputs</button>
                                    <button onClick={() => setCurrentStep(2)} className="btn-primary flex items-center gap-6 px-16 py-8 netlife-glow shadow-none text-sm font-black uppercase tracking-[0.4em] italic group">Validate Parameters <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-all duration-700" /></button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                                <div className="lg:col-span-2 space-y-12">
                                    <SectionCardPremium title="Manifesto Review" subtitle="Autonomous Narrative Analysis" icon={FileText}>
                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Target Product</p>
                                                <p className="text-xl font-black text-white uppercase tracking-tighter italic">{step1.nome_produto}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Output Format</p>
                                                <p className="text-xl font-black text-white uppercase tracking-tighter italic">{step2.formato}</p>
                                            </div>
                                        </div>
                                        <div className="pt-12 border-t border-white/5 space-y-6">
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Optimized Script</p>
                                            <div className="nl-glass p-10 rounded-[48px] bg-black/40 border-white/5 text-white/40 text-xs font-black uppercase tracking-widest leading-loose italic shadow-inner">
                                                {step1.descricao_produto}
                                            </div>
                                        </div>
                                    </SectionCardPremium>
                                </div>

                                <div className="space-y-12">
                                    <SectionCardPremium title="Visual Reference Deck" icon={Layers}>
                                        <div className="space-y-10">
                                            {step1.imagem_produto_url && (
                                                <div className="space-y-3">
                                                    <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] text-center italic">Primary Asset</p>
                                                    <div className="aspect-[3/4] rounded-[48px] overflow-hidden border border-white/5 relative group shadow-2xl">
                                                        <img src={step1.imagem_produto_url} alt="Ref" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                                    </div>
                                                </div>
                                            )}
                                            {step1.logo_empresa_url && (
                                                <div className="space-y-3">
                                                    <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] text-center italic">Brand DNA</p>
                                                    <div className="h-32 rounded-[48px] nl-glass bg-black/40 border border-white/5 p-8 flex items-center justify-center group">
                                                        <img src={step1.logo_empresa_url} alt="Logo" className="max-h-full max-w-full object-contain filter brightness-110 group-hover:scale-110 transition-all duration-700" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </SectionCardPremium>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-16 border-t border-white/5">
                                <button onClick={() => setCurrentStep(1)} className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] italic hover:text-white transition-all">← Reset Protocol</button>
                                <button onClick={handleGenerate} disabled={isGenerating} className="btn-primary min-w-[400px] py-8 netlife-glow shadow-none text-sm font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-6 group">
                                    Execute Neural Generation
                                    <div className="w-px h-8 bg-black/20" />
                                    <Plus className="w-8 h-8 group-hover:rotate-90 transition-all duration-700" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-6 italic">{label}</label>
            {children}
        </div>
    )
}

function InputPremium({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input className={cn('w-full bg-black border border-white/5 text-white placeholder-white/5 px-10 py-6 rounded-[48px] focus:outline-none focus:border-sidebar-primary/40 focus:bg-black transition-all text-sm font-black uppercase tracking-[0.2em] italic', className)} {...props} />
    )
}

function SectionCardPremium({ title, subtitle, icon: Icon, children, className }: { title: string; subtitle?: string; icon?: any; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("nl-glass p-12 border-white/5 rounded-[64px] space-y-12 relative overflow-hidden group shadow-2xl", className)}>
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[2000ms]">
                {Icon && <Icon className="w-48 h-48" />}
            </div>
            <div className="flex items-center gap-6 relative z-10">
                {Icon && (
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-sidebar-primary group-hover:border-sidebar-primary/20 transition-all duration-700">
                        <Icon className="w-7 h-7" />
                    </div>
                )}
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] leading-none italic">{title}</h3>
                    {subtitle && <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] italic">{subtitle}</p>}
                </div>
            </div>
            <div className="relative z-10">{children}</div>
        </div>
    )
}

function FileUploadField({ label, previewUrl, onChange, onClear, required, error }: any) {
    return (
        <div className="space-y-6 flex-1">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-6 italic"> {label}{required && <span className="text-sidebar-primary ml-1">*</span>} </label>
            <div className="relative group/upload">
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f, URL.createObjectURL(f)) }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                <div className={cn("h-64 rounded-[48px] border border-dashed flex flex-col items-center justify-center transition-all duration-1000 bg-black/20 group-hover/upload:bg-black/40 relative overflow-hidden shadow-2xl", error ? 'border-red-500/60' : 'border-white/5 group-hover/upload:border-sidebar-primary/40')}>
                    {previewUrl ? (
                        <div className="relative w-full h-full p-4 group/preview">
                            <img src={previewUrl} alt="P" className="w-full h-full object-cover rounded-[40px] transition-transform duration-[2000ms] group-hover/preview:scale-110" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-all duration-700 flex items-center justify-center rounded-[40px] backdrop-blur-sm">
                                <Upload className="w-12 h-12 text-sidebar-primary" />
                            </div>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }} className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white z-30 opacity-0 group-hover/preview:opacity-100 transition-all"> <X className="w-6 h-6" /> </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6 text-center px-10">
                            <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:border-sidebar-primary/20 transition-all duration-1000 shadow-2xl">
                                <Upload className="w-8 h-8 text-white/10 group-hover/upload:text-sidebar-primary transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[12px] font-black text-white uppercase tracking-[0.3em] block italic">Initialize Asset</span>
                                <span className="text-[9px] text-white/10 font-black uppercase tracking-widest italic">PNG, JPG, WEBP • Max 10MB</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
