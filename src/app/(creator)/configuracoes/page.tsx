'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  User, Lock, Webhook, Bot, Search, MessageCircle,
  Eye, EyeOff, Loader2, ChevronRight, Camera,
  Plus, Trash2, Edit2, Check, X, Copy, Kanban,
  Zap, TestTube2, Save, RefreshCw, ExternalLink, ChevronDown, Link2,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'

// ── schemas ────────────────────────────────────────────────────────────────
const passwordSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  novaSenha: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve ter uma maiúscula')
    .regex(/[0-9]/, 'Deve ter um número')
    .regex(/[^A-Za-z0-9]/, 'Deve ter um caractere especial'),
  confirmarSenha: z.string(),
}).refine(d => d.novaSenha === d.confirmarSenha, {
  message: 'Senhas não coincidem', path: ['confirmarSenha'],
})
type PasswordForm = z.infer<typeof passwordSchema>

// ── tabs ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'perfil',      label: 'Perfil',       icon: User },
  { id: 'pipelines',   label: 'Pipelines',    icon: Kanban },
  { id: 'integracoes', label: 'Integrações',  icon: Webhook },
  { id: 'agente_ia',   label: 'Agente IA',    icon: Bot },
  { id: 'busca_leads', label: 'Busca de Leads', icon: Search },
  { id: 'disparo',     label: 'Disparo',      icon: MessageCircle },
]

// ── helpers ────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

function InputDark({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('w-full bg-[var(--bg-input)] border border-[var(--border-main)] text-[var(--text-main)] placeholder-[#94A3B8] px-4 py-3 rounded-xl focus:outline-none focus:border-accent/60 transition-all text-sm', className)}
      {...props}
    />
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-black/40 border border-[var(--border-main)] rounded-xl p-4 text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
      {code}
    </pre>
  )
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 space-y-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div>
        <h3 className="text-sm font-bold text-[var(--text-main)]">{title}</h3>
        {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

async function saveIntegracao(tipo: string, configuracoes: Record<string, any>, ativo = true) {
  const res = await fetch('/api/creator/integracoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo, configuracoes, ativo }),
  })
  if (!res.ok) throw new Error('Falha ao salvar')
}

// ── Endpoint Modal ─────────────────────────────────────────────────────────
const SOURCES = [
  { value: '', label: 'Selecione ou deixe vazio para usar o path' },
  { value: 'facebook_ads', label: 'Facebook / Meta Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn Ads' },
  { value: 'tiktok', label: 'TikTok Ads' },
  { value: 'hotmart', label: 'Hotmart' },
  { value: 'kiwify', label: 'Kiwify' },
  { value: 'typeform', label: 'Typeform' },
  { value: 'outro', label: 'Outro' },
]

function EndpointModal({
  tipo,
  onClose,
  onCreated,
}: {
  tipo: string
  onClose: () => void
  onCreated: () => void
}) {
  const [path, setPath] = useState('')
  const [source, setSource] = useState('')
  const [secret, setSecret] = useState('')
  const [saving, setSaving] = useState(false)

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin.replace('localhost:3001', 'app.investmaisfinance.com.br').replace('http://', 'https://')
    : 'https://app.investmaisfinance.com.br'
  const cleanPath = path.replace(/[^a-z0-9-_]/gi, '-').toLowerCase()
  const fullUrl = cleanPath ? `${appUrl}/api/webhooks/${cleanPath}` : ''

  const handleCreate = async () => {
    if (!path.trim()) { toast.error('Path é obrigatório'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/creator/integracoes/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, path: cleanPath, source, secret }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Erro ao criar endpoint'); return }
      toast.success('Endpoint criado!')
      onCreated()
      onClose()
    } catch { toast.error('Erro ao criar endpoint') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-main)]">
          <h3 className="text-[var(--text-main)] font-bold text-sm">Novo Endpoint de Webhook</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-[var(--text-main)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Path</label>
            <input
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="facebook-leads"
              className="w-full bg-[var(--bg-primary)] border border-white/10 text-[var(--text-main)] placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-accent/60 transition-all text-sm"
            />
            {fullUrl && (
              <div className="bg-black/30 border border-[var(--border-main)] rounded-lg px-3 py-2">
                <p className="text-[10px] text-gray-500 mb-0.5">URL final:</p>
                <p className="text-[11px] text-emerald-400 font-mono break-all">{fullUrl}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sistema de Origem</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-white/10 text-[var(--text-main)] px-4 py-3 rounded-xl focus:outline-none focus:border-accent/60 transition-all text-sm appearance-none"
            >
              {SOURCES.map(s => (
                <option key={s.value} value={s.value} className="bg-[var(--bg-card)]">{s.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-600">Identifica a origem dos leads nos relatórios UTM</p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Secret Token (opcional)</label>
            <input
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Token de autenticação"
              className="w-full bg-[var(--bg-primary)] border border-white/10 text-[var(--text-main)] placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-accent/60 transition-all text-sm"
            />
            <p className="text-[10px] text-gray-600">Envie no header <code className="text-gray-400">x-webhook-secret</code> ou <code className="text-gray-400">authorization: bearer TOKEN</code></p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-main)]">
          <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-gray-400 hover:text-[var(--text-main)] border border-white/10 rounded-xl transition-all">
            Cancelar
          </button>
          <button onClick={handleCreate} disabled={saving}
            className="px-5 py-2.5 text-xs font-bold bg-accent text-black rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2 uppercase tracking-wider">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Criar Endpoint
          </button>
        </div>
      </div>
    </div>
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
  const [endpointModalTipo, setEndpointModalTipo] = useState<string | null>(null)
  const [expandedInteg, setExpandedInteg] = useState<string | null>(null)

  // Agente IA state
  const [agente, setAgente] = useState({
    nome: 'Agente InvestMais', agente_id: '', nome_empresa: '', tom: 'profissional',
    personalidade: true, webhook_n8n: '', webhook_secret: '', numero_funcionario: '',
    modelo: 'gpt-4o-mini', temperatura: 0.7, max_tokens: 500,
  })
  const [savingAgente, setSavingAgente] = useState(false)
  const [testingAgente, setTestingAgente] = useState(false)

  // Busca leads state
  const [buscaGoogle, setBuscaGoogle] = useState({ url: '' })
  const [buscaCnpj, setBuscaCnpj] = useState({ url: '' })
  const [savingBuscaGoogle, setSavingBuscaGoogle] = useState(false)
  const [savingBuscaCnpj, setSavingBuscaCnpj] = useState(false)
  const [testingGoogle, setTestingGoogle] = useState(false)
  const [testingCnpj, setTestingCnpj] = useState(false)

  // Disparo state
  const [disparo, setDisparo] = useState({ webhook_disparo: '', webhook_status: '', webhook_cancelamento: '' })
  const [savingDisparo, setSavingDisparo] = useState(false)
  const [testingDisparo, setTestingDisparo] = useState(false)

  const callbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/disparos/callback`
    : '/api/disparos/callback'

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
        // Split: user-facing webhooks vs internal config keys
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

  // ── Profile handlers ─────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    const res = await fetch('/api/creator/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: profile.nome, email: profile.email }),
    })
    res.ok ? toast.success('Perfil atualizado!') : toast.error('Erro ao salvar perfil')
    setIsSavingProfile(false)
  }

  const handleChangePassword = async (data: PasswordForm) => {
    setIsSavingPw(true)
    const res = await fetch('/api/creator/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaAtual: data.senhaAtual, novaSenha: data.novaSenha }),
    })
    if (res.ok) { toast.success('Senha alterada!'); resetPasswordForm() }
    else { const err = await res.json(); toast.error(err.error || 'Erro ao alterar senha') }
    setIsSavingPw(false)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProfile(p => ({ ...p, avatar_url: URL.createObjectURL(file) }))
    toast.success('Avatar atualizado! (local)')
  }

  // ── Pipeline handlers ────────────────────────────────────────────────────
  const handleAddStage = async () => {
    if (!newStageName.trim()) return
    try {
      const res = await fetch('/api/creator/pipeline-config/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newStageName.trim() }),
      })
      if (res.ok) { toast.success('Estágio criado!'); setNewStageName(''); setAddingStage(false); loadBoard() }
      else toast.error('Erro ao criar estágio')
    } catch { toast.error('Erro ao criar estágio') }
  }

  const handleEditStage = async (id: string) => {
    if (!editingName.trim()) return
    try {
      const res = await fetch('/api/creator/pipeline-config/stages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nome: editingName.trim() }),
      })
      if (res.ok) { toast.success('Estágio atualizado!'); setEditingStageId(null); loadBoard() }
      else toast.error('Erro ao atualizar estágio')
    } catch { toast.error('Erro ao atualizar estágio') }
  }

  const handleDeleteStage = async (id: string) => {
    if (!confirm('Excluir este estágio?')) return
    try {
      const res = await fetch(`/api/creator/pipeline-config/stages?id=${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Estágio removido!'); loadBoard() }
      else toast.error('Erro ao remover estágio')
    } catch { toast.error('Erro ao remover estágio') }
  }

  // ── Integrações handlers ─────────────────────────────────────────────────
  const handleSaveInteg = async () => {
    if (!newInteg.nome || !newInteg.url) { toast.error('Preencha nome e URL'); return }
    try {
      await saveIntegracao(newInteg.nome.toLowerCase().replace(/\s+/g, '_'), {
        nome: newInteg.nome, url: newInteg.url, tipo: newInteg.tipo,
      })
      toast.success('Integração salva!'); setShowNewInteg(false); setNewInteg({ nome: '', url: '', tipo: 'webhook' }); loadIntegracoes()
    } catch { toast.error('Erro ao salvar integração') }
  }

  const handleToggleInteg = async (integ: any) => {
    try {
      await saveIntegracao(integ.tipo, integ.configuracoes, !integ.ativo)
      toast.success(integ.ativo ? 'Integração desativada' : 'Integração ativada'); loadIntegracoes()
    } catch { toast.error('Erro ao alterar integração') }
  }

  const handleDeleteInteg = async (tipo: string) => {
    if (!confirm('Excluir esta integração?')) return
    try {
      await saveIntegracao(tipo, {}, false)
      toast.success('Integração removida!'); loadIntegracoes()
    } catch { toast.error('Erro ao remover integração') }
  }

  const handleDeleteEndpoint = async (tipo: string, endpointId: string) => {
    if (!confirm('Excluir este endpoint?')) return
    try {
      const res = await fetch(`/api/creator/integracoes/endpoints?tipo=${tipo}&endpoint_id=${endpointId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Endpoint removido!'); loadIntegracoes() }
      else toast.error('Erro ao remover endpoint')
    } catch { toast.error('Erro ao remover endpoint') }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado!')
  }

  // ── Agente IA handlers ───────────────────────────────────────────────────
  const handleSaveAgente = async () => {
    setSavingAgente(true)
    try {
      await saveIntegracao('agente_ia', agente)
      toast.success('Agente IA salvo!')
    } catch { toast.error('Erro ao salvar') }
    finally { setSavingAgente(false) }
  }

  const handleTestAgente = async () => {
    if (!agente.webhook_n8n) { toast.error('Configure o Webhook do N8N primeiro'); return }
    setTestingAgente(true)
    try {
      const res = await fetch(agente.webhook_n8n, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, agente_id: agente.agente_id }),
      })
      res.ok ? toast.success('Conexão estabelecida!') : toast.error(`Erro: ${res.status}`)
    } catch { toast.error('Não foi possível conectar ao webhook') }
    finally { setTestingAgente(false) }
  }

  // ── Busca Leads handlers ─────────────────────────────────────────────────
  const testWebhook = async (url: string, payload: object, onStart: () => void, onEnd: () => void) => {
    if (!url) { toast.error('Insira a URL do webhook primeiro'); return }
    onStart()
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      res.ok ? toast.success('Conexão OK!') : toast.error(`Erro ${res.status}`)
    } catch { toast.error('Webhook inacessível') }
    finally { onEnd() }
  }

  const handleSaveBuscaGoogle = async () => {
    setSavingBuscaGoogle(true)
    try { await saveIntegracao('busca_google_maps', buscaGoogle); toast.success('Salvo!') }
    catch { toast.error('Erro ao salvar') }
    finally { setSavingBuscaGoogle(false) }
  }

  const handleSaveBuscaCnpj = async () => {
    setSavingBuscaCnpj(true)
    try { await saveIntegracao('busca_cnpj', buscaCnpj); toast.success('Salvo!') }
    catch { toast.error('Erro ao salvar') }
    finally { setSavingBuscaCnpj(false) }
  }

  // ── Disparo handlers ─────────────────────────────────────────────────────
  const handleSaveDisparo = async () => {
    setSavingDisparo(true)
    try { await saveIntegracao('disparo_whatsapp', disparo); toast.success('Salvo!') }
    catch { toast.error('Erro ao salvar') }
    finally { setSavingDisparo(false) }
  }

  if (isLoadingProfile) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[var(--bg-primary)] rounded-xl" />
        <div className="h-4 w-64 bg-[var(--bg-primary)] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tighter">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie suas preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-[var(--border-main)] pb-0 no-view -mx-4 md:mx-0 px-4 md:px-0">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 md:px-4 py-3 text-[10px] md:text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all -mb-px whitespace-nowrap flex-shrink-0',
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-[var(--text-main)]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── TAB: PERFIL ─────────────────────────────────────────────────── */}
      {activeTab === 'perfil' && (
        <div className="space-y-6">
          <SectionCard title="Informações do Perfil" subtitle="Atualize seus dados pessoais e foto">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    : <span className="text-accent font-black text-lg">{getInitials(profile.nome || 'U')}</span>
                  }
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-accent text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <div>
                <p className="text-[var(--text-main)] font-bold">{profile.nome || 'Usuário'}</p>
                <p className="text-gray-500 text-xs">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome">
                <InputDark value={profile.nome} onChange={e => setProfile(p => ({ ...p, nome: e.target.value }))} placeholder="Seu nome" />
              </Field>
              <Field label="E-mail">
                <InputDark type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="seu@email.com" />
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={handleSaveProfile} disabled={isSavingProfile}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-xs bg-accent text-black font-black uppercase tracking-widest rounded-xl">
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Alterações
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Segurança" subtitle="Altere sua senha de acesso">
            <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Senha Atual">
                  <div className="relative">
                    <InputDark type={showOldPw ? 'text' : 'password'} {...register('senhaAtual')} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowOldPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.senhaAtual && <p className="text-red-400 text-[10px] mt-1">{passwordErrors.senhaAtual.message}</p>}
                </Field>
                <Field label="Nova Senha">
                  <div className="relative">
                    <InputDark type={showNewPw ? 'text' : 'password'} {...register('novaSenha')} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.novaSenha && <p className="text-red-400 text-[10px] mt-1">{passwordErrors.novaSenha.message}</p>}
                </Field>
                <Field label="Confirmar Senha">
                  <InputDark type="password" {...register('confirmarSenha')} placeholder="••••••••" />
                  {passwordErrors.confirmarSenha && <p className="text-red-400 text-[10px] mt-1">{passwordErrors.confirmarSenha.message}</p>}
                </Field>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isSavingPw}
                  className="btn-secondary flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl">
                  {isSavingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Alterar Senha
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}

      {/* ── TAB: PIPELINES ──────────────────────────────────────────────── */}
      {activeTab === 'pipelines' && (
        <div className="space-y-6">
          {loadingBoard ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : board && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-[var(--text-main)] font-bold">{board.nome}</h2>
                  <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-bold uppercase">Padrão</span>
                </div>
                <button
                  onClick={() => setAddingStage(true)}
                  className="flex items-center gap-2 bg-accent text-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-accent/90 transition-all"
                >
                  <Plus className="w-4 h-4" /> Novo Estágio
                </button>
              </div>

              <SectionCard title="Estágios" subtitle="Arraste para reordenar os estágios do pipeline">
                <div className="space-y-2">
                  {board.colunas?.map((col: any) => (
                    <div key={col.id} className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl group">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: col.cor }} />
                      {editingStageId === col.id ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleEditStage(col.id); if (e.key === 'Escape') setEditingStageId(null) }}
                          className="flex-1 bg-[var(--bg-primary)] border border-accent/40 text-[var(--text-main)] text-sm px-3 py-1.5 rounded-lg outline-none"
                        />
                      ) : (
                        <span className="flex-1 text-sm text-[var(--text-main)] font-medium">{col.nome}</span>
                      )}
                      <span className="text-[10px] text-gray-600 font-medium hidden sm:block">SLA: 24h</span>
                      {editingStageId === col.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleEditStage(col.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingStageId(null)} className="p-1.5 text-gray-500 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingStageId(col.id); setEditingName(col.nome) }} className="p-1.5 text-gray-400 hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)] rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteStage(col.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  ))}

                  {addingStage && (
                    <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded-xl">
                      <div className="w-3 h-3 rounded-full bg-accent flex-shrink-0" />
                      <input
                        autoFocus
                        value={newStageName}
                        onChange={e => setNewStageName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddStage(); if (e.key === 'Escape') { setAddingStage(false); setNewStageName('') } }}
                        placeholder="Nome do estágio..."
                        className="flex-1 bg-transparent text-[var(--text-main)] text-sm outline-none placeholder-gray-600"
                      />
                      <button onClick={handleAddStage} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setAddingStage(false); setNewStageName('') }} className="p-1.5 text-gray-500 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              </SectionCard>
            </>
          )}
        </div>
      )}

      {/* ── TAB: INTEGRAÇÕES ────────────────────────────────────────────── */}
      {activeTab === 'integracoes' && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[var(--text-main)] font-bold">Integrações</h2>
              <p className="text-gray-500 text-xs mt-0.5">Configure webhooks e APIs externas</p>
            </div>
            <button
              onClick={() => setShowNewInteg(true)}
              className="flex items-center gap-2 bg-accent text-black text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Nova Integração
            </button>
          </div>

          {/* New integration form */}
          {showNewInteg && (
            <div className="bg-[var(--bg-primary)] border border-accent/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-main)]">Nova Integração</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome da Integração">
                  <InputDark value={newInteg.nome} onChange={e => setNewInteg(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Facebook Leads Ads" />
                </Field>
                <Field label="Tipo (identificador único)">
                  <InputDark value={newInteg.url} onChange={e => setNewInteg(p => ({ ...p, url: e.target.value }))} placeholder="Ex: facebook_leads" />
                </Field>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowNewInteg(false); setNewInteg({ nome: '', url: '', tipo: 'webhook' }) }}
                  className="px-4 py-2 text-xs font-bold text-gray-400 border border-white/10 rounded-xl hover:text-[var(--text-main)] transition-all">Cancelar</button>
                <button onClick={handleSaveInteg}
                  className="px-4 py-2 text-xs font-bold bg-accent text-black rounded-xl hover:bg-accent/90 transition-all">Salvar</button>
              </div>
            </div>
          )}

          {/* List */}
          {loadingInteg ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
          ) : integracoes.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[var(--border-main)] rounded-2xl">
              <Webhook className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Nenhuma integração configurada</p>
              <p className="text-gray-700 text-xs mt-1">Clique em "Nova Integração" para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {integracoes.map(integ => {
                const endpoints: any[] = integ.configuracoes?.endpoints || []
                const isExpanded = expandedInteg === integ.tipo
                const nome = integ.configuracoes?.nome || integ.tipo

                return (
                  <div key={integ.tipo} className="bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl overflow-hidden">
                    {/* Integration row */}
                    <div className="flex items-center gap-4 px-5 py-4">
                      <Webhook className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="flex-1 text-[var(--text-main)] text-sm font-semibold">{nome}</span>

                      <div className="flex items-center gap-2">
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggleInteg(integ)}
                          className={cn('w-11 h-6 rounded-full transition-all relative flex-shrink-0', integ.ativo ? 'bg-accent' : 'bg-[var(--border-main)]')}
                        >
                          <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all', integ.ativo ? 'left-6' : 'left-1')} />
                        </button>

                        {/* + Endpoint */}
                        <button
                          onClick={() => setEndpointModalTipo(integ.tipo)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[var(--text-main)] border border-white/10 rounded-lg hover:border-accent/40 hover:bg-[var(--bg-primary)] transition-all"
                        >
                          <Plus className="w-3 h-3" /> Endpoint
                        </button>

                        {/* Delete integration */}
                        <button
                          onClick={() => handleDeleteInteg(integ.tipo)}
                          className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Expand chevron */}
                        {endpoints.length > 0 && (
                          <button
                            onClick={() => setExpandedInteg(isExpanded ? null : integ.tipo)}
                            className="p-1.5 text-gray-500 hover:text-[var(--text-main)] transition-colors"
                          >
                            <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Endpoints list */}
                    {(isExpanded || endpoints.length > 0) && endpoints.length > 0 && (
                      <div className="border-t border-white/[0.04]">
                        {endpoints.map(ep => (
                          <div key={ep.id} className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-main)] last:border-0 hover:bg-[var(--bg-primary)] transition-colors group">
                            <Link2 className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                            <code className="text-[12px] text-gray-400 font-mono">/{ep.path}</code>
                            <span className="text-[11px] bg-[var(--bg-primary)] border border-white/10 text-gray-500 px-2 py-0.5 rounded-md font-mono">{ep.tag}</span>
                            {ep.source && (
                              <span className="text-[10px] text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">{ep.source}</span>
                            )}
                            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => copyToClipboard(ep.full_url)} className="p-1.5 text-gray-500 hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)] rounded-lg transition-all" title="Copiar URL">
                                <Copy className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDeleteEndpoint(integ.tipo, ep.id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Excluir endpoint">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Endpoint Modal */}
      {endpointModalTipo && (
        <EndpointModal
          tipo={endpointModalTipo}
          onClose={() => setEndpointModalTipo(null)}
          onCreated={loadIntegracoes}
        />
      )}

      {/* ── TAB: AGENTE IA ──────────────────────────────────────────────── */}
      {activeTab === 'agente_ia' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Identidade do Agente" subtitle="Configure como o agente se apresenta">
              <div className="space-y-4">
                <Field label="Nome do Agente">
                  <InputDark value={agente.nome} onChange={e => setAgente(a => ({ ...a, nome: e.target.value }))} placeholder="Ex: Assistente InvestMais" />
                </Field>
                <Field label="Nome da Empresa (aparece nas mensagens)">
                  <InputDark value={agente.nome_empresa} onChange={e => setAgente(a => ({ ...a, nome_empresa: e.target.value }))} placeholder="InvestMais Finance" />
                </Field>
                <Field label="Tom de Comunicação">
                  <select value={agente.tom} onChange={e => setAgente(a => ({ ...a, tom: e.target.value }))}
                    className="w-full bg-[var(--bg-primary)] border border-white/10 text-[var(--text-main)] px-4 py-3 rounded-xl focus:outline-none focus:border-accent/60 transition-all text-sm">
                    <option value="profissional">Profissional</option>
                    <option value="amigavel">Amigável</option>
                    <option value="formal">Formal</option>
                    <option value="direto">Direto ao ponto</option>
                  </select>
                </Field>
                <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl">
                  <span className="text-sm text-[var(--text-main)]">Personalidade ativa</span>
                  <button onClick={() => setAgente(a => ({ ...a, personalidade: !a.personalidade }))}
                    className={cn('w-10 h-5 rounded-full transition-colors relative', agente.personalidade ? 'bg-accent' : 'bg-[var(--border-main)]')}>
                    <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', agente.personalidade ? 'left-5' : 'left-0.5')} />
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Integrações" subtitle="Conecte o agente ao N8N">
              <div className="space-y-4">
                <Field label="Webhook URL do N8N">
                  <InputDark value={agente.webhook_n8n} onChange={e => setAgente(a => ({ ...a, webhook_n8n: e.target.value }))} placeholder="https://auto.devnetlife.com/webhook/..." />
                </Field>
                <Field label="Webhook Secret (para callback)">
                  <InputDark type="password" value={agente.webhook_secret} onChange={e => setAgente(a => ({ ...a, webhook_secret: e.target.value }))} placeholder="secret_key" />
                </Field>
                <Field label="Número de Funcionário">
                  <InputDark value={agente.numero_funcionario} onChange={e => setAgente(a => ({ ...a, numero_funcionario: e.target.value }))} placeholder="+55 11 99999-9999" />
                </Field>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Modelo de IA" subtitle="Configure o modelo e parâmetros de geração">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Modelo">
                <select value={agente.modelo} onChange={e => setAgente(a => ({ ...a, modelo: e.target.value }))}
                  className="w-full bg-[var(--bg-primary)] border border-white/10 text-[var(--text-main)] px-4 py-3 rounded-xl focus:outline-none focus:border-accent/60 transition-all text-sm">
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                  <option value="gpt-4.1">GPT-4.1</option>
                </select>
              </Field>
              <Field label={`Temperatura: ${agente.temperatura}`}>
                <input type="range" min={0} max={1} step={0.1} value={agente.temperatura}
                  onChange={e => setAgente(a => ({ ...a, temperatura: parseFloat(e.target.value) }))}
                  className="w-full accent-blue-500 mt-3" />
              </Field>
              <Field label="Max Tokens">
                <InputDark type="number" value={agente.max_tokens} onChange={e => setAgente(a => ({ ...a, max_tokens: parseInt(e.target.value) || 500 }))} placeholder="500" />
              </Field>
            </div>
          </SectionCard>

          <div className="flex gap-3 justify-end">
            <button onClick={handleTestAgente} disabled={testingAgente}
              className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase rounded-xl">
              {testingAgente ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube2 className="w-4 h-4" />}
              Testar Conexão
            </button>
            <button onClick={handleSaveAgente} disabled={savingAgente}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase bg-accent text-black rounded-xl">
              {savingAgente ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: BUSCA DE LEADS ─────────────────────────────────────────── */}
      {activeTab === 'busca_leads' && (
        <div className="space-y-6">
          {/* Google Maps */}
          <SectionCard title="🗺️  Busca Google Maps" subtitle="Configure o webhook utilizado para buscar leads no Google Maps via N8N.">
            <Field label="Webhook URL do N8N">
              <InputDark
                value={buscaGoogle.url}
                onChange={e => setBuscaGoogle({ url: e.target.value })}
                placeholder="https://auto.devnetlife.com/webhook/buscar-google"
              />
            </Field>
            <p className="text-[11px] text-gray-600">URL do webhook que processa a busca de leads no Google Maps. O webhook receberá os parâmetros: estado, cidade, nicho e user_id.</p>
            <div className="flex gap-2">
              <button onClick={() => testWebhook(buscaGoogle.url, { estado: 'SP', cidade: 'São Paulo', nicho: 'Restaurantes', user_id: 'teste' }, () => setTestingGoogle(true), () => setTestingGoogle(false))}
                disabled={testingGoogle} className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs rounded-xl">
                {testingGoogle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />} Testar Conexão
              </button>
              <button onClick={handleSaveBuscaGoogle} disabled={savingBuscaGoogle}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold bg-accent text-black rounded-xl">
                {savingBuscaGoogle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Salvar
              </button>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Formato esperado do webhook</p>
              <CodeBlock code={`POST ${buscaGoogle.url || 'https://auto.devnetlife.com/webhook/buscar-google'}
Content-Type: application/json

{
  "estado": "SP",
  "cidade": "São Paulo",
  "nicho": "Restaurantes",
  "user_id": "uuid-do-usuario"
}`} />
            </div>
          </SectionCard>

          {/* CNPJ */}
          <SectionCard title="🏢  Busca CNPJ" subtitle="Configure o webhook utilizado para buscar empresas por CNPJ via N8N.">
            <Field label="Webhook URL do N8N">
              <InputDark
                value={buscaCnpj.url}
                onChange={e => setBuscaCnpj({ url: e.target.value })}
                placeholder="https://auto.devnetlife.com/webhook/pesquisacnpj"
              />
            </Field>
            <p className="text-[11px] text-gray-600">URL do webhook que processa a busca de empresas por CNPJ. O webhook receberá os parâmetros: estado, cidade, cnae, cnae_descricao e user_id.</p>
            <div className="flex gap-2">
              <button onClick={() => testWebhook(buscaCnpj.url, { estado: 'SP', cidade: 'São Paulo', cnae: '4711-3/01', cnae_descricao: 'Comércio varejista', user_id: 'teste' }, () => setTestingCnpj(true), () => setTestingCnpj(false))}
                disabled={testingCnpj} className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs rounded-xl">
                {testingCnpj ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />} Testar Conexão
              </button>
              <button onClick={handleSaveBuscaCnpj} disabled={savingBuscaCnpj}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold bg-accent text-black rounded-xl">
                {savingBuscaCnpj ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Salvar
              </button>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Formato esperado do webhook</p>
              <CodeBlock code={`POST ${buscaCnpj.url || 'https://auto.devnetlife.com/webhook/pesquisacnpj'}
Content-Type: application/json

{
  "estado": "SP",
  "cidade": "São Paulo",
  "cnae": "4711-3/01",
  "cnae_descricao": "Comércio varejista de mercadorias em geral",
  "user_id": "uuid-do-usuario"
}`} />
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── TAB: DISPARO ────────────────────────────────────────────────── */}
      {activeTab === 'disparo' && (
        <div className="space-y-6">
          <SectionCard title="💬  Disparo de Mensagem" subtitle="Configure os webhooks para disparar mensagens de WhatsApp via N8N.">
            <div className="space-y-4">
              <Field label="Webhook de Disparo">
                <InputDark value={disparo.webhook_disparo} onChange={e => setDisparo(d => ({ ...d, webhook_disparo: e.target.value }))} placeholder="https://auto.devnetlife.com/webhook/zap" />
              </Field>
              <Field label="Webhook de Status">
                <InputDark value={disparo.webhook_status} onChange={e => setDisparo(d => ({ ...d, webhook_status: e.target.value }))} placeholder="https://auto.devnetlife.com/webhook/status-disparo" />
                <p className="text-[11px] text-gray-600 mt-1">URL de consulta de status. O N8N deverá retornar o progresso da lista em até 30 segundos.</p>
              </Field>
              <Field label="Webhook de Cancelamento">
                <InputDark value={disparo.webhook_cancelamento} onChange={e => setDisparo(d => ({ ...d, webhook_cancelamento: e.target.value }))} placeholder="https://auto.devnetlife.com/webhook/cancelar-disparo" />
              </Field>
            </div>
            <div className="flex gap-2">
              <button onClick={() => testWebhook(disparo.webhook_disparo, { test: true }, () => setTestingDisparo(true), () => setTestingDisparo(false))}
                disabled={testingDisparo} className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs rounded-xl">
                {testingDisparo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />} Testar Conexão
              </button>
              <button onClick={handleSaveDisparo} disabled={savingDisparo}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold bg-accent text-black rounded-xl">
                {savingDisparo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Salvar
              </button>
            </div>

            <div>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Formato esperado do payload (Disparo)</p>
              <CodeBlock code={`POST ${disparo.webhook_disparo || 'https://auto.devnetlife.com/webhook/zap'}
Content-Type: application/json

{
  "lista_id": "uuid-da-lista",
  "mensagem": "Olá {nome}, tudo bem? Vi que você está em {cidade}...",
  "leads": [
    { "id": "lead-uuid-0", "nome": "João Silva", "telefone": "5562999999999", "cidade": "Goiânia", "estado": "GO", "nicho": "" }
  ],
  "intervalo_segundos": 15,
  "horario_comercial": false,
  "hora_inicio": "08:00",
  "hora_fim": "18:00",
  "dias_semana": ["seg", "ter", "qua", "qui", "sex"]
}`} />
            </div>
          </SectionCard>

          <SectionCard title="📥  Webhook de Callback (Receber Status)" subtitle="Configure esta URL no N8N para receber notificações quando listas finalizarem.">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[var(--bg-primary)] border border-white/10 rounded-xl px-4 py-3">
                <span className="text-sm text-[var(--text-main)] font-mono">{callbackUrl}</span>
              </div>
              <button onClick={() => copyToClipboard(callbackUrl)} className="p-3 bg-[var(--bg-primary)] border border-white/10 rounded-xl text-gray-400 hover:text-[var(--text-main)] hover:border-accent/40 transition-all">
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mt-2">
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">1. Para cada lead enviado com sucesso:</p>
              <CodeBlock code={`{
  "event": "lead_enviado",
  "lista_id": "uuid-da-lista",
  "lead_id": "uuid-do-lead",
  "telefone": "5562999999999",
  "mensagem": "Olá, tudo bem?",
  "status": "sucesso",
  "tempo_resposta_ms": "1200"
}`} />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">2. Para cada erro de envio:</p>
              <CodeBlock code={`{
  "event": "lead_erro",
  "lista_id": "uuid-da-lista",
  "lead_id": "uuid-do-lead",
  "telefone": "5562999999999",
  "mensagem": "Olá, tudo bem?",
  "status": "erro",
  "erro_detalhes": "Número inválido"
}`} />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">3. Ao finalizar a lista:</p>
              <CodeBlock code={`{
  "event": "lista_finalizada",
  "lista_id": "uuid-da-lista",
  "total": "150",
  "enviados": "145",
  "erros": "5"
}`} />
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}
