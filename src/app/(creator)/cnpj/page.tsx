'use client'

import { useState, useCallback } from 'react'
import {
  Building2, Search, AlertCircle, CheckCircle2, XCircle,
  UserPlus, RefreshCw, MapPin, Phone, Mail, DollarSign,
  Calendar, Briefcase, Users, Clock, Eye, ChevronRight,
  Copy, ExternalLink, AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─────────────────────────────────────────────
// CNPJ Validation Algorithm
// ─────────────────────────────────────────────
function validarCNPJ(cnpj: string): boolean {
  const nums = cnpj.replace(/\D/g, '')
  if (nums.length !== 14) return false
  if (/^(\d)\1+$/.test(nums)) return false

  const calc = (len: number) => {
    let sum = 0
    let pos = len - 7
    for (let i = len; i >= 1; i--) {
      sum += parseInt(nums[len - i]) * pos--
      if (pos < 2) pos = 9
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }
  return calc(12) === parseInt(nums[12]) && calc(13) === parseInt(nums[13])
}

// ─────────────────────────────────────────────
// CNPJ Mask
// ─────────────────────────────────────────────
function maskCNPJ(value: string): string {
  const nums = value.replace(/\D/g, '').slice(0, 14)
  return nums
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type SituacaoCadastral = 'ATIVA' | 'INATIVA' | 'SUSPENSA'

interface Socio {
  nome: string
  qualificacao: string
  dataEntrada: string
}

interface CNPJResult {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  situacaoCadastral: SituacaoCadastral
  dataAbertura: string
  cnaePrincipalCodigo: string
  cnaePrincipalDescricao: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  telefone: string
  email: string
  capitalSocial: string
  socios: Socio[]
}

interface ConsultaHistorico {
  id: string
  cnpj: string
  razaoSocial: string
  situacao: SituacaoCadastral
  consultadoEm: string
}

// ─────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────
const MOCK_RESULT: CNPJResult = {
  cnpj: '18.236.120/0001-58',
  razaoSocial: 'NU PAGAMENTOS S.A.',
  nomeFantasia: 'Nubank',
  situacaoCadastral: 'ATIVA',
  dataAbertura: '2013-03-06',
  cnaePrincipalCodigo: '6499-3/01',
  cnaePrincipalDescricao: 'Caixas econômicas',
  logradouro: 'Rua Capote Valente',
  numero: '39',
  complemento: '4° andar',
  bairro: 'Pinheiros',
  municipio: 'São Paulo',
  uf: 'SP',
  cep: '05409-000',
  telefone: '(11) 4003-0099',
  email: 'contato@nubank.com.br',
  capitalSocial: 'R$ 4.800.000.000,00',
  socios: [
    { nome: 'DAVID VÉLEZ OSORNO', qualificacao: 'Sócio-Administrador', dataEntrada: '2013-03-06' },
    { nome: 'CRISTINA JUNQUEIRA', qualificacao: 'Diretora', dataEntrada: '2013-06-15' },
    { nome: 'EDWARD WIBLE', qualificacao: 'Sócio', dataEntrada: '2013-03-06' },
  ],
}

const MOCK_HISTORICO: ConsultaHistorico[] = [
  { id: '1', cnpj: '00.000.000/0001-91', razaoSocial: 'BANCO DO BRASIL S.A.', situacao: 'ATIVA', consultadoEm: '2026-03-29T10:45:00' },
  { id: '2', cnpj: '60.746.948/0001-12', razaoSocial: 'BANCO BRADESCO S.A.', situacao: 'ATIVA', consultadoEm: '2026-03-28T15:20:00' },
  { id: '3', cnpj: '33.000.167/0001-01', razaoSocial: 'PETROLEO BRASILEIRO S.A. - PETROBRAS', situacao: 'ATIVA', consultadoEm: '2026-03-27T09:10:00' },
]

// ─────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────
function SituacaoBadge({ situacao }: { situacao: SituacaoCadastral }) {
  const map: Record<SituacaoCadastral, { label: string; className: string; icon: React.ReactNode }> = {
    ATIVA: {
      label: 'ATIVA',
      className: 'badge-accent',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    INATIVA: {
      label: 'INATIVA',
      className: 'badge-red',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    SUSPENSA: {
      label: 'SUSPENSA',
      className: 'badge-gold',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
  }
  const { label, className, icon } = map[situacao]
  return (
    <span className={`badge ${className} gap-1.5 text-sm px-3 py-1`}>
      {icon}
      {label}
    </span>
  )
}

function DataRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-muted border border-dark-border group hover:border-accent/20 transition-colors">
      <div className="text-gray-500 mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-white font-medium mt-0.5 truncate">{value}</p>
      </div>
      <button onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all shrink-0"
        title="Copiar">
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function CNPJPage() {
  const [cnpjInput, setCnpjInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CNPJResult | null>(null)
  const [errorState, setErrorState] = useState<'invalid' | 'notfound' | 'apierror' | null>(null)
  const [historico, setHistorico] = useState<ConsultaHistorico[]>(MOCK_HISTORICO)
  const [importFeedback, setImportFeedback] = useState(false)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpjInput(maskCNPJ(e.target.value))
    setErrorState(null)
    setResult(null)
  }, [])

  const handleConsultar = async () => {
    if (!validarCNPJ(cnpjInput)) {
      setErrorState('invalid')
      setResult(null)
      return
    }

    setIsLoading(true)
    setErrorState(null)
    setResult(null)

    try {
      const res = await fetch(`/api/cnpj/consultar?cnpj=${cnpjInput.replace(/\D/g, '')}`)
      const json = await res.json()

      if (!res.ok) {
        setErrorState(json.error === 'notfound' ? 'notfound' : 'apierror')
        return
      }

      setResult(json)

      const newEntry: ConsultaHistorico = {
        id: String(Date.now()),
        cnpj: json.cnpj,
        razaoSocial: json.razaoSocial,
        situacao: json.situacaoCadastral,
        consultadoEm: new Date().toISOString(),
      }
      setHistorico(prev => [newEntry, ...prev].slice(0, 10))
    } catch {
      setErrorState('apierror')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConsultar()
  }

  const handleNuevaConsulta = () => {
    setResult(null)
    setErrorState(null)
    setCnpjInput('')
  }

  const handleImportCRM = async () => {
    if (!result) return
    try {
      const res = await fetch('/api/cnpj/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
      if (res.ok) {
        setImportFeedback(true)
        setTimeout(() => setImportFeedback(false), 3000)
      }
    } catch {
      // silently ignore
    }
  }

  const handleHistoricoConsultar = (cnpj: string) => {
    setCnpjInput(cnpj)
    setResult(null)
    setErrorState(null)
  }

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-6xl mx-auto animate-fade-in pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Building2 className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Receita Federal</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
            Consulta CNPJ
          </h1>
          <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px]">
            Pesquise e importe dados empresariais para o CRM
          </p>
        </div>
      </div>

      {/* ── Search Card ── */}
      <div className="card-hover p-8 rounded-[2rem] flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-accent">
          <Building2 className="w-7 h-7 text-accent" />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-black text-white tracking-tight">Consultar Empresa</h2>
          <p className="text-gray-400 text-sm mt-1">Insira o CNPJ da empresa para buscar os dados cadastrais</p>
        </div>

        {/* Input + Button */}
        <div className="w-full space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={cnpjInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className={`input-field pl-11 text-center text-lg tracking-[0.15em] font-mono ${errorState === 'invalid' ? 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20' : ''}`}
            />
          </div>

          {/* Error: Invalid format */}
          <AnimatePresence>
            {errorState === 'invalid' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>CNPJ inválido. Verifique os dígitos e tente novamente.</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleConsultar}
            disabled={isLoading || cnpjInput.replace(/\D/g, '').length < 14}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Consultar
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Loading Skeleton ── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card p-8 rounded-2xl space-y-6">
            <div className="shimmer h-8 w-48 rounded-xl" />
            <div className="shimmer h-10 w-72 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shimmer h-16 rounded-xl" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error States ── */}
      <AnimatePresence>
        {errorState === 'notfound' && !isLoading && (
          <motion.div
            key="notfound"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card-hover flex flex-col items-center py-16 text-center gap-4 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Empresa não encontrada</h3>
              <p className="text-gray-400 text-sm mt-1">O CNPJ informado não consta nos registros da Receita Federal.</p>
            </div>
            <button onClick={handleNuevaConsulta} className="btn-secondary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Nova Consulta
            </button>
          </motion.div>
        )}

        {errorState === 'apierror' && !isLoading && (
          <motion.div
            key="apierror"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">Serviço temporariamente indisponível</p>
              <p className="text-xs text-yellow-400/70 mt-1">A API da Receita Federal está indisponível no momento. Tente novamente em alguns instantes.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result Card ── */}
      <AnimatePresence>
        {result && !isLoading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="space-y-6">

            {/* Import success feedback */}
            <AnimatePresence>
              {importFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <p className="text-sm text-accent font-semibold">
                    <strong>{result.razaoSocial}</strong> importada com sucesso para o CRM!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="card-hover rounded-2xl overflow-hidden">
              {/* Card Header */}
              <div className="p-8 border-b border-dark-border space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <SituacaoBadge situacao={result.situacaoCadastral} />
                  <span className="text-xs text-gray-500 font-mono">{result.cnpj}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight leading-tight">{result.razaoSocial}</h2>
                  {result.nomeFantasia && result.nomeFantasia !== result.razaoSocial && (
                    <p className="text-accent font-semibold text-lg mt-1">{result.nomeFantasia}</p>
                  )}
                </div>
              </div>

              {/* Data Grid */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DataRow
                    icon={<Building2 className="w-4 h-4" />}
                    label="CNPJ"
                    value={result.cnpj}
                  />
                  <DataRow
                    icon={<Calendar className="w-4 h-4" />}
                    label="Data de Abertura"
                    value={format(parseISO(result.dataAbertura), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  />
                  <DataRow
                    icon={<Briefcase className="w-4 h-4" />}
                    label={`CNAE Principal — ${result.cnaePrincipalCodigo}`}
                    value={result.cnaePrincipalDescricao}
                  />
                  <DataRow
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Capital Social"
                    value={result.capitalSocial}
                  />
                  <DataRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Endereço"
                    value={`${result.logradouro}, ${result.numero}${result.complemento ? ` — ${result.complemento}` : ''}, ${result.bairro}`}
                  />
                  <DataRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Cidade / CEP"
                    value={`${result.municipio} — ${result.uf} · CEP ${result.cep}`}
                  />
                  <DataRow
                    icon={<Phone className="w-4 h-4" />}
                    label="Telefone"
                    value={result.telefone}
                  />
                  <DataRow
                    icon={<Mail className="w-4 h-4" />}
                    label="E-mail"
                    value={result.email}
                  />
                </div>

                {/* Quadro Societário */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Quadro Societário
                  </h3>
                  <div className="space-y-2">
                    {result.socios.map((s, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-dark-muted border border-dark-border hover:border-accent/20 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                          <span className="text-accent text-xs font-black">{s.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{s.nome}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{s.qualificacao}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Desde</p>
                          <p className="text-xs text-gray-300 font-medium">
                            {format(parseISO(s.dataEntrada), 'MM/yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleImportCRM}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm">
                    <UserPlus className="w-4 h-4" />
                    Importar para CRM
                  </button>
                  <button
                    onClick={handleNuevaConsulta}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 font-semibold">
                    <RefreshCw className="w-4 h-4" />
                    Nova Consulta
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recent History ── */}
      {historico.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Consultas Recentes
            </h2>
            <span className="text-xs text-gray-500">{historico.length} consulta{historico.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="card-hover overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="table-header">CNPJ</th>
                    <th className="table-header">Razão Social</th>
                    <th className="table-header text-center">Situação</th>
                    <th className="table-header">Consultado em</th>
                    <th className="table-header text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h) => (
                    <tr key={h.id} className="table-row">
                      <td className="table-cell font-mono text-xs text-gray-400">{h.cnpj}</td>
                      <td className="table-cell font-medium text-white max-w-xs truncate">{h.razaoSocial}</td>
                      <td className="table-cell text-center">
                        <SituacaoBadge situacao={h.situacao} />
                      </td>
                      <td className="table-cell text-gray-400 text-xs">
                        {format(parseISO(h.consultadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </td>
                      <td className="table-cell text-center">
                        <button
                          onClick={() => handleHistoricoConsultar(h.cnpj)}
                          title="Consultar novamente"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors">
                          <Eye className="w-3 h-3" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
