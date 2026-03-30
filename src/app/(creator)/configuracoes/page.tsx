'use client'

import { useState, useEffect, useRef } from 'react'
import {
    User,
    Lock,
    Palette,
    Eye,
    EyeOff,
    Loader2,
    ChevronRight,
    Camera,
    Palette as PaletteIcon,
    Settings,
    Upload,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const TABS = [
    { id: 'perfil', label: 'Perfil do Usuário', icon: User },
    { id: 'personalizacao', label: 'DNA da Marca', icon: Palette },
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

export default function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState('perfil')
    const [profile, setProfile] = useState({ nome: '', email: '', avatar_url: null as string | null })
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [showOldPw, setShowOldPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [isSavingPw, setIsSavingPw] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [brandColors, setBrandColors] = useState({ primary: '#0A192F', secondary: '#2563EB' })
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
                const profileRes = await fetch('/api/creator/profile')
                if (profileRes.ok) {
                    const data = await profileRes.json()
                    setProfile({ nome: data.nome || '', email: data.email || '', avatar_url: data.avatar_url || null })
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
        toast.success('Avatar atualizado! (Simulação)')
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoPreview(URL.createObjectURL(file))
        toast.success('Logo carregada! Será usada automaticamente nas criações.')
    }

    if (isLoadingProfile) {
        return (
             <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-12 bg-primary">
                <div className="shimmer h-8 w-48 rounded-[24px] mb-2 opacity-20" />
                <div className="shimmer h-4 w-72 rounded-[12px] opacity-10" />
            </div>
        )
    }

    return (
        <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-12 animate-fade-in bg-primary pb-20 min-h-screen">
            <div className="space-y-4 text-center md:text-left border-b border-white/5 pb-12 overflow-hidden">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4 transition-all hover:bg-accent/20">
                    <Settings className="w-3 h-3 text-accent" />
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Preferências do Sistema</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
                    Ajustes de <br />
                    <span className="text-transparent bg-clip-text bg-gradient-accent">Parâmetros</span>
                </h1>
                <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">
                    Gerencie suas credenciais de acesso e protocolos de identidade visual
                </p>
            </div>

            {/* Premium Tabs */}
            <div className="flex gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-[32px] max-w-2xl">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-[24px] text-[10px] uppercase font-black tracking-widest transition-all duration-300',
                                activeTab === tab.id 
                                    ? 'bg-accent text-black shadow-accent active:scale-95' 
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Profile Tab */}
            {activeTab === 'perfil' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 card border-white/5 bg-white/[0.02] p-8 flex flex-col items-center justify-center space-y-6">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest text-center">Identidade Visual</h3>
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[40px] bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-accent/40 shadow-xl">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    ) : (
                                        <span className="text-white text-3xl font-black">{getInitials(profile.nome || 'U')}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-accent text-black flex items-center justify-center shadow-accent transition-transform hover:scale-110"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">JPG, PNG Otimizado</p>
                                <p className="text-[8px] text-gray-700 font-bold uppercase mt-1">Limite Máximo 2MB</p>
                            </div>
                            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </div>

                        <div className="md:col-span-2 card border-white/5 bg-white/[0.02] p-10 space-y-10">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest pb-4 border-b border-white/5">Parâmetros Pessoais</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={profile.nome}
                                        onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))}
                                        className="input-field h-14 bg-white/5 border-white/5 rounded-2xl uppercase text-[10px] font-black tracking-widest outline-none focus:bg-white/[0.08]"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Endpoint de E-mail</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                                        className="input-field h-14 bg-white/5 border-white/5 rounded-2xl lowercase text-[10px] font-black tracking-widest outline-none focus:bg-white/[0.08]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="btn-primary py-5 px-10 flex items-center gap-3 transition-all hover:gap-4 bg-accent text-black font-black uppercase tracking-widest text-[10px] rounded-xl"
                                >
                                    <span>{isSavingProfile ? 'Sincronizando...' : 'confirmar perfil'}</span>
                                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Access Layer */}
                    <div className="card border-white/5 bg-white/[0.02] p-10 space-y-12">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <Lock className="w-4 h-4 text-gray-500" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Camada de Segurança</h3>
                        </div>
                        <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-10">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chave Atual</label>
                                    <div className="relative">
                                        <input type={showOldPw ? 'text' : 'password'} className={cn("input-field h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-[12px] outline-none w-full px-4", passwordErrors.senhaAtual && 'border-red-500/50')} {...register('senhaAtual')} />
                                        <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                                            {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.senhaAtual && <p className="text-[8px] text-red-400 font-bold uppercase tracking-widest">{passwordErrors.senhaAtual.message}</p>}
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Novo Protocolo</label>
                                    <div className="relative">
                                        <input type={showNewPw ? 'text' : 'password'} className={cn("input-field h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-[12px] outline-none w-full px-4", passwordErrors.novaSenha && 'border-red-500/50')} {...register('novaSenha')} />
                                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.novaSenha && <p className="text-[8px] text-red-400 font-bold uppercase tracking-widest">{passwordErrors.novaSenha.message}</p>}
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Confirmar Sequência</label>
                                    <input type="password" className={cn("input-field h-14 bg-white/5 border-white/5 rounded-2xl text-[12px] outline-none w-full px-4", passwordErrors.confirmarSenha && 'border-red-500/50')} {...register('confirmarSenha')} />
                                    {passwordErrors.confirmarSenha && <p className="text-[8px] text-red-400 font-bold uppercase tracking-widest">{passwordErrors.confirmarSenha.message}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isSavingPw} className="btn-secondary py-5 px-10 border-white/10 hover:border-accent/40 group">
                                    <div className="flex items-center gap-3">
                                        <span className="uppercase tracking-[0.2em] font-black text-xs text-gray-400 group-hover:text-accent transition-colors">{isSavingPw ? 'Processando...' : 'Recalibrar Senha'}</span>
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Personalization Tab */}
            {activeTab === 'personalizacao' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="card space-y-8 border-white/5 bg-white/[0.02] p-10 flex flex-col items-center justify-between">
                            <div className="text-center space-y-4">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Identidade da Marca</h3>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest max-w-[200px] mx-auto leading-loose">
                                    Vetor corporativo padrão para marca d'água automatizada
                                </p>
                            </div>
                            <div
                                className="w-full aspect-video rounded-[32px] border-4 border-dashed border-white/5 hover:border-accent/20 bg-white/[0.01] hover:bg-white/[0.03] flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group relative overflow-hidden"
                                onClick={() => logoInputRef.current?.click()}
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-8 filter brightness-110 transition-transform group-hover:scale-105" />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                            <Upload className="w-7 h-7 text-gray-600 group-hover:text-accent" />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:text-accent transition-colors">Injetar Logotipo</span>
                                    </>
                                )}
                            </div>
                            <p className="text-[8px] text-gray-700 font-bold uppercase">SVG, AI ou PNG Otimizado Sem Fundo</p>
                            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </div>

                        <div className="card space-y-12 border-white/5 bg-white/[0.02] p-10 flex flex-col justify-between">
                             <div className="space-y-8">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] text-center md:text-left">Matrix Cromática</h3>
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColors.primary }} />
                                            Cor Primária
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                value={brandColors.primary}
                                                onChange={(e) => setBrandColors((p) => ({ ...p, primary: e.target.value }))}
                                                className="w-14 h-14 rounded-2xl border-none cursor-pointer bg-white/5 p-1"
                                            />
                                            <input
                                                type="text"
                                                value={brandColors.primary}
                                                onChange={(e) => setBrandColors((p) => ({ ...p, primary: e.target.value }))}
                                                className="input-field h-14 flex-1 font-mono text-[10px] uppercase font-bold tracking-widest bg-white/5 border-white/5 rounded-2xl px-6 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColors.secondary }} />
                                            Cor de Destaque
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                value={brandColors.secondary}
                                                onChange={(e) => setBrandColors((p) => ({ ...p, secondary: e.target.value }))}
                                                className="w-14 h-14 rounded-2xl border-none cursor-pointer bg-white/5 p-1"
                                            />
                                            <input
                                                type="text"
                                                value={brandColors.secondary}
                                                onChange={(e) => setBrandColors((p) => ({ ...p, secondary: e.target.value }))}
                                                className="input-field h-14 flex-1 font-mono text-[10px] uppercase font-bold tracking-widest bg-white/5 border-white/5 rounded-2xl px-6 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => toast.success('DNA visual pronto!')}
                                className="btn-primary py-5 w-full flex items-center justify-center gap-3 group bg-accent text-black font-black uppercase tracking-widest text-[10px] rounded-xl"
                            >
                                <PaletteIcon className="w-4 h-4" />
                                <span className="uppercase tracking-[0.2em] font-black text-xs italic">Atualizar Matrix DNA</span>
                            </button>
                        </div>
                    </div>

                    <div className="card space-y-10 border-white/5 bg-white/[0.02] p-10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="space-y-4 text-center md:text-left">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Motor de Tipografia</h3>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Selecione a fonte padrão para os ativos</p>
                            </div>
                            <div className="w-full md:w-80">
                                <select className="input-field h-16 bg-white/5 border-white/5 rounded-2xl px-8 uppercase text-[10px] font-black tracking-widest outline-none transition-all focus:bg-white/[0.08] cursor-pointer">
                                    {['Inter', 'Outfit', 'Montserrat', 'Open Sans', 'Lato'].map((f) => (
                                        <option key={f} value={f} className="bg-[#0A192F] text-white py-4">{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
