'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Check,
    ChevronRight,
    Upload,
    X,
    Loader2,
    Download,
    Library,
    Plus,
    AlertTriangle,
    CheckCircle,
    Play,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const STEPS = ['Dados do Produto', 'Configurações', 'Revisão e Geração']

const FORMATOS = [
    { value: 'instagram', label: 'Post Instagram/Facebook', icon: '📱' },
    { value: 'stories', label: 'Stories', icon: '⬆️' },
    { value: 'educativo', label: 'Conteúdo Educativo', icon: '📚' },
    { value: 'divulgacao', label: 'Divulgação de Produto', icon: '📢' },
]

const LINHAS = [
    { value: 'avatar', label: 'Avatar Falando (Apresentador IA)', icon: '🎙️' },
    { value: 'hardcopy', label: 'Hardcopy (Texto animado)', icon: '✍️' },
]

const DURACOES = [
    { value: 15, label: '15 segundos' },
    { value: 20, label: '20 segundos' },
]

const TONS = [
    { value: 'informativo', label: 'Informativo', desc: 'Claro e objetivo' },
    { value: 'persuasivo', label: 'Persuasivo', desc: 'Focado em conversão' },
    { value: 'educativo', label: 'Educativo', desc: 'Explicativo e didático' },
]

interface Step1Data {
    nome_produto: string
    descricao_produto: string
    imagem_produto_url: string | null
    logo_empresa_url: string | null
    imagem_produto_file: File | null
    logo_empresa_file: File | null
}

interface Step2Data {
    formato: string
    linha_editorial: string
    duracao: number
    tom: string
}

interface GeneratedVideo {
    id: string
    video_url: string | null
    status: string
}

function FileUploadField({
    label,
    value,
    previewUrl,
    onChange,
    onClear,
}: {
    label: string
    value: File | null
    previewUrl: string | null
    onChange: (file: File, preview: string) => void
    onClear: () => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Apenas arquivos JPG, PNG ou WEBP são aceitos')
            return
        }
        const url = URL.createObjectURL(file)
        onChange(file, url)
    }

    return (
        <div>
            <label className="label">{label}</label>
            {previewUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-dark-border group">
                    <img src={previewUrl} alt={label} className="w-full h-full object-contain bg-dark-muted" />
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-dark-border hover:border-gold/40 bg-dark-muted/50 flex flex-col items-center justify-center gap-2 transition-all group"
                >
                    <Upload className="w-6 h-6 text-gray-500 group-hover:text-gold transition-colors" />
                    <span className="text-sm text-gray-500 group-hover:text-gray-400">
                        Clique para fazer upload
                    </span>
                    <span className="text-xs text-gray-600">JPG, PNG, WEBP</span>
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                className="hidden"
            />
        </div>
    )
}

export default function CriarPage() {
    const router = useRouter()
    const { data: session } = useSession()

    const [currentStep, setCurrentStep] = useState(0)
    const [isGenerating, setIsGenerating] = useState(false)
    const [progress, setProgress] = useState(0)
    const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null)
    const [quotaError, setQuotaError] = useState(false)
    const [pollingVideoId, setPollingVideoId] = useState<string | null>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const [step1, setStep1] = useState<Step1Data>({
        nome_produto: '',
        descricao_produto: '',
        imagem_produto_url: null,
        logo_empresa_url: null,
        imagem_produto_file: null,
        logo_empresa_file: null,
    })

    const [step2, setStep2] = useState<Step2Data>({
        formato: '',
        linha_editorial: '',
        duracao: 15,
        tom: '',
    })

    const [step1Errors, setStep1Errors] = useState<Record<string, string>>({})
    const [step2Errors, setStep2Errors] = useState<Record<string, string>>({})

    const validateStep1 = () => {
        const errors: Record<string, string> = {}
        if (!step1.nome_produto.trim()) errors.nome_produto = 'Nome do produto é obrigatório'
        if (!step1.descricao_produto.trim()) errors.descricao_produto = 'Descrição é obrigatória'
        setStep1Errors(errors)
        return Object.keys(errors).length === 0
    }

    const validateStep2 = () => {
        const errors: Record<string, string> = {}
        if (!step2.formato) errors.formato = 'Selecione um formato'
        if (!step2.linha_editorial) errors.linha_editorial = 'Selecione uma linha editorial'
        if (!step2.tom) errors.tom = 'Selecione um tom'
        setStep2Errors(errors)
        return Object.keys(errors).length === 0
    }

    const handleNext = () => {
        if (currentStep === 0 && !validateStep1()) return
        if (currentStep === 1 && !validateStep2()) return
        setCurrentStep((s) => s + 1)
    }

    // Polling: verifica status do vídeo a cada 10 segundos
    useEffect(() => {
        if (!pollingVideoId) return

        const poll = async () => {
            try {
                const res = await fetch(`/api/videos/status/${pollingVideoId}`)
                if (!res.ok) return
                const data = await res.json()

                if (data.status === 'concluido') {
                    if (pollingRef.current) clearInterval(pollingRef.current)
                    setPollingVideoId(null)
                    setProgress(100)
                    setGeneratedVideo({ id: data.id, video_url: data.video_url, status: 'concluido' })
                } else if (data.status === 'erro') {
                    if (pollingRef.current) clearInterval(pollingRef.current)
                    setPollingVideoId(null)
                    setIsGenerating(false)
                    setProgress(0)
                    toast.error('Erro na geração do vídeo. Tente novamente.')
                } else {
                    // Avança progresso visual enquanto processa
                    setProgress(p => Math.min(p + 5, 90))
                }
            } catch {}
        }

        pollingRef.current = setInterval(poll, 10000)
        return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    }, [pollingVideoId])

    const handleGenerate = async () => {
        if (!session) return

        const sessionUser = session.user as any

        if (sessionUser.cota_usada >= sessionUser.cota_mensal) {
            setQuotaError(true)
            return
        }

        if (!step1.logo_empresa_file) {
            toast.error('Faça upload da logo da empresa para gerar o vídeo')
            return
        }

        setIsGenerating(true)
        setProgress(10)

        try {
            const formData = new FormData()
            formData.append('nome_produto', step1.nome_produto)
            formData.append('descricao_produto', step1.descricao_produto)
            formData.append('formato', step2.formato)
            formData.append('linha_editorial', step2.linha_editorial)
            formData.append('duracao', String(step2.duracao))
            formData.append('tom', step2.tom)
            formData.append('image', step1.logo_empresa_file)

            const response = await fetch('/api/videos/generate', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                let errorMsg = 'Erro na geração do vídeo'
                try {
                    const err = await response.json()
                    errorMsg = err.error || errorMsg
                } catch {}
                throw new Error(errorMsg)
            }

            const { video_id } = await response.json()
            setProgress(20)
            // Inicia polling — o vídeo será atualizado no banco pelo callback do n8n
            setPollingVideoId(video_id)
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

    // Quota error modal
    if (quotaError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="card max-w-md text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3">Cota Esgotada</h2>
                    <p className="text-gray-400 mb-2">
                        Você atingiu o limite mensal de vídeos da sua conta.
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                        Entre em contato com o administrador para aumentar sua cota ou aguarde o reset no início do próximo mês.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setQuotaError(false)} className="btn-secondary flex-1">
                            Voltar
                        </button>
                        <button onClick={() => router.push('/configuracoes')} className="btn-primary flex-1">
                            Ver configurações
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Success screen
    if (generatedVideo) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="card max-w-2xl w-full animate-fade-in">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Vídeo Gerado com Sucesso! 🎉</h2>
                        <p className="text-gray-400 mt-2">
                            Seu vídeo de <strong className="text-white">{step1.nome_produto}</strong> está pronto
                        </p>
                    </div>

                    {generatedVideo.video_url ? (
                        <div className="rounded-xl overflow-hidden bg-dark-muted border border-dark-border mb-6">
                            <video
                                src={generatedVideo.video_url}
                                controls
                                autoPlay
                                className="w-full max-h-96"
                            />
                        </div>
                    ) : (
                        <div className="aspect-video flex items-center justify-center bg-dark-muted rounded-xl border border-dark-border mb-6">
                            <div className="text-center text-gray-500">
                                <Play className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Vídeo sendo processado...</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        {generatedVideo.video_url && (
                            <a
                                href={generatedVideo.video_url}
                                download
                                className="btn-secondary flex-1 flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Baixar Vídeo
                            </a>
                        )}
                        <button
                            onClick={handleSaveToLibrary}
                            className="btn-secondary flex-1 flex items-center justify-center gap-2"
                        >
                            <Library className="w-4 h-4" />
                            Ir para Biblioteca
                        </button>
                        <button
                            onClick={() => {
                                setGeneratedVideo(null)
                                setCurrentStep(0)
                                setStep1({ nome_produto: '', descricao_produto: '', imagem_produto_url: null, logo_empresa_url: null, imagem_produto_file: null, logo_empresa_file: null })
                                setStep2({ formato: '', linha_editorial: '', duracao: 15, tom: '' })
                                setProgress(0)
                                setIsGenerating(false)
                                setPollingVideoId(null)
                            }}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Criar Novo
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Loading / generating screen
    if (isGenerating) {
        const messages = [
            'Iniciando geração...',
            'Fazendo upload das imagens...',
            'Conectando com a IA...',
            'Gerando roteiro do vídeo...',
            'Criando animações...',
            'Processando áudio...',
            'Finalizando vídeo...',
            'Aplicando efeitos finais...',
        ]
        const msgIndex = Math.floor((progress / 100) * messages.length)

        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="card max-w-md w-full text-center animate-fade-in">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-dark-border" />
                        <div
                            className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent animate-spin"
                            style={{ animationDuration: '1s' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gold font-bold text-sm">{progress}%</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        Gerando seu vídeo...
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        {messages[Math.min(msgIndex, messages.length - 1)]}
                    </p>
                    <div className="progress-bar mb-2">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">
                        Isso pode levar alguns minutos. Não feche esta página.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="section-title">Criar Novo Vídeo</h1>
                <p className="section-subtitle">Gere conteúdo profissional para produtos financeiros</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0 mb-10">
                {STEPS.map((step, index) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${index < currentStep
                                        ? 'bg-gold text-primary'
                                        : index === currentStep
                                            ? 'bg-gold/20 border-2 border-gold text-gold'
                                            : 'bg-dark-muted border border-dark-border text-gray-500'
                                    }`}
                            >
                                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                            </div>
                            <span
                                className={`text-xs mt-2 font-medium whitespace-nowrap ${index <= currentStep ? 'text-gold' : 'text-gray-500'
                                    }`}
                            >
                                {step}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-3 ${index < currentStep ? 'bg-gold' : 'bg-dark-border'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1 — Product Data */}
            {currentStep === 0 && (
                <div className="card space-y-6 animate-fade-in">
                    <div>
                        <label className="label">Nome do Produto Financeiro *</label>
                        <input
                            type="text"
                            placeholder="Ex: Home Equity, Financiamento Imobiliário..."
                            value={step1.nome_produto}
                            onChange={(e) => setStep1((p) => ({ ...p, nome_produto: e.target.value }))}
                            className={`input-field ${step1Errors.nome_produto ? 'border-red-500/60' : ''}`}
                        />
                        {step1Errors.nome_produto && (
                            <p className="text-xs text-red-400 mt-1">{step1Errors.nome_produto}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="label m-0">Descrição do Produto *</label>
                            <span className="text-xs text-gray-500">{step1.descricao_produto.length}/1000</span>
                        </div>
                        <textarea
                            placeholder="Descreva o produto financeiro em detalhes, incluindo benefícios, taxas, público-alvo..."
                            value={step1.descricao_produto}
                            onChange={(e) => setStep1((p) => ({ ...p, descricao_produto: e.target.value.slice(0, 1000) }))}
                            rows={5}
                            className={`input-field resize-none ${step1Errors.descricao_produto ? 'border-red-500/60' : ''}`}
                        />
                        {step1Errors.descricao_produto && (
                            <p className="text-xs text-red-400 mt-1">{step1Errors.descricao_produto}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FileUploadField
                            label="Imagem do Produto"
                            value={step1.imagem_produto_file}
                            previewUrl={step1.imagem_produto_url}
                            onChange={(file, preview) =>
                                setStep1((p) => ({ ...p, imagem_produto_file: file, imagem_produto_url: preview }))
                            }
                            onClear={() =>
                                setStep1((p) => ({ ...p, imagem_produto_file: null, imagem_produto_url: null }))
                            }
                        />
                        <FileUploadField
                            label="Logo da Empresa"
                            value={step1.logo_empresa_file}
                            previewUrl={step1.logo_empresa_url}
                            onChange={(file, preview) =>
                                setStep1((p) => ({ ...p, logo_empresa_file: file, logo_empresa_url: preview }))
                            }
                            onClear={() =>
                                setStep1((p) => ({ ...p, logo_empresa_file: null, logo_empresa_url: null }))
                            }
                        />
                    </div>

                    <div className="flex justify-end">
                        <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                            Próximo
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2 — Video Settings */}
            {currentStep === 1 && (
                <div className="card space-y-6 animate-fade-in">
                    {/* Format */}
                    <div>
                        <label className="label">Formato de Saída *</label>
                        <div className="grid grid-cols-2 gap-3">
                            {FORMATOS.map((f) => (
                                <button
                                    key={f.value}
                                    type="button"
                                    onClick={() => setStep2((p) => ({ ...p, formato: f.value }))}
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${step2.formato === f.value
                                            ? 'border-gold bg-gold/10 text-white'
                                            : 'border-dark-border hover:border-gold/30 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl">{f.icon}</span>
                                    <span className="text-sm font-medium">{f.label}</span>
                                </button>
                            ))}
                        </div>
                        {step2Errors.formato && (
                            <p className="text-xs text-red-400 mt-2">{step2Errors.formato}</p>
                        )}
                    </div>

                    {/* Editorial line */}
                    <div>
                        <label className="label">Linha Editorial *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {LINHAS.map((l) => (
                                <button
                                    key={l.value}
                                    type="button"
                                    onClick={() => setStep2((p) => ({ ...p, linha_editorial: l.value }))}
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${step2.linha_editorial === l.value
                                            ? 'border-gold bg-gold/10 text-white'
                                            : 'border-dark-border hover:border-gold/30 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl">{l.icon}</span>
                                    <span className="text-sm font-medium">{l.label}</span>
                                </button>
                            ))}
                        </div>
                        {step2Errors.linha_editorial && (
                            <p className="text-xs text-red-400 mt-2">{step2Errors.linha_editorial}</p>
                        )}
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="label">Duração</label>
                        <div className="flex gap-3">
                            {DURACOES.map((d) => (
                                <button
                                    key={d.value}
                                    type="button"
                                    onClick={() => setStep2((p) => ({ ...p, duracao: d.value }))}
                                    className={`flex-1 py-3 rounded-xl border transition-all font-medium text-sm ${step2.duracao === d.value
                                            ? 'border-gold bg-gold/10 text-gold'
                                            : 'border-dark-border text-gray-400 hover:border-gold/30 hover:text-white'
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tone */}
                    <div>
                        <label className="label">Tom do Conteúdo *</label>
                        <div className="grid grid-cols-3 gap-3">
                            {TONS.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setStep2((p) => ({ ...p, tom: t.value }))}
                                    className={`p-4 rounded-xl border transition-all text-center ${step2.tom === t.value
                                            ? 'border-gold bg-gold/10'
                                            : 'border-dark-border hover:border-gold/30'
                                        }`}
                                >
                                    <p className={`text-sm font-semibold ${step2.tom === t.value ? 'text-gold' : 'text-white'}`}>
                                        {t.label}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                                </button>
                            ))}
                        </div>
                        {step2Errors.tom && (
                            <p className="text-xs text-red-400 mt-2">{step2Errors.tom}</p>
                        )}
                    </div>

                    <div className="flex justify-between gap-3">
                        <button onClick={() => setCurrentStep(0)} className="btn-secondary">
                            Voltar
                        </button>
                        <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                            Próximo
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3 — Review & Generate */}
            {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                    {/* Summary card */}
                    <div className="card space-y-4">
                        <h3 className="text-base font-semibold text-white">Resumo da Criação</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Produto</p>
                                <p className="text-white font-medium">{step1.nome_produto}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Formato</p>
                                <p className="text-white font-medium capitalize">{step2.formato}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Linha Editorial</p>
                                <p className="text-white font-medium capitalize">{step2.linha_editorial}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Duração</p>
                                <p className="text-white font-medium">{step2.duracao} segundos</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Tom</p>
                                <p className="text-white font-medium capitalize">{step2.tom}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 mb-1">Descrição</p>
                            <p className="text-gray-300 text-sm">{step1.descricao_produto}</p>
                        </div>

                        {(step1.imagem_produto_url || step1.logo_empresa_url) && (
                            <div className="grid grid-cols-2 gap-3">
                                {step1.imagem_produto_url && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Imagem do Produto</p>
                                        <img
                                            src={step1.imagem_produto_url}
                                            alt="Produto"
                                            className="h-20 w-full object-contain rounded-lg bg-dark-muted border border-dark-border"
                                        />
                                    </div>
                                )}
                                {step1.logo_empresa_url && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Logo da Empresa</p>
                                        <img
                                            src={step1.logo_empresa_url}
                                            alt="Logo"
                                            className="h-20 w-full object-contain rounded-lg bg-dark-muted border border-dark-border"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Compliance warning */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-blue-400" />
                        </div>
                        <p className="text-sm text-blue-300">
                            <strong className="text-blue-200">Aviso de Compliance: </strong>
                            Este conteúdo será gerado respeitando as diretrizes do mercado financeiro brasileiro,
                            conforme regulamentações da CVM e Bacen.
                        </p>
                    </div>

                    <div className="flex justify-between gap-3">
                        <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                            Voltar
                        </button>
                        <button
                            onClick={handleGenerate}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            Gerar Vídeo
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
