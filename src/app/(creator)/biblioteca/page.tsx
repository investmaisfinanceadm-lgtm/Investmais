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
    'educativo': 'Executive Education',
    'divulgacao': 'High-End Conversion'
}

const DEFAULT_TAGS = ['#Priority', '#NewLaunch', '#HomeEquity', '#Q2_Strategy', '#Educative']

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
            console.error('Fetch protocol failure')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteVideo = async (video: Video) => {
        if (!confirm('Permanent deletion of this asset cannot be undone. Proceed?')) return
        try {
            const res = await fetch(`/api/creator/videos?id=${video.id}`, { method: 'DELETE' })
            if (res.ok) {
                setVideos(videos.filter(v => v.id !== video.id))
                toast.success('Asset purged from vault')
                setActiveMenu(null)
            }
        } catch (error) {
            toast.error('Purge failed')
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
                toast.success('Asset relocated')
                setMovingVideo(null)
                setActiveMenu(null)
            }
        } catch (error) {
            toast.error('Relocation failed')
        }
    }

    const filteredVideos = videos.filter(v => {
        const matchesFolder = selectedFolder ? v.pasta_id === selectedFolder : true
        const matchesTag = selectedTag ? v.tags?.includes(selectedTag) : true
        const matchesSearch = v.nome_produto.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFolder && matchesTag && matchesSearch
    })

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'concluido': return 'SYNCHRONIZED'
            case 'processando': return 'RENDERING'
            case 'erro': return 'FAILURE'
            default: return status.toUpperCase()
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
            <div className="ambient-bg" />
            
            <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-16 pb-32">
                
                {/* Header Actions */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/5 pb-16">
                    <div className="space-y-6 flex-1 min-w-0">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-sidebar-primary/5 border border-sidebar-primary/20 backdrop-blur-3xl">
                            <Database className="w-4 h-4 text-sidebar-primary" />
                            <span className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.5em] italic">Archive Protocol Active</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tighter uppercase italic">Asset Vault</h1>
                            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic flex items-center gap-4">
                                <Shield className="w-4 h-4" /> Secure Digital Intelligence Archive v4.0.0
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/10 group-focus-within:text-sidebar-primary transition-all duration-700" />
                            <input
                                type="text"
                                placeholder="SCAN ARCHIVES..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black border border-white/5 rounded-[24px] py-5 pl-14 pr-6 text-[10px] font-black text-white uppercase tracking-widest placeholder-white/5 focus:border-sidebar-primary/40 focus:bg-black transition-all outline-none italic duration-700"
                            />
                        </div>
                        <Link href="/criar" className="btn-primary px-12 py-7 netlife-glow shadow-none text-xs font-black uppercase tracking-[0.3em] italic group flex items-center gap-4">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" />
                            Initialize Asset
                        </Link>
                    </div>
                </div>

                {/* Filter Matrix */}
                <div className="flex flex-col gap-10">
                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-4">
                        <button onClick={() => setSelectedFolder(null)} className={cn("px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 italic border flex items-center gap-4", !selectedFolder ? 'bg-sidebar-primary text-black border-sidebar-primary netlife-glow shadow-none' : 'bg-white/[0.03] text-white/20 border-white/5 hover:text-white')}>
                            <LayoutGrid className="w-4.5 h-4.5" /> Core Matrix
                        </button>
                        {pastas.map(folder => (
                            <button key={folder.id} onClick={() => setSelectedFolder(folder.id)} className={cn("px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 italic border flex items-center gap-4", selectedFolder === folder.id ? 'bg-sidebar-primary text-black border-sidebar-primary netlife-glow shadow-none' : 'bg-white/[0.03] text-white/20 border-white/5 hover:text-white')}>
                                <Folder className="w-4.5 h-4.5" /> {folder.nome}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
                        <button onClick={() => setSelectedTag(null)} className={cn("px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.4em] transition-all duration-700 border italic", !selectedTag ? 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20' : 'bg-white/[0.03] text-white/10 border-white/5 hover:text-white')}># ALL SIGNALS</button>
                        {DEFAULT_TAGS.map(tag => (
                            <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} className={cn("px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.4em] transition-all duration-700 border italic", selectedTag === tag ? 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20' : 'bg-white/[0.03] text-white/10 border-white/5 hover:text-white')}>{tag}</button>
                        ))}
                    </div>
                </div>

                {/* Vault Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] rounded-[64px] nl-glass border-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="py-40 text-center space-y-10">
                        <div className="w-24 h-24 rounded-[48px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto group hover:border-sidebar-primary/20 transition-all duration-700">
                            <Box className="w-10 h-10 text-white/5 group-hover:text-sidebar-primary group-hover:scale-110 transition-all duration-700" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em] italic leading-none">Vault Depleted</p>
                            <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] italic">No digital assets identified in this sector.</p>
                        </div>
                        <Link href="/criar" className="btn-primary px-10 py-5 netlife-glow shadow-none text-[10px] font-black uppercase tracking-[0.3em] italic inline-flex items-center gap-4">
                            <Plus className="w-5 h-5" /> Initialize First Asset
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                        {filteredVideos.map((video, idx) => (
                            <motion.div key={video.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                                className="nl-glass rounded-[64px] border-white/5 group hover:border-sidebar-primary/20 transition-all duration-1000 overflow-hidden shadow-2xl relative"
                            >
                                <div className="aspect-[3/4] relative cursor-pointer overflow-hidden" onClick={() => setSelectedVideo(video)}>
                                    {video.video_url ? (
                                        <video src={video.video_url} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-40 group-hover:opacity-80" muted loop playsInline onMouseOver={e => e.currentTarget.play()} onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-black/40"><Activity className="w-16 h-16 text-white/5 animate-pulse" /></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                                    
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-1000 backdrop-blur-sm">
                                        <div className="w-24 h-24 rounded-[40px] bg-sidebar-primary text-black flex items-center justify-center netlife-glow shadow-none transform scale-50 group-hover:scale-100 transition-all duration-700">
                                            <Play className="fill-current w-10 h-10 ml-2" />
                                        </div>
                                    </div>

                                    <div className="absolute top-10 left-10 flex flex-wrap gap-2 group-hover:opacity-0 transition-all duration-700">
                                        {video.tags?.map(tag => (
                                            <span key={tag} className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white font-black text-[8px] uppercase tracking-widest italic">{tag}</span>
                                        ))}
                                    </div>

                                    <div className="absolute top-10 right-10 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                        <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === video.id ? null : video.id); }} className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-sidebar-primary transition-all flex items-center justify-center">
                                            <MoreHorizontal className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-12 left-12 right-12 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border italic transition-all duration-700", video.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20')}>
                                                {getStatusLabel(video.status)}
                                            </span>
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-2 italic"><Clock className="w-4 h-4" /> {video.duracao}S</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-sidebar-primary transition-colors duration-700 truncate">{video.nome_produto}</h3>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {activeMenu === video.id && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-24 right-10 w-64 nl-glass border-white/10 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
                                            {video.video_url && (
                                                <a href={video.video_url} download className="w-full flex items-center gap-6 px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white hover:bg-white/[0.05] transition-all border-b border-white/5 italic"><Download className="w-5 h-5" /> Export Asset</a>
                                            )}
                                            <button onClick={() => setMovingVideo(video.id)} className="w-full flex items-center gap-6 px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white hover:bg-white/[0.05] transition-all border-b border-white/5 italic"><Move className="w-5 h-5" /> Relocate Node</button>
                                            <button onClick={() => handleDeleteVideo(video)} className="w-full flex items-center gap-6 px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all italic"><Trash2 className="w-5 h-5" /> Purge Archive</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {movingVideo === video.id && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 nl-glass backdrop-blur-3xl z-50 p-12 flex flex-col">
                                            <div className="flex items-center justify-between mb-12">
                                                <h5 className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic">Relocate Node</h5>
                                                <button onClick={() => setMovingVideo(null)} className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center text-white/20 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                                            </div>
                                            <div className="space-y-4 flex-1">
                                                <button onClick={() => handleMoveVideo(video.id, null)} className="w-full text-left p-8 rounded-[36px] bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-sidebar-primary hover:border-sidebar-primary/40 transition-all flex items-center gap-6 group/btn italic"><LayoutGrid className="w-5 h-5 opacity-20 group-hover/btn:opacity-100" /> Digital Root</button>
                                                {pastas.map(p => (
                                                    <button key={p.id} onClick={() => handleMoveVideo(video.id, p.id)} className="w-full text-left p-8 rounded-[36px] bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-sidebar-primary hover:border-sidebar-primary/40 transition-all flex items-center gap-6 group/btn italic"><Folder className="w-5 h-5 opacity-20 group-hover/btn:opacity-100" /> {p.nome}</button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cinematic Preview Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-20 overflow-hidden">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setSelectedVideo(null)} />
                        
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="relative z-[110] nl-glass border-white/5 rounded-[80px] w-full max-w-[1700px] h-full max-h-[90vh] shadow-[0_100px_300px_rgba(0,0,0,1)] flex flex-col lg:flex-row overflow-hidden"
                        >
                            <div className="flex-1 bg-black/60 flex items-center justify-center relative p-12 min-h-0">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_80%)] opacity-40" />
                                
                                <div className={cn("relative shadow-[0_100px_200px_rgba(0,0,0,0.9)] bg-black overflow-hidden flex items-center justify-center group/player transition-all duration-[2000ms]", selectedVideo.formato === 'stories' ? "aspect-[9/16] h-full max-h-[75vh] rounded-[64px] border-[16px] border-black/80 ring-1 ring-white/5" : "w-full max-w-6xl aspect-video rounded-[64px] border border-white/5")}>
                                    <video id="vault-video-player" src={selectedVideo.video_url || ''} autoPlay loop playsInline className="w-full h-full object-cover" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onClick={(e) => e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause()} />
                                    
                                    <div className="absolute inset-x-0 bottom-0 p-16 flex flex-col gap-8 bg-gradient-to-t from-black/95 via-black/20 to-transparent translate-y-10 opacity-0 group-hover/player:translate-y-0 group-hover/player:opacity-100 transition-all duration-1000">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-8">
                                                <button onClick={() => { const v = document.getElementById('vault-video-player') as HTMLVideoElement; v.paused ? v.play() : v.pause() }} className="w-20 h-20 rounded-[32px] bg-sidebar-primary text-black flex items-center justify-center transition-all netlife-glow shadow-none scale-100 active:scale-90"><Play className={cn("w-8 h-8 fill-current", isPlaying ? "hidden" : "ml-2")} /> <Pause className={cn("w-8 h-8 fill-current", isPlaying ? "" : "hidden")} /></button>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-black text-white uppercase tracking-widest italic">{selectedVideo.nome_produto}</p>
                                                    <p className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.4em] italic">{selectedVideo.formato === 'stories' ? 'Neural Stories 9:16' : 'Cinematic Hub 16:9'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6">
                                                <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-all"><Share2 className="w-6 h-6" /></button>
                                                <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-all"><Download className="w-6 h-6" /></button>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer"><motion.div animate={{ width: isPlaying ? '100%' : '5%' }} transition={{ duration: isPlaying ? 30 : 0.5, ease: 'linear' }} className="h-full bg-sidebar-primary netlife-glow shadow-none" /></div>
                                    </div>

                                    {selectedVideo.formato === 'stories' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-10 bg-black border-x border-b border-white/5 rounded-b-[32px] z-50 flex items-center justify-center gap-6"><div className="w-2.5 h-2.5 rounded-full bg-white/5" /><div className="w-20 h-2.5 rounded-full bg-white/5" /></div>}
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-[560px] p-20 bg-black/40 backdrop-blur-3xl border-t lg:border-l lg:border-t-0 border-white/5 flex flex-col justify-between overflow-y-auto scrollbar-none">
                                <div className="space-y-20">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-8">
                                            <h3 className="text-5xl font-black text-white uppercase tracking-tighter leading-none italic">{selectedVideo.nome_produto}</h3>
                                            <div className="flex flex-wrap gap-4">
                                                {selectedVideo.tags?.map(tag => (
                                                    <span key={tag} className="px-6 py-2.5 rounded-full bg-sidebar-primary/10 border border-sidebar-primary/20 text-sidebar-primary font-black text-[10px] uppercase tracking-widest italic">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedVideo(null)} className="w-16 h-16 rounded-[28px] bg-white/[0.03] border border-white/5 text-white/20 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center"><X className="w-8 h-8" /></button>
                                    </div>

                                    <div className="space-y-12">
                                        <div className="flex justify-between items-center py-8 border-b border-white/5 group"><span className="text-[12px] font-black text-white/20 uppercase tracking-[0.4em] italic group-hover:text-white/40 transition-all">Vault Sync Protocol</span><span className="text-[12px] font-black text-white uppercase tracking-widest italic">{formatDateTime(selectedVideo.created_at)}</span></div>
                                        <div className="flex justify-between items-center py-8 border-b border-white/5 group"><span className="text-[12px] font-black text-white/20 uppercase tracking-[0.4em] italic group-hover:text-white/40 transition-all">Temporal Runtime</span><span className="text-[12px] font-black text-white uppercase tracking-widest italic">{selectedVideo.duracao} Seconds</span></div>
                                        <div className="flex justify-between items-center py-8 border-b border-white/5 group"><span className="text-[12px] font-black text-white/20 uppercase tracking-[0.4em] italic group-hover:text-white/40 transition-all">Architecture Vector</span><span className="text-[12px] font-black text-white uppercase tracking-widest italic">{FORMATO_LABELS[selectedVideo.formato] || selectedVideo.formato}</span></div>
                                        <div className="flex justify-between items-center py-8 border-b border-white/5 group"><span className="text-[12px] font-black text-white/20 uppercase tracking-[0.4em] italic group-hover:text-white/40 transition-all">Asset Security Hash</span><span className="text-[12px] font-black text-sidebar-primary uppercase tracking-widest italic">{selectedVideo.id.substring(0, 14).toUpperCase()}</span></div>
                                    </div>
                                </div>

                                <div className="pt-24 flex flex-col gap-6">
                                    {selectedVideo.video_url && (
                                        <a href={selectedVideo.video_url} download className="w-full flex items-center justify-center gap-8 py-10 bg-sidebar-primary text-black font-black uppercase tracking-[0.4em] text-sm rounded-[40px] hover:scale-[1.02] transition-all netlife-glow shadow-none italic group"><Download className="w-7 h-7 group-hover:translate-y-2 transition-transform duration-700" /> Export Digital Asset</a>
                                    )}
                                    <button onClick={() => setSelectedVideo(null)} className="w-full py-6 transition-all font-black uppercase tracking-[0.5em] text-[10px] text-white/20 hover:text-white italic">Shutdown Stream Workspace</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
