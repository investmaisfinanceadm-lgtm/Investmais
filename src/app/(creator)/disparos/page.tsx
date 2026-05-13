'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus, X, Play, Trash2, CheckCircle2, Clock,
  Phone, Users, Send, TrendingUp, Activity,
  Zap, Shield, Cpu, Layers, MessageSquare,
  Sparkles, ChevronRight, BarChart2, Radio,
  Smartphone, Monitor, Globe, RefreshCw
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

const DEFAULT_MENSAGEM = `Olá {nome}, tudo bem?

Vi sua operação em {cidade} e gostaria de apresentar uma solução exclusiva para o seu negócio.

Como posso te ajudar?`

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
const DIAS_UTEIS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

function parsePhones(raw: string): string[] {
  return raw.split('\n')
    .map(l => l.replace(/\D/g, '').trim())
    .filter(l => l.length >= 10 && l.length <= 15)
}

function applyVars(msg: string): string {
  return msg
    .replace(/\{nome\}/gi, 'João Silva')
    .replace(/\{cidade\}/gi, 'São Paulo')
    .replace(/\{estado\}/gi, 'SP')
    .replace(/\{nicho\}/gi, 'Imobiliário')
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ListaStatus }) {
  const map: Record<ListaStatus, { label: string; cls: string; icon: any }> = {
    nova:         { label: 'Aguardando',    cls: 'bg-white/5 border-white/10 text-white/40', icon: Clock },
    em_progresso: { label: 'Enviando', cls: 'bg-primary/10 border-primary/20 text-primary', icon: Activity },
    concluida:    { label: 'Concluído',   cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
  }
  const { label, cls, icon: Icon } = map[status]
  return (
    <span className={cn("inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border", cls)}>
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
            'Seg': 'seg', 'Ter': 'ter', 'Qua': 'qua',
            'Qui': 'qui', 'Sex': 'sex', 'Sab': 'sab', 'Dom': 'dom',
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
          toast.error('Configure o Webhook de Disparo nas configurações.')
        } else {
          throw new Error(data?.error || `Erro ${res.status}`)
        }
        setStarting(false)
        return
      }

      onConfirm(lista.id)
      toast.success('Disparo iniciado com sucesso')
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Falha ao iniciar disparo')
    } finally {
      setStarting(false)
    }
  }

  const tabs: { key: DisparoTab; label: string }[] = [
    { key: 'mensagem', label: 'Mensagem' },
    { key: 'configuracoes', label: 'Parâmetros' },
    { key: 'confirmar', label: 'Iniciar' },
  ]

  const diasLabel = config.dias
    .sort((a, b) => DIAS_SEMANA.indexOf(a) - DIAS_SEMANA.indexOf(b))
    .join(', ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Configurar Envio</h2>
                <p className="text-xs text-white/40">{lista.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-xl bg-white/[0.03] text-white/20 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 gap-2 mt-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex-1 py-3 text-xs font-bold transition-all rounded-xl border",
                activeTab === t.key
                  ? 'bg-primary text-white border-primary shadow-lg'
                  : 'bg-white/[0.02] text-white/20 border-white/5 hover:border-white/10'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'mensagem' && (
              <motion.div key="msg" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Variáveis Disponíveis</label>
                  <div className="flex flex-wrap gap-2">
                    {['{nome}', '{cidade}', '{estado}', '{nicho}'].map(v => (
                      <button key={v} onClick={() => setConfig(prev => ({ ...prev, mensagem: prev.mensagem + v }))}
                        className="text-[10px] px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-primary font-bold hover:border-primary/40 transition-all">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Texto da Mensagem</label>
                    <button onClick={() => setConfig(prev => ({ ...prev, mensagem: DEFAULT_MENSAGEM }))}
                      className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                      <RefreshCw className="w-3 h-3" /> Resetar
                    </button>
                  </div>
                  <textarea value={config.mensagem}
                    onChange={e => setConfig(prev => ({ ...prev, mensagem: e.target.value }))}
                    rows={6} className="w-full bg-black/40 border border-white/5 text-white placeholder-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-sm leading-relaxed resize-none font-sans" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Prévia</label>
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/40 font-medium whitespace-pre-wrap leading-relaxed italic">
                    {applyVars(config.mensagem) || "Aguardando mensagem..."}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'configuracoes' && (
              <motion.div key="cfg" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Intervalo entre Envios (Segundos)
                  </label>
                  <div className="flex items-center gap-4">
                    <input type="number" value={config.intervalo} min={3} max={60}
                      onChange={e => setConfig(prev => ({ ...prev, intervalo: Math.min(60, Math.max(3, Number(e.target.value))) }))}
                      className="w-24 bg-black/40 border border-white/5 text-white text-center px-4 py-3 rounded-xl focus:outline-none focus:border-primary/50 transition-all text-sm font-bold" />
                    <span className="text-[10px] text-white/10 font-bold uppercase tracking-widest">Recomendado: 5-15s</span>
                  </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Dias de Operação</label>
                    <div className="flex flex-wrap gap-2">
                        {DIAS_SEMANA.map(dia => (
                        <button key={dia} onClick={() => toggleDia(dia)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                                config.dias.includes(dia)
                                    ? 'bg-primary/10 text-primary border-primary/40'
                                    : 'bg-white/[0.02] border-white/5 text-white/10 hover:border-white/20'
                            )}>
                            {dia}
                        </button>
                        ))}
                    </div>
                </div>

                <label className="flex items-center gap-4 p-6 rounded-2xl bg-black/40 border border-white/5 cursor-pointer group hover:border-primary/20 transition-all">
                  <div onClick={() => setConfig(prev => ({ ...prev, horarioComercial: !prev.horarioComercial }))}
                    className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        config.horarioComercial ? 'bg-primary border-primary shadow-lg' : 'border-white/10 bg-black/40'
                    )}>
                    {config.horarioComercial && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                      <span className="text-sm text-white font-bold group-hover:text-primary transition-colors">Horário Comercial</span>
                      <p className="text-[10px] text-white/20 font-medium">Restringir envios para 08:00 - 18:00</p>
                  </div>
                </label>
              </motion.div>
            )}

            {activeTab === 'confirmar' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-6">
                <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 space-y-6">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-3">
                    <Activity className="w-4 h-4" /> Pronto para Iniciar
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Lista', value: lista.nome, cls: 'text-white' },
                      { label: 'Contatos', value: `${lista.total - lista.enviados} selecionados`, cls: 'text-primary font-bold' },
                      { label: 'Intervalo', value: `${config.intervalo} segundos`, cls: 'text-white' },
                      { label: 'Janela', value: config.horarioComercial ? 'Comercial (08-18h)' : '24 Horas', cls: 'text-white' },
                      { label: 'Dias', value: diasLabel, cls: 'text-white/40 text-[10px]' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{row.label}:</span>
                        <span className={cn("text-xs font-bold", row.cls)}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 rounded-2xl bg-black/40 border border-white/5">
                    <Shield className="w-5 h-5 text-white/10" />
                    <p className="text-[10px] text-white/20 font-medium leading-relaxed">
                        O disparo será processado automaticamente. Você poderá acompanhar o progresso em tempo real na listagem principal.
                    </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 flex gap-4 bg-black/40">
          <button onClick={onClose} className="px-6 text-xs font-bold text-white/20 hover:text-white transition-all">Cancelar</button>
          {activeTab !== 'confirmar' ? (
            <button onClick={() => setActiveTab(activeTab === 'mensagem' ? 'configuracoes' : 'confirmar')}
              className="flex-1 bg-primary hover:bg-primary/90 py-4 rounded-xl text-white text-xs font-bold transition-all shadow-lg">
              Próximo Passo
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={starting}
              className="flex-1 bg-primary hover:bg-primary/90 py-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-3 disabled:opacity-40 shadow-lg">
              {starting ? <Activity className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Iniciar Disparo
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
      toast.success('Lista criada com sucesso')
      onClose()
    } catch {
      toast.error('Falha ao criar lista')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Nova Lista de Contatos</h2>
                <p className="text-xs text-white/40">Importação manual de telefones</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-xl bg-white/[0.03] text-white/20 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Nome da Lista</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Leads Campanha Março"
              className="w-full bg-black/40 border border-white/5 text-white placeholder-white/10 px-6 py-4 rounded-xl focus:outline-none focus:border-primary/50 transition-all text-sm font-bold" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> Números de Telefone (um por linha)
            </label>
            <textarea value={rawPhones} onChange={e => setRawPhones(e.target.value)} rows={6}
              placeholder={'5511987654321\n55 62 99433-1056'}
              className="w-full bg-black/40 border border-white/5 text-white placeholder-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-primary/50 transition-all text-sm font-mono resize-none leading-relaxed" />
            <div className="flex items-center justify-between px-1">
                <p className="text-[10px] text-white/10 font-medium">Formato: DDI + DDD + Número</p>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{phones.length} números válidos</span>
            </div>
          </div>
        </div>

        <div className="p-6 flex gap-4 bg-background/50 border-t border-border">
          <button onClick={onClose} className="px-6 text-xs font-bold text-muted-foreground hover:text-foreground transition-all">Cancelar</button>
          <button onClick={handleSubmit} disabled={!canSave || saving}
            className="flex-1 bg-primary hover:bg-primary/90 py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-3 disabled:opacity-40 transition-all shadow-lg">
            {saving
              ? <><Activity className="w-4 h-4 animate-spin" />Salvando...</>
              : <><Layers className="w-4 h-4" /> Criar Lista com {phones.length} Contatos</>}
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
      toast.success('Lista removida')
    } catch {
      toast.error('Erro ao remover lista')
    } finally {
      setDeletingId(null)
    }
  }

  const handleConfirmIniciar = (id: string) => {
    setListas(prev => prev.map(l => l.id === id ? { ...l, status: 'em_progresso' } : l))
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Disparos</h1>
          <p className="text-muted-foreground text-xs">Gerencie suas campanhas de mensagens automáticas</p>
        </div>
        
        <button onClick={() => setCriarOpen(true)}
          className="bg-primary hover:bg-primary/90 px-8 py-4 rounded-2xl text-white text-xs font-bold flex items-center gap-3 transition-all shadow-lg">
          <Plus className="w-5 h-5" /> Criar Nova Lista
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Listas Ativas',   value: stats.ativas,            icon: Send,       color: 'text-primary' },
          { label: 'Em Processamento',    value: stats.emProgresso,       icon: Activity,   color: 'text-primary' },
          { label: 'Taxa de Conclusão', value: `${stats.taxaSucesso}%`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Mensagens Pendentes',       value: stats.pendentes,         icon: Users,      color: 'text-white/40' },
        ].map((s, idx) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card/40 border border-border p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:bg-card/60 transition-all shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary transition-colors">
                <s.icon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
                <p className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Area */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/40 border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Radio className="w-4.5 h-4.5" />
            </div>
            <div>
                <h3 className="text-sm font-bold tracking-tight">Histórico de Listas</h3>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Acompanhamento de progresso em tempo real</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-background border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{listas.length} listas</span>
        </div>

        {loading ? (
          <div className="p-10 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />)}</div>
        ) : listas.length === 0 ? (
          <div className="py-32 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto opacity-20">
              <Send className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white/40">Nenhuma lista encontrada</p>
              <p className="text-xs text-white/20">Crie sua primeira lista para iniciar os disparos.</p>
            </div>
            <button onClick={() => setCriarOpen(true)} className="bg-primary/10 hover:bg-primary/20 px-8 py-3 rounded-xl text-primary text-xs font-bold transition-all">
              Criar Lista agora
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5">
                  <th className="px-10 py-6 text-[10px] font-bold text-white/40 uppercase tracking-wider">Nome da Lista</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-white/40 uppercase tracking-wider text-center">Progresso</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-white/40 uppercase tracking-wider">Data</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-white/40 uppercase tracking-wider text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {listas.map((lista, idx) => {
                    const pct = lista.total > 0 ? Math.round(lista.enviados / lista.total * 100) : 0
                    return (
                      <motion.tr key={lista.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-white/[0.02] transition-all">
                        <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                    <Layers className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-primary" />
                                </div>
                                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{lista.nome}</span>
                            </div>
                        </td>
                        <td className="px-10 py-8 min-w-[250px]">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-white/40 uppercase tracking-wider">{lista.enviados} de {lista.total} envios</span>
                                <span className="text-primary">{pct}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                              <div className="h-full bg-primary shadow-lg rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8"><StatusBadge status={lista.status} /></td>
                        <td className="px-10 py-8 text-xs font-medium text-white/20">
                          {format(parseISO(lista.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center justify-center gap-2">
                            {lista.status === 'nova' && (
                              <button onClick={() => setIniciarLista(lista)}
                                className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center group/btn">
                                <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(lista.id)} disabled={deletingId === lista.id}
                              className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 text-white/20 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5 transition-all flex items-center justify-center group/btn">
                                {deletingId === lista.id ? <Activity className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />}
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

      {iniciarLista && (
        <IniciarDisparoModal 
          lista={iniciarLista} 
          onClose={() => setIniciarLista(null)} 
          onConfirm={handleConfirmIniciar} 
        />
      )}

      {criarOpen && (
        <CriarListaModal 
          onClose={() => setCriarOpen(false)} 
          onCreate={(nova) => setListas([nova, ...listas])} 
        />
      )}
    </div>
  )
}
