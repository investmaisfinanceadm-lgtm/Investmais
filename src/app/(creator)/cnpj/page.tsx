'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Search, Building2, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  AlertTriangle, UserPlus, Copy, Phone, Mail, MapPin, Calendar,
  Briefcase, DollarSign, Users, Clock, ChevronDown, Filter,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { ptBR } from 'date-fns/locale'

// ─── CNPJ helpers ────────────────────────────────────────────────────────────
function validarCNPJ(cnpj: string): boolean {
  const n = cnpj.replace(/\D/g, '')
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false
  const calc = (len: number) => {
    let s = 0, p = len - 7
    for (let i = len; i >= 1; i--) { s += parseInt(n[len - i]) * p--; if (p < 2) p = 9 }
    return s % 11 < 2 ? 0 : 11 - (s % 11)
  }
  return calc(12) === parseInt(n[12]) && calc(13) === parseInt(n[13])
}
function maskCNPJ(v: string): string {
  const n = v.replace(/\D/g, '').slice(0, 14)
  return n.replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Situacao = 'ATIVA' | 'INATIVA' | 'SUSPENSA'
interface Socio { nome: string; qualificacao: string; dataEntrada: string }
interface CNPJResult {
  cnpj: string; razaoSocial: string; nomeFantasia: string
  situacaoCadastral: Situacao; dataAbertura: string
  cnaePrincipalCodigo: string; cnaePrincipalDescricao: string
  logradouro: string; numero: string; complemento: string
  bairro: string; municipio: string; uf: string; cep: string
  telefone: string; email: string; capitalSocial: string; socios: Socio[]
}
interface LeadCNPJ {
  id: string; cnpj: string; nome: string | null; telefone: string | null
  email: string | null; situacao: string | null; cidade: string | null
  estado: string | null; endereco: string | null; cnae_descricao: string | null
  cnae_codigo: string | null; created_at: string
}

// ─── Badge ───────────────────────────────────────────────────────────────────
function SituacaoBadge({ situacao }: { situacao: string | null }) {
  if (!situacao) return <span className="badge badge-gold">—</span>
  const map: Record<string, string> = { ATIVA: 'badge-accent', INATIVA: 'badge-red', SUSPENSA: 'badge-gold' }
  return <span className={`badge ${map[situacao] ?? 'badge-gold'} text-xs`}>{situacao}</span>
}

// ─── DataRow ─────────────────────────────────────────────────────────────────
function DataRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-main)] group hover:border-accent/20 transition-colors">
      <div className="text-[var(--text-muted)] mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
        <p className="text-sm text-[var(--text-main)] font-medium mt-0.5 truncate">{value}</p>
      </div>
      <button onClick={() => { navigator.clipboard.writeText(value).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all shrink-0">
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

// ─── Google Search Tab ───────────────────────────────────────────────────────
const NICHOS = ['Beleza e Estética', 'Saúde e Medicina', 'Agronegócio', 'Contabilidade e Finanças', 'Engenharia e Construção', 'Educação', 'Alimentação e Gastronomia', 'Tecnologia', 'Jurídico', 'Imobiliário']
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

function GoogleTab() {
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [nicho, setNicho] = useState('')
  const [loading, setLoading] = useState(false)
  const [buscaStatus, setBuscaStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [googleLeads, setGoogleLeads] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/creator/crm')
      .then(r => r.json())
      .then((d: any[]) => {
        if (Array.isArray(d)) {
          const leadsGoogle = d.filter(c => c.canal_origem?.toLowerCase() === 'google' || c.canal?.toLowerCase() === 'google')
          setGoogleLeads(leadsGoogle)
        }
      })
      .catch(() => {})
  }, [])

  const handleBuscar = async () => {
    if (!estado || !cidade || !nicho) return
    setLoading(true)
    setBuscaStatus('idle')
    try {
      const res = await fetch('/api/creator/crm/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, cidade, nicho }),
      })
      setBuscaStatus(res.ok ? 'success' : 'error')
      if (res.ok) {
        toast.success('Busca iniciada! Os leads serão adicionados em breve.')
      } else {
        toast.error(`Erro ao iniciar busca (${res.status})`)
      }
    } catch {
      setBuscaStatus('error')
      toast.error('Não foi possível conectar ao webhook')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card card-hover p-6 rounded-2xl space-y-5">
        <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-accent" />
          Buscar Leads no Google
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Estado</label>
            <div className="relative">
              <select value={estado} onChange={e => setEstado(e.target.value)}
                className="input-field appearance-none pr-8 text-sm">
                <option value="">Selecione o Estado</option>
                {ESTADOS.map(e => <option key={e} value={e} className="text-gray-900 bg-white">{e}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Cidade</label>
            <input value={cidade} onChange={e => setCidade(e.target.value)}
              placeholder={estado ? 'Digite a cidade' : 'Selecione o estado primeiro'}
              disabled={!estado}
              className="input-field text-sm disabled:opacity-40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Nicho de Mercado</label>
            <div className="relative">
              <select value={nicho} onChange={e => setNicho(e.target.value)}
                className="input-field appearance-none pr-8 text-sm">
                <option value="">Selecione o Nicho</option>
                {NICHOS.map(n => <option key={n} value={n} className="text-gray-900 bg-white">{n}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>
        <button onClick={handleBuscar} disabled={loading || !estado || !cidade || !nicho}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-wider disabled:opacity-40">
          {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Buscando...</> : <><Search className="w-4 h-4" />Buscar Leads no Google</>}
        </button>
        {buscaStatus === 'success' && (
          <p className="flex items-center gap-2 text-accent text-[11px] mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Busca enviada com sucesso! Os leads serão adicionados ao CRM em instantes.
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Google', value: googleLeads.length.toString(), color: 'text-accent' },
          { label: 'Leads Hoje', value: googleLeads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length.toString(), color: 'text-[var(--text-main)]' },
          { label: 'Conversões', value: googleLeads.filter(l => l.status_funil === 'cliente').length.toString(), color: 'text-[var(--text-main)]' },
          { label: 'Na Semana', value: googleLeads.filter(l => (new Date().getTime() - new Date(l.created_at).getTime()) / (1000 * 3600 * 24) < 7).length.toString(), color: 'text-[var(--text-main)]' },
        ].map(s => (
          <div key={s.label} className="card card-hover p-5 rounded-2xl text-center shadow-sm">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Últimas Buscas */}
      <div className="card card-hover rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Clock className="w-4 h-4 text-[var(--text-muted)]" />
               <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">Últimos Leads Extraídos</h3>
            </div>
            <button onClick={() => window.location.reload()} className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--text-main)] uppercase font-black"><RefreshCw className="w-3 h-3"/> Atualizar</button>
        </div>
        <div className="divide-y divide-[var(--border-main)]">
          {googleLeads.length === 0 ? (
             <p className="text-sm text-[var(--text-muted)] text-center py-6">Nenhum lead extraído do Google Maps até o momento.</p>
          ) : (
            googleLeads.slice(0, 8).map((b, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-primary)] transition-colors">
                <div className="flex items-start md:items-center flex-col md:flex-row gap-1 md:gap-3">
                  <span className="text-sm font-semibold text-[var(--text-main)] truncate max-w-[200px] md:max-w-[300px]">{b.nome}</span>
                  <span className="text-[var(--text-support)] hidden md:block">•</span>
                  <span className="text-sm text-accent font-black tracking-tight">{b.telefone || 'Sem número'}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-xs text-[var(--text-muted)] font-black uppercase tracking-wider">{b.status_funil}</span>
                   <span className="text-[10px] text-[var(--text-support)] font-medium">{format(new Date(b.created_at || new Date()), "dd/MM/yy 'às' HH:mm")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CNPJ Tab ─────────────────────────────────────────────────────────────────
function CNPJTab() {
  const [cnpjInput, setCnpjInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CNPJResult | null>(null)
  const [errorState, setErrorState] = useState<'invalid' | 'notfound' | 'apierror' | 'ratelimit' | null>(null)
  const [importFeedback, setImportFeedback] = useState(false)
  const [leads, setLeads] = useState<LeadCNPJ[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  useEffect(() => {
    fetch('/api/leads-cnpj')
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setLeads(d) : null)
      .catch(() => {})
      .finally(() => setLoadingLeads(false))
  }, [result])

  const handleConsultar = async () => {
    if (!validarCNPJ(cnpjInput)) { setErrorState('invalid'); setResult(null); return }
    setIsLoading(true); setErrorState(null); setResult(null)
    try {
      const res = await fetch(`/api/cnpj/consultar?cnpj=${cnpjInput.replace(/\D/g, '')}`)
      const json = await res.json()
      if (!res.ok) {
        if (json.error === 'notfound') setErrorState('notfound')
        else if (json.error === 'ratelimit') setErrorState('ratelimit')
        else setErrorState('apierror')
        return
      }
      setResult(json)
    } catch { setErrorState('apierror') }
    finally { setIsLoading(false) }
  }

  const handleImportCRM = async () => {
    if (!result) return
    try {
      const res = await fetch('/api/cnpj/importar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) })
      if (res.ok) { setImportFeedback(true); setTimeout(() => setImportFeedback(false), 3000) }
    } catch {}
  }

  const filteredLeads = leads.filter(l => {
    if (filterStatus && l.situacao !== filterStatus) return false
    if (filterEstado && l.estado !== filterEstado) return false
    return true
  })

  const estadosDisponiveis = [...new Set(leads.map(l => l.estado).filter(Boolean)) as any] as string[]

  return (
    <div className="space-y-6">
      {/* Search card */}
      <div className="card card-hover p-6 rounded-2xl shadow-sm">
        <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-accent" />
          Buscar Empresas por CNPJ
        </h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input type="text" value={cnpjInput}
              onChange={e => { setCnpjInput(maskCNPJ(e.target.value)); setErrorState(null); setResult(null) }}
              onKeyDown={e => e.key === 'Enter' && handleConsultar()}
              placeholder="00.000.000/0000-00" maxLength={18}
              className={`input-field pl-9 font-mono tracking-widest ${errorState === 'invalid' ? 'border-red-500/60' : ''}`} />
          </div>
          <button onClick={handleConsultar} disabled={isLoading || cnpjInput.replace(/\D/g, '').length < 14}
            className="btn-primary px-6 flex items-center gap-2 font-black text-sm uppercase tracking-wider disabled:opacity-40 whitespace-nowrap">
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isLoading ? 'Buscando...' : 'Iniciar Busca de CNPJ'}
          </button>
        </div>

        <AnimatePresence>
          {errorState === 'invalid' && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-red-400 text-xs mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              <XCircle className="w-3.5 h-3.5 shrink-0" />CNPJ inválido. Verifique os dígitos.
            </motion.p>
          )}
          {errorState === 'ratelimit' && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-orange-400 text-xs mt-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />Limite atingido. Aguarde 1 minuto.
            </motion.p>
          )}
          {errorState === 'apierror' && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-yellow-400 text-xs mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />Serviço temporariamente indisponível.
            </motion.p>
          )}
          {errorState === 'notfound' && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-yellow-400 text-xs mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />CNPJ não encontrado nos registros da Receita Federal.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Result */}
      <AnimatePresence>
        {isLoading && (
          <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card p-6 rounded-2xl space-y-4">
            <div className="shimmer h-6 w-40 rounded-lg" />
            <div className="shimmer h-8 w-64 rounded-lg" />
            <div className="grid grid-cols-2 gap-3">{[...Array(6)].map((_, i) => <div key={i} className="shimmer h-14 rounded-xl" />)}</div>
          </motion.div>
        )}
        {result && !isLoading && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="card rounded-2xl overflow-hidden">
            <AnimatePresence>
              {importFeedback && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 px-6 py-3 bg-accent/10 border-b border-accent/20">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-sm text-accent font-semibold">{result.razaoSocial} importada para o CRM!</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="p-6 border-b border-[var(--border-main)] space-y-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <SituacaoBadge situacao={result.situacaoCadastral} />
                <span className="text-xs text-[var(--text-muted)] font-mono">{result.cnpj}</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">{result.razaoSocial}</h2>
              {result.nomeFantasia && result.nomeFantasia !== result.razaoSocial && (
                <p className="text-accent font-semibold">{result.nomeFantasia}</p>
              )}
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <DataRow icon={<Calendar className="w-4 h-4" />} label="Data de Abertura" value={format(parseISO(result.dataAbertura), "dd/MM/yyyy")} />
                <DataRow icon={<Briefcase className="w-4 h-4" />} label={`CNAE — ${result.cnaePrincipalCodigo}`} value={result.cnaePrincipalDescricao} />
                <DataRow icon={<DollarSign className="w-4 h-4" />} label="Capital Social" value={result.capitalSocial} />
                <DataRow icon={<MapPin className="w-4 h-4" />} label="Cidade / UF" value={`${result.municipio} — ${result.uf}`} />
                <DataRow icon={<Phone className="w-4 h-4" />} label="Telefone" value={result.telefone} />
                <DataRow icon={<Mail className="w-4 h-4" />} label="E-mail" value={result.email} />
              </div>
              {result.socios.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-3 h-3" />Quadro Societário
                  </p>
                  {result.socios.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-main)]">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-accent text-[10px] font-black">{s.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-main)] truncate">{s.nome}</p>
                        <p className="text-xs text-[var(--text-muted)]">{s.qualificacao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={handleImportCRM}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm py-3">
                  <UserPlus className="w-4 h-4" />Importar para CRM
                </button>
                <button onClick={() => { setResult(null); setCnpjInput('') }}
                  className="btn-secondary flex items-center gap-2 font-semibold px-5">
                  <RefreshCw className="w-4 h-4" />Nova
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leads CNPJ Table */}
      <div className="card card-hover rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">Leads CNPJ</h3>
            <span className="badge badge-accent text-[10px]">{leads.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <div className="relative">
              <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
                className="text-xs bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-lg px-3 py-1.5 text-[var(--text-main)] appearance-none pr-6">
                <option value="" className="text-gray-900 bg-white">Todos os Estados</option>
                {estadosDisponiveis.map(e => <option key={e} value={e} className="text-gray-900 bg-white">{e}</option>)}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
            </div>
            <div className="relative">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="text-xs bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-lg px-3 py-1.5 text-[var(--text-main)] appearance-none pr-6">
                <option value="" className="text-gray-900 bg-white">Todos os Status</option>
                <option value="ATIVA" className="text-gray-900 bg-white">Ativa</option>
                <option value="INATIVA" className="text-gray-900 bg-white">Inativa</option>
                <option value="SUSPENSA" className="text-gray-900 bg-white">Suspensa</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>
        {loadingLeads ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />)}</div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-[var(--text-support)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)] text-sm font-semibold">Nenhum lead encontrado</p>
            <p className="text-[var(--text-support)] text-xs mt-1 uppercase font-black tracking-widest">Faça uma busca por CNPJ para gerar leads</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-main)] bg-[var(--bg-primary)]/50">
                  <th className="table-header">CNPJ</th>
                  <th className="table-header">Empresa</th>
                  <th className="table-header">Telefone</th>
                  <th className="table-header">E-mail</th>
                  <th className="table-header text-center">Situação</th>
                  <th className="table-header">Cidade/Estado</th>
                  <th className="table-header">CNAE</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="table-row">
                    <td className="table-cell font-mono text-xs text-[var(--text-muted)]">{lead.cnpj}</td>
                    <td className="table-cell font-bold text-[var(--text-main)] max-w-[180px] truncate">{lead.nome ?? '—'}</td>
                    <td className="table-cell text-[var(--text-muted)] text-xs font-semibold">{lead.telefone ?? '—'}</td>
                    <td className="table-cell text-[var(--text-muted)] text-xs max-w-[160px] truncate">{lead.email ?? '—'}</td>
                    <td className="table-cell text-center"><SituacaoBadge situacao={lead.situacao} /></td>
                    <td className="table-cell text-[var(--text-muted)] text-xs">{lead.cidade && lead.estado ? `${lead.cidade}/${lead.estado}` : '—'}</td>
                    <td className="table-cell text-[var(--text-muted)] text-xs max-w-[200px] truncate">{lead.cnae_descricao ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BuscaLeadsPage() {
  const [activeTab, setActiveTab] = useState<'google' | 'cnpj'>('google')

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-6 md:space-y-8 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tighter">Busca de Leads</h1>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
          Encontre leads para alavancar seu negócio
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-xl w-fit">
        {([['google', 'Busca Google'], ['cnpj', 'Busca CNPJ']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === key
                ? 'bg-accent text-[var(--text-main)] shadow-accent'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {activeTab === 'google' ? <GoogleTab /> : <CNPJTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
