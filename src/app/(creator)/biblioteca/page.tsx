'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Search,
    FolderPlus,
    Folder,
    Video,
    Download,
    Trash2,
    MoreHorizontal,
    Play,
    X,
    FolderOpen,
    Move,
} from 'lucide-react'
import { formatDate, cn, getStatusColor, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

interface VideoItem {
    id: string
    nome_produto: string
    formato: string
    duracao: number
    status: string
    video_url: string | null
    pasta_id: string | null
    created_at: string
}

interface PastaItem {
    id: string
    nome: string
    created_at: string
}

const FORMATO_LABELS: Record<string, string> = {
    instagram: 'Instagram',
    stories: 'Stories',
    educativo: 'Educativo',
    divulgacao: 'Divulgação',
}

const FORMATO_COLORS: Record<string, string> = {
    instagram: 'badge-gold',
    stories: 'badge-blue',
    educativo: 'badge-green',
    divulgacao: 'badge-yellow',
}

export default function BibliotecaPage() {
    const [videos, setVideos] = useState<VideoItem[]>([])
    const [pastas, setPastas] = useState<PastaItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterFormato, setFilterFormato] = useState('todos')
    const [filterStatus, setFilterStatus] = useState('todos')
    const [selectedPasta, setSelectedPasta] = useState<string | null>(null)
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [newFolderName, setNewFolderName] = useState('')
    const [showNewFolder, setShowNewFolder] = useState(false)
    const [movingVideo, setMovingVideo] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [videosRes, pastasRes] = await Promise.all([
                fetch('/api/creator/videos'),
                fetch('/api/creator/pastas'),
            ])
            if (videosRes.ok) setVideos(await videosRes.json())
            if (pastasRes.ok) setPastas(await pastasRes.json())
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return

        const res = await fetch('/api/creator/pastas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: newFolderName.trim() }),
        })

        if (!res.ok) {
            toast.error('Erro ao criar pasta')
        } else {
            toast.success('Pasta criada!')
            setNewFolderName('')
            setShowNewFolder(false)
            loadData()
        }
    }

    const handleDeleteVideo = async (video: VideoItem) => {
        if (!confirm(`Excluir "${video.nome_produto}"?`)) return
        const res = await fetch(`/api/creator/videos/${video.id}`, { method: 'DELETE' })
        if (!res.ok) {
            toast.error('Erro ao excluir vídeo')
        } else {
            toast.success('Vídeo excluído')
            loadData()
        }
        setActiveMenu(null)
    }

    const handleMoveVideo = async (videoId: string, pastaId: string | null) => {
        const res = await fetch(`/api/creator/videos/${videoId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pasta_id: pastaId }),
        })
        if (!res.ok) {
            toast.error('Erro ao mover vídeo')
        } else {
            toast.success('Vídeo movido!')
            loadData()
        }
        setMovingVideo(null)
        setActiveMenu(null)
    }

    const filteredVideos = videos.filter((v) => {
        const matchSearch = v.nome_produto.toLowerCase().includes(search.toLowerCase())
        const matchFormato = filterFormato === 'todos' || v.formato === filterFormato
        const matchStatus = filterStatus === 'todos' || v.status === filterStatus
        const matchPasta =
            selectedPasta === null
                ? true
                : selectedPasta === 'rascunhos'
                    ? v.status === 'processando'
                    : selectedPasta === 'sem-pasta'
                        ? !v.pasta_id
                        : v.pasta_id === selectedPasta
        return matchSearch && matchFormato && matchStatus && matchPasta
    })

    const videosByPasta = (pastaId: string | null) =>
        videos.filter((v) => v.pasta_id === pastaId).length

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Folder Sidebar */}
            <aside className="w-full lg:w-56 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-dark-border bg-dark-card/50 p-4 space-y-1">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-300">Pastas</h3>
                    <button
                        onClick={() => setShowNewFolder(true)}
                        className="p-1 text-gray-400 hover:text-gold rounded-lg hover:bg-gold/10 transition-colors"
                        title="Nova pasta"
                    >
                        <FolderPlus className="w-4 h-4" />
                    </button>
                </div>

                {showNewFolder && (
                    <div className="flex gap-1 mb-2">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateFolder()
                                if (e.key === 'Escape') setShowNewFolder(false)
                            }}
                            placeholder="Nome da pasta"
                            autoFocus
                            className="input-field flex-1 h-8 text-xs px-2"
                        />
                        <button onClick={handleCreateFolder} className="px-2 py-1 bg-gold text-primary rounded-lg text-xs font-medium">
                            OK
                        </button>
                    </div>
                )}

                <button
                    onClick={() => setSelectedPasta(null)}
                    className={cn('sidebar-item w-full text-left', selectedPasta === null && 'sidebar-item-active')}
                >
                    <Video className="w-4 h-4" />
                    <span className="text-sm">Todos os Vídeos</span>
                    <span className="ml-auto text-xs text-gray-500">{videos.length}</span>
                </button>

                <button
                    onClick={() => setSelectedPasta('sem-pasta')}
                    className={cn('sidebar-item w-full text-left', selectedPasta === 'sem-pasta' && 'sidebar-item-active')}
                >
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm">Sem pasta</span>
                    <span className="ml-auto text-xs text-gray-500">{videosByPasta(null)}</span>
                </button>

                <button
                    onClick={() => setSelectedPasta('rascunhos')}
                    className={cn('sidebar-item w-full text-left', selectedPasta === 'rascunhos' && 'sidebar-item-active')}
                >
                    <Folder className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Rascunhos</span>
                    <span className="ml-auto text-xs text-gray-500">
                        {videos.filter((v) => v.status === 'processando').length}
                    </span>
                </button>

                <div className="divider !my-3" />

                {pastas.map((pasta) => (
                    <button
                        key={pasta.id}
                        onClick={() => setSelectedPasta(pasta.id)}
                        className={cn('sidebar-item w-full text-left', selectedPasta === pasta.id && 'sidebar-item-active')}
                    >
                        <Folder className="w-4 h-4 text-gold" />
                        <span className="text-sm truncate">{pasta.nome}</span>
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="section-title">Biblioteca</h1>
                    <p className="text-sm text-gray-400">{filteredVideos.length} vídeos</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar vídeos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-11 h-10"
                        />
                    </div>
                    <select
                        value={filterFormato}
                        onChange={(e) => setFilterFormato(e.target.value)}
                        className="input-field h-10 w-full sm:w-40"
                    >
                        <option value="todos">Todos os formatos</option>
                        <option value="instagram">Instagram</option>
                        <option value="stories">Stories</option>
                        <option value="educativo">Educativo</option>
                        <option value="divulgacao">Divulgação</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-field h-10 w-full sm:w-36"
                    >
                        <option value="todos">Todo status</option>
                        <option value="concluido">Concluído</option>
                        <option value="processando">Processando</option>
                        <option value="erro">Erro</option>
                    </select>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="card">
                                <div className="shimmer w-full h-36 rounded-xl mb-3" />
                                <div className="shimmer h-4 rounded w-3/4 mb-2" />
                                <div className="shimmer h-3 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="text-center py-16">
                        <Video className="w-14 h-14 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 font-medium">Nenhum vídeo encontrado</p>
                        <p className="text-gray-500 text-sm mt-1">
                            {search ? 'Tente outra busca' : 'Crie seu primeiro vídeo'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredVideos.map((video) => (
                            <div key={video.id} className="card-hover group relative overflow-hidden">
                                {/* Thumbnail */}
                                <div
                                    className="relative w-full h-36 rounded-xl overflow-hidden bg-dark-muted border border-dark-border mb-3 cursor-pointer"
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    {video.video_url && video.status === 'concluido' ? (
                                        <video src={video.video_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Video className={`w-10 h-10 ${video.status === 'processando' ? 'text-yellow-400 animate-pulse' : 'text-gray-600'}`} />
                                        </div>
                                    )}
                                    {video.status === 'concluido' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center">
                                                <Play className="w-5 h-5 text-primary ml-0.5" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <p className="text-white font-medium text-sm truncate mb-1">
                                    {video.nome_produto}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">{formatDate(video.created_at)}</p>
                                    <span className={`badge text-xs ${FORMATO_COLORS[video.formato] || 'badge-blue'}`}>
                                        {FORMATO_LABELS[video.formato] || video.formato}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <span className={`badge text-xs ${getStatusColor(video.status)}`}>
                                        {getStatusLabel(video.status)}
                                    </span>
                                </div>

                                {/* Actions menu */}
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setActiveMenu(activeMenu === video.id ? null : video.id)
                                        }}
                                        className="w-7 h-7 rounded-lg bg-dark-card/90 border border-dark-border flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>

                                    {activeMenu === video.id && (
                                        <div className="absolute right-0 mt-1 w-44 bg-dark-card border border-dark-border rounded-xl shadow-card-hover z-10 overflow-hidden animate-fade-in">
                                            {video.video_url && (
                                                <a
                                                    href={video.video_url}
                                                    download
                                                    onClick={() => setActiveMenu(null)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Baixar
                                                </a>
                                            )}
                                            <button
                                                onClick={() => setMovingVideo(movingVideo === video.id ? null : video.id)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                                            >
                                                <Move className="w-3.5 h-3.5" />
                                                Mover para pasta
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVideo(video)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Excluir
                                            </button>
                                        </div>
                                    )}

                                    {/* Move to folder sub-menu */}
                                    {movingVideo === video.id && (
                                        <div className="absolute right-0 mt-1 w-44 bg-dark-card border border-dark-border rounded-xl shadow-card-hover z-20 overflow-hidden animate-fade-in">
                                            <p className="px-3 py-2 text-xs text-gray-400 border-b border-dark-border">Mover para:</p>
                                            <button
                                                onClick={() => handleMoveVideo(video.id, null)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                                            >
                                                <FolderOpen className="w-3.5 h-3.5" />
                                                Sem pasta
                                            </button>
                                            {pastas.map((pasta) => (
                                                <button
                                                    key={pasta.id}
                                                    onClick={() => handleMoveVideo(video.id, pasta.id)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                                                >
                                                    <Folder className="w-3.5 h-3.5 text-gold" />
                                                    {pasta.nome}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Video Preview Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedVideo(null)}
                    />
                    <div className="relative z-10 bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl shadow-card-hover animate-fade-in">
                        <div className="flex items-center justify-between p-5 border-b border-dark-border">
                            <div>
                                <h3 className="font-semibold text-white">{selectedVideo.nome_produto}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`badge text-xs ${FORMATO_COLORS[selectedVideo.formato] || 'badge-blue'}`}>
                                        {FORMATO_LABELS[selectedVideo.formato] || selectedVideo.formato}
                                    </span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-500">{formatDate(selectedVideo.created_at)}</span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-500">{selectedVideo.duracao}s</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5">
                            {selectedVideo.video_url ? (
                                <video
                                    src={selectedVideo.video_url}
                                    controls
                                    autoPlay
                                    className="w-full rounded-xl max-h-80"
                                />
                            ) : (
                                <div className="w-full h-48 rounded-xl bg-dark-muted border border-dark-border flex items-center justify-center text-gray-500 text-sm">
                                    {selectedVideo.status === 'processando'
                                        ? 'Vídeo em processamento...'
                                        : 'Vídeo não disponível'}
                                </div>
                            )}

                            <div className="flex gap-3 mt-4">
                                {selectedVideo.video_url && (
                                    <a
                                        href={selectedVideo.video_url}
                                        download
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Baixar
                                    </a>
                                )}
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="btn-secondary flex-1"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
