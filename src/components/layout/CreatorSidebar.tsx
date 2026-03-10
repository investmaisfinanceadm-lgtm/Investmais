'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Video,
    Library,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UserData {
    nome: string
    email: string
    avatar_url: string | null
    cota_mensal: number
    cota_usada: number
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/criar', label: 'Criar Vídeo', icon: Video, highlight: true },
    { href: '/biblioteca', label: 'Biblioteca', icon: Library },
    { href: '/agenda', label: 'Agenda', icon: Calendar },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function CreatorSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [user, setUser] = useState<UserData | null>(null)
    const [notifications, setNotifications] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        async function loadUser() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            const { data: profile } = await supabase
                .schema('im')
                .from('profiles')
                .select('nome, email, avatar_url, cota_mensal, cota_usada')
                .eq('id', authUser.id)
                .single()

            if (profile) setUser(profile as UserData)

            // Load unread notifications count
            const { count } = await supabase
                .schema('im')
                .from('notificacoes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', authUser.id)
                .eq('lida', false)

            setNotifications(count || 0)
        }
        loadUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success('Logout realizado')
        router.push('/login')
        router.refresh()
    }

    const quotaPercent = user
        ? Math.round((user.cota_usada / user.cota_mensal) * 100)
        : 0

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-dark-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold flex-shrink-0">
                        <span className="text-primary font-black text-base">I+</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">
                        Invest<span className="text-gradient-gold">Mais</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    if (item.highlight) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-gold text-primary font-semibold shadow-gold hover:shadow-gold-lg transition-all duration-200 group mt-2 mb-2"
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span>{item.label}</span>
                                <ChevronRight className="w-4 h-4 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                isActive ? 'sidebar-item-active' : 'sidebar-item'
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-dark-border space-y-3">
                {/* Quota */}
                {user && (
                    <div className="px-2 py-3 rounded-xl bg-dark-muted">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-400 font-medium">Cota mensal</span>
                            <span className="text-xs font-semibold text-white">
                                {user.cota_usada}/{user.cota_mensal}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                            {user.cota_mensal - user.cota_usada} vídeos restantes
                        </p>
                    </div>
                )}

                {/* User info */}
                {user && (
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.nome}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-gold text-xs font-bold">
                                    {getInitials(user.nome)}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.nome}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            title="Sair"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-dark-card border-r border-dark-border h-screen sticky top-0 flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-dark-card/95 backdrop-blur-lg border-b border-dark-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-gold flex items-center justify-center">
                        <span className="text-primary font-black text-sm">I+</span>
                    </div>
                    <span className="text-white font-bold text-lg">
                        Invest<span className="text-gradient-gold">Mais</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="relative p-2 text-gray-400 hover:text-white">
                        <Bell className="w-5 h-5" />
                        {notifications > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-primary text-xs font-bold rounded-full flex items-center justify-center">
                                {notifications}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 text-gray-400 hover:text-white"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    'lg:hidden fixed top-0 left-0 h-full w-72 bg-dark-card border-r border-dark-border z-50 transition-transform duration-300',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>
        </>
    )
}
