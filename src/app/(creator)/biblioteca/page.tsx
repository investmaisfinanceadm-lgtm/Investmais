'use client'

import { useState, useEffect } from 'react'
import { 
    LayoutGrid, 
    Folder, 
    Search, 
    Plus, 
    Video, 
    MoreHorizontal, 
    Download, 
    Trash2, 
    X,
    Play,
    Pause,
    Move,
    Tag,
    Hash,
    Filter,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface Video {
    id: string
    nome_produto: string
    video_url: string | null
    status: 'concluido' | 'processando' | 'erro'
    created_at: string
    duracao: number
    formato: string
    pasta_id: string | null
    tags?: string[]
}

interface Pasta {
    id: string
    nome: string
}

const FORMATO_LABELS: Record<string, string> = {
    'instagram': 'Feed Instagram',
    'stories': 'Stories / Reels',
    'youtube': 'YouTube / Wide',
    'educativo': 'Educação',
    'divulgacao': 'Vendas'
}

const DEFAULT_TAGS = ['#Urgente', '#Lançamento', '#HomeEquity', '#Campanha_Q1', '#Educativo']

export default function BibliotecaPage() {
    const { data: session } = useSession()
    const [videos, setVideos] = useState<Video[]>([])
    const [pastas, setPastas] = useState<Pasta[]>([])
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [movingVideo, setMovingVideo] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [vRes, pRes] = await Promise.all([
                fetch('/api/creator/videos'),
                fetch('/api/creator/pastas')
            ])
            
            if (vRes.ok) {
                const videoData = await vRes.json()
                // Inject random tags for mock purpose
                setVideos(videoData.map((v: Video) => ({
                    ...v,
                    tags: [DEFAULT_TAGS[Math.floor(Math.random() * DEFAULT_TAGS.length)]]
                })))
            }
            if (pRes.ok) setPastas(await pRes.json())
        } catch (error) {
            console.error('Error fetching library:', error)
            toast.error('Erro ao carregar biblioteca')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteVideo = async (video: Video) => {
        if (!confirm('Tem certeza que deseja excluir permanentemente este vídeo?')) return
        
        try {
            const res = await fetch(`/api/creator/videos?id=${video.id}`, { method: 'DELETE' })
            if (res.ok) {
                setVideos(videos.filter(v => v.id !== video.id))
                toast.success('Ativo removido do acervo')
                setActiveMenu(null)
            }
        } catch (error) {
            toast.error('Erro ao excluir')
        }
    }

    const handleMoveVideo = async (videoId: string, pastaId: string | null) => {
        try {
            const res = await fetch('/api/creator/videos/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId, pastaId })
            })
            if (res.ok) {
                setVideos(videos.map(v => v.id === videoId ? { ...v, pasta_id: pastaId } : v))
                toast.success('Localização atualizada')
                setMovingVideo(null)
                setActiveMenu(null)
            }
        } catch (error) {
            toast.error('Erro ao mover arquivo')
        }
    }

    const filteredVideos = videos.filter(v => {
        const matchesFolder = selectedFolder ? v.pasta_id === selectedFolder : true
        const matchesTag = selectedTag ? v.tags?.includes(selectedTag) : true
        const matchesSearch = v.nome_produto.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFolder && matchesTag && matchesSearch
    })

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'concluido': return 'Finalizado'
            case 'processando': return 'Processando'
            case 'erro': return 'Falha'
            default: return status
        }
    }

    return (
        <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
                {/* Header Actions */}
                <div className="min-h-[60px] md:h-24 border-b border-[var(--border-main)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-3 px-4 md:px-10 py-3 md:py-0 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4 md:gap-10 flex-1 max-w-4xl min-w-0">
                        <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center border border-accent/20">
                                <LayoutGrid className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">Acervo Digital</h1>
                                <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Protocolos de Mídia Estúdio AI</p>
                            </div>
                        </div>

                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="BUSCAR NO ACERVO..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] placeholder-[#94A3B8] focus:bg-[var(--bg-primary)] focus:border-accent/40 focus:ring-0 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/criar" className="btn-primary flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 bg-accent text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 transition-all shadow-accent/20 whitespace-nowrap">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Configurar Novo Protocolo</span>
                            <span className="sm:hidden">Novo</span>
                        </Link>
                    </div>
                </div>

                {/* Advanced Filter Bar (Folders & Tags) - NEW RECOMMENDATION */}
                <div className="px-4 md:px-10 py-4 md:py-6 border-b border-[var(--border-main)] flex flex-col gap-4 md:gap-6 bg-[var(--bg-card)]">
                    {/* Folders */}
                    <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar no-view">
                        <div className="flex items-center gap-2 mr-4 border-r border-[var(--border-main)] pr-4">
                             <Filter className="w-3 h-3 text-gray-600" />
                             <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest whitespace-nowrap">Pastas Operais:</span>
                        </div>
                        <button
                            onClick={() => setSelectedFolder(null)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                !selectedFolder ? 'bg-accent text-black shadow-accent' : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-main)]'
                            )}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Ver Tudo
                        </button>
                        {pastas.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => setSelectedFolder(folder.id)}
                                className={cn(
                                    "flex items-center gap-3 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border border-[var(--border-main)]",
                                    selectedFolder === folder.id ? 'bg-accent text-black shadow-accent' : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-main)]'
                                )}
                            >
                                <Folder className="w-3.5 h-3.5" />
                                {folder.nome}
                            </button>
                        ))}
                    </div>

                    {/* Tags System - NEW */}
                    <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar no-view">
                        <div className="flex items-center gap-2 mr-4 border-r border-[var(--border-main)] pr-4">
                             <Hash className="w-3 h-3 text-gray-600" />
                             <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest whitespace-nowrap">Filtragem Inteligente:</span>
                        </div>
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={cn(
                                "px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border",
                                !selectedTag ? 'border-accent bg-accent/10 text-accent' : 'border-[var(--border-main)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            )}
                        >
                            TODAS AS TAGS
                        </button>
                        {DEFAULT_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border",
                                    selectedTag === tag ? 'border-accent bg-accent/10 text-accent shadow-accent-sm' : 'border-[var(--border-main)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                )}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4] rounded-[48px] shimmer opacity-10 border border-[var(--border-main)] bg-[var(--bg-primary)]" />
                            ))}
                        </div>
                    ) : filteredVideos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 space-y-6">
                            <div className="w-24 h-24 rounded-full bg-[var(--bg-primary)] flex items-center justify-center border border-[var(--border-main)] shadow-2xl">
                                <Search className="w-10 h-10 text-gray-800" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-[var(--text-main)] font-black uppercase text-sm tracking-widest mb-2">Acervo Vazio ou Filtro Incompatível</h3>
                                <p className="text-gray-600 font-bold uppercase text-[9px]">Ajuste seus filtros ou inicie uma nova geração por IA.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10 pb-20">
                            {filteredVideos.map((video) => (
                                <div
                                    key={video.id}
                                    className="group relative bg-[var(--bg-card)] border border-[var(--border-main)] shadow-light-card rounded-[40px] overflow-hidden hover:border-accent/40 transition-all duration-700 shadow-2xl flex flex-col hover:scale-[1.02] hover:-translate-y-2"
                                >
                                    {/* Thumbnail */}
                                    <div 
                                        className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-black"
                                        onClick={() => setSelectedVideo(video)}
                                    >
                                        {video.video_url ? (
                                            <video 
                                                src={video.video_url} 
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                                <Video className="w-12 h-12 text-gray-500 animate-pulse" />
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
                                        
                                        {video.status === 'concluido' && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[4px]">
                                                <div className="w-16 h-16 rounded-full bg-accent text-black flex items-center justify-center shadow-accent transform scale-50 group-hover:scale-100 transition-transform duration-500 hover:scale-110">
                                                    <Play className="fill-current w-6 h-6 ml-1" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Tags Display on card */}
                                        <div className="absolute top-6 left-6 flex flex-wrap gap-2 group-hover:opacity-0 transition-opacity duration-300">
                                            {video.tags?.map(tag => (
                                                <span key={tag} className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[var(--text-main)] font-black text-[7px] uppercase tracking-widest">{tag}</span>
                                            ))}
                                        </div>

                                        <div className="absolute top-6 right-6 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === video.id ? null : video.id); }}
                                                className="p-3.5 rounded-[20px] bg-black/60 backdrop-blur-md border border-white/10 text-[var(--text-main)] hover:bg-accent hover:text-black hover:border-accent transition-all shadow-2xl"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-8 left-8 right-8 space-y-4">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border w-fit shadow-2xl transition-all",
                                                        video.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                                                        video.status === 'processando' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30 animate-pulse shadow-amber-400/10' : 
                                                        'bg-red-500/10 text-red-500 border-red-500/30'
                                                    )}>
                                                        {getStatusLabel(video.status)}
                                                    </span>
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">{video.duracao}s</span>
                                                </div>
                                                <h3 className="text-white font-black uppercase text-sm tracking-tighter truncate group-hover:text-accent transition-colors duration-500 italic">
                                                    {video.nome_produto}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Menus */}
                                    {activeMenu === video.id && (
                                        <div className="absolute top-24 right-8 w-56 bg-[#0A192F] border border-white/10 rounded-[28px] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-30 overflow-hidden animate-scale-in backdrop-blur-3xl">
                                            {video.video_url && (
                                                <a
                                                    href={video.video_url}
                                                    download
                                                    className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)] transition-all border-b border-[var(--border-main)]"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Exportar Ativo
                                                </a>
                                            )}
                                            <button 
                                                onClick={() => setMovingVideo(video.id)}
                                                className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)] transition-all border-b border-[var(--border-main)]"
                                            >
                                                <Move className="w-4 h-4" />
                                                Redirecionar Pasta
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteVideo(video)}
                                                className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Eliminar do Acervo
                                            </button>
                                        </div>
                                    )}

                                    {movingVideo === video.id && (
                                        <div className="absolute inset-0 bg-primary/98 backdrop-blur-2xl z-40 p-10 flex flex-col animate-scale-in">
                                            <div className="flex items-center justify-between mb-10">
                                                <h5 className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">Reprocessar Local</h5>
                                                <button onClick={() => setMovingVideo(null)} className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-main)] text-gray-500 hover:text-[var(--text-main)]"><X className="w-4 h-4" /></button>
                                            </div>
                                            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pb-4">
                                                <button 
                                                    onClick={() => handleMoveVideo(video.id, null)}
                                                    className="w-full text-left p-6 rounded-[24px] bg-[var(--bg-primary)] border border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-accent hover:border-accent/40 shadow-inner group/btn"
                                                >
                                                    <div className="flex items-center gap-3">
                                                         <LayoutGrid className="w-4 h-4 opacity-50 group-hover/btn:opacity-100" />
                                                         Raiz do Acervo Digital
                                                    </div>
                                                </button>
                                                {pastas.map(p => (
                                                    <button 
                                                        key={p.id}
                                                        onClick={() => handleMoveVideo(video.id, p.id)}
                                                        className="w-full text-left p-6 rounded-[24px] bg-[var(--bg-primary)] border border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-accent hover:border-accent/40 shadow-inner group/btn"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                             <Folder className="w-4 h-4 opacity-50 group-hover/btn:opacity-100" />
                                                             {p.nome}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal - Premium Fullscreen Experience */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-8 lg:p-20 overflow-hidden">
                    <div className="absolute inset-0 bg-primary/98 backdrop-blur-3xl animate-fade-in" onClick={() => setSelectedVideo(null)} />
                    <div className="relative z-50 bg-[#0A192F] border border-[var(--border-main)] rounded-2xl md:rounded-[64px] w-full max-w-7xl shadow-[0_0_150px_rgba(48,203,123,0.1)] animate-scale-in flex flex-col lg:row overflow-hidden max-h-[95vh]">
                        <div className="flex flex-col lg:flex-row h-full">
                            <div className="flex-1 bg-black/40 flex items-center justify-center relative min-h-[50vh] lg:min-h-0 p-8">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
                                                       {selectedVideo.video_url ? (
                                    <div className={cn(
                                        "relative shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-black/20 overflow-hidden flex items-center justify-center group/player transition-all duration-700",
                                        selectedVideo.formato === 'stories' 
                                            ? "aspect-[9/16] h-[75vh] md:h-[82vh] rounded-[48px] border-[12px] border-[#18181B] ring-1 ring-white/10" 
                                            : "w-full max-w-4xl aspect-video rounded-[32px] border border-white/10"
                                    )}>
                                        <video 
                                            id="main-video-player"
                                            src={selectedVideo.video_url} 
                                            autoPlay 
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover" 
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onClick={(e) => {
                                                const v = e.currentTarget
                                                if (v.paused) v.play()
                                                else v.pause()
                                            }}
                                        />
                                        
                                        {/* Custom Floating Controls */}
                                        <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col gap-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent translate-y-4 opacity-0 group-hover/player:translate-y-0 group-hover/player:opacity-100 transition-all duration-500 pointer-events-none">
                                            <div className="flex items-center justify-between pointer-events-auto">
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => {
                                                            const v = document.getElementById('main-video-player') as HTMLVideoElement
                                                            if (v.paused) v.play()
                                                            else v.pause()
                                                        }}
                                                        className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all active:scale-95"
                                                    >
                                                        {isPlaying ? (
                                                            <Pause className="w-5 h-5 text-white fill-current" />
                                                        ) : (
                                                            <Play className="w-5 h-5 text-white fill-current ml-1" />
                                                        )}
                                                    </button>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">{selectedVideo.nome_produto}</p>
                                                        <p className="text-[8px] font-bold text-accent uppercase tracking-[0.2em] drop-shadow-md">{selectedVideo.formato === 'stories' ? '9:16 Vertical' : '16:9 Landscape'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Progress bar mock */}
                                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden pointer-events-auto cursor-pointer">
                                                <div className="h-full w-1/3 bg-accent" />
                                            </div>
                                        </div>

                                        {/* Phone-style notch for 9:16 visualization */}
                                        {selectedVideo.formato === 'stories' && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#18181B] rounded-b-[20px] z-50 flex items-center justify-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg-primary)]" />
                                                <div className="w-12 h-1.5 rounded-full bg-[var(--bg-primary)]" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/player:group-active/player:opacity-100 transition-opacity">
                                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center animate-ping">
                                                {isPlaying ? (
                                                    <Pause className="w-8 h-8 text-white fill-current" />
                                                ) : (
                                                    <Play className="w-8 h-8 text-white fill-current ml-2" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-8 text-gray-800">
                                        <div className="relative">
                                             <Video className="w-24 h-24 absolute inset-0 blur-2xl opacity-40 animate-pulse" />
                                             <Video className="w-24 h-24 relative animate-pulse" />
                                        </div>
                                        <span className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-700">Canal de Render Ativo</span>
                                    </div>
                                )}
                                
                                {/* Status overlay in modal */}
                                <div className="absolute top-10 left-10 flex gap-4">
                                     <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-3">
                                          <div className="w-2 h-2 rounded-full bg-accent shadow-accent animate-pulse" />
                                          <span className="text-[10px] font-black text-white uppercase tracking-widest italic tracking-tighter drop-shadow-md">{selectedVideo.nome_produto}</span>
                                     </div>
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-[450px] p-16 bg-[#0A192F] border-t lg:border-l lg:border-t-0 border-[var(--border-main)] flex flex-col justify-between overflow-y-auto custom-scrollbar">
                                <div className="space-y-12">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-6">
                                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">{selectedVideo.nome_produto}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedVideo.tags?.map(tag => (
                                                    <span key={tag} className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-black text-[8px] uppercase tracking-widest">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedVideo(null)} className="p-4 rounded-3xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex justify-between items-center py-5 border-b border-white/10 group">
                                            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Protocolo de Tempo</span>
                                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{selectedVideo.duracao} Segundos</span>
                                        </div>
                                        <div className="flex justify-between items-center py-5 border-b border-white/10 group">
                                            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Layout de Saída</span>
                                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{FORMATO_LABELS[selectedVideo.formato] || selectedVideo.formato}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-5 border-b border-white/10 group">
                                            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Sincronização</span>
                                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{formatDateTime(selectedVideo.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-16 flex flex-col gap-6">
                                    {selectedVideo.video_url && (
                                        <a 
                                            href={selectedVideo.video_url} 
                                            download 
                                            className="w-full flex items-center justify-center gap-5 py-8 bg-accent text-black font-black uppercase tracking-[0.2em] text-sm rounded-[32px] hover:scale-105 transition-all shadow-accent group"
                                        >
                                            <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
                                            Exportar Ativo Final
                                        </a>
                                    )}
                                    <button 
                                        onClick={() => setSelectedVideo(null)}
                                        className="w-full py-4 transition-all font-black uppercase tracking-[0.3em] text-[10px] text-gray-500 hover:text-white"
                                    >
                                        Fechar Workspace
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
