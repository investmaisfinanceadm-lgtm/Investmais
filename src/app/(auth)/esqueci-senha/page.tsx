'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2, Mail, ArrowLeft, CheckCircle, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const schema = z.object({
    email: z.string().email('E-mail institucional inválido'),
})

type FormData = z.infer<typeof schema>

export default function EsqueciSenhaPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            })

            if (!response.ok) {
                toast.error('ERRO DE ENVIO: Protocolo não encontrado.')
                return
            }

            setSent(true)
            toast.success('PROTOCOLO INICIADO: Link de recuperação enviado.')
        } catch {
            toast.error('ERRO CRÍTICO: Falha na rede de autenticação.')
        } finally {
            setIsLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="animate-fade-in text-center space-y-10">
                <div className="w-20 h-20 rounded-[32px] bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-10 shadow-accent-sm">
                    <CheckCircle className="w-10 h-10 text-accent animate-bounce" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">E-mail de Resgate Enviado!</h2>
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px] px-8">
                        Um link de redefinição foi encaminhado para o endereço corporativo:
                    </p>
                    <p className="text-accent font-black text-xs uppercase tracking-widest bg-accent/5 py-3 rounded-2xl border border-accent/10 inline-block px-6">
                        {getValues('email')}
                    </p>
                </div>
                <div className="pt-8">
                    <Link href="/login" className="btn-primary inline-flex items-center gap-4 px-10 py-5 rounded-3xl group transition-all">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                        <span className="uppercase tracking-[0.4em] font-black text-[10px]">Voltar para o Login</span>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in space-y-12">
            <div className="space-y-4">
                 <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                     <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Protocolo de Recuperação</span>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Resgatar Senha</h2>
                <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px]">
                    Inicie o protocolo de redefinição via e-mail <br /> para reestabelecer o acesso ao estúdio.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                    <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">
                        E-mail Corporativo
                    </label>
                    <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@investmais.com"
                            className={cn(
                                "w-full bg-white/5 border rounded-[28px] py-5 pl-14 pr-6 text-white font-black uppercase tracking-widest text-[11px] focus:bg-white/[0.08] focus:ring-0 transition-all outline-none",
                                errors.email ? 'border-red-500/60 shadow-red-500/10' : 'border-white/5 focus:border-accent/40'
                            )}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-2 text-[9px] font-black text-red-500 uppercase tracking-widest pr-4 text-right italic">{errors.email.message}</p>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-4 py-6 rounded-[32px] group transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="uppercase tracking-[0.4em] font-black text-[11px]">Enviando Protocolo...</span>
                            </>
                        ) : (
                            <>
                                <span className="uppercase tracking-[0.4em] font-black text-[11px]">Solicitar Resgate</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="pt-10 border-t border-white/5 text-center">
                 <Link
                    href="/login"
                    className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 hover:text-white transition-all inline-flex items-center gap-4 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
                    Cancelar Procedimento e Voltar
                </Link>
            </div>
        </div>
    )
}
