import { type ReactNode } from 'react'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex bg-gradient-primary">
            {/* Left panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/3 blur-3xl" />
                </div>

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                            <span className="text-primary font-black text-lg">I+</span>
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight">
                            Invest<span className="text-gradient-gold">Mais</span>
                        </span>
                    </div>
                </div>

                <div className="relative z-10 space-y-8">
                    {/* Headline */}
                    <div>
                        <h1 className="text-4xl font-bold text-white leading-tight">
                            Conteúdo Financeiro{' '}
                            <span className="text-gradient-gold">Profissional</span> com IA
                        </h1>
                        <p className="mt-4 text-gray-400 text-lg leading-relaxed">
                            Automatize a criação de vídeos para Home Equity, Financiamento
                            Imobiliário e outros produtos financeiros.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        {[
                            {
                                icon: '🎬',
                                text: 'Vídeos profissionais gerados por IA em minutos',
                            },
                            {
                                icon: '📊',
                                text: 'Conteúdo alinhado às diretrizes do mercado financeiro',
                            },
                            {
                                icon: '🚀',
                                text: 'Múltiplos formatos: Instagram, Stories, YouTube',
                            },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-2xl">{feature.icon}</span>
                                <span className="text-gray-300 text-sm">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { number: '10k+', label: 'Vídeos gerados' },
                            { number: '500+', label: 'Profissionais' },
                            { number: '98%', label: 'Satisfação' },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="bg-dark-card/60 border border-dark-border rounded-xl p-4 text-center"
                            >
                                <div className="text-2xl font-bold text-gold">{stat.number}</div>
                                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-gray-500 text-xs">
                    © 2024 InvestMais. Todos os direitos reservados.
                </div>
            </div>

            {/* Right panel - Auth form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                            <span className="text-primary font-black text-lg">I+</span>
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight">
                            Invest<span className="text-gradient-gold">Mais</span>
                        </span>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    )
}
