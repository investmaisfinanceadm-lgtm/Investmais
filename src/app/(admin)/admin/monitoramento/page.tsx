'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Trash2, Play } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MonitorVideo {
    id: string
    nome_produto: string
    formato: string
    linha_editorial: string
    duracao: number
    status: string
    video_url: string | null
    created_at: string
    user_id: string
    user_nome?: string
}

export default function AdminMonitoramentoPage() {
    const [videos, setVideos] = useState<MonitorVideo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('todos')
    const [filterUser, setFilterUser] = useState('todos')
    const [users, setUsers] = useState<Array<{ id: string; nome: string }>>([])
    const [selectedVideo, setSelectedVideo] = useState<MonitorVideo | null>(null)

    const loadData = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/monitoramento')
            if (response.ok) {
                const data = await response.json()
                setVideos(data.videos)
                setUsers(data.users)
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleDelete = async (video: MonitorVideo) => {
        if (!confirm(`Excluir vídeo "${video.nome_produto}"?`)) return

        const response = await fetch('/api/admin/monitoramento', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: video.id }),
        })

        if (!response.ok) {
            toast.error('Erro ao excluir vídeo')
        } else {
            toast.success('Vídeo excluído')
            loadData()
        }
    }

    const filteredVideos = videos.filter((v) => {
        const matchSearch = v.nome_produto.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'todos' || v.status === filterStatus
        const matchUser = filterUser === 'todos' || v.user_id === filterUser
        return matchSearch && matchStatus && matchUser
    })

    const formatOptions: Record<string, string> = {
        instagram: 'Instagram/Facebook',
        stories: 'Stories',
        educativo: 'Educativo',
        divulgacao: 'Divulgação',
    }

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="section-title">Monitoramento</h1>
                <p className="section-subtitle">
                    {videos.length} vídeos na plataforma
                </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: videos.length, color: 'text-white' },
                    {
                        label: 'Concluídos',
                        value: videos.filter((v) => v.status === 'concluido').length,
                        color: 'text-emerald-400',
                    },
                    {
                        label: 'Processando',
                        value: videos.filter((v) => v.status === 'processando').length,
                        color: 'text-yellow-400',
                    },
                    {
                        label: 'Com erro',
                        value: videos.filter((v) => v.status === 'erro').length,
                        color: 'text-red-400',
                    },
                ].map((stat) => (
                    <div key={stat.label} className="card text-center py-4">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por produto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-11 h-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input-field h-10 w-40"
                        >
                            <option value="todos">Todo status</option>
                            <option value="processando">Processando</option>
                            <option value="concluido">Concluído</option>
                            <option value="erro">Erro</option>
                        </select>
                        <select
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value)}
                            className="input-field h-10 w-44"
                        >
                            <option value="todos">Todos os usuários</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--bg-primary)]">
                            <tr>
                                <th className="table-header">Produto</th>
                                <th className="table-header">Usuário</th>
                                <th className="table-header">Formato</th>
                                <th className="table-header">Duração</th>
                                <th className="table-header">Data</th>
                                <th className="table-header">Status</th>
                                <th className="table-header text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="table-row">
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="table-cell">
                                                <div className="shimmer h-4 rounded w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredVideos.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        Nenhum vídeo encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredVideos.map((video) => (
                                    <tr key={video.id} className="table-row">
                                        <td className="table-cell font-medium text-white">
                                            {video.nome_produto}
                                        </td>
                                        <td className="table-cell">{video.user_nome}</td>
                                        <td className="table-cell text-xs">
                                            {formatOptions[video.formato] || video.formato}
                                        </td>
                                        <td className="table-cell">{video.duracao}s</td>
                                        <td className="table-cell text-xs">
                                            {formatDateTime(video.created_at)}
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${getStatusColor(video.status)}`}>
                                                {getStatusLabel(video.status)}
                                            </span>
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {video.video_url && (
                                                    <button
                                                        onClick={() => setSelectedVideo(video)}
                                                        className="p-2 text-gray-400 hover:text-gold rounded-lg hover:bg-gold/10 transition-colors"
                                                        title="Visualizar"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(video)}
                                                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedVideo(null)}
                    />
                    <div className="relative z-10 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl w-full max-w-2xl shadow-card-hover animate-fade-in p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {selectedVideo.nome_produto}
                        </h3>
                        {selectedVideo.video_url ? (
                            <video
                                src={selectedVideo.video_url}
                                controls
                                className="w-full rounded-xl"
                            />
                        ) : (
                            <div className="aspect-video flex items-center justify-center bg-[var(--bg-primary)] rounded-xl text-gray-500">
                                Vídeo não disponível
                            </div>
                        )}
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="mt-4 btn-secondary w-full"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
