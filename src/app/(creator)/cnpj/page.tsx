'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Search, Building2, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  AlertTriangle, UserPlus, Copy, Phone, Mail, MapPin, Calendar,
  Briefcase, DollarSign, Users, Clock, ChevronDown, Filter, Eye
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { ptBR } from 'date-fns/locale'
import { 
  LeadDetailModal, 
  Contact, 
  FunilStatus, 
  Canal, 
  ActivityType, 
  ContactActivity 
} from '@/components/crm/LeadDetailModal'


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
        <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
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

// ─── City Selector Component ──────────────────────────────────────────────────
interface SearchableSelectProps {
  label?: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  icon: any
  disabled?: boolean
  loading?: boolean
  mini?: boolean
}

function SearchableSelect({ 
  label, value, onChange, options, placeholder, icon: Icon, disabled, loading, mini 
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    if (!Array.isArray(options)) return []
    if (!searchTerm) return options
    const normalizedSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return options.filter(o => 
      String(o || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedSearch)
    )
  }, [options, searchTerm])

  return (
    <div className={cn("relative", !mini && "space-y-1.5")}>
      {label && <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider">{label}</label>}
      <div className="relative">
        <div 
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          className={cn(
            "input-field flex items-center justify-between cursor-pointer group transition-all duration-300",
            mini ? "py-1.5 px-3 text-xs min-h-0 bg-[var(--bg-primary)]" : "py-3 px-4 text-sm",
            disabled && "opacity-40 cursor-not-allowed",
            isOpen && "border-accent/60 ring-2 ring-accent/10 shadow-lg shadow-accent/5"
          )}
        >
          <div className="flex items-center gap-2 truncate flex-1 min-w-0">
            {!mini && Icon && <Icon className={cn("w-3.5 h-3.5 shrink-0", value ? "text-accent" : "text-[var(--text-support)]")} />}
            <span className={cn("truncate font-semibold", !value && "text-[var(--text-support)]")}>
              {loading ? (
                <span className="flex items-center gap-2 italic text-accent animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {mini ? '' : 'Carregando...'}
                </span>
              ) : value || placeholder}
            </span>
          </div>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-all duration-300 text-[var(--text-support)] group-hover:text-accent", isOpen && "rotate-180 text-accent")} />
        </div>

        <AnimatePresence>
          {isOpen && (
            <div key="dropdown-wrapper" className="fixed inset-0 z-[120] flex items-start justify-center pt-20 px-4 sm:relative sm:inset-auto sm:p-0">
              <motion.div 
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1] sm:hidden"
              />
              
              <motion.div 
                 key="dropdown-content"
                 initial={{ opacity: 0, y: 8, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 8, scale: 0.95 }}
                 className={cn(
                   "w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl overflow-hidden glass z-[130] sm:absolute sm:top-full sm:mt-2",
                   mini ? "max-w-[200px] sm:right-0" : "max-w-md sm:left-0 sm:right-0"
                 )}
              >
                <div className="p-3 border-b border-[var(--border-main)] bg-[var(--bg-primary)]/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input 
                      autoFocus
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full bg-[var(--bg-card)] text-sm px-10 py-1.5 rounded-xl border border-[var(--border-main)] focus:outline-none focus:border-accent/60 focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-[var(--text-support)]"
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar py-1">
                  {filtered.length === 0 ? (
                    <div className="px-6 py-4 text-center text-xs text-[var(--text-muted)]">
                      Nenhum resultado
                    </div>
                  ) : (
                    filtered.map(o => (
                      <div 
                        key={o}
                        onClick={() => {
                          onChange(o)
                          setIsOpen(false)
                          setSearchTerm('')
                        }}
                        className={cn(
                          "px-4 py-2.5 text-xs cursor-pointer hover:bg-accent/10 hover:text-accent transition-all flex items-center justify-between group",
                          value === o && "bg-accent/[0.08] text-accent font-bold"
                        )}
                      >
                        <span className="truncate">{o}</span>
                        {value === o && <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(37,99,235,0.6)]" />}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CitySelector({ uf, value, onChange }: { uf: string, value: string, onChange: (v: string) => void }) {
  const [cidades, setCidades] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!uf) {
      setCidades([])
      onChange('')
      return
    }

    const fetchCidades = async () => {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        const sorted = data
          .map((m: any) => m.nome)
          .sort((a: string, b: string) => a.localeCompare(b, 'pt-BR'))
        setCidades(sorted)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCidades()
    onChange('')
  }, [uf, onChange])

  return (
    <SearchableSelect
      label="Cidade"
      value={value}
      onChange={onChange}
      options={cidades}
      placeholder={uf ? "Selecione a Cidade" : "Selecione o estado"}
      icon={MapPin}
      disabled={!uf}
      loading={loading}
    />
  )
}


const PAGE_SIZE = 10
const POLL_INTERVAL = 3000
const POLL_TIMEOUT = 30000

function GoogleTab() {
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [nicho, setNicho] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLeads, setGoogleLeads] = useState<any[]>([])
  const [polling, setPolling] = useState(false)
  const [pollingMsg, setPollingMsg] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const sortedLeads = useMemo(
    () => [...googleLeads].sort((a, b) => {
      const dateA = new Date(a?.created_at || 0).getTime()
      const dateB = new Date(b?.created_at || 0).getTime()
      return dateB - dateA
    }),
    [googleLeads]
  )

  const formatContact = (c: any): Contact => ({
    ...c,
    status: (c.status_funil || 'lead') as FunilStatus,
    canal: (c.canal_origem || 'Site') as Canal,
    tags: c.tags || [],
    notas: c.notas || '',
    empresa: c.empresa || '',
    email: c.email || '',
    telefone: c.telefone || '',
    cargo: c.cargo || '',
    cidade: c.cidade || '',
    estado: c.estado || '',
    endereco: c.endereco || '',
    site: c.site || '',
    nicho: c.nicho || '',
    createdAt: new Date(c.created_at),
    lastActivity: new Date(c.updated_at || c.created_at),
    activities: (c.atividades || []).map((a: any) => ({
      id: a.id,
      type: (a.tipo || 'note') as ActivityType,
      description: a.descricao || '',
      date: new Date(a.data || Date.now()),
    }))
  })

  const fetchGoogleLeads = useCallback(async (): Promise<Contact[]> => {
    try {
      const d = await fetch('/api/creator/crm').then(r => r.json())
      if (Array.isArray(d)) {
        const leadsGoogle = d
          .filter((c: any) => c.canal_origem?.toLowerCase() === 'google' || c.canal?.toLowerCase() === 'google')
          .map(formatContact)
        setGoogleLeads(leadsGoogle)
        return leadsGoogle
      }
    } catch {}
    return []
  }, [])


  useEffect(() => { fetchGoogleLeads() }, [fetchGoogleLeads])
  useEffect(() => { setCidade('') }, [estado])

  // Polling: after successful search, poll every 3s until new leads appear or 30s timeout
  useEffect(() => {
    if (!polling) return
    const startCount = googleLeads.length
    const deadline = Date.now() + POLL_TIMEOUT
    let timerId: ReturnType<typeof setTimeout>
    let isMounted = true

    const tick = async () => {
      if (!isMounted) return
      
      if (Date.now() >= deadline) {
        setPolling(false)
        setPollingMsg('Tempo limite atingido. Verifique o painel do Google ou tente novamente.')
        toast.error('A busca demorou demais para retornar resultados.')
        setTimeout(() => isMounted && setPollingMsg(null), 8000)
        return
      }

      try {
        const fresh = await fetchGoogleLeads()
        if (fresh.length > startCount) {
          setPolling(false)
          setPollingMsg(null)
          setVisibleCount(PAGE_SIZE) // reset pagination to show top
          toast.success(`${fresh.length - startCount} novo(s) lead(s) adicionado(s)!`)
          return
        }
      } catch (err) {
        console.error('Polling tick error:', err)
      }

      if (isMounted) {
        timerId = setTimeout(tick, POLL_INTERVAL)
      }
    }

    timerId = setTimeout(tick, POLL_INTERVAL)
    return () => {
      isMounted = false
      clearTimeout(timerId)
    }
  }, [polling, googleLeads.length, fetchGoogleLeads])

  const handleBuscar = async () => {
    if (!estado || !cidade || !nicho) return
    setLoading(true)
    try {
      const res = await fetch('/api/creator/crm/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, cidade, nicho }),
      })
      if (res.ok) {
        toast.success('Busca iniciada! Monitorando novos leads...')
        setPolling(true)
        setPollingMsg(null)
      } else {
        toast.error(`Erro ao iniciar busca (${res.status})`)
      }
    } catch {
      toast.error('Não foi possível conectar ao webhook')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search form */}
      <div className="card card-hover p-6 rounded-2xl space-y-5">
        <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-accent" />
          Buscar Leads no Google
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchableSelect
            label="Estado"
            value={estado}
            onChange={setEstado}
            options={ESTADOS}
            placeholder="Selecione o Estado"
            icon={MapPin}
          />
          <CitySelector uf={estado} value={cidade} onChange={setCidade} />
          <SearchableSelect
            label="Nicho de Mercado"
            value={nicho}
            onChange={setNicho}
            options={NICHOS}
            placeholder="Selecione o Nicho"
            icon={Briefcase}
          />
        </div>
        <button onClick={handleBuscar} disabled={loading || polling || !estado || !cidade || !nicho}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-wider disabled:opacity-40">
          {loading
            ? <><RefreshCw className="w-4 h-4 animate-spin" />Enviando...</>
            : polling
            ? <><RefreshCw className="w-4 h-4 animate-spin" />Monitorando novos leads...</>
            : <><Search className="w-4 h-4" />Buscar Leads no Google</>}
        </button>
        {pollingMsg && (
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 shrink-0" /> {pollingMsg}
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

      {/* Lead list */}
      <div className="card card-hover rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--text-muted)]" />
            <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">Últimos Leads Extraídos</h3>
          </div>
          {polling && <span className="text-[10px] text-accent flex items-center gap-1.5 font-black uppercase"><RefreshCw className="w-3 h-3 animate-spin" />Monitorando</span>}
        </div>

        <div className="divide-y divide-[var(--border-main)]">
          {sortedLeads.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">Nenhum lead extraído do Google Maps até o momento.</p>
          ) : (
            sortedLeads.slice(0, visibleCount).map((b, i) => (
              <div 
                key={b.id ?? i} 
                className="flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-primary)] transition-colors group"
              >
                <div className="flex items-center gap-3 flex-wrap min-w-0 flex-1">
                  <span className="text-sm font-semibold text-[var(--text-main)] truncate max-w-[160px] md:max-w-[260px]">{b.nome}</span>
                  <span className="text-[var(--text-support)]">•</span>
                  <span className="text-sm text-accent font-black tracking-tight whitespace-nowrap">{b.telefone || 'Sem número'}</span>
                  {b.email && <span className="text-[11px] text-[#64748B] font-medium truncate hidden sm:block">{b.email}</span>}
                  {b.cnpj && <span className="text-[10px] bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border-main)] text-[var(--text-muted)] font-mono">{b.cnpj}</span>}
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setSelectedContact(b)
                      setIsDetailOpen(true)
                    }}
                    title="Ver detalhes"
                    className="p-2 rounded-lg text-gray-500 hover:text-accent hover:bg-accent/10 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-end shrink-0 min-w-[80px]">
                    <span className="text-xs text-[var(--text-muted)] font-black uppercase tracking-wider">{b.status || 'lead'}</span>
                    <span className="text-[10px] text-[var(--text-support)] font-medium">
                      {(() => {
                        try {
                          const d = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
                          return isNaN(d.getTime()) ? '—' : format(d, "dd/MM/yy 'às' HH:mm")
                        } catch { return '—' }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ))

          )}
        </div>

        {/* Pagination footer */}
        {sortedLeads.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--border-main)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Exibindo {Math.min(visibleCount, sortedLeads.length)} de {sortedLeads.length} leads
            </span>
            {visibleCount < sortedLeads.length && (
              <button
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                className="text-[11px] font-black text-accent uppercase tracking-wider hover:underline transition-colors"
              >
                Ver mais leads →
              </button>
            )}
          </div>
        )}
      </div>
      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedContact && (
          <LeadDetailModal
            contact={selectedContact}
            readOnly={true}
            simpleMode={true}
            onClose={() => { setIsDetailOpen(false); setSelectedContact(null) }}
            onUpdate={async (updated) => {
              // Same basic update logic as CRM page
              try {
                const res = await fetch(`/api/creator/crm/${updated.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    status_funil: updated.status,
                    notas: updated.notas,
                    tags: updated.tags
                  })
                })
                if (res.ok) {
                  const data = await res.json()
                  const formatted = formatContact(data)
                  setGoogleLeads(prev => prev.map(l => l.id === formatted.id ? formatted : l))
                  setSelectedContact(formatted)
                }
              } catch (err) {
                console.error('Update err:', err)
              }
            }}
            onDelete={async (id) => {
              try {
                const res = await fetch(`/api/creator/crm/${id}`, { method: 'DELETE' })
                if (res.ok) {
                  setGoogleLeads(prev => prev.filter(l => l.id !== id))
                  toast.success('Lead excluído')
                }
              } catch (err) {
                console.error('Delete err:', err)
              }
            }}
          />
        )}
      </AnimatePresence>
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

  const estadosDisponiveis = useMemo(() => {
    if (!Array.isArray(leads)) return []
    return [...new Set(leads.map(l => l?.estado).filter(Boolean))] as string[]
  }, [leads])

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
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
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
            <SearchableSelect
              mini
              value={filterEstado}
              onChange={setFilterEstado}
              options={estadosDisponiveis}
              placeholder="Todos os Estados"
              icon={MapPin}
            />
            <SearchableSelect
              mini
              value={filterStatus}
              onChange={setFilterStatus}
              options={['ATIVA', 'INATIVA', 'SUSPENSA']}
              placeholder="Todos os Status"
              icon={Building2}
            />
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
