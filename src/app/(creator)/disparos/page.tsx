'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus, X, Play, Trash2, CheckCircle2, Clock,
  Phone, Users, Send, TrendingUp, Activity,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

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

Vi que você está em {cidade} e gostaria de apresentar uma solução especial para o seu negócio.

Posso te ajudar?`

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
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
    .replace(/\{nicho\}/gi, 'Contabilidade')
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ListaStatus }) {
  const map: Record<ListaStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    nova:         { label: 'Nova',         cls: 'bg-white/5 border-white/10 text-gray-300',                   icon: <Clock className="w-3 h-3" /> },
    em_progresso: { label: 'Em Progresso', cls: 'bg-accent/10 border-accent/20 text-accent',                  icon: <Activity className="w-3 h-3" /> },
    concluida:    { label: 'Concluída',    cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',    icon: <CheckCircle2 className="w-3 h-3" /> },
  }
  const { label, cls, icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {icon}{label}
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
      // Map phone numbers to lead objects expected by n8n automation
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
            'Qui': 'qui', 'Sex': 'sex', 'Sáb': 'sab', 'Dom': 'dom',
          }
          return map[d] || d.toLowerCase()
        }),
      }

      // Call server-side proxy to avoid CORS issues when calling n8n externally
      const res = await fetch('/api/proxy/disparo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 400 && data?.error?.includes('não configurado')) {
          toast.error('Configure o Webhook de Disparo em Configurações > Disparo')
        } else {
          throw new Error(data?.error || `Erro ${res.status}`)
        }
        setStarting(false)
        return
      }

      onConfirm(lista.id)
      toast.success('Disparo de WhatsApp iniciado!')
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao iniciar disparo')
    } finally {
      setStarting(false)
    }
  }

  const tabs: { key: DisparoTab; label: string }[] = [
    { key: 'mensagem', label: 'Mensagem' },
    { key: 'configuracoes', label: 'Configurações' },
    { key: 'confirmar', label: 'Confirmar' },
  ]

  const diasLabel = config.dias
    .sort((a, b) => DIAS_SEMANA.indexOf(a) - DIAS_SEMANA.indexOf(b))
    .map(d => d.toUpperCase())
    .join(', ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm md:text-base font-black text-white flex items-center gap-2 min-w-0">
            <Send className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="truncate">Iniciar: <span className="text-accent">{lista.nome}</span></span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-border">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === t.key
                  ? 'text-white border-b-2 border-accent bg-accent/5'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {/* ── Mensagem ── */}
            {activeTab === 'mensagem' && (
              <motion.div key="msg" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-4">
                {/* Variables */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Variáveis Disponíveis</p>
                  <div className="flex flex-wrap gap-2">
                    {['{nome}', '{cidade}', '{estado}', '{nicho}'].map(v => (
                      <button key={v} onClick={() => setConfig(prev => ({ ...prev, mensagem: prev.mensagem + v }))}
                        className="text-xs px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent font-mono hover:bg-accent/20 transition-colors">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Mensagem</label>
                    <div className="flex gap-2">
                      <button onClick={() => setConfig(prev => ({ ...prev, mensagem: DEFAULT_MENSAGEM }))}
                        className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                        ↺ Carregar Padrão
                      </button>
                      <button onClick={() => { localStorage.setItem('disparo_msg_padrao', config.mensagem); toast.success('Padrão salvo!') }}
                        className="text-[10px] text-accent hover:text-accent/80 transition-colors flex items-center gap-1 font-semibold">
                        ✦ Salvar como Padrão
                      </button>
                    </div>
                  </div>
                  <textarea value={config.mensagem}
                    onChange={e => setConfig(prev => ({ ...prev, mensagem: e.target.value }))}
                    rows={5} className="input-field text-sm resize-none font-mono" />
                  <p className="text-[10px] text-gray-600 text-right">{config.mensagem.length} caracteres</p>
                </div>

                {/* Preview */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Preview</p>
                  <div className="p-4 rounded-xl bg-dark-muted border border-dark-border text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {applyVars(config.mensagem) || <span className="text-gray-600 italic">Digite uma mensagem acima</span>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Configurações ── */}
            {activeTab === 'configuracoes' && (
              <motion.div key="cfg" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-6">
                {/* Intervalo */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />Intervalo entre Envios
                  </p>
                  <div className="flex items-center gap-3">
                    <input type="number" value={config.intervalo} min={3} max={60}
                      onChange={e => setConfig(prev => ({ ...prev, intervalo: Math.min(60, Math.max(3, Number(e.target.value))) }))}
                      className="input-field w-24 text-center font-mono text-sm" />
                    <span className="text-sm text-gray-400">segundos (min: 3, máx: 60)</span>
                  </div>
                </div>

                {/* Horário comercial */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div onClick={() => setConfig(prev => ({ ...prev, horarioComercial: !prev.horarioComercial }))}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      config.horarioComercial ? 'bg-accent border-accent' : 'border-dark-border bg-dark-muted group-hover:border-accent/40'
                    }`}>
                    {config.horarioComercial && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-gray-300 font-medium">Enviar apenas em horário comercial</span>
                </label>

                {/* Dias da semana */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Dias da Semana</p>
                  <div className="flex flex-wrap gap-2">
                    {DIAS_SEMANA.map(dia => (
                      <button key={dia} onClick={() => toggleDia(dia)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          config.dias.includes(dia)
                            ? 'bg-accent text-white shadow-accent'
                            : 'bg-dark-muted border border-dark-border text-gray-400 hover:border-accent/40'
                        }`}>
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Confirmar ── */}
            {activeTab === 'confirmar' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-4">
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-3">
                  <p className="text-sm font-black text-accent flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" />Resumo do Disparo
                  </p>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Lista',             value: lista.nome,                              cls: 'text-white font-semibold' },
                      { label: 'Total de Leads',     value: String(lista.total),                    cls: 'text-white font-semibold' },
                      { label: 'Já enviados',        value: String(lista.enviados),                 cls: 'text-white font-semibold' },
                      { label: 'Serão enviados',     value: String(lista.total - lista.enviados),   cls: 'text-accent font-bold' },
                      { label: 'Intervalo',          value: `${config.intervalo} segundos`,         cls: 'text-white' },
                      { label: 'Horário Comercial',  value: config.horarioComercial ? 'Ativado' : 'Desativado', cls: 'text-white' },
                      { label: 'Dias',               value: diasLabel,                              cls: 'text-white' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between gap-4">
                        <span className="text-gray-400">{row.label}:</span>
                        <span className={row.cls}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 bg-dark-muted border border-dark-border rounded-xl px-4 py-3 leading-relaxed">
                  O disparo será processado via webhook N8N. Você pode acompanhar o progresso na tabela de listas.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 font-semibold">Cancelar</button>
          {activeTab !== 'confirmar' ? (
            <button onClick={() => setActiveTab(activeTab === 'mensagem' ? 'configuracoes' : 'confirmar')}
              className="btn-primary flex-1 font-black text-sm uppercase tracking-wider">
              Próximo →
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={starting}
              className="btn-primary flex-1 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60">
              {starting ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Iniciar Disparo de WhatsApp
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
      toast.success('Lista criada com sucesso!')
      onClose()
    } catch {
      toast.error('Erro ao criar lista. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" />Criar Lista Manual
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Adicione telefones manualmente para criar uma nova lista de disparo.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nome da Lista *</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Prospecção Janeiro 2024"
              className="input-field text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3 h-3" />Telefones (um por linha) *
            </label>
            <textarea value={rawPhones} onChange={e => setRawPhones(e.target.value)} rows={6}
              placeholder={'5511987654321\n5521999998888\n55 62 99433-1056'}
              className="input-field text-sm font-mono resize-none" />
            <p className="text-[10px] text-gray-600">
              Formato: DDI + DDD + Número (ex: 5562994331056)
              <span className="ml-2 text-accent font-bold">
                {phones.length} válidos / {rawPhones.split('\n').filter(l => l.trim()).length} total
              </span>
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 font-semibold">Cancelar</button>
          <button onClick={handleSubmit} disabled={!canSave || saving}
            className="btn-primary flex-1 font-black text-sm uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2">
            {saving
              ? <><Activity className="w-4 h-4 animate-spin" />Criando...</>
              : `Criar Lista (${phones.length} telefones)`}
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
    <div className="p-4 md:p-8 lg:p-12 space-y-6 md:space-y-8 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Listas de Disparo</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            Gerencie suas listas e dispare mensagens WhatsApp para leads
          </p>
        </div>
        <button onClick={() => setCriarOpen(true)}
          className="btn-primary flex items-center gap-2 font-black text-xs md:text-sm uppercase tracking-wider whitespace-nowrap self-start sm:self-auto">
          <Plus className="w-4 h-4" />Criar Lista
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Listas Ativas',   value: stats.ativas,            icon: <Send className="w-5 h-5" />,       color: 'text-accent' },
          { label: 'Em Progresso',    value: stats.emProgresso,       icon: <Activity className="w-5 h-5" />,   color: 'text-blue-400' },
          { label: 'Taxa de Sucesso', value: `${stats.taxaSucesso}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-400' },
          { label: 'Pendentes',       value: stats.pendentes,         icon: <Users className="w-5 h-5" />,      color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card p-5 rounded-2xl flex items-center gap-4">
            <div className={`${s.color} opacity-60`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-border flex items-center gap-2">
          <Send className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Listas de Disparo</h3>
          <span className="badge badge-accent text-[10px] ml-1">{listas.length}</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="shimmer h-14 rounded-xl" />)}</div>
        ) : listas.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-gray-400 font-semibold">Nenhuma lista criada ainda</p>
            <p className="text-gray-600 text-sm mt-1">Crie sua primeira lista de disparo para começar</p>
            <button onClick={() => setCriarOpen(true)} className="btn-primary mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider">
              <Plus className="w-4 h-4" />Criar Lista Manual
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="table-header">Nome</th>
                  <th className="table-header text-center">Leads</th>
                  <th className="table-header">Progresso</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header">Criado em</th>
                  <th className="table-header text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {listas.map(lista => {
                    const pct = lista.total > 0 ? Math.round(lista.enviados / lista.total * 100) : 0
                    return (
                      <motion.tr key={lista.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="table-row">
                        <td className="table-cell font-semibold text-white">{lista.nome}</td>
                        <td className="table-cell text-center text-sm text-gray-400">
                          <span className="font-bold text-white">{lista.enviados}</span>/{lista.total}
                        </td>
                        <td className="table-cell min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500 w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="table-cell text-center"><StatusBadge status={lista.status} /></td>
                        <td className="table-cell text-gray-400 text-xs">
                          {format(parseISO(lista.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="table-cell text-center">
                          <div className="flex items-center justify-center gap-1">
                            {lista.status === 'nova' && (
                              <button onClick={() => setIniciarLista(lista)} title="Iniciar disparo"
                                className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors">
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(lista.id)} disabled={deletingId === lista.id}
                              title="Excluir lista"
                              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40">
                              <Trash2 className="w-3.5 h-3.5" />
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
