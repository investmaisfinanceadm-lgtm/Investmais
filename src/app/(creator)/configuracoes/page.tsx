'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  User, Lock, Webhook, Bot, Search, MessageCircle,
  Eye, EyeOff, Loader2, ChevronRight, Camera,
  Plus, Trash2, Edit2, Check, X, Copy, Kanban,
  Zap, TestTube2, Save, RefreshCw, ExternalLink, ChevronDown, Link2,
  Shield, Activity, Cpu, Layers, Radio, Globe, Database, Settings,
  ArrowRight, Sparkles, Smartphone, Monitor, Code, Target, Fingerprint
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'

// ── schemas ────────────────────────────────────────────────────────────────
const passwordSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  novaSenha: z.string()
    .min(8, 'Mínimo de 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter um número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter um caractere especial'),
  confirmarSenha: z.string(),
}).refine(d => d.novaSenha === d.confirmarSenha, {
  message: 'As senhas não coincidem', path: ['confirmarSenha'],
})
type PasswordForm = z.infer<typeof passwordSchema>

// ── tabs ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'perfil',      label: 'Perfil', icon: User, desc: 'Dados e segurança da conta' },
  { id: 'pipelines',   label: 'Pipeline', icon: Kanban, desc: 'Configuração do funil de vendas' },
  { id: 'integracoes', label: 'Integrações', icon: Webhook, desc: 'Conexão com ferramentas externas' },
  { id: 'agente_ia',   label: 'Agente IA', icon: Bot, desc: 'Parâmetros da inteligência artificial' },
  { id: 'busca_leads', label: 'Busca de Leads', icon: Search, desc: 'Configuração de captura (CNPJ/Maps)' },
  { id: 'disparo',     label: 'Disparos', icon: MessageCircle, desc: 'Configuração de envios WhatsApp' },
]

// ── components ─────────────────────────────────────────────────────────────
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{label}</label>
      {children}
      {error && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{error}</p>}
    </div>
  )
}

function InputPremium({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('w-full bg-white/[0.03] border border-white/5 text-white placeholder-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-sm font-medium', className)}
      {...props}
    />
  )
}

function SectionCardPremium({ title, subtitle, icon: Icon, children, className }: { title: string; subtitle?: string; icon?: any; children: React.ReactNode; className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white/[0.02] border border-white/5 p-10 rounded-3xl space-y-10 relative overflow-hidden group shadow-xl", className)}
    >
      <div className="flex items-center gap-6 relative z-10">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{subtitle}</p>}
        </div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

// ── main component ─────────────────────────────────────────────────────────
export default function ConfiguracoesPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('perfil')

  // Profile state
  const [profile, setProfile] = useState({ nome: '', email: '', avatar_url: null as string | null })
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [showOldPw, setShowOldPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [isSavingPw, setIsSavingPw] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Pipeline state
  const [board, setBoard] = useState<any>(null)
  const [loadingBoard, setLoadingBoard] = useState(false)
  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newStageName, setNewStageName] = useState('')
  const [addingStage, setAddingStage] = useState(false)

  // Integrações state
  const [integracoes, setIntegracoes] = useState<any[]>([])
  const [loadingInteg, setLoadingInteg] = useState(false)
  const [showNewInteg, setShowNewInteg] = useState(false)
  const [newInteg, setNewInteg] = useState({ nome: '', url: '', tipo: 'webhook' })

  // Agente IA state
  const [agente, setAgente] = useState({
    nome: 'InvestMais Assistant', agente_id: '', nome_empresa: '', tom: 'professional',
    personalidade: true, webhook_n8n: '', webhook_secret: '', numero_funcionario: '',
    modelo: 'gpt-4o-mini', temperatura: 0.7, max_tokens: 500,
  })
  const [savingAgente, setSavingAgente] = useState(false)

  // Busca leads state
  const [buscaGoogle, setBuscaGoogle] = useState({ url: '' })
  const [buscaCnpj, setBuscaCnpj] = useState({ url: '' })
  const [savingBuscaGoogle, setSavingBuscaGoogle] = useState(false)
  const [savingBuscaCnpj, setSavingBuscaCnpj] = useState(false)

  // Disparo state
  const [disparo, setDisparo] = useState({ webhook_disparo: '', webhook_status: '', webhook_cancelamento: '' })
  const [savingDisparo, setSavingDisparo] = useState(false)

  const { register, handleSubmit, reset: resetPasswordForm, formState: { errors: passwordErrors } } =
    useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  // ── load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/creator/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile({ nome: data.nome || '', email: data.email || '', avatar_url: data.avatar_url || null })
        }
      } finally { setIsLoadingProfile(false) }
    }
    loadProfile()
  }, [])

  const loadBoard = useCallback(async () => {
    setLoadingBoard(true)
    try {
      const res = await fetch('/api/creator/pipeline-config')
      if (res.ok) setBoard(await res.json())
    } finally { setLoadingBoard(false) }
  }, [])

  const loadIntegracoes = useCallback(async () => {
    setLoadingInteg(true)
    try {
      const res = await fetch('/api/creator/integracoes')
      if (res.ok) {
        const all: any[] = await res.json()
        const internalKeys = ['agente_ia', 'busca_google_maps', 'busca_cnpj', 'disparo_whatsapp']
        setIntegracoes(all.filter(i => !internalKeys.includes(i.tipo)))

        const agenteData = all.find(i => i.tipo === 'agente_ia')
        if (agenteData?.configuracoes) setAgente(a => ({ ...a, ...agenteData.configuracoes }))

        const googleData = all.find(i => i.tipo === 'busca_google_maps')
        if (googleData?.configuracoes) setBuscaGoogle(googleData.configuracoes)

        const cnpjData = all.find(i => i.tipo === 'busca_cnpj')
        if (cnpjData?.configuracoes) setBuscaCnpj(cnpjData.configuracoes)

        const disparoData = all.find(i => i.tipo === 'disparo_whatsapp')
        if (disparoData?.configuracoes) setDisparo(disparoData.configuracoes)
      }
    } finally { setLoadingInteg(false) }
  }, [])

  useEffect(() => {
    if (activeTab === 'pipelines' && !board) loadBoard()
    if (['integracoes', 'agente_ia', 'busca_leads', 'disparo'].includes(activeTab)) loadIntegracoes()
  }, [activeTab]) // eslint-disable-line

  // Profile handlers
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    const res = await fetch('/api/creator/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: profile.nome, email: profile.email }),
    })
    res.ok ? toast.success('Perfil atualizado') : toast.error('Falha ao atualizar')
    setIsSavingProfile(false)
  }

  const handleChangePassword = async (data: PasswordForm) => {
    setIsSavingPw(true)
    const res = await fetch('/api/creator/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaAtual: data.senhaAtual, novaSenha: data.novaSenha }),
    })
    if (res.ok) { toast.success('Senha alterada com sucesso'); resetPasswordForm() }
    else { const err = await res.json(); toast.error(err.error || 'Erro ao alterar senha') }
    setIsSavingPw(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-white/40 text-sm">Gerencie sua conta e as preferências da plataforma</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">Status da Conta</p>
            <p className="text-xs font-bold text-emerald-500">Segura e Ativa</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-300 relative group",
                isActive 
                  ? "bg-primary/10 border-primary/40 shadow-lg" 
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                isActive ? "bg-primary text-white scale-110 shadow-lg" : "bg-white/[0.05] text-white/20 group-hover:text-white"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className={cn("text-xs font-bold", isActive ? "text-white" : "text-white/40")}>{tab.label}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* PERFIL */}
            {activeTab === 'perfil' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <SectionCardPremium title="Dados Cadastrais" subtitle="Informações pessoais e avatar" icon={User} className="lg:col-span-2">
                  <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-black/40 border border-white/5 rounded-3xl mb-8 group/avatar">
                    <div className="relative group/img cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                      <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center overflow-hidden relative shadow-lg transition-all group-hover/img:border-primary">
                        {profile.avatar_url
                          ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          : <span className="text-primary font-bold text-3xl">{getInitials(profile.nome || 'U')}</span>
                        }
                        <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" />
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                      <p className="text-xl font-bold text-white">{profile.nome || 'Usuário InvestMais'}</p>
                      <p className="text-sm text-white/40">{profile.email}</p>
                      <div className="flex gap-2 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">Acesso Master</span>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-wider">Verificado</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Nome Completo">
                      <InputPremium value={profile.nome} onChange={e => setProfile(p => ({ ...p, nome: e.target.value }))} placeholder="Seu nome" />
                    </Field>
                    <Field label="E-mail Principal">
                      <InputPremium type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" />
                    </Field>
                  </div>

                  <div className="flex justify-end pt-8">
                    <button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-primary hover:bg-primary/90 px-8 py-3 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg">
                      {isSavingProfile ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Salvar Alterações
                    </button>
                  </div>
                </SectionCardPremium>

                <SectionCardPremium title="Segurança" subtitle="Alteração de senha" icon={Lock}>
                  <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-6">
                    <Field label="Senha Atual" error={passwordErrors.senhaAtual?.message}>
                      <div className="relative">
                        <InputPremium type={showOldPw ? 'text' : 'password'} {...register('senhaAtual')} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowOldPw(v => !v)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                          {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>
                    
                    <Field label="Nova Senha" error={passwordErrors.novaSenha?.message}>
                      <div className="relative">
                        <InputPremium type={showNewPw ? 'text' : 'password'} {...register('novaSenha')} placeholder="Mín. 8 caracteres" />
                        <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>

                    <Field label="Confirmar Nova Senha" error={passwordErrors.confirmarSenha?.message}>
                      <InputPremium type="password" {...register('confirmarSenha')} placeholder="Repita a nova senha" />
                    </Field>

                    <button type="submit" disabled={isSavingPw} className="w-full bg-primary hover:bg-primary/90 py-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg">
                      {isSavingPw ? <Activity className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Atualizar Senha
                    </button>
                  </form>
                </SectionCardPremium>
              </div>
            )}

            {/* PIPELINES */}
            {activeTab === 'pipelines' && (
              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                      <div className="space-y-1">
                          <h2 className="text-xl font-bold text-white tracking-tight">{board?.nome || 'Funil de Vendas'}</h2>
                          <p className="text-xs text-white/40">Gerencie as etapas do seu processo comercial</p>
                      </div>
                      <button
                        onClick={() => setAddingStage(true)}
                        className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
                      >
                        <Plus className="w-4 h-4" /> 
                        Nova Etapa
                      </button>
                 </div>

                 <SectionCardPremium title="Estrutura do Funil" subtitle="Controle as colunas do seu pipeline" icon={Layers}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {board?.colunas?.map((col: any, idx: number) => (
                              <motion.div key={col.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                  className="bg-black/40 border border-white/5 p-6 rounded-2xl group flex items-center gap-6 shadow-md"
                              >
                                  <div className="w-1.5 h-10 rounded-full shadow-lg" style={{ backgroundColor: col.cor }} />
                                  <div className="flex-1">
                                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{col.nome}</p>
                                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Etapa {idx + 1}</p>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                      <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                                      <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                 </SectionCardPremium>
              </div>
            )}

            {/* INTEGRATIONS, AI CORE, etc. */}
            {['integracoes', 'agente_ia', 'busca_leads', 'disparo'].includes(activeTab) && (
                <SectionCardPremium 
                  title={TABS.find(t => t.id === activeTab)?.label || 'Configurações'} 
                  subtitle={TABS.find(t => t.id === activeTab)?.desc} 
                  icon={TABS.find(t => t.id === activeTab)?.icon}
                >
                      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/5 rounded-3xl group hover:border-primary/20 transition-all bg-black/20">
                           <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                               <Radio className="w-8 h-8 text-white/10 group-hover:text-primary transition-colors" />
                           </div>
                           <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Painel em Sincronização</p>
                           <p className="text-xs text-white/10 mt-2">Configurações para InvestMais CRM v4</p>
                      </div>
                </SectionCardPremium>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
