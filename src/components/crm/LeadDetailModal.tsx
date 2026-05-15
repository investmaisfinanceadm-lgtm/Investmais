'use client'

import React, { useState } from 'react'
import {
  X, Mail, Phone, Building2, Briefcase, MessageSquare,
  MapPin, Globe, Tag, ExternalLink, Copy, MessageCircle,
  ChevronRight, Trash2, Clock, CheckCircle2, Circle, FileText,
  Calendar, Users, Shield, Hash, Activity, Target, Zap, Cpu,
  Fingerprint, Lock, Share2, Eye, Maximize, Database, Send, Plus, ArrowUpRight, Layers
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Canal = 'WhatsApp' | 'Site' | 'Indicação' | 'Google' | 'Instagram' | 'LinkedIn'
export type FunilStatus = 'lead' | 'qualificado' | 'reuniao' | 'proposta' | 'cliente' | 'inativo'
export type ActivityType = 'phone' | 'email' | 'message' | 'meeting' | 'note'

export interface ContactActivity {
  id: string
  type: ActivityType
  description: string
  date: Date
}

export interface Contact {
  id: string
  nome: string
  email: string
  telefone: string
  empresa: string
  cargo: string
  canal: Canal
  status: FunilStatus
  tags: string[]
  notas: string
  cidade: string
  estado: string
  endereco: string
  site: string
  nicho: string
  createdAt: Date
  lastActivity: Date
  activities: ContactActivity[]
  cnpj?: string
}

const FUNIL_STAGES: { key: FunilStatus; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'qualificado', label: 'Qualificado' },
  { key: 'reuniao', label: 'Reunião' },
  { key: 'proposta', label: 'Proposta' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'inativo', label: 'Inativo' },
]

// ─── Shared Utilities ─────────────────────────────────────────────────────────

export function safeFormat(date: Date | string | null | undefined, fmt: string): string {
  try {
    if (!date) return '—'
    const d = date instanceof Date ? date : new Date(date)
    return format(d, fmt, { locale: ptBR })
  } catch { return '—' }
}

export function safeDistance(date: Date | string | null | undefined): string {
  try {
    if (!date) return '—'
    const d = date instanceof Date ? date : new Date(date)
    return formatDistanceToNow(d, { locale: ptBR, addSuffix: true })
  } catch { return '—' }
}

export function ContactAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
  
  const sizes = {
    sm: 'w-10 h-10 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-20 h-20 text-xl'
  }

  return (
    <div className={cn("rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold", sizes[size])}>
        {initials}
    </div>
  )
}

export function getStatusConfig(status: FunilStatus | undefined | null) {
  switch (status) {
    case 'lead': return { label: 'Lead', classes: 'bg-white/5 text-white/40 border-white/10' }
    case 'qualificado': return { label: 'Qualificado', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
    case 'reuniao': return { label: 'Reunião', classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
    case 'proposta': return { label: 'Proposta', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
    case 'cliente': return { label: 'Cliente', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    case 'inativo': return { label: 'Inativo', classes: 'bg-red-500/10 text-red-500 border-red-500/20' }
    default: return { label: 'Sincronizando', classes: 'bg-primary/10 text-primary border-primary/20' }
  }
}

export function getCanalIcon(canal: Canal | undefined | null) {
  switch (canal) {
    case 'WhatsApp': return <MessageCircle className="w-4 h-4" />
    case 'Google': return <Globe className="w-4 h-4" />
    case 'Instagram': return <MessageSquare className="w-4 h-4" />
    case 'LinkedIn': return <Linkedin className="w-4 h-4" />
    default: return <Globe className="w-4 h-4" />
  }
}

function Linkedin(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
  )
}

function getActivityColor(type: ActivityType) {
  switch (type) {
    case 'phone': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    case 'email': return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    case 'message': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    case 'meeting': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    case 'note': return 'text-white/40 bg-white/5 border-white/10'
  }
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'phone': return <Phone className="w-4 h-4" />
    case 'email': return <Mail className="w-4 h-4" />
    case 'message': return <MessageCircle className="w-4 h-4" />
    case 'meeting': return <Calendar className="w-4 h-4" />
    case 'note': return <FileText className="w-4 h-4" />
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary/60">{icon}</div>}
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none">{title}</h3>
      </div>
      <div className="h-px bg-white/5 w-full" />
    </div>
  )
}

function DetailField({ icon, label, value, children }: { icon: React.ReactNode; label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="pl-6">
        {children ? children : (
          <span className={cn("text-sm font-bold block truncate", !value || value === "—" || value === "Não informado" ? "text-white/10 font-normal italic" : "text-white/80")}>
            {value || 'Não informado'}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LeadDetailModal({
  contact,
  onClose,
  onUpdate,
  onDelete,
  readOnly = false,
  simpleMode = false
}: {
  contact: Contact
  onClose: () => void
  onUpdate?: (updated: Contact) => void
  onDelete?: (id: string) => void
  readOnly?: boolean
  simpleMode?: boolean
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'matrix'>('overview')
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [activityDesc, setActivityDesc] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('note')
  const [showCopyTooltip, setShowCopyTooltip] = useState(false)

  const statusConfig = getStatusConfig(contact.status)

  function updateStatus(newStatus: FunilStatus) {
    if (readOnly || !onUpdate) return
    onUpdate({ ...contact, status: newStatus, lastActivity: new Date() })
  }

  function addActivity() {
    if (!activityDesc.trim()) return
    const newActivity: ContactActivity = {
      id: 'new-' + Date.now(),
      type: activityType,
      description: activityDesc,
      date: new Date(),
    }
    const updated: Contact = {
      ...contact,
      activities: [newActivity, ...contact.activities],
      lastActivity: new Date(),
    }
    if (!onUpdate) return
    onUpdate(updated)
    setActivityDesc('')
    setIsAddingActivity(false)
    toast.success('Atividade registrada')
  }

  const handleCopyPhone = (phone: string) => {
    const clean = phone.replace(/[^\d]/g, '')
    navigator.clipboard.writeText(clean)
    setShowCopyTooltip(true)
    setTimeout(() => setShowCopyTooltip(false), 2000)
  }

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const link = `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}`
    window.open(link, '_blank')
  }

  const isUndefined = (v: string | undefined | null) => !v || v === 'undefined' || v === 'null' || v.trim() === ''

  const formatAddress = () => {
    const parts = []
    if (!isUndefined(contact.endereco)) parts.push(contact.endereco)
    if (!isUndefined(contact.cidade))   parts.push(contact.cidade)
    if (!isUndefined(contact.estado))   parts.push(contact.estado)
    if (parts.length > 0) return parts.join(', ')
    return null
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-full max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 lg:p-12 border-b border-white/5 bg-white/[0.01]">
           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                  <ContactAvatar name={contact.nome} size="lg" />
                  <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <span className={cn('px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border', statusConfig.classes)}>
                           {statusConfig.label}
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/5">
                           {getCanalIcon(contact.canal)} 
                           <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{contact.canal}</span>
                        </div>
                     </div>
                     <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                       {contact.nome}
                     </h2>
                     <div className="flex items-center gap-6 text-white/40 text-xs font-medium">
                        <div className="flex items-center gap-2">
                           <Building2 className="w-4 h-4" />
                           <span>{contact.empresa || 'Individual'}</span>
                        </div>
                        {contact.cargo && (
                          <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              <span>{contact.cargo}</span>
                          </div>
                        )}
                     </div>
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  {!simpleMode && !readOnly && onDelete && (
                    <button onClick={() => { onDelete(contact.id); onClose() }} className="w-12 h-12 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 transition-all flex items-center justify-center"> 
                      <Trash2 className="w-5 h-5" /> 
                    </button>
                  )}
                  <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white transition-all flex items-center justify-center"> 
                    <X className="w-6 h-6" /> 
                  </button>
               </div>
           </div>

           {/* Tabs */}
           {!simpleMode && !readOnly && (
             <div className="flex gap-2 mt-10 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
                {[
                  { id: 'overview', label: 'Visão Geral', icon: <Target className="w-4 h-4" /> },
                  { id: 'activities', label: 'Atividades', icon: <Activity className="w-4 h-4" /> },
                  { id: 'matrix', label: 'Dados Técnicos', icon: <Cpu className="w-4 h-4" /> }
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn('px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3', activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-white/20 hover:text-white/40')}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
             </div>
           )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-8 lg:p-12 scrollbar-thin">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="visao" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-16">
                {/* Status Pipeline */}
                {!simpleMode && !readOnly && (
                   <div className="space-y-6">
                      <SectionTitle title="Estágio no Funil" icon={<Layers className="w-4 h-4" />} />
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                         {FUNIL_STAGES.map((s, idx) => {
                            const currentIdx = FUNIL_STAGES.findIndex(fs => fs.key === contact.status)
                            const isPast = idx < currentIdx
                            const isActive = idx === currentIdx
                            return (
                               <button key={s.key} onClick={() => updateStatus(s.key)} className={cn("py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all", isActive ? "bg-primary text-white border-primary shadow-lg" : isPast ? "bg-primary/10 text-primary border-primary/20" : "bg-white/[0.02] text-white/10 border-white/5 hover:border-white/10 hover:text-white/20")}>
                                  {s.label}
                               </button>
                            )
                         })}
                      </div>
                   </div>
                 )}

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <SectionTitle title="Contatos" icon={<Zap className="w-4 h-4" />} />
                        <div className="grid gap-8">
                            <DetailField icon={<Phone className="w-4 h-4" />} label="Telefone / WhatsApp">
                               <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-white/90">{contact.telefone || 'Não informado'}</span>
                                  {contact.telefone && (
                                     <div className="flex items-center gap-3">
                                        <button onClick={() => handleCopyPhone(contact.telefone)} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/40 text-white/20 hover:text-primary transition-all flex items-center justify-center relative">
                                           <Copy className="w-4 h-4" />
                                           <AnimatePresence> {showCopyTooltip && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-lg whitespace-nowrap">Copiado</motion.span>} </AnimatePresence>
                                        </button>
                                        <button onClick={() => handleWhatsApp(contact.telefone)} className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center justify-center">
                                           <MessageCircle className="w-5 h-5" />
                                        </button>
                                     </div>
                                  )}
                               </div>
                            </DetailField>
                            <DetailField icon={<Mail className="w-4 h-4" />} label="E-mail" value={contact.email} />
                            <DetailField icon={<Briefcase className="w-4 h-4" />} label="Cargo" value={contact.cargo} />
                        </div>
                    </div>
                    <div className="space-y-8">
                        <SectionTitle title="Localização e Empresa" icon={<Building2 className="w-4 h-4" />} />
                        <div className="grid gap-8">
                            <DetailField icon={<Building2 className="w-4 h-4" />} label="Empresa" value={contact.empresa} />
                            <DetailField icon={<MapPin className="w-4 h-4" />} label="Endereço">
                                <span className={cn("text-sm font-bold block", !formatAddress() ? "text-white/5 italic" : "text-white/60")}>
                                   {formatAddress() || 'Não informado'}
                                </span>
                            </DetailField>
                            <DetailField icon={<Globe className="w-4 h-4" />} label="Site / URL">
                                {contact.site ? (
                                   <a href={contact.site.startsWith('http') ? contact.site : `https://${contact.site}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold text-sm flex items-center gap-2 group transition-all">
                                      {contact.site} <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                   </a>
                                ) : <span className="text-white/5 font-bold text-sm italic">Não informado</span>}
                            </DetailField>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 space-y-4">
                  <SectionTitle title="Notas e Observações" icon={<FileText className="w-4 h-4" />} />
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                     {contact.notas || 'Nenhuma nota registrada para este contato.'}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div key="atividades" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                   <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Histórico de Interações</h4>
                   <button onClick={() => setIsAddingActivity(!isAddingActivity)} className="bg-white/[0.05] hover:bg-white/[0.1] px-6 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all">
                      <Plus className="w-4 h-4" /> {isAddingActivity ? 'Cancelar' : 'Nova Atividade'}
                   </button>
                </div>

                <AnimatePresence>
                  {isAddingActivity && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/[0.03] rounded-3xl p-8 border border-white/10 space-y-8 overflow-hidden">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                          {(['phone', 'email', 'message', 'meeting', 'note'] as ActivityType[]).map((t) => (
                            <button key={t} onClick={() => setActivityType(t)} className={cn('py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-3 border transition-all', activityType === t ? getActivityColor(t) + ' border-opacity-40 shadow-lg' : 'border-white/5 text-white/10 hover:border-white/10')}>
                              {getActivityIcon(t)}
                              {t}
                            </button>
                          ))}
                        </div>
                        <textarea className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-primary/50 transition-all resize-none placeholder-white/5" rows={3} placeholder="Descreva o que aconteceu..." value={activityDesc} onChange={(e) => setActivityDesc(e.target.value)} />
                        <div className="flex gap-4">
                          <button onClick={() => setIsAddingActivity(false)} className="flex-1 py-3 rounded-xl bg-white/[0.02] text-xs font-bold text-white/20 hover:text-white transition-all">Descartar</button>
                          <button onClick={addActivity} className="flex-1 py-3 rounded-xl bg-primary text-xs font-bold text-white shadow-lg">Salvar Atividade</button>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative pl-10 space-y-10">
                   <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/5" />
                   {contact.activities.length === 0 ? (
                      <div className="text-center py-20 opacity-10 space-y-4">
                         <Activity className="w-10 h-10 mx-auto" />
                         <p className="text-xs font-bold uppercase tracking-widest">Nenhuma atividade registrada</p>
                      </div>
                   ) : contact.activities.map((activity) => (
                      <div key={activity.id} className="relative group">
                         <div className={cn('absolute -left-[31px] top-1 w-6 h-6 rounded-lg flex items-center justify-center border border-black z-10', getActivityColor(activity.type))}>
                            {getActivityIcon(activity.type)}
                         </div>
                         <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 hover:bg-white/[0.04] transition-all">
                            <p className="text-sm text-white/80 leading-relaxed mb-4">{activity.description}</p>
                            <div className="flex items-center justify-between text-[10px] font-bold text-white/20 uppercase tracking-wider">
                               <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{safeFormat(activity.date, "dd MMM yyyy · HH:mm")}</span>
                                </div>
                                <span>{activity.type}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'matrix' && (
              <motion.div key="matrix" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                       {contact.cnpj ? (
                          <div className="bg-white/[0.03] p-10 rounded-[40px] border border-white/5 space-y-10 shadow-xl">
                             <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                   <Building2 className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                   <h4 className="text-2xl font-bold text-white tracking-tight">{contact.empresa}</h4>
                                   <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold">
                                      <Fingerprint className="w-4 h-4 opacity-50" />
                                      <span>{contact.cnpj}</span>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Cidade / Estado</p>
                                   <div className="flex items-center gap-3">
                                      <MapPin className="w-4 h-4 text-primary" />
                                      <p className="text-sm font-bold text-white/80">{contact.cidade || 'Não inf.'} / {contact.estado || '--'}</p>
                                   </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Nicho de Atuação</p>
                                   <div className="flex items-center gap-3">
                                      <Target className="w-4 h-4 text-primary" />
                                      <p className="text-sm font-bold text-white/80">{contact.nicho || 'Não inf.'}</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       ) : (
                          <div className="py-32 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-6 opacity-20">
                             <Shield className="w-12 h-12" />
                             <div className="text-center">
                                <p className="text-sm font-bold uppercase tracking-widest">Sem vínculo com CNPJ</p>
                                <p className="text-xs">Realize uma busca de leads para obter dados completos.</p>
                             </div>
                          </div>
                       )}
                    </div>
                    
                    <div className="bg-white/[0.03] rounded-[40px] p-8 border border-white/5 space-y-8">
                       <SectionTitle title="Segurança do Sistema" icon={<Lock className="w-4 h-4" />} />
                       <div className="space-y-6">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">DB Sync Active</p>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-primary" />
                             <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Cloud Relay Stable</p>
                          </div>
                          <div className="pt-6 border-t border-white/5">
                             <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest mb-2">Hash de Referência</p>
                             <p className="text-[10px] font-mono text-white/10 break-all">{contact.id.repeat(2)}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 lg:px-12 py-6 bg-white/[0.01] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Última Atividade: {safeDistance(contact.lastActivity)}</span>
                </div>
                <div className="w-px h-4 bg-white/5" />
                <span>ID: {contact.id}</span>
           </div>
           <div className="text-primary/20 text-[10px] font-bold uppercase tracking-widest">Investmais CRM v4.0.0</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

