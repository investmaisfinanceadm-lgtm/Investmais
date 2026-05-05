'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus, X, Play, Trash2, CheckCircle2, Clock,
  Phone, Users, Send, TrendingUp, Activity,
  Zap, Shield, Cpu, Layers, MessageSquare,
  Sparkles, ChevronRight, BarChart2, Radio,
  Smartphone, Monitor, Globe
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────
type ListaStatus = 'nova' | 'em_progresso' | 'concluida'
type DisparoTab = 'mensagem' | 'configuracoes' | 'confirmar'

interface ListaDisparo {
  id: string
  nome: string
  telefones: string[]
  status: ListaStatus
  total: number
  enviados: number
  created_at: string
}

interface DisparoConfig {
  mensagem: string
  intervalo: number
  horarioComercial: boolean
  dias: string[]
}

const DEFAULT_MENSAGEM = `Hello {nome}, hope you're doing well.

I noticed your operation in {cidade} and would like to present an exclusive solution for your business.

How can I assist you?`

const DIAS_SEMANA = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DIAS_UTEIS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function parsePhones(raw: string): string[] {
  return raw.split('\n')
    .map(l => l.replace(/\D/g, '').trim())
    .filter(l => l.length >= 10 && l.length <= 15)
}

function applyVars(msg: string): string {
  return msg
    .replace(/\{nome\}/gi, 'John Doe')
    .replace(/\{cidade\}/gi, 'New York')
    .replace(/\{estado\}/gi, 'NY')
    .replace(/\{nicho\}/gi, 'Technology')
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ListaStatus }) {
  const map: Record<ListaStatus, { label: string; cls: string; icon: any }> = {
    nova:         { label: 'Idle Node',    cls: 'bg-white/5 border-white/10 text-white/40', icon: Clock },
    em_progresso: { label: 'Transmitting', cls: 'bg-sidebar-primary/10 border-sidebar-primary/20 text-sidebar-primary', icon: Activity },
    concluida:    { label: 'Delivered',   cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
  }
  const { label, cls, icon: Icon } = map[status]
  return (
    <span className={cn("inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border italic", cls)}>
      <Icon className="w-3 h-3" />{label}
    </span>
  )
}

// ─── Modal Iniciar Disparo ────────────────────────────────────────────────────
function IniciarDisparoModal({
  lista,
  onClose,
  onConfirm,
}: {
  lista: ListaDisparo
  onClose: () => void
  onConfirm: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState<DisparoTab>('mensagem')
  const [config, setConfig] = useState<DisparoConfig>({
    mensagem: DEFAULT_MENSAGEM,
    intervalo: 5,
    horarioComercial: false,
    dias: [...DIAS_UTEIS],
  })
  const [starting, setStarting] = useState(false)

  const toggleDia = (dia: string) =>
    setConfig(prev => ({
      ...prev,
      dias: prev.dias.includes(dia) ? prev.dias.filter(d => d !== dia) : [...prev.dias, dia],
    }))

  const handleConfirm = async () => {
    setStarting(true)
    try {
      const leads = lista.telefones.map((telefone, i) => ({
        id: `lead-${lista.id}-${i}`,
        nome: 'Lead',
        telefone,
        cidade: '',
        estado: '',
        nicho: '',
      }))

      const payload = {
        lista_id: lista.id,
        mensagem: config.mensagem,
        leads,
        intervalo_segundos: config.intervalo,
        horario_comercial: config.horarioComercial,
        hora_inicio: '08:00',
        hora_fim: '18:00',
        dias_semana: config.dias.map(d => {
          const map: Record<string, string> = {
            'Mon': 'seg', 'Tue': 'ter', 'Wed': 'qua',
            'Thu': 'qui', 'Fri': 'sex', 'Sat': 'sab', 'Sun': 'dom',
          }
          return map[d] || d.toLowerCase()
        }),
      }

      const res = await fetch('/api/proxy/disparo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 400 && data?.error?.includes('não configurado')) {
          toast.error('Configure Dispatch Webhook in Core Settings')
        } else {
          throw new Error(data?.error || `Error ${res.status}`)
        }
        setStarting(false)
        return
      }

      onConfirm(lista.id)
      toast.success('Autonomous dispatch protocol energized')
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Dispatch activation failure')
    } finally {
      setStarting(false)
    }
  }

  const tabs: { key: DisparoTab; label: string }[] = [
    { key: 'mensagem', label: 'Payload' },
    { key: 'configuracoes', label: 'Parameters' },
    { key: 'confirmar', label: 'Execute' },
  ]

  const diasLabel = config.dias
    .sort((a, b) => DIAS_SEMANA.indexOf(a) - DIAS_SEMANA.indexOf(b))
    .map(d => d.toUpperCase())
    .join(', ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl nl-glass border-white/10 rounded-[48px] shadow-[0_100px_200px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
                <Send className="w-5 h-5 text-sidebar-primary" />
            </div>
            <div className="space-y-0.5">
                <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Dispatch Initialization</h2>
                <p className="text-[9px] font-black text-sidebar-primary uppercase tracking-[0.2em]">{lista.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-2xl bg-white/[0.03] text-white/20 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-10 gap-2 mt-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl border",
                activeTab === t.key
                  ? 'bg-sidebar-primary text-black border-sidebar-primary netlife-glow shadow-none italic'
                  : 'bg-white/[0.02] text-white/20 border-white/5 hover:border-white/10'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-10 min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'mensagem' && (
              <motion.div key="msg" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Injection Variables</label>
                  <div className="flex flex-wrap gap-3">
                    {['{nome}', '{cidade}', '{estado}', '{nicho}'].map(v => (
                      <button key={v} onClick={() => setConfig(prev => ({ ...prev, mensagem: prev.mensagem + v }))}
                        className="text-[9px] px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-sidebar-primary font-black uppercase tracking-widest hover:border-sidebar-primary/40 transition-all">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Neural Payload</label>
                    <button onClick={() => setConfig(prev => ({ ...prev, mensagem: DEFAULT_MENSAGEM }))}
                      className="text-[9px] text-sidebar-primary font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                      <RefreshCw className="w-3 h-3" /> Reset Core
                    </button>
                  </div>
                  <textarea value={config.mensagem}
                    onChange={e => setConfig(prev => ({ ...prev, mensagem: e.target.value }))}
                    rows={6} className="w-full bg-black/40 border border-white/5 text-white placeholder-white/10 px-8 py-6 rounded-[24px] focus:outline-none focus:border-sidebar-primary/40 transition-all text-xs font-black uppercase tracking-widest leading-relaxed resize-none font-mono" />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Real-time Preview</label>
                  <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 text-[11px] text-white/40 font-black uppercase tracking-widest whitespace-pre-wrap leading-loose italic">
                    {applyVars(config.mensagem) || "Awaiting Payload Input..."}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'configuracoes' && (
              <motion.div key="cfg" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
                    <Clock className="w-4 h-4 text-sidebar-primary" /> Signal Delay (Seconds)
                  </label>
                  <div className="flex items-center gap-6">
                    <input type="number" value={config.intervalo} min={3} max={60}
                      onChange={e => setConfig(prev => ({ ...prev, intervalo: Math.min(60, Math.max(3, Number(e.target.value))) }))}
                      className="w-32 bg-black/40 border border-white/5 text-white text-center px-8 py-5 rounded-[24px] focus:outline-none focus:border-sidebar-primary/40 transition-all text-sm font-black tracking-widest" />
                    <span className="text-[10px] text-white/10 font-black uppercase tracking-widest">Recommended: 5-15s per signal</span>
                  </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Operation Days</label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                        {DIAS_SEMANA.map(dia => (
                        <button key={dia} onClick={() => toggleDia(dia)}
                            className={cn(
                                "py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                                config.dias.includes(dia)
                                    ? 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/40'
                                    : 'bg-white/[0.02] border-white/5 text-white/10 hover:border-white/20'
                            )}>
                            {dia}
                        </button>
                        ))}
                    </div>
                </div>

                <label className="flex items-center gap-6 p-8 rounded-[32px] bg-black/40 border border-white/5 cursor-pointer group hover:border-sidebar-primary/20 transition-all">
                  <div onClick={() => setConfig(prev => ({ ...prev, horarioComercial: !prev.horarioComercial }))}
                    className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        config.horarioComercial ? 'bg-sidebar-primary border-sidebar-primary netlife-glow shadow-none' : 'border-white/10 bg-black/40'
                    )}>
                    {config.horarioComercial && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                  <div className="space-y-1">
                      <span className="text-xs text-white font-black uppercase tracking-widest italic group-hover:text-sidebar-primary transition-colors">Executive Business Hours</span>
                      <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Restrict transmission to 08:00 - 18:00</p>
                  </div>
                </label>
              </motion.div>
            )}

            {activeTab === 'confirmar' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-8">
                <div className="p-10 rounded-[48px] bg-sidebar-primary/5 border border-sidebar-primary/10 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                      <Zap className="w-20 h-20 text-sidebar-primary/5" />
                  </div>
                  <h3 className="text-xs font-black text-sidebar-primary uppercase tracking-[0.3em] flex items-center gap-3 italic">
                    <Activity className="w-4 h-4" /> Ready for Ignition
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Target Vault', value: lista.nome, cls: 'text-white' },
                      { label: 'Signal Batch', value: `${lista.total - lista.enviados} Nodes`, cls: 'text-sidebar-primary font-black' },
                      { label: 'Neural Delay', value: `${config.intervalo} SECS`, cls: 'text-white' },
                      { label: 'Operation Window', value: config.horarioComercial ? 'BUSINESS ONLY' : 'FULL 24H', cls: 'text-white' },
                      { label: 'Transmission Days', value: diasLabel, cls: 'text-white/40 text-[8px]' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-4">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{row.label}:</span>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", row.cls)}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6 p-8 rounded-[32px] bg-black/40 border border-white/5">
                    <Shield className="w-5 h-5 text-white/10" />
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] leading-loose">
                        Dispatch authorized via Neural Hub N8N. Progression status will synchronize with the primary matrix automatically.
                    </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-white/5 flex gap-6 bg-black/40">
          <button onClick={onClose} className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-all">Abort</button>
          {activeTab !== 'confirmar' ? (
            <button onClick={() => setActiveTab(activeTab === 'mensagem' ? 'configuracoes' : 'confirmar')}
              className="flex-1 btn-primary py-6 netlife-glow shadow-none text-[10px] font-black uppercase tracking-[0.3em]">
              Next Parameter Phase
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={starting}
              className="flex-1 btn-primary py-6 netlife-glow shadow-none text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-40">
              {starting ? <Activity className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Energize Dispatch Protocol
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Modal Criar Lista ────────────────────────────────────────────────────────
function CriarListaModal({ onClose, onCreate }: { onClose: () => void; onCreate: (lista: ListaDisparo) => void }) {
  const [nome, setNome] = useState('')
  const [rawPhones, setRawPhones] = useState('')
  const [saving, setSaving] = useState(false)

  const phones = useMemo(() => parsePhones(rawPhones), [rawPhones])
  const canSave = nome.trim().length > 0 && phones.length > 0

  const handleSubmit = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      const res = await fetch('/api/listas-disparo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), telefones: phones }),
      })
      if (!res.ok) throw new Error()
      const lista = await res.json()
      onCreate(lista)
      toast.success('New Signal Vault initialized')
      onClose()
    } catch {
      toast.error('Vault initialization failure')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl nl-glass border-white/10 rounded-[48px] shadow-[0_100px_200px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
                <Plus className="w-5 h-5 text-sidebar-primary" />
            </div>
            <div className="space-y-0.5">
                <h2 className="text-sm font-black text-white uppercase tracking-widest italic">New Signal Vault</h2>
                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em]">Manual Lead Infiltration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-2xl bg-white/[0.03] text-white/20 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-10 space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Vault Designation</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Q1 Strategic Prospecion"
              className="w-full bg-black/40 border border-white/5 text-white placeholder-white/10 px-8 py-6 rounded-[24px] focus:outline-none focus:border-sidebar-primary/40 transition-all text-xs font-black uppercase tracking-widest" />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
              <Phone className="w-4 h-4 text-sidebar-primary" /> Neural Signal Vectors (One per line)
            </label>
            <textarea value={rawPhones} onChange={e => setRawPhones(e.target.value)} rows={6}
              placeholder={'5511987654321\n55 62 99433-1056'}
              className="w-full bg-black/40 border border-white/5 text-white placeholder-white/10 px-8 py-6 rounded-[32px] focus:outline-none focus:border-sidebar-primary/40 transition-all text-xs font-black uppercase tracking-widest font-mono resize-none leading-relaxed" />
            <div className="flex items-center justify-between px-2">
                <p className="text-[9px] text-white/10 font-black uppercase tracking-widest">Format: [DDI] [DDD] [NODE]</p>
                <div className="flex gap-4">
                    <span className="text-[9px] font-black text-sidebar-primary uppercase tracking-widest italic">{phones.length} Verified Nodes</span>
                </div>
            </div>
          </div>
        </div>

        <div className="p-10 flex gap-6 bg-black/40 border-t border-white/5">
          <button onClick={onClose} className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={!canSave || saving}
            className="flex-1 btn-primary py-6 netlife-glow shadow-none text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-40">
            {saving
              ? <><Activity className="w-5 h-5 animate-spin" />Syncing...</>
              : <><Layers className="w-5 h-5" /> Initialize Vault with {phones.length} Nodes</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ListasDisparoPage() {
  const [listas, setListas] = useState<ListaDisparo[]>([])
  const [loading, setLoading] = useState(true)
  const [criarOpen, setCriarOpen] = useState(false)
  const [iniciarLista, setIniciarLista] = useState<ListaDisparo | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/listas-disparo')
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setListas(d) : null)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    ativas:       listas.filter(l => l.status === 'nova').length,
    emProgresso:  listas.filter(l => l.status === 'em_progresso').length,
    taxaSucesso:  listas.length > 0 ? Math.round(listas.filter(l => l.status === 'concluida').length / listas.length * 100) : 0,
    pendentes:    listas.reduce((acc, l) => acc + (l.total - l.enviados), 0),
  }), [listas])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/listas-disparo?id=${id}`, { method: 'DELETE' })
      setListas(prev => prev.filter(l => l.id !== id))
      toast.success('Signal Vault purged')
    } catch {
      toast.error('Purge failure')
    } finally {
      setDeletingId(null)
    }
  }

  const handleConfirmIniciar = (id: string) => {
    setListas(prev => prev.map(l => l.id === id ? { ...l, status: 'em_progresso' } : l))
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <div className="ambient-bg" />
      
      <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Autonomous Dispatch Hub</h1>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Neural Signal Transmission Command</p>
          </div>
          
          <button onClick={() => setCriarOpen(true)}
            className="btn-primary flex items-center gap-4 px-10 py-6 netlife-glow shadow-none text-xs font-black uppercase tracking-[0.3em] italic">
            <Plus className="w-5 h-5" /> Initialize New Vault
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Active Vaults',   value: stats.ativas,            icon: Send,       color: 'text-sidebar-primary' },
            { label: 'Live Transmission',    value: stats.emProgresso,       icon: Activity,   color: 'text-sidebar-primary' },
            { label: 'Sync Efficiency', value: `${stats.taxaSucesso}%`, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Pending Signals',       value: stats.pendentes,         icon: Users,      color: 'text-white' },
          ].map((s, idx) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="nl-glass p-8 rounded-[40px] border-white/5 space-y-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/10 group-hover:text-white transition-colors">
                  <s.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-center">
                  <p className={`text-3xl font-black italic tracking-tighter ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nl-glass rounded-[48px] border-white/5 overflow-hidden">
          <div className="px-10 py-8 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
            <div className="w-10 h-10 rounded-2xl bg-sidebar-primary/10 border border-sidebar-primary/20 flex items-center justify-center text-sidebar-primary">
                <Radio className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Signal Transmission Matrix</h3>
                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Vault Inventory & Propagation</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-sidebar-primary/10 border border-sidebar-primary/20 text-[9px] font-black text-sidebar-primary ml-auto">{listas.length} Active Nodes</span>
          </div>

          {loading ? (
            <div className="p-10 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-[32px] bg-white/[0.02] border border-white/5 animate-pulse" />)}</div>
          ) : listas.length === 0 ? (
            <div className="py-40 text-center space-y-8">
              <div className="w-20 h-20 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-4 group hover:border-sidebar-primary/40 transition-all duration-700">
                <Send className="w-10 h-10 text-white/5 group-hover:text-sidebar-primary group-hover:scale-110 transition-all" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em] italic">No Signal Vaults Detected</p>
                <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">Initialize your first infiltration batch to begin transmission.</p>
              </div>
              <button onClick={() => setCriarOpen(true)} className="btn-primary px-10 py-5 netlife-glow shadow-none inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] italic">
                <Plus className="w-5 h-5" /> Initialize First Vault
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-white/5">
                    <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Vault Entity</th>
                    <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] text-center">Node Count</th>
                    <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Propagation Flux</th>
                    <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] text-center">Protocol Status</th>
                    <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Initialized</th>
                    <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] text-center">Vectors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {listas.map((lista, idx) => {
                      const pct = lista.total > 0 ? Math.round(lista.enviados / lista.total * 100) : 0
                      return (
                        <motion.tr key={lista.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                          className="group hover:bg-white/[0.03] transition-all duration-700">
                          <td className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                  <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-sidebar-primary group-hover:text-black transition-all">
                                      <Layers className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                                  </div>
                                  <span className="text-xs font-black text-white uppercase tracking-widest italic group-hover:text-sidebar-primary transition-colors">{lista.nome}</span>
                              </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-black text-white tracking-widest">{lista.enviados}<span className="text-white/10 mx-2">/</span>{lista.total}</span>
                                <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em]">NODES SYNCED</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 min-w-[200px]">
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-black text-sidebar-primary uppercase tracking-widest italic">Signal Flux</span>
                                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{pct}%</span>
                              </div>
                              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-sidebar-primary netlife-glow shadow-none rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-center"><StatusBadge status={lista.status} /></td>
                          <td className="px-10 py-8 text-[10px] font-black text-white/10 uppercase tracking-widest italic">
                            {format(parseISO(lista.created_at), 'dd MMM yy', { locale: ptBR })}
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center justify-center gap-3">
                              {lista.status === 'nova' && (
                                <button onClick={() => setIniciarLista(lista)}
                                  className="w-12 h-12 rounded-2xl bg-sidebar-primary/5 border border-sidebar-primary/20 text-sidebar-primary hover:bg-sidebar-primary hover:text-black transition-all flex items-center justify-center group/btn shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                                  <Play className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                </button>
                              )}
                              <button onClick={() => handleDelete(lista.id)} disabled={deletingId === lista.id}
                                className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 text-white/10 hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/5 transition-all flex items-center justify-center group/btn">
                                {deletingId === lista.id ? <Activity className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {criarOpen && (
          <CriarListaModal
            onClose={() => setCriarOpen(false)}
            onCreate={lista => setListas(prev => [lista, ...prev])}
          />
        )}
        {iniciarLista && (
          <IniciarDisparoModal
            lista={iniciarLista}
            onClose={() => setIniciarLista(null)}
            onConfirm={handleConfirmIniciar}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
