'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Video,
    Library,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronRight,
    Kanban,
    Users,
    Send,
    Search,
    Moon,
    Sun,
    Plus,
    Home,
    Shield,
    Activity,
    Cpu,
    Globe,
    Target,
    Layers,
    Zap,
    MessageSquare,
    Sparkles
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pipeline', label: 'Pipeline', icon: Kanban },
    { href: '/crm', label: 'Contatos', icon: Users },
    { href: '/cnpj', label: 'Busca de Leads', icon: Search },
    { href: '/disparos', label: 'Disparos', icon: Send },
    { href: '/agenda', label: 'Agenda', icon: Kanban },
    { href: '/relatorios', label: 'Relatórios', icon: Library },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

const contentItems = [
    { href: '/criar', label: 'Estúdio de Vídeo', icon: Video },
    { href: '/biblioteca', label: 'Biblioteca', icon: Library },
]

// Items that appear in the mobile bottom nav (most important)
const mobileBottomNav = [
    { href: '/dashboard', label: 'Início', icon: Home },
    { href: '/crm', label: 'Contatos', icon: Users },
    { href: '/criar', label: 'Novo', icon: Plus, isPrimary: true },
    { href: '/biblioteca', label: 'Biblioteca', icon: Library },
    { href: '/pipeline', label: 'Pipeline', icon: Kanban },
]

export function CreatorSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { data: session } = useSession()

    useEffect(() => {
        setMounted(true)
    }, [])

    const sessionUser = session?.user as any

    const user = sessionUser
        ? {
              nome: sessionUser.name || '',
              email: sessionUser.email || '',
              avatar_url: sessionUser.image || null,
              cota_mensal: sessionUser.cota_mensal || 0,
              cota_usada: sessionUser.cota_usada || 0,
          }
        : null

    const handleLogout = async () => {
        await signOut({ redirect: false })
        toast.success('Sessão encerrada')
        router.push('/login')
    }

    const quotaPercent = user
        ? Math.round((user.cota_usada / user.cota_mensal) * 100)
        : 0

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-black relative overflow-hidden">
            {/* Ambient Orb inside sidebar */}
            <div className="absolute -top-24 -left-20 w-80 h-80 bg-sidebar-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />
            
            {/* Logo */}
            <div className="px-8 pt-12 pb-10 flex items-center gap-4 z-10">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-2 shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition-all group-hover:scale-110 group-hover:rotate-3 duration-700">
                         <img src="/logo.png" alt="InvestMais" className="w-full h-full object-contain filter brightness-100" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-xl tracking-tight leading-none uppercase">Invest<span className="text-sidebar-primary">Mais</span></span>
                        <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">Gestão Inteligente</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-8 space-y-12 overflow-y-auto z-10 scrollbar-none">
                <div className="space-y-3">
                    <div className="flex items-center gap-4 px-4 mb-4">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Menu Principal</p>
                    </div>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm",
                                    isActive 
                                        ? "bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20" 
                                        : "text-white/60 hover:bg-white/[0.03] hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-all", isActive ? "text-sidebar-primary" : "opacity-40 group-hover:opacity-100")} />
                                <span>{item.label}</span>
                                
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-4 px-4 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-white/10" />
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Criação de Conteúdo</p>
                    </div>
                    {contentItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm",
                                    isActive 
                                        ? "bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20" 
                                        : "text-white/60 hover:bg-white/[0.03] hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-all", isActive ? "text-sidebar-primary" : "opacity-40 group-hover:opacity-100")} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-8 border-t border-white/5 bg-black relative z-10">
                {user && (
                    <div className="mb-10 space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] p-[1px] shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5">
                                <div className="w-full h-full rounded-[15px] bg-black flex items-center justify-center overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.nome} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sidebar-primary text-sm font-black italic">{getInitials(user.nome)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user.nome || 'Usuário InvestMais'}</p>
                                <p className="text-[10px] text-white/20 truncate font-bold uppercase tracking-widest mt-1">Nível Executivo</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 group hover:border-sidebar-primary/20 transition-all duration-700 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Uso da Cota</span>
                                <span className="text-[11px] font-bold text-sidebar-primary uppercase italic">{quotaPercent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(quotaPercent, 100)}%` }}
                                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="h-full bg-sidebar-primary netlife-glow shadow-none rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="w-12 h-12 flex items-center justify-center text-white/20 hover:text-sidebar-primary hover:bg-white/[0.03] transition-all duration-700 rounded-2xl border border-white/5 hover:border-sidebar-primary/20"
                            >
                                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-12 h-12 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all duration-700 rounded-2xl border border-white/5 hover:border-red-500/20"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
                         <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">Protegido</span>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* ─────────── DESKTOP SIDEBAR ─────────── */}
            <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 flex-shrink-0 z-50 border-r border-white/5 animate-fade-in">
                <SidebarContent />
            </aside>

            {/* ─────────── MOBILE TOP HEADER ─────────── */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-black/80 backdrop-blur-3xl border-b border-white/5 safe-top">
                <Link href="/dashboard" className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white p-2 flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-white font-black text-xl tracking-tighter italic uppercase">
                        Invest<span className="text-sidebar-primary">Mais</span>
                    </span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="w-12 h-12 flex items-center justify-center text-white/60 bg-white/[0.03] rounded-2xl border border-white/5"
                >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* ─────────── MOBILE DRAWER OVERLAY ─────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-[60] bg-black/90 backdrop-blur-2xl"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ─────────── MOBILE DRAWER ─────────── */}
            <aside
                className={cn(
                    'lg:hidden fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-black z-[70] transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) border-r border-white/5',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>

            {/* ─────────── MOBILE BOTTOM NAVIGATION ─────────── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-3xl border-t border-white/5 safe-bottom">
                <div className="flex items-center justify-around px-4 py-4">
                    {mobileBottomNav.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        const isPrimary = item.isPrimary

                        if (isPrimary) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex flex-col items-center gap-2 -mt-10"
                                >
                                    <div className="w-16 h-16 rounded-[24px] bg-sidebar-primary flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.5)] netlife-glow shadow-none active:scale-90 transition-all duration-500">
                                        <Icon className="w-7 h-7 text-black" strokeWidth={3} />
                                    </div>
                                    <span className="text-[9px] font-black text-sidebar-primary uppercase tracking-[0.3em] italic">{item.label}</span>
                                </Link>
                            )
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-2 py-2 px-4 rounded-2xl transition-all active:scale-90"
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-700",
                                    isActive ? "bg-sidebar-primary/10" : ""
                                )}>
                                    <Icon
                                        className={cn(
                                            "w-5 h-5 transition-all duration-700",
                                            isActive ? "text-sidebar-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)] scale-110" : "text-white/20"
                                        )}
                                        strokeWidth={isActive ? 3 : 2}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-700 italic",
                                    isActive ? "text-sidebar-primary" : "text-white/10"
                                )}>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
