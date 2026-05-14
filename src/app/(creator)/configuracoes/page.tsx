'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  User, Shield, Globe, Zap, Search, Send, Users, Clock,
  Save, Mail, Plus, Trash2, Pencil, X, Check, Loader2,
  ChevronRight, ChevronDown, Copy, Eye, EyeOff, Kanban,
  Settings,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SystemUser {
  id: string; nome: string; email: string; perfil: string
  status: string; cota_mensal: number; created_at: string; avatar_url?: string
}

interface Team {
  id: string; nome: string; created_at: string
  membros: { id: string; nome: string; email: string; perfil: string }[]
  permissoes?: {
    ver_todos_deals: boolean
    ver_todas_atividades: boolean
    ver_todos_contatos: boolean
  }
}

interface Integracao {
  id: string; tipo: string; token_acesso?: string
  configuracoes?: any; ativo: boolean
}

interface PipelineBoard {
  id: string; nome: string; is_default: boolean
  colunas: { id: string; nome: string; cor: string; sla_horas?: number; ordem: number }[]
}

// ─── Sub-Tab ─────────────────────────────────────────────────────────────────

function SubTab({ label, icon: Icon, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
      isActive ? "bg-white/[0.05] text-primary shadow-sm" : "text-white/40 hover:text-white"
    )}>
      <Icon className="w-3.5 h-3.5" />{label}
    </button>
  )
}

// ─── Input helpers ────────────────────────────────────────────────────────────
const inp = "w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all"
const lbl = "block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2"

// ─── User Modal ───────────────────────────────────────────────────────────────

function UserModal({ user, onClose, onSaved }: { user: SystemUser | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!user
  const [nome, setNome] = useState(user?.nome || '')
  const [email, setEmail] = useState(user?.email || '')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState(user?.perfil || 'criador')
  const [cota, setCota] = useState(String(user?.cota_mensal || 10))
  const [isSaving, setIsSaving] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleSave = async () => {
    if (!nome || !email) { toast.error('Nome e e-mail obrigatórios'); return }
    if (!isEdit && !senha) { toast.error('Senha obrigatória para novo usuário'); return }
    setIsSaving(true)
    try {
      const url = isEdit ? `/api/admin/usuarios/${user!.id}` : '/api/admin/usuarios'
      const method = isEdit ? 'PATCH' : 'POST'
      const body: any = { nome, email, perfil, cota_mensal: Number(cota) }
      if (senha) body.senha = senha
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { toast.success(isEdit ? 'Usuário atualizado!' : 'Usuário criado!'); onSaved(); onClose() }
      else { const e = await res.json(); toast.error(e.error || 'Erro ao salvar') }
    } finally { setIsSaving(false) }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0A0A0B] border border-white/[0.06] rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
            <h2 className="text-base font-bold text-white">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/5 text-white/40 hover:text-white transition-all"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div><label className={lbl}>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} className={inp} placeholder="Nome completo" /></div>
            <div><label className={lbl}>E-mail</label><input value={email} onChange={e => setEmail(e.target.value)} type="email" className={inp} placeholder="email@exemplo.com" /></div>
            <div>
              <label className={lbl}>{isEdit ? 'Nova senha (deixe vazio para manter)' : 'Senha *'}</label>
              <div className="relative">
                <input value={senha} onChange={e => setSenha(e.target.value)} type={showPwd ? 'text' : 'password'} className={inp + ' pr-10'} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Perfil</label>
                <select value={perfil} onChange={e => setPerfil(e.target.value)} className={inp + ' cursor-pointer'}>
                  <option value="criador" className="bg-[#0a0a0b]">Criador</option>
                  <option value="admin" className="bg-[#0a0a0b]">Admin</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Cota mensal</label>
                <input type="number" value={cota} onChange={e => setCota(e.target.value)} className={inp} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/40 hover:text-white transition-all">Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Team Modal ───────────────────────────────────────────────────────────────

function TeamModal({ team, allUsers, onClose, onSaved }: { team: Team | null; allUsers: SystemUser[]; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!team
  const [nome, setNome] = useState(team?.nome || '')
  const [permissoes, setPermissoes] = useState({
    ver_todos_deals: team?.permissoes?.ver_todos_deals ?? true,
    ver_todas_atividades: team?.permissoes?.ver_todas_atividades ?? true,
    ver_todos_contatos: team?.permissoes?.ver_todos_contatos ?? true,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!nome.trim()) { toast.error('Nome obrigatório'); return }
    setIsSaving(true)
    try {
      const url = isEdit ? `/api/creator/times/${team!.id}` : '/api/creator/times'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ nome, permissoes }) 
      })
      if (res.ok) { toast.success(isEdit ? 'Time atualizado!' : 'Time criado!'); onSaved(); onClose() }
      else { const e = await res.json(); toast.error(e.error || 'Erro ao salvar') }
    } finally { setIsSaving(false) }
  }

  const handleAddMember = async (memberId: string) => {
    if (!team) return
    await fetch(`/api/creator/times/${team.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ addMemberId: memberId }) })
    onSaved()
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return
    await fetch(`/api/creator/times/${team.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ removeMemberId: memberId }) })
    onSaved()
  }

  const memberIds = new Set(team?.membros.map(m => m.id) || [])
  const available = allUsers.filter(u => !memberIds.has(u.id))

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0A0A0B] border border-white/[0.06] rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
            <h2 className="text-base font-bold text-white">{isEdit ? 'Editar Time' : 'Novo Time'}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/5 text-white/40 hover:text-white transition-all"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
            <div>
              <label className={lbl}>Nome do Time</label>
              <input value={nome} onChange={e => setNome(e.target.value)} className={inp} placeholder="Ex: Equipe Comercial" />
            </div>
            
            <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <p className={lbl}>Permissões de Visibilidade</p>
              <div className="space-y-3">
                {[
                  { key: 'ver_todos_deals', label: 'Ver todos os deals (Pipeline)' },
                  { key: 'ver_todas_atividades', label: 'Ver todas as atividades' },
                  { key: 'ver_todos_contatos', label: 'Ver todos os contatos (CRM)' }
                ].map(p => (
                  <label key={p.key} className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => setPermissoes(prev => ({ ...prev, [p.key]: !prev[p.key as keyof typeof permissoes] }))}
                      className={cn(
                        "w-5 h-5 rounded-md border transition-all flex items-center justify-center",
                        permissoes[p.key as keyof typeof permissoes] ? "bg-primary border-primary" : "border-white/10 bg-white/5 hover:border-white/20"
                      )}
                    >
                      {permissoes[p.key as keyof typeof permissoes] && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-xs text-white/60 group-hover:text-white transition-colors">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {isEdit && (
              <>
                <div>
                  <p className={lbl}>Membros ({team?.membros.length || 0})</p>
                  <div className="space-y-1.5">
                    {team?.membros.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{m.nome[0]}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{m.nome}</p><p className="text-[10px] text-white/30">{m.perfil}</p></div>
                        <button onClick={() => handleRemoveMember(m.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                {available.length > 0 && (
                  <div>
                    <p className={lbl}>Adicionar membro</p>
                    <div className="space-y-1">
                      {available.slice(0, 5).map(u => (
                        <button key={u.id} onClick={() => handleAddMember(u.id)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all">
                          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold">{u.nome[0]}</div>
                          <span className="text-sm text-white/70 flex-1 text-left">{u.nome}</span>
                          <Plus className="w-3.5 h-3.5 text-primary/50" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="p-6 border-t border-white/[0.04] flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/40 hover:text-white transition-all">Fechar</button>
            {!isEdit && (
              <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Criar
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('Perfil')

  // Users
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userModal, setUserModal] = useState<{ open: boolean; user: SystemUser | null }>({ open: false, user: null })

  // Teams
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [teamModal, setTeamModal] = useState<{ open: boolean; team: Team | null }>({ open: false, team: null })

  // Integracoes
  const [integracoes, setIntegracoes] = useState<Integracao[]>([])
  const [loadingInteg, setLoadingInteg] = useState(false)

  // Pipelines
  const [boards, setBoards] = useState<PipelineBoard[]>([])
  const [loadingBoards, setLoadingBoards] = useState(false)
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null)
  const [newBoardName, setNewBoardName] = useState('')
  const [newStageName, setNewStageName] = useState('')
  const [newStageColor, setNewStageColor] = useState('#3B82F6')
  const [editBoardId, setEditBoardId] = useState<string | null>(null)
  const [editBoardName, setEditBoardName] = useState('')

  const tabs = [
    { label: 'Perfil', icon: User },
    { label: 'Pipelines', icon: Settings },
    { label: 'Integrações', icon: Globe },
    { label: 'Agente IA', icon: Zap },
    { label: 'Disparo', icon: Send },
    { label: 'Usuários', icon: Users },
    { label: 'Times', icon: Clock },
  ]

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/usuarios')
      if (res.ok) setUsers(await res.json())
    } finally { setLoadingUsers(false) }
  }, [])

  const fetchTeams = useCallback(async () => {
    setLoadingTeams(true)
    try {
      const res = await fetch('/api/creator/times')
      if (res.ok) setTeams(await res.json())
    } finally { setLoadingTeams(false) }
  }, [])

  const fetchIntegracoes = useCallback(async () => {
    setLoadingInteg(true)
    try {
      const res = await fetch('/api/creator/integracoes')
      if (res.ok) setIntegracoes(await res.json())
    } finally { setLoadingInteg(false) }
  }, [])

  const fetchBoards = useCallback(async () => {
    setLoadingBoards(true)
    try {
      const res = await fetch('/api/creator/pipeline-config')
      if (res.ok) setBoards(await res.json())
    } finally { setLoadingBoards(false) }
  }, [])

  useEffect(() => {
    if (activeTab === 'Usuários') fetchUsers()
    if (activeTab === 'Times') fetchTeams()
    if (activeTab === 'Integrações' || activeTab === 'Disparo' || activeTab === 'Agente IA') fetchIntegracoes()
    if (activeTab === 'Pipelines') fetchBoards()
  }, [activeTab, fetchUsers, fetchTeams, fetchIntegracoes, fetchBoards])

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Remover este usuário?')) return
    const res = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
    if (res.ok) { setUsers(prev => prev.filter(u => u.id !== id)); toast.success('Usuário removido') }
    else toast.error('Erro ao remover')
  }

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Remover este time?')) return
    const res = await fetch(`/api/creator/times/${id}`, { method: 'DELETE' })
    if (res.ok) { setTeams(prev => prev.filter(t => t.id !== id)); toast.success('Time removido') }
    else toast.error('Erro ao remover')
  }

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return
    const res = await fetch('/api/creator/pipeline-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'board', nome: newBoardName }) })
    if (res.ok) { setNewBoardName(''); fetchBoards(); toast.success('Pipeline criado!') }
  }

  const handleDeleteBoard = async (id: string) => {
    if (!confirm('Remover este pipeline e todas as suas colunas?')) return
    const res = await fetch(`/api/creator/pipeline-config/${id}`, { method: 'DELETE' })
    if (res.ok) { fetchBoards(); toast.success('Pipeline removido') }
    else { const e = await res.json(); toast.error(e.error || 'Erro ao remover') }
  }

  const handleRenameBoard = async (id: string) => {
    if (!editBoardName.trim()) return
    const res = await fetch(`/api/creator/pipeline-config/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: editBoardName }) })
    if (res.ok) { setEditBoardId(null); fetchBoards(); toast.success('Renomeado!') }
  }

  const handleCreateStage = async (boardId: string) => {
    if (!newStageName.trim()) return
    const res = await fetch('/api/creator/pipeline-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'column', boardId, nome: newStageName, color: newStageColor }) })
    if (res.ok) { setNewStageName(''); fetchBoards(); toast.success('Estágio criado!') }
  }

  const handleDeleteStage = async (id: string) => {
    const res = await fetch(`/api/creator/pipeline-config/stages?id=${id}`, { method: 'DELETE' })
    if (res.ok) { fetchBoards(); toast.success('Estágio removido') }
  }

  const saveIntegracao = async (tipo: string, updates: any) => {
    const existing = integracoes.find(i => i.tipo === tipo)
    const res = await fetch('/api/creator/integracoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, token_acesso: updates.token_acesso ?? existing?.token_acesso, configuracoes: { ...(existing?.configuracoes || {}), ...updates.configuracoes }, ativo: true }),
    })
    if (res.ok) { fetchIntegracoes(); toast.success('Salvo!') }
  }

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copiado!') }

  const getInteg = (tipo: string) => integracoes.find(i => i.tipo === tipo)

  // Agente IA / Disparo state
  const [agenteWebhook, setAgenteWebhook] = useState('')
  const [agentePrompt, setAgentePrompt] = useState('')
  const [disparoWebhook, setDisparoWebhook] = useState('')

  useEffect(() => {
    const agente = getInteg('agente_ia')
    if (agente) {
      setAgenteWebhook(agente.configuracoes?.webhook_url || '')
      setAgentePrompt(agente.configuracoes?.prompt || '')
    }
    const disparo = getInteg('whatsapp') || getInteg('disparo')
    if (disparo) setDisparoWebhook(disparo.configuracoes?.webhook_url || disparo.token_acesso || '')
  }, [integracoes])

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-10 space-y-8 transition-colors duration-300">
      <div className="space-y-1 border-b border-white/5 pb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-white/40 text-sm">Gerencie preferências e informações da conta</p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 p-1 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => <SubTab key={tab.label} label={tab.label} icon={tab.icon} isActive={activeTab === tab.label} onClick={() => setActiveTab(tab.label)} />)}
      </div>

      <div className="max-w-4xl">

        {/* ── Perfil ── */}
        {activeTab === 'Perfil' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
            <div><h2 className="text-xl font-bold">Informações do Perfil</h2><p className="text-sm text-white/20 mt-1">Atualize suas informações pessoais</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={lbl}>Nome</label><input defaultValue="Gabriel" className={inp} /></div>
              <div><label className={lbl}>Sobrenome</label><input defaultValue="de Guimarães e Sousa" className={inp} /></div>
              <div className="md:col-span-2"><label className={lbl}>URL do Avatar</label><input placeholder="https://..." className={inp} /></div>
            </div>
            <button className="bg-primary px-8 py-3 rounded-xl text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </motion.div>
        )}

        {/* ── Pipelines ── */}
        {activeTab === 'Pipelines' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-bold">Gestão de Pipelines</h2><p className="text-sm text-white/20 mt-1">Configure seus funis e estágios</p></div>
              </div>

              {loadingBoards ? (
                <div className="flex items-center justify-center h-24"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
              ) : (
                <div className="space-y-3">
                  {boards.map(board => (
                    <div key={board.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                      <div className="p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Kanban className="w-5 h-5 text-primary" /></div>
                        {editBoardId === board.id ? (
                          <input value={editBoardName} onChange={e => setEditBoardName(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') handleRenameBoard(board.id); if (e.key === 'Escape') setEditBoardId(null) }} className="flex-1 bg-white/5 border border-primary/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none" />
                        ) : (
                          <div className="flex-1"><p className="text-sm font-bold text-white">{board.nome}</p><p className="text-[10px] text-white/30">{board.colunas?.length || 0} estágios</p></div>
                        )}
                        <div className="flex items-center gap-1">
                          <button onClick={() => setExpandedBoard(expandedBoard === board.id ? null : board.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all">
                            <ChevronDown className={cn('w-4 h-4 transition-transform', expandedBoard === board.id && 'rotate-180')} />
                          </button>
                          {editBoardId === board.id ? (
                            <button onClick={() => handleRenameBoard(board.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Check className="w-4 h-4" /></button>
                          ) : (
                            <button onClick={() => { setEditBoardId(board.id); setEditBoardName(board.nome) }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                          )}
                          {boards.length > 1 && (
                            <button onClick={() => handleDeleteBoard(board.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </div>

                      {expandedBoard === board.id && (
                        <div className="border-t border-white/[0.04] p-5 space-y-3">
                          <p className={lbl}>Estágios</p>
                          {board.colunas?.map(col => (
                            <div key={col.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: col.cor }} />
                              <span className="flex-1 text-sm text-white/80">{col.nome}</span>
                              {col.sla_horas && <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">SLA {col.sla_horas}h</span>}
                              <span className="text-[10px] text-white/20">#{col.ordem}</span>
                              <button onClick={() => handleDeleteStage(col.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-4">
                            <input value={newStageName} onChange={e => setNewStageName(e.target.value)} placeholder="Nome do estágio" className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-primary/40 transition-all" />
                            <input type="color" value={newStageColor} onChange={e => setNewStageColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border border-white/10 p-1" />
                            <button onClick={() => handleCreateStage(board.id)} disabled={!newStageName.trim()} className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 disabled:opacity-40 transition-all flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <input value={newBoardName} onChange={e => setNewBoardName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateBoard()} placeholder="Nome do novo pipeline" className={inp} />
                <button onClick={handleCreateBoard} disabled={!newBoardName.trim()} className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Criar
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Integrações ── */}
        {activeTab === 'Integrações' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
            <div><h2 className="text-xl font-bold">Integrações</h2><p className="text-sm text-white/20 mt-1">Webhooks e APIs conectadas</p></div>
            {loadingInteg ? (
              <div className="flex items-center justify-center h-24"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
            ) : integracoes.length === 0 ? (
              <div className="py-12 text-center text-white/20 text-sm">Nenhuma integração cadastrada</div>
            ) : (
              <div className="space-y-4">
                {integracoes.map(integ => (
                  <div key={integ.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase">{integ.tipo}</p>
                          <p className={cn('text-[10px] font-bold uppercase tracking-widest', integ.ativo ? 'text-emerald-400' : 'text-white/30')}>{integ.ativo ? 'Ativo' : 'Inativo'}</p>
                        </div>
                      </div>
                    </div>
                    {integ.token_acesso && (
                      <div className="flex items-center gap-2">
                        <input readOnly value={integ.token_acesso} className={inp + ' font-mono text-xs'} />
                        <button onClick={() => copyToClipboard(integ.token_acesso!)} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>
                      </div>
                    )}
                    {integ.configuracoes?.webhook_url && (
                      <div>
                        <label className={lbl}>Webhook URL</label>
                        <div className="flex items-center gap-2">
                          <input readOnly value={integ.configuracoes.webhook_url} className={inp + ' font-mono text-xs'} />
                          <button onClick={() => copyToClipboard(integ.configuracoes.webhook_url)} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                    {integ.configuracoes?.endpoints?.map((ep: any) => (
                      <div key={ep.id}>
                        <label className={lbl}>Endpoint: {ep.tag}</label>
                        <div className="flex items-center gap-2">
                          <input readOnly value={ep.full_url} className={inp + ' font-mono text-xs'} />
                          <button onClick={() => copyToClipboard(ep.full_url)} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Agente IA ── */}
        {activeTab === 'Agente IA' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-8">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold">Agente IA</h2><p className="text-sm text-white/20 mt-1">Configure o webhook e personalidade do agente</p></div>
              <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest">Ativo</div>
            </div>
            <div>
              <label className={lbl}>Webhook URL do Agente</label>
              <div className="flex gap-2">
                <input value={agenteWebhook} onChange={e => setAgenteWebhook(e.target.value)} placeholder="https://..." className={inp} />
                {agenteWebhook && <button onClick={() => copyToClipboard(agenteWebhook)} className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>}
              </div>
            </div>
            <div>
              <label className={lbl}>Prompt Base (Personalidade)</label>
              <textarea value={agentePrompt} onChange={e => setAgentePrompt(e.target.value)} rows={5} className={inp + ' resize-none'} placeholder="Você é um especialista em vendas B2B..." />
            </div>
            <button onClick={() => saveIntegracao('agente_ia', { configuracoes: { webhook_url: agenteWebhook, prompt: agentePrompt } })} className="bg-primary px-8 py-3 rounded-xl text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              <Save className="w-4 h-4" /> Salvar
            </button>
          </motion.div>
        )}

        {/* ── Disparo e Webhooks ── */}
        {activeTab === 'Disparo' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-12">
            
            {/* Entrada (N8N) */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-500" /> Webhook de Entrada (N8N)
                </h2>
                <p className="text-sm text-white/20 mt-1">Use esta URL no N8N para enviar leads automaticamente para o CRM (tabela Lead).</p>
              </div>
              <div>
                <div className="flex gap-2">
                  <input readOnly value="https://app.investmais.com/api/creator/crm/n8n-leads" className={inp + ' text-emerald-500/80 font-mono'} />
                  <button onClick={() => copyToClipboard("https://app.investmais.com/api/creator/crm/n8n-leads")} className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            {/* Saída (Disparo) */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-500" /> Automação de Disparos (Saída)
                </h2>
                <p className="text-sm text-white/20 mt-1">URL do seu painel disparador (Evolution/N8N) para onde o CRM enviará as campanhas.</p>
              </div>
              <div>
                <label className={lbl}>URL de Destino</label>
                <div className="flex gap-2">
                  <input value={disparoWebhook} onChange={e => setDisparoWebhook(e.target.value)} placeholder="https://seu-n8n.com/webhook/disparo" className={inp} />
                  {disparoWebhook && <button onClick={() => copyToClipboard(disparoWebhook)} className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>}
                </div>
              </div>
              <button onClick={() => saveIntegracao('whatsapp', { configuracoes: { webhook_url: disparoWebhook } })} className="bg-primary px-8 py-3 rounded-xl text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                <Save className="w-4 h-4" /> Salvar URL de Saída
              </button>
            </div>

          </motion.div>
        )}

        {/* ── Usuários ── */}
        {activeTab === 'Usuários' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold">Gestão de Usuários</h2><p className="text-sm text-white/20 mt-1">Gerencie os membros da plataforma</p></div>
              <button onClick={() => setUserModal({ open: true, user: null })} className="bg-primary px-5 py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                <Plus className="w-3.5 h-3.5" /> Novo Usuário
              </button>
            </div>
            {loadingUsers ? (
              <div className="flex items-center justify-center h-24"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                      {u.nome[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{u.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-white/30 truncate">{u.email}</p>
                        <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest', u.perfil === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-white/5 text-white/30 border border-white/10')}>{u.perfil}</span>
                        <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest', u.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>{u.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setUserModal({ open: true, user: u })} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteUser(u.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="text-center text-white/20 text-sm py-8">Nenhum usuário encontrado</p>}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Times ── */}
        {activeTab === 'Times' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold">Hierarquia de Times</h2><p className="text-sm text-white/20 mt-1">Agrupe usuários em equipes de vendas</p></div>
              <button onClick={() => setTeamModal({ open: true, team: null })} className="bg-primary/10 text-primary border border-primary/20 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
                <Plus className="w-3.5 h-3.5" /> Novo Time
              </button>
            </div>
            {loadingTeams ? (
              <div className="flex items-center justify-center h-24"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
            ) : teams.length === 0 ? (
              <div className="py-12 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                <Users className="w-8 h-8 text-white/10 mb-3" />
                <p className="text-sm font-bold text-white/20">Nenhum time criado</p>
                <p className="text-[10px] text-white/10 mt-1 uppercase tracking-widest">Crie um time para agrupar usuários</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map(t => (
                  <div key={t.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-blue-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{t.nome}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{t.membros.length} membro{t.membros.length !== 1 ? 's' : ''}</p>
                      {t.membros.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {t.membros.slice(0, 5).map(m => (
                            <div key={m.id} title={m.nome} className="w-6 h-6 rounded-full bg-primary/10 border border-white/10 flex items-center justify-center text-[9px] font-bold text-primary">{m.nome[0]}</div>
                          ))}
                          {t.membros.length > 5 && <span className="text-[10px] text-white/30">+{t.membros.length - 5}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setTeamModal({ open: true, team: t })} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteTeam(t.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {userModal.open && <UserModal user={userModal.user} onClose={() => setUserModal({ open: false, user: null })} onSaved={fetchUsers} />}
      </AnimatePresence>
      <AnimatePresence>
        {teamModal.open && <TeamModal team={teamModal.team} allUsers={users} onClose={() => setTeamModal({ open: false, team: null })} onSaved={() => { fetchTeams(); if (teamModal.team) setTeamModal(prev => ({ ...prev, team: teams.find(t => t.id === prev.team?.id) || null })) }} />}
      </AnimatePresence>
    </div>
  )
}
