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
    Sun
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pipeline', label: 'Pipeline', icon: Kanban },
    { href: '/crm', label: 'CRM', icon: Users },
    { href: '/disparos', label: 'Listas de Disparo', icon: Send },
    { href: '/cnpj', label: 'Busca de Leads', icon: Search },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

const contentItems = [
    { href: '/criar', label: 'Criar Vídeo', icon: Video },
    { href: '/biblioteca', label: 'Biblioteca', icon: Library },
]

export function CreatorSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { data: session } = useSession()

    // Avoid hydration mismatch
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
        toast.success('Logout realizado')
        router.push('/login')
    }

    const quotaPercent = user
        ? Math.round((user.cota_usada / user.cota_mensal) * 100)
        : 0

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-4 pt-8 pb-7 border-b border-white/5 flex justify-center items-center">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <img src="/logo.png" alt="InvestMais Finance" className="h-20 w-auto object-contain hover:opacity-85 transition-opacity duration-300" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Monitoramento</p>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    isActive ? 'sidebar-item-active' : 'sidebar-item'
                                )}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-accent animate-pulse" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Gerenciador de Conteúdo</p>
                    {contentItems.map((item, idx) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        const isPrimary = idx === 0
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black transition-all duration-300 group uppercase tracking-widest text-[10px] ${
                                    isPrimary
                                        ? 'bg-accent text-white shadow-accent hover:bg-accent/90 hover:shadow-accent-lg'
                                        : isActive
                                            ? 'bg-white/10 text-white border border-white/20'
                                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                                }`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span>{item.label}</span>
                                <ChevronRight className="w-4 h-4 ml-auto opacity-40 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-6 border-t border-white/5 space-y-6">
                {/* Quota */}
                {user && (
                    <div className="px-4 py-4 rounded-[20px] bg-white/5 border border-white/5 group hover:border-accent/10 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cota de Processamento</span>
                            <span className="text-[10px] font-extrabold text-white bg-accent/20 px-2 py-0.5 rounded-full border border-accent/20">
                                {user.cota_usada}/{user.cota_mensal}
                            </span>
                        </div>
                        <div className="progress-bar h-1.5 bg-white/5">
                            <div
                                className="progress-fill bg-gradient-accent"
                                style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* User info */}
                {user && (
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.nome}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-accent text-xs font-black">
                                    {getInitials(user.nome)}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-extrabold text-white dark:text-white truncate uppercase tracking-wider">{user.nome}</p>
                            <p className="text-[10px] text-gray-500 truncate font-medium">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="p-2 text-gray-600 hover:text-accent transition-all rounded-lg hover:bg-white/5"
                                    title="Alternar Tema"
                                >
                                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-white/5"
                                title="Sair"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 sidebar-fixed-dark h-screen sticky top-0 flex-shrink-0 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 sidebar-fixed-dark border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex-shrink-0">
                        <img src="/logo.png" alt="InvestMais Finance" className="h-9 w-auto object-contain" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-tighter">
                        INVEST<span className="text-accent">MAIS</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-[var(--color-dark-muted)]" />
                    </button>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    'lg:hidden fixed top-0 left-0 h-full w-[80vw] max-w-[320px] sidebar-fixed-dark z-[70] transition-transform duration-500 ease-in-out',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>
        </>
    )
}
