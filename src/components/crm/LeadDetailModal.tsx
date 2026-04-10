import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Mail, Phone, Building2, Briefcase, MessageSquare, 
  MapPin, Globe, Tag, ExternalLink, Copy, MessageCircle,
  ChevronRight, Trash2, Clock, CheckCircle2, Circle, FileText,
  Calendar, Users
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FunilStatus = 'lead' | 'qualificado' | 'proposta' | 'cliente' | 'inativo'
export type Canal = 'Instagram' | 'Site' | 'Indicação' | 'LinkedIn' | 'WhatsApp' | 'Google'
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
  empresa: string
  email: string
  telefone: string
  cargo: string
  canal: Canal
  status: FunilStatus
  tags: string[]
  cnpj?: string
  notas: string
  cidade?: string
  estado?: string
  endereco?: string
  site?: string
  nicho?: string
  createdAt: Date
  lastActivity: Date
  activities: ContactActivity[]
}

export const FUNIL_STAGES: { key: FunilStatus; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'qualificado', label: 'Qualificado' },
  { key: 'proposta', label: 'Proposta' },
  { key: 'cliente', label: 'Cliente' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return '??'
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '??'
}

export function ContactAvatar({ contact, size = 'md' }: { contact: Contact; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }
  return (
    <div className={cn('rounded-full flex items-center justify-center font-black shrink-0', sizeClasses[size], getAvatarColor(contact.id))}>
      {getInitials(contact.nome)}
    </div>
  )
}

export function safeFormat(date: Date | string | null | undefined, fmt: string): string {
  try {
    if (!date) return '—'
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return '—'
    return format(d, fmt, { locale: ptBR })
  } catch { return '—' }
}

export function safeDistance(date: Date | string | null | undefined): string {
  try {
    if (!date) return '—'
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return '—'
    return formatDistanceToNow(d, { locale: ptBR, addSuffix: true })
  } catch { return '—' }
}

const AVATAR_COLORS = [
  'bg-accent/20 text-accent',
  'bg-blue-500/20 text-blue-400',
  'bg-purple-500/20 text-purple-400',
  'bg-amber-500/20 text-amber-400',
  'bg-rose-500/20 text-rose-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-orange-500/20 text-orange-400',
  'bg-indigo-500/20 text-indigo-400',
]

function getAvatarColor(id: string): string {
  const index = parseInt(id, 10) % AVATAR_COLORS.length
  return AVATAR_COLORS[index] ?? AVATAR_COLORS[0]
}

export function getStatusConfig(status: FunilStatus | undefined | null) {
  switch (status) {
    case 'lead': return { label: 'Lead', classes: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' }
    case 'qualificado': return { label: 'Qualificado', classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' }
    case 'proposta': return { label: 'Proposta', classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' }
    case 'cliente': return { label: 'Cliente', classes: 'bg-accent/10 text-accent border border-accent/20' }
    case 'inativo': return { label: 'Inativo', classes: 'bg-red-500/10 text-red-400 border border-red-500/20' }
    default: return { label: 'Lead', classes: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' }
  }
}

export function getCanalIcon(canal: Canal | undefined | null) {
  switch (canal) {
    case 'WhatsApp': return <MessageCircle className="w-3 h-3" />
    default: return <Globe className="w-3 h-3" />
  }
}

function getActivityIcon(type: ActivityType | undefined | null) {
  switch (type) {
    case 'phone': return <Phone className="w-4 h-4" />
    case 'email': return <Mail className="w-4 h-4" />
    case 'message': return <MessageSquare className="w-4 h-4" />
    case 'meeting': return <Calendar className="w-4 h-4" />
    case 'note': return <FileText className="w-4 h-4" />
    default: return <MessageSquare className="w-4 h-4" />
  }
}

function getActivityColor(type: ActivityType | undefined | null) {
  switch (type) {
    case 'phone': return 'bg-accent/10 text-accent border-accent/20'
    case 'email': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'message': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'meeting': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'note': return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1.5 h-4 bg-accent rounded-full" />
      <h3 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{title}</h3>
    </div>
  )
}

function DetailField({ icon, label, value, children }: { icon: React.ReactNode, label: string, value?: string, children?: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-primary)]/40 p-4 rounded-xl border border-[var(--border-main)]/50">
      <div className="flex items-center gap-2 mb-1.5 grayscale opacity-60">
        {icon}
        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
      </div>
      {children ? children : (
        <span className={cn("text-sm font-bold block truncate", !value || value === "—" || value === "Não informado" ? "text-[var(--text-support)] font-medium italic" : "text-[var(--text-main)]")}>
          {value || 'Não informado'}
        </span>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LeadDetailModal({
  contact,
  onClose,
  onUpdate,
  onDelete,
}: {
  contact: Contact
  onClose: () => void
  onUpdate: (updated: Contact) => void
  onDelete: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'atividades' | 'cnpj'>('visao-geral')
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [activityDesc, setActivityDesc] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('note')
  const [showCopyTooltip, setShowCopyTooltip] = useState(false)

  const statusConfig = getStatusConfig(contact.status)

  function updateStatus(newStatus: FunilStatus) {
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
    onUpdate(updated)
    setActivityDesc('')
    setIsAddingActivity(false)
    toast.success('Atividade registrada!')
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

  const formatAddress = () => {
    const parts = []
    if (contact.endereco && contact.endereco !== 'undefined') parts.push(contact.endereco)
    if (contact.cidade && contact.cidade !== 'undefined') parts.push(contact.cidade)
    if (contact.estado && contact.estado !== 'undefined') parts.push(contact.estado)
    
    if (parts.length > 0) return parts.join(', ')
    
    // Fallback search in notes
    if (contact.notas && contact.notas.includes('Endereço:')) {
      const match = contact.notas.match(/Endereço:\s*([^, Site:\n]+(?:,[^, Site:\n]+)*)/)
      if (match && match[1] && !match[1].includes('undefined')) return match[1].trim()
    }
    
    return null
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full sm:max-w-4xl bg-[var(--bg-card)] border border-[var(--border-main)] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] outline-none"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        {/* Modal Header */}
        <div className="p-8 border-b border-[var(--border-main)] relative bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)]">
           <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                  <ContactAvatar contact={contact} size="lg" />

                 <div>
                    <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight mb-1">{contact.nome}</h2>
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-medium">
                       <Building2 className="w-4 h-4" />
                       {contact.empresa} {contact.cargo && `· ${contact.cargo}`}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                       <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', statusConfig.classes)}>
                          {statusConfig.label}
                       </span>
                       <span className="px-3 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-main)] text-[var(--text-muted)] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                          {getCanalIcon(contact.canal)} {contact.canal}
                       </span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => { onDelete(contact.id); onClose() }} className="p-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"> <Trash2 className="w-5 h-5" /> </button>
                 <button onClick={onClose} className="p-3 rounded-2xl bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"> <X className="w-5 h-5" /> </button>
              </div>
           </div>

           {/* Tabs */}
           <div className="flex gap-1 mt-8 bg-[var(--bg-primary)]/50 backdrop-blur-md rounded-2xl p-1.5 border border-[var(--border-main)] w-fit">
             {(['visao-geral', 'atividades', 'cnpj'] as const).map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={cn(
                   'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all relative',
                   activeTab === tab ? 'bg-[var(--bg-card)] text-accent border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                 )}
               >
                 {tab === 'visao-geral' ? 'Visão Geral' : tab === 'atividades' ? 'Atividades' : 'CNPJ Vinculado'}
               </button>
             ))}
           </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'visao-geral' && (
              <motion.div key="visao" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                {/* Pipeline */}
                <div className="bg-[var(--bg-primary)] rounded-[24px] p-6 border border-[var(--border-main)]">
                   <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Estágio no Funil</p>
                   <div className="flex items-center gap-1.5">
                      {FUNIL_STAGES.map((s, idx) => {
                         const currentIdx = FUNIL_STAGES.findIndex(fs => fs.key === contact.status)
                         const isPast = idx < currentIdx
                         const isActive = idx === currentIdx
                         return (
                            <React.Fragment key={s.key}>
                               <button onClick={() => updateStatus(s.key)} className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all", isActive ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" : isPast ? "bg-accent/10 text-accent border-accent/20" : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-white/20")}>
                                  {s.label}
                               </button>
                               {idx < FUNIL_STAGES.length - 1 && <ChevronRight className="w-3 h-3 text-[var(--border-main)]" />}
                            </React.Fragment>
                         )
                      })}
                   </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <SectionTitle title="Dados de Contato" />
                        <div className="grid gap-4">
                            <DetailField icon={<Phone className="w-4 h-4" />} label="Telefone">
                               <div className="flex items-center justify-between">
                                  <span className="font-bold text-[var(--text-main)]">{contact.telefone || 'Não informado'}</span>
                                  {contact.telefone && (
                                     <div className="flex items-center gap-1">
                                        <button onClick={() => handleCopyPhone(contact.telefone)} className="p-2 rounded-lg bg-[var(--bg-primary)] hover:bg-accent/10 text-[var(--text-muted)] hover:text-accent relative transition-all">
                                           <Copy className="w-3.5 h-3.5" />
                                           {showCopyTooltip && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] p-1.5 rounded shadow-xl">Copiado!</span>}
                                        </button>
                                        <button onClick={() => handleWhatsApp(contact.telefone)} className="p-2 rounded-lg bg-[var(--bg-primary)] hover:bg-green-500/10 text-[var(--text-muted)] hover:text-green-500 transition-all">
                                           <MessageCircle className="w-4 h-4" />
                                        </button>
                                     </div>
                                  )}
                               </div>
                            </DetailField>
                            <DetailField icon={<Mail className="w-4 h-4" />} label="E-mail" value={contact.email} />
                            <DetailField icon={<Briefcase className="w-4 h-4" />} label="Cargo" value={contact.cargo} />
                            <DetailField icon={getCanalIcon(contact.canal)} label="Canal Origem" value={contact.canal} />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <SectionTitle title="Dados da Empresa" />
                        <div className="grid gap-4">
                            <DetailField icon={<Building2 className="w-4 h-4" />} label="Empresa" value={contact.empresa} />
                            <DetailField icon={<MapPin className="w-4 h-4" />} label="Endereço">
                                <span className={cn("text-sm font-bold block", !formatAddress() ? "text-[var(--text-support)] font-medium italic" : "text-[var(--text-main)]")}>
                                   {formatAddress() || 'Não informado'}
                                </span>
                            </DetailField>
                            <DetailField icon={<Globe className="w-4 h-4" />} label="Site">
                                {contact.site ? (
                                   <a href={contact.site.startsWith('http') ? contact.site : `https://${contact.site}`} target="_blank" rel="noopener noreferrer" className="text-accent underline font-bold flex items-center gap-1.5">
                                      {contact.site} <ExternalLink className="w-3 h-3" />
                                   </a>
                                ) : <span className="text-[var(--text-support)] font-medium italic text-sm">Não informado</span>}
                            </DetailField>
                            <DetailField icon={<Tag className="w-4 h-4" />} label="Nicho / Segmento" value={contact.nicho} />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {(contact.notas && contact.notas.trim() !== "") && (
                   <div className="bg-[var(--bg-primary)] rounded-[24px] p-6 border border-[var(--border-main)]">
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">Notas Internas</p>
                      <p className="text-sm text-[var(--text-main)] leading-relaxed whitespace-pre-wrap opacity-80 font-medium">
                         {contact.notas.replace(/Endereço:.*?(Site:|$)/g, '$1').trim() || contact.notas}
                      </p>
                   </div>
                )}
              </motion.div>
            )}

            {activeTab === 'atividades' && (
              <motion.div key="atividades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <button onClick={() => setIsAddingActivity(!isAddingActivity)} className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-2xl">
                   <Users className="w-5 h-5" /> Registrar Nova Atividade
                </button>

                <AnimatePresence>
                  {isAddingActivity && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-accent/20 space-y-4">
                        <div className="grid grid-cols-5 gap-2">
                          {(['phone', 'email', 'message', 'meeting', 'note'] as ActivityType[]).map((t) => (
                            <button key={t} onClick={() => setActivityType(t)} className={cn('py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex flex-col items-center gap-2 border transition-all', activityType === t ? getActivityColor(t) + ' border-opacity-100' : 'border-[var(--border-main)] text-[var(--text-muted)] hover:bg-white/5')}>
                              {getActivityIcon(t)} {t}
                            </button>
                          ))}
                        </div>
                        <textarea className="input-field resize-none bg-[var(--bg-card)]" rows={4} placeholder="O que aconteceu nesta interação?" value={activityDesc} onChange={(e) => setActivityDesc(e.target.value)} />
                        <div className="flex gap-3">
                          <button onClick={() => setIsAddingActivity(false)} className="btn-secondary flex-1">Cancelar</button>
                          <button onClick={addActivity} className="btn-primary flex-1">Salvar Registro</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative pl-8 space-y-6">
                   <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/50 via-[var(--border-main)] to-transparent" />
                   {contact.activities.map((activity) => (
                      <div key={activity.id} className="relative">
                         <div className={cn('absolute -left-[31px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-[var(--bg-card)] shadow-sm z-10', getActivityColor(activity.type))}>
                            {getActivityIcon(activity.type)}
                         </div>
                         <div className="bg-[var(--bg-primary)] rounded-2xl p-5 border border-[var(--border-main)]">
                            <p className="text-sm text-[var(--text-main)] font-medium leading-relaxed">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-3 opacity-60">
                               <Clock className="w-3 h-3" />
                               <span className="text-[10px] font-black uppercase tracking-widest">{safeFormat(activity.date, "dd 'de' MMMM 'às' HH:mm")}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'cnpj' && (
              <motion.div key="cnpj" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                 {contact.cnpj ? (
                    <div className="bg-[var(--bg-primary)] rounded-[32px] p-8 border border-[var(--border-main)] relative overflow-hidden group">
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                             <Building2 className="w-7 h-7 text-accent" />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">{contact.empresa}</h4>
                             <p className="text-sm text-accent font-black tracking-[0.2em]">{contact.cnpj}</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Cidade/UF</p>
                             <p className="text-sm font-bold text-[var(--text-main)]">{contact.cidade || '—'} / {contact.estado || '—'}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Segmento</p>
                             <p className="text-sm font-bold text-[var(--text-main)]">{contact.nicho || 'Não especificado'}</p>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="text-center py-20 bg-[var(--bg-primary)]/30 rounded-[32px] border border-dashed border-[var(--border-main)]">
                       <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                       <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.2em] text-[10px]">Sem dados de CNPJ vinculados</p>
                    </div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
