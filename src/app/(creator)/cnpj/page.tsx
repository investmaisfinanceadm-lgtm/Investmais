'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Search, Building2, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  AlertTriangle, UserPlus, Copy, Phone, Mail, MapPin, Calendar,
  Briefcase, DollarSign, Users, Clock, ChevronDown, Filter, Eye,
  Shield, Activity, Globe, Database, Target, Zap, Layers, Cpu,
  ExternalLink, BarChart2, Smartphone, Monitor, ArrowUpRight, Fingerprint,
  Save, Loader2, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { ptBR } from 'date-fns/locale'
import { useSession } from 'next-auth/react'

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SituacaoBadge({ situacao }: { situacao: string | null }) {
  if (!situacao) return <span className="px-4 py-1.5 rounded-full bg-white/5 text-white/20 text-[10px] font-bold uppercase tracking-widest border border-white/10">—</span>
  const map: Record<string, string> = { 
    ATIVA: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', 
    INATIVA: 'bg-red-500/10 text-red-500 border-red-500/20', 
    SUSPENSA: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
  }
  return <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", map[situacao] ?? 'bg-white/5 text-white/40 border-white/10')}>{situacao}</span>
}

function DataRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-all duration-300 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
        <p className="text-sm text-white font-bold truncate mt-1">{value}</p>
      </div>
      <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/20 hover:text-white transition-all shrink-0">
        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CNPJPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'google' | 'cnpj'>('google')
  const [selectedEstado, setSelectedEstado] = useState('')
  const [cidades, setCidades] = useState<string[]>([])
  const [loadingCidades, setLoadingCidades] = useState(false)
  const [cnpjInput, setCnpjInput] = useState('')
  const [errorState, setErrorState] = useState<'invalid' | 'notfound' | 'apierror' | 'ratelimit' | null>(null)
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [viewingSearch, setViewingSearch] = useState<any>(null)
  const [viewingLeads, setViewingLeads] = useState<any[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)

  const loadSearchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/creator/leads/history')
      const data = await res.json()
      setSearchHistory(data)
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const handleViewLeads = async (search: any) => {
    setViewingSearch(search)
    setLoadingLeads(true)
    try {
      const res = await fetch('/api/creator/crm')
      const allLeads = await res.json()
      // Filter by niche, city, state and ensure it's around the same time or Google Maps
      const filtered = allLeads.filter((l: any) => 
        l.nicho === search.nicho && 
        l.cidade === search.cidade && 
        l.estado === search.estado
      )
      setViewingLeads(filtered)
    } catch (err) {
      toast.error('Erro ao buscar leads do histórico')
    } finally {
      setLoadingLeads(false)
    }
  }

  const handleDeleteSearch = async (id: string) => {
    if (!confirm('Deseja excluir este registro do histórico?')) return
    try {
      const res = await fetch(`/api/creator/leads/history?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Histórico removido')
      loadSearchHistory()
    } catch (err) {
      toast.error('Erro ao remover histórico')
    }
  }

  useEffect(() => {
    if (activeTab === 'google') loadSearchHistory()
  }, [activeTab, loadSearchHistory])

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
      toast.success('Empresa localizada com sucesso')
    } catch { setErrorState('apierror') }
    finally { setIsLoading(false) }
  }

  useEffect(() => {
    if (!selectedEstado) {
      setCidades([])
      return
    }
    const loadCidades = async () => {
      setLoadingCidades(true)
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios`)
        const data = await res.json()
        const names = data.map((c: any) => c.nome).sort()
        setCidades(names)
      } catch (err) {
        toast.error('Erro ao carregar cidades')
      } finally {
        setLoadingCidades(false)
      }
    }
    loadCidades()
  }, [selectedEstado])

  return (
    <div className="min-h-screen bg-background text-white p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">Busca de Empresas</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Inteligência de Mercado</h1>
          <p className="text-white/40 text-sm">Consulte dados empresariais e prospecte novos leads</p>
        </div>

        <div className="flex bg-white/[0.03] border border-white/5 p-1.5 rounded-2xl shadow-xl">
          <button onClick={() => setActiveTab('google')} className={cn("px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2", activeTab === 'google' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white')}> <MapPin className="w-4 h-4" /> Google Maps </button>
          <button onClick={() => setActiveTab('cnpj')} className={cn("px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2", activeTab === 'cnpj' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white')}> <Building2 className="w-4 h-4" /> Consulta CNPJ </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'google' ? (
          <motion.div key="google" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden group shadow-xl">
                  <div className="flex items-center gap-6 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg"> <Globe className="w-6 h-6 text-blue-500" /> </div>
                      <div className="space-y-1">
                          <h2 className="text-base font-bold text-white uppercase tracking-widest">Busca Google Maps (N8N)</h2>
                          <p className="text-xs text-white/20">Extração de leads em massa via Webhook inteligente</p>
                      </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                       const formData = new FormData(e.currentTarget);
                       const nicho = formData.get('nicho') as string;
                       const cidade = formData.get('cidade') as string;
                       const estado = formData.get('estado') as string;

                       const webhookUrl = 'https://auto.devnetlife.com/webhook/investmais';

                       // 1. Gravar no histórico local
                       fetch('/api/creator/leads/history', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ nicho, cidade, estado })
                       }).then(() => loadSearchHistory());

                       // 2. Disparar Webhook
                       fetch(webhookUrl, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ 
                           estado, 
                           cidade, 
                           nicho, 
                           user_id: session?.user ? (session.user as any).id : 'f8e344d0-b985-44f2-b7c6-818285dd2b2f', 
                           acao: 'busca_leads_google' 
                         })
                       }).then(() => toast.success('Busca iniciada! Acompanhe no histórico abaixo.'))
                         .catch(() => toast.error('Erro ao conectar com N8N.'));
                     }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10"
                  >
                      <div className="relative group">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors z-10" />
                           <select 
                              name="estado" 
                              required 
                              value={selectedEstado}
                              onChange={e => setSelectedEstado(e.target.value)}
                              className="w-full h-16 bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all shadow-xl appearance-none cursor-pointer"
                            >
                              <option value="" disabled className="bg-[#0a0a0b]">Estado (UF)</option>
                              {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(uf => (
                                <option key={uf} value={uf} className="bg-[#0a0a0b]">{uf}</option>
                              ))}
                            </select>
                      </div>
                      <div className="relative group">
                           <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors z-10" />
                           <select 
                              name="cidade" 
                              required 
                              defaultValue=""
                              disabled={!selectedEstado || loadingCidades}
                              className="w-full h-16 bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all shadow-xl appearance-none cursor-pointer disabled:opacity-40"
                            >
                              <option value="" disabled className="bg-[#0a0a0b]">
                                {loadingCidades ? 'Carregando cidades...' : 'Cidade'}
                              </option>
                              {cidades.map(city => (
                                <option key={city} value={city} className="bg-[#0a0a0b]">{city}</option>
                              ))}
                            </select>
                      </div>
                      <div className="relative group">
                           <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
                           <select name="nicho" required defaultValue="" className="w-full h-16 bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all shadow-xl appearance-none cursor-pointer">
                             <option value="" disabled className="bg-[#0a0a0b]">Nicho / Atividade</option>
                             {['Academia / Fitness','Advocacia','Agência de Marketing','Arquitetura','Clínica Médica','Clínica Odontológica','Consultoria','Contabilidade','Corretora de Imóveis','Educação / Cursos','Estética / Beleza','Farmácia','Hotel / Pousada','Imobiliária','Loja de Roupas','Mecânica / Oficina','Nutrição','Ótica','Petshop','Psicologia','Restaurante / Alimentação','Seguros','Tecnologia / TI','Veterinária'].map(n => (
                               <option key={n} value={n} className="bg-[#0a0a0b]">{n}</option>
                             ))}
                           </select>
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 h-16 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 text-sm font-bold text-white transition-all group">
                          <Zap className="w-5 h-5 group-hover:scale-110 transition-all" />
                          Disparar Busca
                      </button>
                  </form>
              </div>

              {/* Histórico de Extração */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Histórico de Buscas</h3>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Registro de extrações solicitadas</p>
                    </div>
                  </div>
                  <button onClick={loadSearchHistory} className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/40 hover:text-white transition-all">
                    <RefreshCw className={cn("w-4 h-4", loadingHistory && "animate-spin")} />
                  </button>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                  {loadingHistory ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Sincronizando buscas...</p>
                    </div>
                  ) : searchHistory.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 text-white/10">
                      <Database className="w-12 h-12" />
                      <p className="text-xs font-bold uppercase tracking-widest text-center">Nenhuma busca realizada.<br/><span className="text-[10px] opacity-50">Inicie uma extração acima.</span></p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Estado</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Cidade</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Nicho</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {searchHistory.map((search) => (
                            <tr key={search.id} className="group hover:bg-white/[0.01] transition-all">
                              <td className="px-6 py-4 text-sm font-bold text-white">{search.estado}</td>
                              <td className="px-6 py-4 text-sm font-bold text-white">{search.cidade}</td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                                  {search.nicho}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  {search.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleViewLeads(search)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                    <Eye className="w-3.5 h-3.5" /> Ver Leads
                                  </button>
                                  <button onClick={() => handleDeleteSearch(search.id)} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
          </motion.div>
        ) : (
          <motion.div key="cnpj" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden group shadow-xl">
                  <div className="flex items-center gap-6 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg"> <Cpu className="w-6 h-6 text-primary" /> </div>
                      <div className="space-y-1">
                          <h2 className="text-base font-bold text-white uppercase tracking-widest">Consulta CNPJ</h2>
                          <p className="text-xs text-white/20">Recupere informações oficiais da Receita Federal</p>
                      </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 relative z-10">
                      <div className="relative flex-1 group">
                           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                           <input type="text" value={cnpjInput} onChange={e => setCnpjInput(maskCNPJ(e.target.value))} placeholder="00.000.000/0000-00" maxLength={18} className="w-full h-16 bg-black/40 border border-white/5 rounded-2xl pl-16 pr-6 text-xl font-bold text-white placeholder-white/5 tracking-widest outline-none focus:border-primary/50 transition-all shadow-xl" />
                      </div>
                      <button onClick={handleConsultar} disabled={isLoading || cnpjInput.length < 18} className="bg-primary hover:bg-primary/90 px-10 h-16 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-sm font-bold text-white transition-all group disabled:opacity-40">
                           {isLoading ? <Activity className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:scale-110 transition-all" />}
                           Consultar Agora
                      </button>
                  </div>

                  <AnimatePresence>
                      {errorState && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">
                              <AlertTriangle className="w-4 h-4" /> Erro na Consulta: {errorState === 'invalid' ? 'CNPJ Inválido' : 'Empresa não encontrada ou erro no servidor'}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>

              {result && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div className="bg-white/[0.03] rounded-3xl border border-white/5 overflow-hidden relative shadow-2xl">
                          <div className="p-10 border-b border-white/5 space-y-6 relative z-10 bg-white/[0.01]">
                              <div className="flex items-center justify-between gap-6 flex-wrap">
                                  <SituacaoBadge situacao={result.situacaoCadastral} />
                                  <div className="px-4 py-1.5 rounded-xl bg-black/40 border border-white/5">
                                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{result.cnpj}</span>
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <h2 className="text-3xl font-bold text-white tracking-tight">{result.razaoSocial}</h2>
                                  {result.nomeFantasia && <p className="text-lg font-bold text-primary">{result.nomeFantasia}</p>}
                              </div>
                          </div>

                          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                              <DataRow icon={Calendar} label="Data de Abertura" value={format(parseISO(result.dataAbertura), "dd 'de' MMM 'de' yyyy", { locale: ptBR })} />
                              <DataRow icon={Target} label={`Atividade Principal — ${result.cnaePrincipalCodigo}`} value={result.cnaePrincipalDescricao} />
                              <DataRow icon={DollarSign} label="Capital Social" value={result.capitalSocial} />
                              <DataRow icon={MapPin} label="Localização" value={`${result.municipio} — ${result.uf}`} />
                              <DataRow icon={Smartphone} label="Telefone" value={result.telefone} />
                              <DataRow icon={Mail} label="E-mail de Contato" value={result.email} />
                          </div>

                          <div className="p-10 pt-0 flex justify-end relative z-10">
                              <button onClick={() => toast.success('Lead salvo no CRM.')} className="bg-primary hover:bg-primary/90 px-8 py-4 rounded-xl text-white text-xs font-bold flex items-center gap-3 shadow-lg group transition-all">
                                  <Save className="w-5 h-5" /> Salvar Empresa no CRM
                              </button>
                          </div>
                      </div>
                  </motion.div>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Leads da Busca */}
      <AnimatePresence>
        {viewingSearch && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingSearch(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 lg:inset-20 z-[110] flex items-center justify-center pointer-events-none">
              <div className="w-full max-w-5xl h-full bg-[#0a0a0b] border border-white/10 rounded-3xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Leads: {viewingSearch.nicho}</h2>
                      <p className="text-xs text-white/20 uppercase tracking-widest font-bold">{viewingSearch.cidade} — {viewingSearch.estado}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingSearch(null)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                  {loadingLeads ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Carregando leads da base...</p>
                    </div>
                  ) : viewingLeads.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 opacity-20">
                      <Users className="w-20 h-20" />
                      <div className="text-center space-y-2">
                        <p className="text-lg font-bold uppercase tracking-widest">Nenhum lead encontrado ainda</p>
                        <p className="text-xs max-w-xs mx-auto">A extração pode levar alguns minutos para aparecer na base de dados após o disparo.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewingLeads.map(lead => (
                        <div key={lead.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group">
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-1">
                              <h4 className="font-bold text-white group-hover:text-primary transition-colors">{lead.empresa || lead.nome}</h4>
                              <p className="text-[10px] text-white/20 uppercase font-bold">{lead.nome}</p>
                            </div>
                            <button className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><Copy className="w-4 h-4" /></button>
                          </div>
                          <div className="space-y-3">
                            {lead.telefone && (
                              <div className="flex items-center gap-3 text-xs text-white/40">
                                <Phone className="w-4 h-4" /> {lead.telefone}
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-3 text-xs text-white/40">
                                <Mail className="w-4 h-4" /> {lead.email}
                              </div>
                            )}
                            {lead.endereco && (
                              <div className="flex items-center gap-3 text-xs text-white/40">
                                <MapPin className="w-4 h-4" /> {lead.endereco}
                              </div>
                            )}
                          </div>
                          <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                            <a href="/pipeline" className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 hover:underline">Ver no CRM <ExternalLink className="w-3.5 h-3.5" /></a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
