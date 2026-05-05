'use client'

import React, { useState } from 'react'
import { 
  X, Mail, Phone, Building2, Briefcase, MessageSquare, 
  MapPin, Globe, Tag, ExternalLink, Copy, MessageCircle,
  ChevronRight, Trash2, Clock, CheckCircle2, Circle, FileText,
  Calendar, Users, Shield, Hash, Activity, Target, Zap, Cpu,
  Fingerprint, Lock, Share2, Eye, Maximize, Database, Send, Plus
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
  { key: 'lead', label: 'Lead Infiltration' },
  { key: 'qualificado', label: 'Neural Qualification' },
  { key: 'reuniao', label: 'Executive Meeting' },
  { key: 'proposta', label: 'Proposal Protocol' },
  { key: 'cliente', label: 'Converted Entity' },
  { key: 'inativo', label: 'Deactivated Sector' },
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

export function ContactAvatar({ contact, size = 'md' }: { contact: Contact; size?: 'sm' | 'md' | 'lg' }) {
  const initials = contact.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
  
  const sizes = {
    sm: 'w-10 h-10 text-[10px]',
    md: 'w-16 h-16 text-xs',
    lg: 'w-24 h-24 text-2xl'
  }

  return (
    <div className={cn("rounded-[24px] netlife-gradient p-[1px] group-hover:scale-105 transition-all duration-1000 shadow-2xl", sizes[size])}>
      <div className="w-full h-full rounded-[23px] bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-sidebar-primary/5" />
        <span className="font-black text-sidebar-primary uppercase tracking-tighter relative z-10 italic">{initials}</span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      </div>
    </div>
  )
}

export function getStatusConfig(status: FunilStatus | undefined | null) {
  switch (status) {
    case 'lead': return { label: 'Infiltration', classes: 'bg-white/5 text-white/40 border-white/10' }
    case 'qualificado': return { label: 'Qualified', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20 netlife-glow shadow-none' }
    case 'reuniao': return { label: 'Meeting', classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20 netlife-glow shadow-none' }
    case 'proposta': return { label: 'Proposal', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20 netlife-glow shadow-none' }
    case 'cliente': return { label: 'Client', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 netlife-glow shadow-none' }
    case 'inativo': return { label: 'Inactive', classes: 'bg-red-500/10 text-red-500 border-red-500/20' }
    default: return { label: 'Syncing', classes: 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20' }
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
    <div className="flex flex-col gap-4 mb-10">
      <div className="flex items-center gap-4">
        {icon && <div className="text-sidebar-primary/40">{icon}</div>}
        <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">{title}</h3>
      </div>
      <div className="h-px bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-transparent w-full" />
    </div>
  )
}

function DetailField({ icon, label, value, children }: { icon: React.ReactNode; label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-3 group/field">
      <div className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic group-hover/field:text-sidebar-primary/40 transition-all duration-700">
        {icon}
        {label}
      </div>
      <div className="pl-9">
        {children ? children : (
          <span className={cn("text-sm font-black uppercase tracking-widest block truncate italic", !value || value === "—" || value === "Não informado" ? "text-white/5 font-medium italic" : "text-white/80 group-hover/field:text-sidebar-primary transition-colors duration-700")}>
            {value || 'Not Defined'}
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
    toast.success('Activity Logged')
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 lg:p-20 overflow-hidden">
      <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 50 }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="relative w-full sm:max-w-7xl bg-black border border-white/5 rounded-t-[64px] sm:rounded-[80px] shadow-[0_100px_200px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-full max-h-[92vh] outline-none group/modal"
      >
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-sidebar-primary/[0.08] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover/modal:scale-110 transition-transform duration-[5000ms]"> <Shield className="w-96 h-96 text-sidebar-primary" /> </div>

        {/* Modal Header */}
        <div className="p-16 lg:px-20 lg:py-20 border-b border-white/5 relative z-10">
           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
              <div className="flex items-center gap-12">
                  <ContactAvatar contact={contact} size="lg" />

                 <div className="space-y-6">
                    <div className="flex items-center gap-6">
                       <span className={cn('px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border italic transition-all duration-700', statusConfig.classes)}>
                          {statusConfig.label}
                       </span>
                       <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                       <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white/[0.02] border border-white/5">
                          {getCanalIcon(contact.canal)} 
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">{contact.canal}</span>
                       </div>
                    </div>

                    <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none uppercase italic">
                      {readOnly && contact.empresa ? contact.empresa : contact.nome}
                    </h2>

                    <div className="flex items-center gap-8 text-white/40 text-[12px] font-black uppercase tracking-[0.3em] italic">
                       <div className="flex items-center gap-4 group/item">
                          <Building2 className="w-5 h-5 text-sidebar-primary/20 group-hover/item:text-sidebar-primary transition-colors" />
                          <span className="group-hover/item:text-white transition-colors">{(readOnly && contact.empresa) ? contact.nome : contact.empresa}</span>
                       </div>
                       {contact.cargo && (
                         <>
                           <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                           <div className="flex items-center gap-4 group/item">
                              <Briefcase className="w-5 h-5 text-sidebar-primary/20 group-hover/item:text-sidebar-primary transition-colors" />
                              <span className="group-hover/item:text-white transition-colors">{contact.cargo}</span>
                           </div>
                         </>
                       )}
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-6 self-end lg:self-center">
                  {!simpleMode && !readOnly && onDelete && (
                    <button onClick={() => { onDelete(contact.id); onClose() }} className="w-16 h-16 rounded-[28px] bg-red-500/5 border border-red-500/10 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all duration-700 flex items-center justify-center group/del"> 
                      <Trash2 className="w-7 h-7 group-hover/del:scale-110 transition-transform" /> 
                    </button>
                  )}
                  <button onClick={onClose} className="w-16 h-16 rounded-[28px] bg-white/[0.03] border border-white/5 text-white/10 hover:text-white transition-all duration-700 flex items-center justify-center"> 
                    <X className="w-8 h-8" /> 
                  </button>
               </div>
           </div>

           {/* Tabs Navigation */}
           {!simpleMode && !readOnly && (
             <div className="flex gap-4 mt-20 p-2 bg-black/40 border border-white/5 rounded-[36px] w-fit shadow-2xl">
                {[
                  { id: 'overview', label: 'Executive Matrix', icon: <Target className="w-4.5 h-4.5" /> },
                  { id: 'activities', label: 'Neural Logs', icon: <Activity className="w-4.5 h-4.5" /> },
                  { id: 'matrix', label: 'Institutional Node', icon: <Cpu className="w-4.5 h-4.5" /> }
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn('px-10 py-4.5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-1000 flex items-center gap-4 italic border', activeTab === tab.id ? 'bg-sidebar-primary text-black border-sidebar-primary netlife-glow shadow-none scale-105' : 'text-white/20 border-transparent hover:text-white/40')}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
             </div>
           )}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-16 lg:p-20 scrollbar-none relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="visao" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-24">
                {/* Pipeline State Machine */}
                {!simpleMode && !readOnly && (
                   <div className="space-y-12">
                      <SectionTitle title="Funnel Architecture" icon={<Layers className="w-5 h-5" />} />
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                         {FUNIL_STAGES.map((s, idx) => {
                            const currentIdx = FUNIL_STAGES.findIndex(fs => fs.key === contact.status)
                            const isPast = idx < currentIdx
                            const isActive = idx === currentIdx
                            return (
                               <button key={s.key} onClick={() => updateStatus(s.key)} className={cn("relative py-6 rounded-[28px] text-[10px] font-black uppercase tracking-widest border transition-all duration-1000 overflow-hidden group/stage italic", isActive ? "bg-sidebar-primary text-black border-sidebar-primary netlife-glow shadow-none scale-105" : isPast ? "bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20" : "bg-black/40 text-white/5 border-white/5 hover:border-white/10 hover:text-white/20")}>
                                  <span className="relative z-10">{s.label}</span>
                                  {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                               </button>
                            )
                         })}
                      </div>
                   </div>
                 )}

                {/* Data Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                    <div className="space-y-12">
                        <SectionTitle title="Neural Connectivity" icon={<Zap className="w-5 h-5" />} />
                        <div className="grid gap-12">
                            <DetailField icon={<Phone className="w-5 h-5" />} label="Terminal Signal">
                               <div className="flex items-center justify-between">
                                  <span className="text-xl font-black text-white/90 tracking-[0.2em] italic">{contact.telefone || 'SIGNAL LOST'}</span>
                                  {contact.telefone && (
                                     <div className="flex items-center gap-4">
                                        <button onClick={() => handleCopyPhone(contact.telefone)} className="w-14 h-14 rounded-2xl bg-black border border-white/5 hover:border-sidebar-primary/40 text-white/10 hover:text-sidebar-primary transition-all duration-700 flex items-center justify-center relative shadow-2xl">
                                           <Copy className="w-6 h-6" />
                                           <AnimatePresence> {showCopyTooltip && <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-14 left-1/2 -translate-x-1/2 bg-sidebar-primary text-black text-[10px] font-black uppercase px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap italic">HASH COPIED</motion.span>} </AnimatePresence>
                                        </button>
                                        <button onClick={() => handleWhatsApp(contact.telefone)} className="w-14 h-14 rounded-2xl bg-black border border-white/5 hover:border-emerald-500/40 text-white/10 hover:text-emerald-500 transition-all duration-700 flex items-center justify-center shadow-2xl">
                                           <MessageCircle className="w-6 h-6" />
                                        </button>
                                     </div>
                                  )}
                               </div>
                            </DetailField>
                            <DetailField icon={<Mail className="w-5 h-5" />} label="Digital Handshake" value={contact.email} />
                            <DetailField icon={<Briefcase className="w-5 h-5" />} label="Infiltration Protocol" value={contact.cargo} />
                            <DetailField icon={getCanalIcon(contact.canal)} label="Ingress Vector" value={contact.canal} />
                        </div>
                    </div>
                    <div className="space-y-12">
                        <SectionTitle title="Corporate Infiltration" icon={<Building2 className="w-5 h-5" />} />
                        <div className="grid gap-12">
                            <DetailField icon={<Building2 className="w-5 h-5" />} label="Institutional Entity" value={contact.empresa} />
                            <DetailField icon={<MapPin className="w-5 h-5" />} label="Geospatial Target">
                                <span className={cn("text-sm font-black uppercase tracking-widest leading-relaxed block italic", !formatAddress() ? "text-white/5 italic" : "text-white/60 group-hover/field:text-white transition-colors duration-700")}>
                                   {formatAddress() || 'GLOBAL NETWORK NODE'}
                                </span>
                            </DetailField>
                            <DetailField icon={<Globe className="w-5 h-5" />} label="Cyber Domain">
                                {contact.site ? (
                                   <a href={contact.site.startsWith('http') ? contact.site : `https://${contact.site}`} target="_blank" rel="noopener noreferrer" className="text-sidebar-primary hover:text-white underline font-black uppercase tracking-[0.2em] text-sm flex items-center gap-3 transition-all duration-700 group/link italic">
                                      {contact.site} <ArrowUpRight className="w-4.5 h-4.5 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                   </a>
                                ) : <span className="text-white/5 font-black uppercase tracking-widest text-sm italic">UNSECURED DOMAIN</span>}
                            </DetailField>
                            <DetailField icon={<Target className="w-5 h-5" />} label="Sector Vector" value={contact.nicho || 'GENERAL MARKET PROTOCOL'} />
                        </div>
                    </div>
                </div>

                {/* Intelligence Feed */}
                <div className="nl-glass rounded-[48px] p-12 border-white/5 relative overflow-hidden group shadow-2xl bg-black/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <SectionTitle title="Strategy Dossier" icon={<FileText className="w-5 h-5" />} />
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sidebar-primary/20 rounded-full group-hover:bg-sidebar-primary/40 transition-colors duration-700" />
                    <p className="text-lg text-white/40 leading-loose whitespace-pre-wrap font-medium italic group-hover:text-white/60 transition-colors duration-1000">
                       {contact.notas ? `"${contact.notas}"` : 'AWAITING NEURAL NOTES INFILTRATION...'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div key="atividades" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16">
                <div className="flex items-center justify-between border-b border-white/5 pb-10">
                   <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic">Neural Activity Stream</h4>
                      <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] italic">Real-time Protocol Log v2.0</p>
                   </div>
                   <button onClick={() => setIsAddingActivity(!isAddingActivity)} className="btn-primary px-10 py-5 netlife-glow shadow-none text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center gap-4 group">
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" /> {isAddingActivity ? 'ABORT PROTOCOL' : 'INJECT NEW LOG'}
                   </button>
                </div>

                <AnimatePresence>
                  {isAddingActivity && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="nl-glass rounded-[48px] p-12 border-sidebar-primary/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative z-20">
                      <div className="space-y-12">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                          {(['phone', 'email', 'message', 'meeting', 'note'] as ActivityType[]).map((t) => (
                            <button key={t} onClick={() => setActivityType(t)} className={cn('py-6 px-4 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] italic flex flex-col items-center gap-5 border transition-all duration-1000 group/btn', activityType === t ? getActivityColor(t) + ' scale-105 shadow-2xl border-opacity-40' : 'border-white/5 text-white/10 hover:bg-black hover:border-white/10')}>
                              <div className="p-4 rounded-2xl bg-current/10 group-hover/btn:scale-110 transition-transform duration-700">{getActivityIcon(t)}</div>
                              {t}
                            </button>
                          ))}
                        </div>
                        <textarea className="w-full bg-black border border-white/10 rounded-[48px] px-10 py-10 text-sm font-black uppercase tracking-widest text-white/60 outline-none focus:border-sidebar-primary/40 transition-all resize-none leading-loose italic placeholder-white/5 duration-700" rows={4} placeholder="TRANSCRIBE MISSION LOG..." value={activityDesc} onChange={(e) => setActivityDesc(e.target.value)} />
                        <div className="flex gap-6">
                          <button onClick={() => setIsAddingActivity(false)} className="flex-1 py-7 rounded-[32px] bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-[0.4em] italic text-white/10 hover:text-white transition-all duration-700">ABORT INJECTION</button>
                          <button onClick={addActivity} className="flex-1 py-7 rounded-[32px] btn-primary netlife-glow shadow-none text-[10px] font-black uppercase tracking-[0.4em] italic">COMMIT PROTOCOL</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative pl-16 space-y-16">
                   <div className="absolute left-[31px] top-6 bottom-6 w-px bg-gradient-to-b from-sidebar-primary via-white/5 to-transparent opacity-40" />
                   {contact.activities.length === 0 ? (
                      <div className="text-center py-32 space-y-10">
                         <div className="w-24 h-24 rounded-[48px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto opacity-10"> <Activity className="w-10 h-10" /> </div>
                         <p className="text-[12px] font-black text-white/10 uppercase tracking-[0.5em] italic">Awaiting First Neural Signal</p>
                      </div>
                   ) : contact.activities.map((activity, idx) => (
                      <motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="relative group/activity">
                         <div className={cn('absolute -left-[63px] top-0 w-16 h-16 rounded-[28px] flex items-center justify-center border-[6px] border-black shadow-2xl z-10 transition-all duration-1000 group-hover/activity:scale-110', getActivityColor(activity.type))}>
                            {getActivityIcon(activity.type)}
                         </div>
                         <div className="nl-glass rounded-[48px] p-10 border-white/5 group-hover/activity:border-white/10 transition-all duration-1000 group-hover/activity:bg-black/60 shadow-2xl">
                            <p className="text-base text-white/60 font-medium leading-loose mb-8 italic">"{activity.description}"</p>
                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                               <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">
                                  <Clock className="w-4.5 h-4.5" />
                                  <span>{safeFormat(activity.date, "dd MMM yyyy · HH:mm")}</span>
                                </div>
                                <span className="px-5 py-2 rounded-xl bg-white/[0.03] text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic">{activity.type} ENCRYPTION</span>
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'matrix' && (
              <motion.div key="matrix" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-16">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                       {contact.cnpj ? (
                          <div className="nl-glass p-16 rounded-[64px] border-white/5 relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.8)] bg-black/40">
                             <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-[2000ms]" />
                             <div className="flex items-center gap-10 mb-16 relative z-10">
                                <div className="w-24 h-24 rounded-[40px] bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20 shadow-2xl group-hover:scale-110 transition-all duration-1000">
                                   <Building2 className="w-12 h-12 text-sidebar-primary" />
                                </div>
                                <div className="space-y-2">
                                   <h4 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">{contact.empresa}</h4>
                                   <div className="flex items-center gap-4 px-5 py-2 rounded-xl bg-black border border-white/5 w-fit">
                                      <Fingerprint className="w-4.5 h-4.5 text-sidebar-primary/40" />
                                      <p className="text-[11px] text-sidebar-primary font-black tracking-[0.4em] uppercase italic">{contact.cnpj}</p>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                <div className="p-8 rounded-[32px] bg-black border border-white/5 space-y-4 hover:border-sidebar-primary/20 transition-all duration-1000 group/data">
                                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Geospatial Vector</p>
                                   <div className="flex items-center gap-4">
                                      <MapPin className="w-5 h-5 text-sidebar-primary/40 group-hover/data:text-sidebar-primary transition-colors" />
                                      <p className="text-sm font-black text-white/60 uppercase tracking-widest italic">{contact.cidade || 'EXTRADETERRIORIAL'} / {contact.estado || 'CLD'}</p>
                                   </div>
                                </div>
                                <div className="p-8 rounded-[32px] bg-black border border-white/5 space-y-4 hover:border-sidebar-primary/20 transition-all duration-1000 group/data">
                                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Industry Intelligence</p>
                                   <div className="flex items-center gap-4">
                                      <Target className="w-5 h-5 text-sidebar-primary/40 group-hover/data:text-sidebar-primary transition-colors" />
                                      <p className="text-sm font-black text-white/60 uppercase tracking-widest italic">{contact.nicho || 'UNCLASSIFIED VECTOR'}</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       ) : (
                          <div className="py-40 rounded-[64px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-10 opacity-20 hover:opacity-40 hover:border-sidebar-primary/20 transition-all duration-1000">
                             <div className="w-24 h-24 rounded-[48px] bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-2xl"> <Shield className="w-12 h-12" /> </div>
                             <div className="text-center space-y-4">
                                <p className="text-[14px] font-black uppercase tracking-[0.5em] italic">No Identity Linkage</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Initialize CNPJ Infiltration to secure this node.</p>
                             </div>
                          </div>
                       )}
                    </div>
                    
                    <div className="nl-glass rounded-[64px] p-12 border-white/5 space-y-12 shadow-2xl bg-black/40">
                       <SectionTitle title="Matrix Security Protocol" icon={<Lock className="w-5 h-5" />} />
                       <div className="space-y-10">
                          <div className="flex items-center gap-5 group/sec">
                             <div className="w-3 h-3 rounded-full bg-emerald-500 netlife-glow shadow-none group-hover/sec:animate-ping" />
                             <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] italic">Real-time DB Synchronization</p>
                          </div>
                          <div className="flex items-center gap-5 group/sec">
                             <div className="w-3 h-3 rounded-full bg-sidebar-primary netlife-glow shadow-none group-hover/sec:animate-ping" />
                             <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] italic">Neural Uplink Active</p>
                          </div>
                          <div className="space-y-6 pt-10 border-t border-white/5">
                             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] italic">Session Encryption Hash</p>
                             <p className="text-[10px] font-mono text-white/20 break-all leading-relaxed uppercase">{contact.id.repeat(4)}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="px-16 py-10 bg-black border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.02] border border-white/5">
                  <Clock className="w-4 h-4 text-white/20" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Last Activity: {safeDistance(contact.lastActivity)}</span>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="px-5 py-2 rounded-full bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Matrix ID: {contact.id}</span>
              </div>
           </div>
           <div className="text-sidebar-primary/20 text-[11px] font-black uppercase tracking-[0.6em] italic animate-pulse">Investmais Neural OS v4.0.0</div>
        </div>
      </motion.div>
    </motion.div>
  )
}
