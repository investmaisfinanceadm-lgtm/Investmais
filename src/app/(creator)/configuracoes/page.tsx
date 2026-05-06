'use client'

import { useState } from 'react'
import { 
  User, 
  Shield, 
  Globe, 
  Zap, 
  Search, 
  Send, 
  Users, 
  Clock,
  ChevronRight,
  Save,
  Mail,
  Fingerprint,
  Calendar
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Sub-Tab Item Component ──────────────────────────────────────────────────
function SubTab({ label, icon: Icon, isActive, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
        isActive ? "bg-white/[0.05] text-primary shadow-sm" : "text-white/40 hover:text-white"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('Perfil')

  const tabs = [
    { label: 'Perfil', icon: User },
    { label: 'Pipelines', icon: Shield },
    { label: 'Integrações', icon: Globe },
    { label: 'Agente IA', icon: Zap },
    { label: 'Busca de Leads', icon: Search },
    { label: 'Disparo', icon: Send },
    { label: 'Usuários', icon: Users },
    { label: 'Times', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="space-y-1 border-b border-white/5 pb-10">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-white/40 text-sm">Gerencie suas preferências e informações da conta</p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white/[0.02] border border-white/5 p-1 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <SubTab 
            key={tab.label} 
            label={tab.label} 
            icon={tab.icon} 
            isActive={activeTab === tab.label}
            onClick={() => setActiveTab(tab.label)}
          />
        ))}
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 gap-8 max-w-5xl">
        
        {activeTab === 'Perfil' && (
          <>
            {/* Informações do Perfil */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-10"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Informações do Perfil</h2>
                <p className="text-sm text-white/20">Atualize suas informações pessoais</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[28px] bg-primary flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                  GD
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Gabriel de Guimarães e Sousa</h3>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    gabrielsousacj@gmail.com
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Nome</label>
                  <input 
                    type="text" 
                    defaultValue="Gabriel"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 px-6 text-sm font-medium text-white focus:border-primary/40 transition-all outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Sobrenome</label>
                  <input 
                    type="text" 
                    defaultValue="de Guimarães e Sousa"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 px-6 text-sm font-medium text-white focus:border-primary/40 transition-all outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">URL do Avatar</label>
                  <input 
                    type="text" 
                    placeholder="https://exemplo.com/avatar.jpg"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 px-6 text-sm font-medium text-white focus:border-primary/40 transition-all outline-none"
                  />
                </div>
              </div>

              <button className="bg-primary px-10 py-4 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            </motion.div>

            {/* Informações da Conta */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-10"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Informações da Conta</h2>
                <p className="text-sm text-white/20">Detalhes da sua conta</p>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold text-white">gabrielsousacj@gmail.com</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">ID do Usuário</p>
                  <div className="flex items-center gap-3">
                     <Fingerprint className="w-4 h-4 text-primary" />
                     <p className="text-[10px] font-bold text-white/40 tracking-widest">f8a1dd8d-b085-4df3-b7c6-a18285dd3b2f</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Conta criada em</p>
                  <div className="flex items-center gap-3">
                     <Calendar className="w-4 h-4 text-emerald-500" />
                     <p className="text-sm font-bold text-white">15/01/2026</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {activeTab === 'Pipelines' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/5 rounded-[32px] p-10 space-y-10"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Gestão de Pipelines</h2>
                <p className="text-sm text-white/20">Configure seus funis de vendas e colunas</p>
              </div>
              <button className="bg-primary/10 text-primary border border-primary/20 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                Novo Pipeline
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">H</div>
                  <div>
                    <p className="text-sm font-bold">Host Menos Imposto</p>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">6 colunas • 353 leads</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-primary transition-colors" />
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">V</div>
                  <div>
                    <p className="text-sm font-bold">CRM Vendas</p>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">4 colunas • 12 leads</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab !== 'Perfil' && activeTab !== 'Pipelines' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.03] border border-white/5 rounded-[32px] p-20 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10">
              <Zap className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Módulo em Desenvolvimento</h3>
              <p className="text-sm text-white/20 max-w-xs">A aba de {activeTab} está sendo configurada para sua conta.</p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
    </div>
  )
}
