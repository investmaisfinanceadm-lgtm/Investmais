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
    { href: '/relatorios', label: 'Relatórios', icon: Library },
    { href: '/atividades', label: 'Atividades', icon: Calendar },
    { href: '/utm', label: 'UTM Analytics', icon: BarChart2 },
    { href: '/insights', label: 'IA Insights', icon: Sparkles },
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
            <div className="absolute -top-24 -left-20 w-80 h-80 bg-sidebar-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
            
            {/* Logo */}
            <div className="px-6 pt-8 pb-6 flex items-center gap-4 z-10">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2 transition-all group-hover:scale-110 duration-500">
                         <img src="/logo.png" alt="InvestMais" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg tracking-tight leading-none">INVEST<span className="text-sidebar-primary">MAIS</span></span>
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Gestão Inteligente</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto z-10 scrollbar-none">
                <div className="space-y-1">
                    <div className="px-3 mb-2">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Painel Administrativo</p>
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
                                    "group relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 font-bold text-xs",
                                    isActive 
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-lg" 
                                        : "text-white/40 hover:bg-white/[0.03] hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-4 h-4 flex-shrink-0 transition-all", isActive ? "text-primary" : "opacity-40 group-hover:opacity-100")} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                <div className="space-y-1">
                    <div className="px-3 mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-white/10" />
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Criação & Ativos</p>
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
                                    "group relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 font-bold text-xs",
                                    isActive 
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-lg" 
                                        : "text-white/40 hover:bg-white/[0.03] hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-4 h-4 flex-shrink-0 transition-all", isActive ? "text-primary" : "opacity-40 group-hover:opacity-100")} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-6 border-t border-white/5 bg-black/40 relative z-10">
                {user && (
                    <div className="mb-6 space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 p-0.5 shadow-xl">
                                <div className="w-full h-full rounded-[9px] bg-black flex items-center justify-center overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.nome} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-primary text-[10px] font-bold uppercase">{getInitials(user.nome)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{user.nome || 'Usuário'}</p>
                                <p className="text-[8px] text-white/20 truncate font-bold uppercase tracking-widest mt-0.5">Executivo</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Cota Mensal</span>
                                <span className="text-[9px] font-bold text-primary">{quotaPercent}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(quotaPercent, 100)}%` }}
                                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="h-full bg-primary rounded-full shadow-[0_0_10px_var(--primary)]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-primary hover:bg-white/[0.03] transition-all rounded-xl border border-white/5"
                            >
                                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-xl border border-white/5"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest">Ativo</span>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* ─────────── DESKTOP SIDEBAR ─────────── */}
            <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0 z-50 border-r border-white/5">
                <SidebarContent />
            </aside>

            {/* ─────────── MOBILE TOP HEADER ─────────── */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-xl border-b border-white/5 safe-top">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 p-1.5 flex items-center justify-center border border-primary/20">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight uppercase">
                        INVEST<span className="text-primary">MAIS</span>
                    </span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="w-10 h-10 flex items-center justify-center text-white/60 bg-white/[0.03] rounded-xl border border-white/5"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* ─────────── MOBILE DRAWER OVERLAY ─────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-[60] bg-black/90 backdrop-blur-md"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ─────────── MOBILE DRAWER ─────────── */}
            <aside
                className={cn(
                    'lg:hidden fixed top-0 left-0 h-full w-64 bg-black z-[70] transition-transform duration-500 border-r border-white/5',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>

            {/* ─────────── MOBILE BOTTOM NAVIGATION ─────────── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5 safe-bottom">
                <div className="flex items-center justify-around px-2 py-3">
                    {mobileBottomNav.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        const isPrimary = item.isPrimary

                        if (isPrimary) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex flex-col items-center gap-1 -mt-8"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg active:scale-90 transition-all">
                                        <Icon className="w-6 h-6 text-black" strokeWidth={3} />
                                    </div>
                                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest">{item.label}</span>
                                </Link>
                            )
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-1.5 p-2 rounded-xl active:scale-95 transition-all"
                            >
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-all",
                                        isActive ? "text-primary" : "text-white/20"
                                    )}
                                    strokeWidth={isActive ? 3 : 2}
                                />
                                <span className={cn(
                                    "text-[8px] font-bold uppercase tracking-widest transition-all",
                                    isActive ? "text-primary" : "text-white/10"
                                )}>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
