import { type ReactNode } from 'react'
import Image from 'next/image'
import { Sparkles, ShieldCheck, Zap, Activity } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex bg-[#0A192F] overflow-hidden relative font-sans">
            {/* Background decoration - Advanced blurs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] opacity-40 animate-pulse" />
                <div className="absolute top-[20%] right-[5%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-[100px] opacity-30" />
                <div className="absolute -bottom-[15%] left-[20%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[150px] opacity-25" />
            </div>

            {/* Left panel - Branding (Digital Asset Vibe) */}
            <div className="hidden lg:flex lg:w-3/5 flex-col justify-between p-20 relative z-10">
                <div className="relative">
                    {/* Logo Premium */}
                    <div className="flex items-center gap-4">
                        <img src="/logo.jpg" alt="InvestMais Finance" className="h-14 w-auto object-contain" />
                    </div>
                </div>

                <div className="max-w-2xl space-y-16">
                    {/* Headline Matriz */}
                    <div className="space-y-8">
                        <h1 className="text-7xl font-black text-white leading-[1.05] tracking-tighter uppercase italic">
                            O Futuro do <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">
                                Conteúdo Ativo.
                            </span>
                        </h1>
                        <p className="text-gray-500 text-xl leading-relaxed font-medium max-w-lg">
                            Potencialize suas conversões financeiras com ativos digitais de alta performance gerados por inteligência artificial.
                        </p>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            {
                                title: 'Criativos em Massa',
                                desc: 'Escalabilidade total de roteiros e vídeos.',
                                icon: Zap,
                                color: 'text-accent'
                            },
                            {
                                title: 'Inteligência de CVM',
                                desc: 'Compliance e termos técnicos garantidos.',
                                icon: ShieldCheck,
                                color: 'text-emerald-400'
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] group hover:border-accent/40 transition-all cursor-default shadow-2xl">
                                <item.icon className={cn("w-8 h-8 mb-6", item.color)} />
                                <h4 className="text-white font-black text-sm uppercase tracking-widest">{item.title}</h4>
                                <p className="text-gray-600 text-[10px] mt-3 font-bold uppercase leading-relaxed tracking-wider">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Confidence Indicator */}
                    <div className="flex items-center gap-8 pt-6">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0A192F] bg-white/5 flex items-center justify-center text-[10px] text-accent font-black ring-1 ring-white/10">
                                    AI
                                </div>
                            ))}
                        </div>
                        <div className="space-y-1">
                            <span className="text-white font-black text-sm uppercase tracking-widest">500+ Especialistas</span>
                            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Escalando resultados agora mesmo</p>
                        </div>
                    </div>
                </div>

                <div className="text-gray-700 text-[10px] font-black tracking-[0.4em] uppercase border-t border-white/5 pt-8">
                    © 2024 InvestMais Hub • Todos os Direitos Reservados
                </div>
            </div>

            {/* Right panel - Auth form (Glass Container) */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative z-10 bg-[#0A192F]/40 backdrop-blur-sm lg:bg-transparent">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex flex-col items-center gap-4 mb-16">
                        <img src="/logo.jpg" alt="InvestMais Finance" className="h-16 w-auto object-contain rounded-2xl" />
                    </div>

                    <div className="bg-[#0A192F] border border-white/5 p-12 rounded-[48px] shadow-[0_0_100px_rgba(30,92,214,0.05)] relative overflow-hidden group">
                        {/* Subtle accent border on top */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-blue-400 opacity-40" />
                        
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
