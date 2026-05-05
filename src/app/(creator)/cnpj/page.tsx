'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Search, Building2, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  AlertTriangle, UserPlus, Copy, Phone, Mail, MapPin, Calendar,
  Briefcase, DollarSign, Users, Clock, ChevronDown, Filter, Eye,
  Shield, Activity, Globe, Database, Target, Zap, Layers, Cpu,
  ExternalLink, BarChart2, Smartphone, Monitor, ArrowUpRight, Fingerprint
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SituacaoBadge({ situacao }: { situacao: string | null }) {
  if (!situacao) return <span className="px-4 py-1.5 rounded-full bg-white/5 text-white/20 text-[8px] font-black uppercase tracking-widest border border-white/10 italic">—</span>
  const map: Record<string, string> = { 
    ATIVA: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 netlife-glow shadow-none', 
    INATIVA: 'bg-red-500/10 text-red-500 border-red-500/20', 
    SUSPENSA: 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20' 
  }
  return <span className={cn("px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border italic", map[situacao] ?? 'bg-white/5 text-white/40 border-white/10')}>{situacao}</span>
}

function DataRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-start gap-6 p-8 rounded-[40px] bg-black border border-white/5 group hover:border-sidebar-primary/20 transition-all duration-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10 group-hover:text-sidebar-primary transition-all duration-700 shrink-0 shadow-2xl">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">{label}</p>
        <p className="text-[12px] text-white font-black uppercase tracking-widest truncate italic">{value}</p>
      </div>
      <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="opacity-0 group-hover:opacity-100 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/20 hover:text-white transition-all shrink-0">
        {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
      </button>
    </div>
  )
}

function SearchableSelect({ label, value, onChange, options, placeholder, icon: Icon, disabled, loading, mini }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    if (!Array.isArray(options)) return []
    if (!searchTerm) return options
    const normalizedSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return options.filter(o => String(o || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedSearch))
  }, [options, searchTerm])

  return (
    <div className={cn("relative", !mini && "space-y-4")}>
      {label && <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-6 italic">{label}</label>}
      <div onClick={() => !disabled && !loading && setIsOpen(!isOpen)} className={cn("w-full bg-black border border-white/5 px-10 py-6 rounded-[48px] flex items-center justify-between cursor-pointer group transition-all duration-700 italic", isOpen && "border-sidebar-primary/40 bg-black/60 shadow-[0_30px_60px_rgba(0,0,0,0.5)]")}>
        <div className="flex items-center gap-6 truncate flex-1 min-w-0">
          {!mini && Icon && <Icon className={cn("w-6 h-6 shrink-0 transition-all duration-700", value ? "text-sidebar-primary" : "text-white/10")} />}
          <span className={cn("truncate text-[12px] font-black uppercase tracking-widest", !value ? "text-white/20" : "text-white")}>{loading ? 'Synchronizing...' : value || placeholder}</span>
        </div>
        <ChevronDown className={cn("w-5 h-5 transition-all duration-700 text-white/10 group-hover:text-sidebar-primary", isOpen && "rotate-180 text-sidebar-primary")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center pt-32 px-4 sm:relative sm:inset-auto sm:p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[-1] sm:hidden" />
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className={cn("w-full nl-glass border border-white/10 rounded-[48px] shadow-[0_60px_120px_rgba(0,0,0,0.8)] overflow-hidden z-[130] sm:absolute sm:top-full sm:mt-6", mini ? "max-w-[300px] sm:right-0" : "max-w-xl sm:left-0 sm:right-0")}>
              <div className="p-6 border-b border-white/5 bg-white/[0.03]"><div className="relative group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-sidebar-primary transition-all duration-700" /><input autoFocus type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="SCAN NODES..." className="w-full bg-black/40 text-[10px] font-black uppercase tracking-[0.3em] px-14 py-4 rounded-[24px] border border-white/5 focus:outline-none focus:border-sidebar-primary/40 transition-all italic placeholder-white/5" /></div></div>
              <div className="max-h-[350px] overflow-y-auto scrollbar-none py-4">
                {filtered.map(o => (
                  <div key={o} onClick={() => { onChange(o); setIsOpen(false); setSearchTerm('') }} className={cn("px-10 py-5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-sidebar-primary/10 hover:text-sidebar-primary transition-all flex items-center justify-between group italic", value === o && "bg-sidebar-primary/10 text-sidebar-primary italic")}>
                    <span className="truncate">{o}</span>
                    {value === o && <div className="w-2 h-2 rounded-full bg-sidebar-primary netlife-glow shadow-none" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
      toast.success('Infiltration logic decrypted successfully.')
    } catch { setErrorState('apierror') }
    finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <div className="ambient-bg" />
      
      <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-16 pb-32">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/5 pb-16">
          <div className="space-y-6 flex-1 min-w-0">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-sidebar-primary/5 border border-sidebar-primary/20 backdrop-blur-3xl">
                <Globe className="w-4 h-4 text-sidebar-primary" />
                <span className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.5em] italic">Intelligence Hub Active</span>
            </div>
            <div className="space-y-4">
                <h1 className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tighter uppercase italic">Recon Matrix</h1>
                <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic flex items-center gap-4">
                    <Fingerprint className="w-4 h-4" /> B2B Corporate Infiltration Protocol v4.0.0
                </p>
            </div>
          </div>

          <div className="flex bg-white/[0.03] border border-white/5 p-2 rounded-[32px] shadow-2xl">
            <button onClick={() => setActiveTab('google')} className={cn("px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 italic flex items-center gap-4", activeTab === 'google' ? 'bg-sidebar-primary text-black netlife-glow shadow-none' : 'text-white/20 hover:text-white')}> <Search className="w-4 h-4" /> Maps Recon </button>
            <button onClick={() => setActiveTab('cnpj')} className={cn("px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 italic flex items-center gap-4", activeTab === 'cnpj' ? 'bg-sidebar-primary text-black netlife-glow shadow-none' : 'text-white/20 hover:text-white')}> <Building2 className="w-4 h-4" /> CNPJ Decode </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'google' ? (
            <motion.div key="google" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16">
                <div className="flex flex-col items-center justify-center py-48 nl-glass border-white/5 rounded-[64px] group border-dashed border-2">
                    <div className="w-24 h-24 rounded-[48px] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-1000 shadow-2xl">
                         <Target className="w-10 h-10 text-white/5 group-hover:text-sidebar-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-black text-white/20 uppercase tracking-[0.5em] italic">Initializing Maps Recon Flow</h3>
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] italic mt-4">Protocol stabilized for deep-sector asset extraction</p>
                </div>
            </motion.div>
          ) : (
            <motion.div key="cnpj" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16">
                <div className="nl-glass p-16 border-white/5 rounded-[64px] space-y-12 relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[2000ms]"> <Shield className="w-64 h-64 text-sidebar-primary" /> </div>
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-16 h-16 rounded-[28px] bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20 shadow-2xl"> <Cpu className="w-8 h-8 text-sidebar-primary" /> </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] italic">Direct Matrix Decoding</h2>
                            <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic">Institutional CNPJ Signal Retrieval</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                        <div className="relative flex-1 group">
                             <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-7 h-7 text-white/10 group-focus-within:text-sidebar-primary transition-all duration-700" />
                             <input type="text" value={cnpjInput} onChange={e => setCnpjInput(maskCNPJ(e.target.value))} placeholder="00.000.000/0000-00" maxLength={18} className="w-full h-24 bg-black border border-white/5 rounded-[48px] pl-24 pr-10 text-2xl font-black text-white placeholder-white/5 tracking-[0.4em] outline-none focus:border-sidebar-primary/40 transition-all italic duration-700 shadow-2xl" />
                        </div>
                        <button onClick={handleConsultar} disabled={isLoading || cnpjInput.length < 18} className="btn-primary px-16 h-24 netlife-glow shadow-none flex items-center justify-center gap-6 text-sm font-black uppercase tracking-[0.4em] italic transition-all duration-700 group">
                             {isLoading ? <Activity className="w-7 h-7 animate-spin" /> : <Zap className="w-7 h-7 group-hover:scale-110 transition-all" />}
                             Initialize Decode
                        </button>
                    </div>

                    <AnimatePresence>
                        {errorState && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6 p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] text-red-500 text-[10px] font-black uppercase tracking-widest italic">
                                <AlertTriangle className="w-6 h-6" /> Decryption Failure: {errorState === 'invalid' ? 'Checksum Mismatch' : 'Matrix Connection Error'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {result && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        <div className="nl-glass rounded-[80px] border-white/5 overflow-hidden relative shadow-[0_100px_200px_rgba(0,0,0,0.8)]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.05)_0%,transparent_80%)] opacity-30" />
                            <div className="p-16 border-b border-white/5 space-y-10 relative z-10">
                                <div className="flex items-center justify-between gap-10 flex-wrap">
                                    <SituacaoBadge situacao={result.situacaoCadastral} />
                                    <div className="px-8 py-3 rounded-2xl bg-black border border-white/5 shadow-2xl">
                                        <span className="text-xs font-black text-white/20 uppercase tracking-[0.4em] italic">{result.cnpj}</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h2 className="text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">{result.razaoSocial}</h2>
                                    {result.nomeFantasia && <p className="text-2xl font-black text-sidebar-primary uppercase tracking-[0.3em] italic">{result.nomeFantasia}</p>}
                                </div>
                            </div>

                            <div className="p-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
                                <DataRow icon={Calendar} label="Genesis Protocol (Opening)" value={format(parseISO(result.dataAbertura), "dd MMM yyyy")} />
                                <DataRow icon={Target} label={`Matrix Vector — ${result.cnaePrincipalCodigo}`} value={result.cnaePrincipalDescricao} />
                                <DataRow icon={DollarSign} label="Financial Capacity" value={result.capitalSocial} />
                                <DataRow icon={MapPin} label="Geospatial Hub" value={`${result.municipio} — ${result.uf}`} />
                                <DataRow icon={Smartphone} label="Direct Vector" value={result.telefone} />
                                <DataRow icon={Mail} label="Secure Handshake (E-mail)" value={result.email} />
                            </div>

                            <div className="p-16 pt-0 flex justify-end relative z-10">
                                <button onClick={() => toast.success('Node Secured in CRM Matrix.')} className="btn-primary px-12 py-7 netlife-glow shadow-none text-xs font-black uppercase tracking-[0.4em] italic flex items-center gap-6 group">
                                    <ArrowUpRight className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all" /> Secure Identity in Matrix
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
