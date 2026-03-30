'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Lock, Mail, ChevronRight, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { signIn, getSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
    email: z.string().email('E-mail institucional inválido'),
    senha: z.string().min(1, 'Senha de acesso é obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true)
        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.senha,
                redirect: false,
            })

            if (result?.error) {
                if (result.error === 'Conta inativa') {
                    toast.error('ACESSO NEGADO: Sua conta está desativada.')
                } else {
                    toast.error('CREDENCIAIS INVÁLIDAS: Verifique seu e-mail ou senha.')
                }
                return
            }

            if (!result?.ok) {
                toast.error('ERRO DE AUTENTICAÇÃO: Verifique sua conexão.')
                return
            }

            toast.success('AUTENTICAÇÃO CONCLUÍDA: Bem-vindo ao Estúdio!')

            const session = await getSession()
            if ((session?.user as any)?.perfil === 'admin') {
                router.push('/admin/dashboard')
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        } catch {
            toast.error('ERRO INESPERADO: Protocolo de rede falhou.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="animate-fade-in space-y-12">
            <div className="text-center md:text-left space-y-4">
                <div className="flex items-center gap-3 self-start md:self-auto justify-center md:justify-start">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                     <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Canal Seguro Ativo</span>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Acesse o Estúdio</h2>
                <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px] leading-relaxed">
                    Insira suas credenciais de parceiro <br /> para sincronizar com o núcleo de IA.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Email */}
                <div className="space-y-4">
                    <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">
                        E-mail Corporativo
                    </label>
                    <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="seu@investmais.com"
                            className={cn(
                                "w-full bg-white/5 border rounded-[28px] py-5 pl-14 pr-6 text-white font-black uppercase tracking-widest text-[11px] focus:bg-white/[0.08] focus:ring-0 transition-all outline-none",
                                errors.email ? 'border-red-500/60 shadow-red-500/10' : 'border-white/5 focus:border-accent/40'
                            )}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-2 text-[9px] uppercase font-black text-red-500 tracking-wider text-right pr-4 italic">{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-4">
                    <label htmlFor="senha" className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">
                        Chave de Segurança
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                        <input
                            id="senha"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className={cn(
                                "w-full bg-white/5 border rounded-[28px] py-5 pl-14 pr-14 text-white font-black uppercase tracking-widest text-[11px] focus:bg-white/[0.08] focus:ring-0 transition-all outline-none",
                                errors.senha ? 'border-red-500/60 shadow-red-500/10' : 'border-white/5 focus:border-accent/40'
                            )}
                            {...register('senha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.senha && (
                        <p className="mt-2 text-[9px] uppercase font-black text-red-500 tracking-wider text-right pr-4 italic">{errors.senha.message}</p>
                    )}
                    <div className="flex justify-end pt-2">
                         <Link
                            href="/esqueci-senha"
                            className="text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-accent transition-all italic hover:underline underline-offset-4 decoration-accent/20"
                        >
                            Recuperar Protocolo de Senha?
                        </Link>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-4 py-6 rounded-[32px] group transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="uppercase tracking-[0.4em] font-black text-[11px]">Autenticando...</span>
                            </>
                        ) : (
                            <>
                                <span className="uppercase tracking-[0.4em] font-black text-[11px]">Autorizar Acesso</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="pt-10 border-t border-white/5 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">
                    Novo Parceiro?{' '}
                    <Link href="/cadastro" className="text-accent hover:opacity-80 transition-all ml-4 group inline-flex items-center gap-2">
                        <UserPlus className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                        Criar Credencial
                    </Link>
                </p>
            </div>
        </div>
    )
}
