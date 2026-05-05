import { type ReactNode } from 'react'
import { ShieldCheck, Zap, Users, BarChart3, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex bg-[#050505] overflow-hidden relative font-sans text-white">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] opacity-20" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] opacity-20" />
            </div>

            {/* Left panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative z-10 border-r border-white/5">
                <div>
                    <img src="/logo.png" alt="InvestMais Finance" className="h-12 w-auto object-contain" />
                </div>

                <div className="max-w-xl space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Plataforma Financeira Premium</span>
                        </div>
                        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
                            Sua jornada financeira <br />
                            <span className="text-primary">elevada ao máximo.</span>
                        </h1>
                        <p className="text-white/40 text-lg leading-relaxed font-medium">
                            Acesse ferramentas avançadas de CRM, automação de marketing e inteligência de dados para o mercado financeiro.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {[
                            {
                                title: 'Gestão de Leads',
                                desc: 'Pipeline inteligente com automação de status.',
                                icon: Users,
                            },
                            {
                                title: 'Segurança Total',
                                desc: 'Protocolos de criptografia e proteção de dados.',
                                icon: ShieldCheck,
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-primary border border-white/5">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase tracking-wide">{item.title}</h4>
                                    <p className="text-white/40 text-xs mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-white/20 text-[10px] font-bold tracking-widest uppercase">
                    © 2024 InvestMais Finance Hub
                </div>
            </div>

            {/* Right panel - Auth form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-12">
                        <img src="/logo.png" alt="InvestMais Finance" className="h-12 w-auto object-contain" />
                    </div>

                    <div className="bg-white/[0.03] p-10 lg:p-12 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-40" />
                        {children}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">InvestMais Finance System v4.0</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
