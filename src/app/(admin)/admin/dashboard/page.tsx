'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Video,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Clock,
} from 'lucide-react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'

interface Stats {
    totalUsers: number
    videosThisMonth: number
    videosToday: number
    totalQuotaConsumed: number
}

interface VideoActivity {
    id: string
    nome_produto: string
    status: string
    created_at: string
    user_nome: string | null
}

// Generate last 30 days data
function generateChartData() {
    const data = []
    for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        data.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            videos: Math.floor(Math.random() * 15) + 1,
        })
    }
    return data
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl px-4 py-3 shadow-card">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-white font-semibold mt-1">
                    {payload[0].value} vídeos
                </p>
            </div>
        )
    }
    return null
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        videosThisMonth: 0,
        videosToday: 0,
        totalQuotaConsumed: 0,
    })
    const [recentVideos, setRecentVideos] = useState<VideoActivity[]>([])
    const [topUsers, setTopUsers] = useState<Array<{ nome: string; total: number }>>([])
    const [chartData] = useState(generateChartData())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            try {
                const response = await fetch('/api/admin/dashboard-stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data.stats)
                    setRecentVideos(data.recentVideos)
                    setTopUsers(data.topUsers)
                }
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const metricCards = [
        {
            label: 'Usuários Ativos',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            change: '+12%',
        },
        {
            label: 'Vídeos no Mês',
            value: stats.videosThisMonth,
            icon: Video,
            color: 'text-gold',
            bg: 'bg-gold/10',
            change: '+8%',
        },
        {
            label: 'Vídeos Hoje',
            value: stats.videosToday,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            change: '+3%',
        },
        {
            label: 'Cota Total Consumida',
            value: stats.totalQuotaConsumed,
            icon: Activity,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            change: '+5%',
        },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="section-title">Dashboard Administrativo</h1>
                <p className="section-subtitle">
                    Visão geral da plataforma InvestMais
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {metricCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <div key={card.label} className="card-hover animate-fade-in">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 font-medium">
                                        {card.label}
                                    </p>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {isLoading ? (
                                            <span className="shimmer inline-block w-16 h-8 rounded" />
                                        ) : (
                                            card.value.toLocaleString()
                                        )}
                                    </p>
                                </div>
                                <div
                                    className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}
                                >
                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-4">
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs text-emerald-400 font-medium">
                                    {card.change}
                                </span>
                                <span className="text-xs text-gray-500">em relação ao mês anterior</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Line Chart - Videos by day */}
                <div className="card xl:col-span-2">
                    <h2 className="text-base font-semibold text-white mb-6">
                        Vídeos Criados por Dia (últimos 30 dias)
                    </h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
                            <XAxis
                                dataKey="date"
                                stroke="#4b5563"
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                tickLine={false}
                                interval={4}
                            />
                            <YAxis
                                stroke="#4b5563"
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="videos"
                                stroke="#C9A84C"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: '#C9A84C', strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar chart - Top users */}
                <div className="card">
                    <h2 className="text-base font-semibold text-white mb-6">
                        Top Usuários
                    </h2>
                    {topUsers.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={topUsers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" horizontal={false} />
                                <XAxis
                                    type="number"
                                    stroke="#4b5563"
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="nome"
                                    stroke="#4b5563"
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    tickLine={false}
                                    width={80}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="total" fill="#C9A84C" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-60 text-gray-500 text-sm">
                            Nenhum dado disponível
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-white">
                        Atividade Recente
                    </h2>
                    <Clock className="w-4 h-4 text-gray-400" />
                </div>

                {recentVideos.length === 0 && !isLoading ? (
                    <div className="text-center py-12 text-gray-500">
                        <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>Nenhum vídeo criado ainda</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border-main)]">
                                    <th className="table-header">Produto</th>
                                    <th className="table-header">Usuário</th>
                                    <th className="table-header">Data</th>
                                    <th className="table-header">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentVideos.map((video) => (
                                    <tr key={video.id} className="table-row">
                                        <td className="table-cell font-medium text-white">
                                            {video.nome_produto}
                                        </td>
                                        <td className="table-cell">
                                            {video.user_nome || 'Desconhecido'}
                                        </td>
                                        <td className="table-cell">
                                            {formatDateTime(video.created_at)}
                                        </td>
                                        <td className="table-cell">
                                            <span
                                                className={`badge ${getStatusColor(video.status)}`}
                                            >
                                                {getStatusLabel(video.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
