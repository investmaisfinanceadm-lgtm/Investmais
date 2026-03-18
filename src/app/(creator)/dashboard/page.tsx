'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Video, Clock, Library, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'

interface DashboardVideo {
    id: string
    nome_produto: string
    status: string
    created_at: string
    duracao: number
}

interface UserStats {
    nome: string
    cota_mensal: number
    cota_usada: number
    videosTotal: number
}

export default function DashboardPage() {
    const [stats, setStats] = useState<UserStats | null>(null)
    const [recentVideos, setRecentVideos] = useState<DashboardVideo[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch('/api/creator/dashboard')
                if (response.ok) {
                    const data = await response.json()
                    if (data.profile) setStats(data.profile)
                    setRecentVideos(data.recentVideos || [])
                }
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const quotaPercent = stats ? Math.min(Math.round((stats.cota_usada / stats.cota_mensal) * 100), 100) : 0

    const greeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Bom dia'
        if (hour < 18) return 'Boa tarde'
        return 'Boa noite'
    }

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    {isLoading ? (
                        <div className="shimmer h-8 w-64 rounded mb-2" />
                    ) : (
                        <h1 className="text-3xl font-bold text-white">
                            {greeting()},{' '}
                            <span className="text-gradient-gold">
                                {stats?.nome?.split(' ')[0] || 'usuário'}
                            </span>{' '}
                            👋
                        </h1>
                    )}
                    <p className="text-gray-400 mt-1">
                        Bem-vindo à sua plataforma de criação de conteúdo financeiro
                    </p>
                </div>
                <Link href="/criar" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    Criar Novo Vídeo
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-hover animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                            <Video className="w-5 h-5 text-gold" />
                        </div>
                        <span className="text-xs text-gray-400">este mês</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{isLoading ? '—' : stats?.cota_usada || 0}</p>
                    <p className="text-sm text-gray-400 mt-1">Vídeos criados</p>
                </div>

                <div className="card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-xs text-gray-400">disponível</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {isLoading ? '—' : stats ? stats.cota_mensal - stats.cota_usada : 0}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Cota restante</p>
                    {stats && (
                        <div className="mt-3">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${quotaPercent}%` }} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{quotaPercent}% usado</p>
                        </div>
                    )}
                </div>

                <div className="card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                            <Library className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-xs text-gray-400">total</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{isLoading ? '—' : stats?.videosTotal || 0}</p>
                    <p className="text-sm text-gray-400 mt-1">Vídeos na biblioteca</p>
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                    href="/criar"
                    className="group card-hover flex items-center gap-4 cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                        <Plus className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-white">Criar Novo Vídeo</p>
                        <p className="text-sm text-gray-400 mt-0.5">Start do processo de geração por IA</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    href="/biblioteca"
                    className="group card-hover flex items-center gap-4 cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center group-hover:bg-blue-400/20 transition-colors">
                        <Library className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-white">Ir para Biblioteca</p>
                        <p className="text-sm text-gray-400 mt-0.5">Acesse todos os seus vídeos</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* Recent Videos */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Criações Recentes</h2>
                    <Link href="/biblioteca" className="text-sm text-gold hover:text-gold-300 transition-colors flex items-center gap-1">
                        Ver todos
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="card">
                                <div className="shimmer h-5 rounded w-1/3 mb-2" />
                                <div className="shimmer h-3 rounded w-1/4" />
                            </div>
                        ))}
                    </div>
                ) : recentVideos.length === 0 ? (
                    <div className="card text-center py-12">
                        <Video className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-400 font-medium">Nenhum vídeo criado ainda</p>
                        <p className="text-gray-500 text-sm mt-1">
                            Clique em &quot;Criar Novo Vídeo&quot; para começar
                        </p>
                        <Link href="/criar" className="btn-primary inline-flex items-center gap-2 mt-4">
                            <Plus className="w-4 h-4" />
                            Criar Primeiro Vídeo
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentVideos.map((video) => (
                            <div key={video.id} className="card-hover flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-dark-muted border border-dark-border flex items-center justify-center flex-shrink-0">
                                    <Video className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{video.nome_produto}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs text-gray-500">
                                            {formatDateTime(video.created_at)}
                                        </span>
                                    </div>
                                </div>
                                <span className={`badge ${getStatusColor(video.status)}`}>
                                    {getStatusLabel(video.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
