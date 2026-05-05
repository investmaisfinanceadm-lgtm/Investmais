'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Search, Building2, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  AlertTriangle, UserPlus, Copy, Phone, Mail, MapPin, Calendar,
  Briefcase, DollarSign, Users, Clock, ChevronDown, Filter, Eye,
  Shield, Activity, Globe, Database, Target, Zap, Layers, Cpu,
  ExternalLink, BarChart2, Smartphone, Monitor, ArrowUpRight, Fingerprint,
  Save
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
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
  const [activeTab, setActiveTab] = useState<'google' | 'cnpj'>('google')
  const [cnpjInput, setCnpjInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CNPJResult | null>(null)
  const [errorState, setErrorState] = useState<'invalid' | 'notfound' | 'apierror' | 'ratelimit' | null>(null)

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

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10">
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
              <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-3xl group hover:border-primary/20 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                       <Target className="w-8 h-8 text-white/10 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-white/20 uppercase tracking-widest">Busca Google Maps em Breve</h3>
                  <p className="text-xs text-white/10 mt-2">Extração inteligente de leads baseada em geolocalização</p>
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
    </div>
  )
}
