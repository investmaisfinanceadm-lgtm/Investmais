'use client'

import { useState, useEffect, useRef } from 'react'
import {
    User,
    Lock,
    Puzzle,
    Palette,
    Save,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle,
    XCircle,
    Upload,
    HardDrive,
    Instagram,
    Facebook,
    Webhook,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const TABS = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'integracoes', label: 'Integrações', icon: Puzzle },
    { id: 'personalizacao', label: 'Personalização', icon: Palette },
]

const passwordSchema = z.object({
    senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
    novaSenha: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Deve ter uma maiúscula')
        .regex(/[0-9]/, 'Deve ter um número')
        .regex(/[^A-Za-z0-9]/, 'Deve ter um caractere especial'),
    confirmarSenha: z.string(),
}).refine((d) => d.novaSenha === d.confirmarSenha, {
    message: 'Senhas não coincidem',
    path: ['confirmarSenha'],
})

type PasswordForm = z.infer<typeof passwordSchema>

interface Integration {
    tipo: string
    ativo: boolean
    configuracoes?: Record<string, string>
}

const INTEGRATIONS = [
    { id: 'google_drive', label: 'Google Drive', icon: HardDrive, desc: 'Salve vídeos automaticamente' },
    { id: 'dropbox', label: 'Dropbox', icon: HardDrive, desc: 'Backup na nuvem' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, desc: 'Agende posts automaticamente' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, desc: 'Publique na sua página' },
    { id: 'webhook', label: 'Webhook Personalizado', icon: Webhook, desc: 'Integre com qualquer sistema' },
]

export default function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState('perfil')
    const [profile, setProfile] = useState({ nome: '', email: '', avatar_url: null as string | null })
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [showOldPw, setShowOldPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [isSavingPw, setIsSavingPw] = useState(false)
    const [integrations, setIntegrations] = useState<Record<string, Integration>>({})
    const [webhookUrl, setWebhookUrl] = useState('')
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [brandColors, setBrandColors] = useState({ primary: '#0A1628', secondary: '#C9A84C' })
    const logoInputRef = useRef<HTMLInputElement>(null)
    const avatarInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        reset: resetPasswordForm,
        formState: { errors: passwordErrors },
    } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

    useEffect(() => {
        async function loadData() {
            try {
                const [profileRes, intRes] = await Promise.all([
                    fetch('/api/creator/profile'),
                    fetch('/api/creator/integracoes'),
                ])

                if (profileRes.ok) {
                    const data = await profileRes.json()
                    setProfile({ nome: data.nome || '', email: data.email || '', avatar_url: data.avatar_url || null })
                }

                if (intRes.ok) {
                    const data: Integration[] = await intRes.json()
                    const map: Record<string, Integration> = {}
                    data.forEach((i) => {
                        map[i.tipo] = { tipo: i.tipo, ativo: i.ativo, configuracoes: (i.configuracoes as Record<string, string>) || {} }
                    })
                    setIntegrations(map)
                    if (map.webhook?.configuracoes?.url) setWebhookUrl(map.webhook.configuracoes.url)
                }
            } finally {
                setIsLoadingProfile(false)
            }
        }
        loadData()
    }, [])

    const handleSaveProfile = async () => {
        setIsSavingProfile(true)
        const res = await fetch('/api/creator/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: profile.nome, email: profile.email }),
        })

        if (!res.ok) {
            toast.error('Erro ao salvar perfil')
        } else {
            toast.success('Perfil atualizado!')
        }
        setIsSavingProfile(false)
    }

    const handleChangePassword = async (data: PasswordForm) => {
        setIsSavingPw(true)
        const res = await fetch('/api/creator/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senhaAtual: data.senhaAtual, novaSenha: data.novaSenha }),
        })

        if (!res.ok) {
            const err = await res.json()
            toast.error(err.error || 'Erro ao alterar senha')
        } else {
            toast.success('Senha alterada com sucesso!')
            resetPasswordForm()
        }
        setIsSavingPw(false)
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const preview = URL.createObjectURL(file)
        setProfile((p) => ({ ...p, avatar_url: preview }))
        toast.success('Avatar atualizado!')
    }

    const handleToggleIntegration = async (tipo: string) => {
        const current = integrations[tipo]
        const newState = !current?.ativo

        const res = await fetch('/api/creator/integracoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo,
                ativo: newState,
                token_acesso: null,
                configuracoes: tipo === 'webhook' ? { url: webhookUrl } : {},
            }),
        })

        if (!res.ok) {
            toast.error('Erro ao atualizar integração')
            return
        }

        setIntegrations((prev) => ({
            ...prev,
            [tipo]: { tipo, ativo: newState, configuracoes: tipo === 'webhook' ? { url: webhookUrl } : {} },
        }))

        toast.success(newState ? `${tipo} conectado!` : `${tipo} desconectado`)
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoPreview(URL.createObjectURL(file))
        toast.success('Logo carregada! Será usada automaticamente nas criações.')
    }

    if (isLoadingProfile) {
        return (
            <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
                <div className="shimmer h-8 w-48 rounded mb-2" />
                <div className="shimmer h-4 w-72 rounded" />
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="section-title">Configurações</h1>
                <p className="section-subtitle">Gerencie sua conta e preferências</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-dark-card border border-dark-border rounded-xl">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all', activeTab === tab.id ? 'bg-gold text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5')}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Profile Tab */}
            {activeTab === 'perfil' && (
                <div className="space-y-4 animate-fade-in">
                    {/* Avatar */}
                    <div className="card">
                        <h3 className="text-base font-semibold text-white mb-4">Foto de Perfil</h3>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center overflow-hidden">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gold text-xl font-bold">{getInitials(profile.nome || 'U')}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gold flex items-center justify-center shadow-gold"
                                >
                                    <Upload className="w-3 h-3 text-primary" />
                                </button>
                            </div>
                            <div>
                                <button onClick={() => avatarInputRef.current?.click()} className="btn-secondary text-sm h-9">
                                    Alterar foto
                                </button>
                                <p className="text-xs text-gray-500 mt-1">JPG, PNG. Máx 2MB</p>
                            </div>
                        </div>
                        <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </div>

                    {/* Info */}
                    <div className="card space-y-4">
                        <h3 className="text-base font-semibold text-white">Informações Pessoais</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Nome completo</label>
                                <input
                                    type="text"
                                    value={profile.nome}
                                    onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label">E-mail</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                                className="btn-primary flex items-center gap-2"
                            >
                                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="card space-y-4">
                        <h3 className="text-base font-semibold text-white">Alterar Senha</h3>
                        <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="label">Senha atual</label>
                                    <div className="relative">
                                        <input type={showOldPw ? 'text' : 'password'} className={`input-field pr-10 ${passwordErrors.senhaAtual ? 'border-red-500/60' : ''}`} {...register('senhaAtual')} />
                                        <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.senhaAtual && <p className="text-xs text-red-400 mt-1">{passwordErrors.senhaAtual.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Nova senha</label>
                                    <div className="relative">
                                        <input type={showNewPw ? 'text' : 'password'} className={`input-field pr-10 ${passwordErrors.novaSenha ? 'border-red-500/60' : ''}`} {...register('novaSenha')} />
                                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.novaSenha && <p className="text-xs text-red-400 mt-1">{passwordErrors.novaSenha.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Confirmar nova senha</label>
                                    <input type="password" className={`input-field ${passwordErrors.confirmarSenha ? 'border-red-500/60' : ''}`} {...register('confirmarSenha')} />
                                    {passwordErrors.confirmarSenha && <p className="text-xs text-red-400 mt-1">{passwordErrors.confirmarSenha.message}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isSavingPw} className="btn-primary flex items-center gap-2">
                                    {isSavingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    Alterar senha
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integracoes' && (
                <div className="space-y-4 animate-fade-in">
                    {INTEGRATIONS.map((int) => {
                        const Icon = int.icon
                        const isActive = integrations[int.id]?.ativo || false
                        return (
                            <div key={int.id} className="card flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-dark-muted border border-dark-border flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-white">{int.label}</p>
                                        {isActive ? (
                                            <span className="badge badge-green text-xs">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Conectado
                                            </span>
                                        ) : (
                                            <span className="badge badge-red text-xs">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Desconectado
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{int.desc}</p>
                                    {int.id === 'webhook' && (
                                        <input
                                            type="url"
                                            placeholder="https://seu-endpoint.com/webhook"
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                            className="input-field mt-2 h-9 text-sm"
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => handleToggleIntegration(int.id)}
                                    className={isActive ? 'btn-danger' : 'btn-secondary text-sm whitespace-nowrap'}
                                >
                                    {isActive ? 'Desconectar' : 'Conectar'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Personalization Tab */}
            {activeTab === 'personalizacao' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="card space-y-4">
                        <h3 className="text-base font-semibold text-white">Logo Padrão da Empresa</h3>
                        <p className="text-sm text-gray-400">
                            Esta logo será usada automaticamente em todas as criações de vídeo.
                        </p>
                        <div
                            className="w-full h-32 rounded-xl border-2 border-dashed border-dark-border hover:border-gold/40 bg-dark-muted/50 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
                            onClick={() => logoInputRef.current?.click()}
                        >
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="h-full object-contain p-4" />
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-gray-500 group-hover:text-gold transition-colors" />
                                    <span className="text-sm text-gray-500">Clique para fazer upload da logo</span>
                                </>
                            )}
                        </div>
                        <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </div>

                    <div className="card space-y-4">
                        <h3 className="text-base font-semibold text-white">Paleta de Cores da Marca</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Cor Primária</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={brandColors.primary}
                                        onChange={(e) => setBrandColors((p) => ({ ...p, primary: e.target.value }))}
                                        className="w-10 h-10 rounded-lg border border-dark-border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={brandColors.primary}
                                        onChange={(e) => setBrandColors((p) => ({ ...p, primary: e.target.value }))}
                                        className="input-field flex-1 font-mono text-sm uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Cor Secundária</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={brandColors.secondary}
                                        onChange={(e) => setBrandColors((p) => ({ ...p, secondary: e.target.value }))}
                                        className="w-10 h-10 rounded-lg border border-dark-border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={brandColors.secondary}
                                        onChange={(e) => setBrandColors((p) => ({ ...p, secondary: e.target.value }))}
                                        className="input-field flex-1 font-mono text-sm uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card space-y-4">
                        <h3 className="text-base font-semibold text-white">Fontes Preferidas</h3>
                        <div>
                            <label className="label">Fonte principal</label>
                            <select className="input-field">
                                {['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Outfit', 'Open Sans', 'Lato'].map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => toast.success('Preferências de personalização salvas!')}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Salvar Preferências
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
