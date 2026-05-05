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
    AlertCircle,
    Layers,
    Shield,
    Activity,
    Clock,
    Zap,
    ChevronRight,
    Smartphone,
    Monitor,
    Share2,
    Eye,
    ArrowUpRight,
    Box,
    Database,
    ZapOff
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

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
    'instagram': 'Feed (1:1)',
    'stories': 'Reels/Stories (9:16)',
    'youtube': 'Cinema (16:9)',
    'educativo': 'Educativo',
    'divulgacao': 'Conversão'
}

const DEFAULT_TAGS = ['#Prioridade', '#Lançamento', '#HomeEquity', '#Estratégia', '#Educativo']

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
                setVideos(videoData.map((v: Video) => ({
                    ...v,
                    tags: [DEFAULT_TAGS[Math.floor(Math.random() * DEFAULT_TAGS.length)]]
                })))
            }
            if (pRes.ok) setPastas(await pRes.json())
        } catch (error) {
            console.error('Erro ao carregar dados')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteVideo = async (video: Video) => {
        if (!confirm('Deseja excluir permanentemente este vídeo?')) return
        try {
            const res = await fetch(`/api/creator/videos?id=${video.id}`, { method: 'DELETE' })
            if (res.ok) {
                setVideos(videos.filter(v => v.id !== video.id))
                toast.success('Vídeo removido')
                setActiveMenu(null)
            }
        } catch (error) {
            toast.error('Falha ao excluir')
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
                toast.success('Vídeo movido')
                setMovingVideo(null)
                setActiveMenu(null)
            }
        } catch (error) {
            toast.error('Falha ao mover')
        }
    }

    const filteredVideos = videos.filter(v => {
        const matchesFolder = selectedFolder ? v.pasta_id === selectedFolder : true
        const matchesTag = selectedTag ? v.tags?.includes(selectedTag) : true
        const matchesSearch = v.nome_produto.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFolder && matchesTag && matchesSearch
    })

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'concluido': return 'CONCLUÍDO'
            case 'processando': return 'PROCESSANDO'
            case 'erro': return 'ERRO'
            default: return status.toUpperCase()
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] p-6 lg:p-10 space-y-10">
            {/* Header Actions */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Biblioteca</h1>
                    <p className="text-white/40 text-sm">Gerencie e organize seus ativos digitais</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative w-full lg:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-all" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-white/10 focus:border-primary/50 transition-all outline-none"
                        />
                    </div>
                    <Link href="/criar" className="bg-primary hover:bg-primary/90 px-8 py-3.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Novo Vídeo
                    </Link>
                </div>
            </div>

            {/* Filter Matrix */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-2">
                    <button onClick={() => setSelectedFolder(null)} className={cn("px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2", !selectedFolder ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white/[0.02] text-white/20 border-white/5 hover:text-white')}>
                        <LayoutGrid className="w-4 h-4" /> Todos
                    </button>
                    {pastas.map(folder => (
                        <button key={folder.id} onClick={() => setSelectedFolder(folder.id)} className={cn("px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2", selectedFolder === folder.id ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white/[0.02] text-white/20 border-white/5 hover:text-white')}>
                            <Folder className="w-4 h-4" /> {folder.nome}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
                    <button onClick={() => setSelectedTag(null)} className={cn("px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border", !selectedTag ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/[0.02] text-white/10 border-white/5 hover:text-white')}># TODOS</button>
                    {DEFAULT_TAGS.map(tag => (
                        <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} className={cn("px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border", selectedTag === tag ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/[0.02] text-white/10 border-white/5 hover:text-white')}>{tag}</button>
                    ))}
                </div>
            </div>

            {/* Vault Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredVideos.length === 0 ? (
                <div className="py-32 text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto opacity-20">
                        <Box className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-white/40">Nenhum vídeo encontrado</p>
                        <p className="text-xs text-white/20">Sua biblioteca está vazia no momento.</p>
                    </div>
                    <Link href="/criar" className="bg-primary/10 hover:bg-primary/20 px-8 py-3 rounded-xl text-primary text-xs font-bold transition-all inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Criar Primeiro Vídeo
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredVideos.map((video, idx) => (
                        <motion.div key={video.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                            className="bg-white/[0.02] rounded-3xl border border-white/5 group hover:border-primary/20 transition-all overflow-hidden shadow-xl relative"
                        >
                            <div className="aspect-[3/4] relative cursor-pointer overflow-hidden" onClick={() => setSelectedVideo(video)}>
                                {video.video_url ? (
                                    <video src={video.video_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-40 group-hover:opacity-70" muted loop playsInline onMouseOver={e => e.currentTarget.play()} onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black/40"><Activity className="w-10 h-10 text-white/5 animate-pulse" /></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                                    <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                                        <Play className="fill-current w-6 h-6 ml-1" />
                                    </div>
                                </div>

                                <div className="absolute top-6 left-6 flex flex-wrap gap-2 group-hover:opacity-0 transition-all">
                                    {video.tags?.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white font-bold text-[8px] uppercase tracking-widest">{tag}</span>
                                    ))}
                                </div>

                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === video.id ? null : video.id); }} className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-primary transition-all flex items-center justify-center">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className={cn("px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all", video.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20')}>
                                            {getStatusLabel(video.status)}
                                        </span>
                                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {video.duracao}s</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-primary transition-colors truncate">{video.nome_produto}</h3>
                                </div>
                            </div>

                            <AnimatePresence>
                                {activeMenu === video.id && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-16 right-6 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                        {video.video_url && (
                                            <a href={video.video_url} download className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.03] transition-all border-b border-white/5"><Download className="w-4 h-4" /> Baixar Vídeo</a>
                                        )}
                                        <button onClick={() => setMovingVideo(video.id)} className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.03] transition-all border-b border-white/5"><Move className="w-4 h-4" /> Mover para Pasta</button>
                                        <button onClick={() => handleDeleteVideo(video)} className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /> Excluir permanentemente</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {movingVideo === video.id && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-50 p-8 flex flex-col">
                                        <div className="flex items-center justify-between mb-8">
                                            <h5 className="text-[10px] font-bold text-white uppercase tracking-widest">Mover para Pasta</h5>
                                            <button onClick={() => setMovingVideo(null)} className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/20 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                                        </div>
                                        <div className="space-y-3 flex-1">
                                            <button onClick={() => handleMoveVideo(video.id, null)} className="w-full text-left px-5 py-4 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-primary hover:border-primary/40 transition-all flex items-center gap-4 group/btn"><LayoutGrid className="w-4 h-4 opacity-20 group-hover/btn:opacity-100" /> Raiz</button>
                                            {pastas.map(p => (
                                                <button key={p.id} onClick={() => handleMoveVideo(video.id, p.id)} className="w-full text-left px-5 py-4 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-primary hover:border-primary/40 transition-all flex items-center gap-4 group/btn"><Folder className="w-4 h-4 opacity-20 group-hover/btn:opacity-100" /> {p.nome}</button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Cinematic Preview Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedVideo(null)} />
                        
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative z-[110] bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-6xl h-full max-h-[85vh] shadow-2xl flex flex-col lg:flex-row overflow-hidden"
                        >
                            <div className="flex-1 bg-black/40 flex items-center justify-center relative p-8">
                                <div className={cn("relative shadow-2xl bg-black overflow-hidden flex items-center justify-center group/player transition-all duration-700", selectedVideo.formato === 'stories' ? "aspect-[9/16] h-full max-h-[70vh] rounded-3xl border border-white/5" : "w-full max-w-4xl aspect-video rounded-3xl border border-white/5")}>
                                    <video id="vault-video-player" src={selectedVideo.video_url || ''} autoPlay loop playsInline className="w-full h-full object-cover" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onClick={(e) => e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause()} />
                                    
                                    <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col gap-6 bg-gradient-to-t from-black/80 to-transparent translate-y-5 opacity-0 group-hover/player:translate-y-0 group-hover/player:opacity-100 transition-all duration-500">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <button onClick={() => { const v = document.getElementById('vault-video-player') as HTMLVideoElement; v.paused ? v.play() : v.pause() }} className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center transition-all shadow-lg"><Play className={cn("w-6 h-6 fill-current", isPlaying ? "hidden" : "ml-1")} /> <Pause className={cn("w-6 h-6 fill-current", isPlaying ? "" : "hidden")} /></button>
                                                <div className="space-y-0.5">
                                                    <p className="text-lg font-bold text-white tracking-tight">{selectedVideo.nome_produto}</p>
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedVideo.formato === 'stories' ? 'Stories 9:16' : 'Horizontal 16:9'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><Share2 className="w-5 h-5" /></button>
                                                <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><Download className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden"><motion.div animate={{ width: isPlaying ? '100%' : '5%' }} transition={{ duration: isPlaying ? 20 : 0.5, ease: 'linear' }} className="h-full bg-primary shadow-lg" /></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-[400px] p-10 bg-white/[0.01] backdrop-blur-xl border-t lg:border-l lg:border-t-0 border-white/5 flex flex-col justify-between overflow-y-auto scrollbar-none">
                                <div className="space-y-12">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4">
                                            <h3 className="text-2xl font-bold text-white tracking-tight">{selectedVideo.nome_produto}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedVideo.tags?.map(tag => (
                                                    <span key={tag} className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-widest">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedVideo(null)} className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 text-white/20 hover:text-white transition-all flex items-center justify-center"><X className="w-6 h-6" /></button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center py-4 border-b border-white/5"><span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Data de Criação</span><span className="text-xs font-bold text-white">{formatDateTime(selectedVideo.created_at)}</span></div>
                                        <div className="flex justify-between items-center py-4 border-b border-white/5"><span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Duração</span><span className="text-xs font-bold text-white">{selectedVideo.duracao} Segundos</span></div>
                                        <div className="flex justify-between items-center py-4 border-b border-white/5"><span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Formato</span><span className="text-xs font-bold text-white">{FORMATO_LABELS[selectedVideo.formato] || selectedVideo.formato}</span></div>
                                        <div className="flex justify-between items-center py-4 border-b border-white/5"><span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">ID do Vídeo</span><span className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedVideo.id.substring(0, 8)}</span></div>
                                    </div>
                                </div>

                                <div className="pt-12 flex flex-col gap-4">
                                    {selectedVideo.video_url && (
                                        <a href={selectedVideo.video_url} download className="w-full flex items-center justify-center gap-4 py-5 bg-primary text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-primary/90 transition-all shadow-lg group"><Download className="w-5 h-5 transition-transform group-hover:translate-y-0.5" /> Baixar Vídeo</a>
                                    )}
                                    <button onClick={() => setSelectedVideo(null)} className="w-full py-4 transition-all font-bold uppercase tracking-widest text-[10px] text-white/20 hover:text-white">Fechar Visualização</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
