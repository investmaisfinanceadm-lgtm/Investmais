'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Lock, Mail, ChevronRight, UserPlus, Shield } from 'lucide-react'
import Link from 'next/link'
import { signIn, getSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const loginSchema = z.object({
    email: z.string().email('E-mail institucional inválido'),
    senha: z.string().min(1, 'A chave de segurança é obrigatória'),
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
                    toast.error('ACESSO NEGADO: Conta Desativada.')
                } else {
                    toast.error('CREDENCIAIS INVÁLIDAS: Verifique E-mail e Senha.')
                }
                return
            }

            if (!result?.ok) {
                toast.error('ERRO DE AUTENTICAÇÃO: Falha no Protocolo.')
                return
            }

            toast.success('AUTENTICAÇÃO REALIZADA: Acessando Dashboard.')

            const session = await getSession()
            if ((session?.user as any)?.perfil === 'admin') {
                router.push('/admin/dashboard')
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        } catch {
            toast.error('ERRO INESPERADO DO SISTEMA: Falha na Rede.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <Lock className="w-4 h-4" />
                     </div>
                     <h2 className="text-2xl font-bold text-white tracking-tight">Login</h2>
                </div>
                <p className="text-white/40 font-medium text-sm">
                    Entre com suas credenciais para acessar a plataforma.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">
                        E-mail Institucional
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="executivo@investmais.com"
                            className={cn(
                                "w-full bg-white/[0.02] border rounded-2xl py-4 pl-12 pr-4 text-white font-medium text-sm transition-all outline-none",
                                errors.email ? 'border-red-500/40' : 'border-white/10 focus:border-primary/50 focus:bg-white/[0.04]'
                            )}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-[10px] font-bold text-red-400 ml-1"> {errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label htmlFor="senha" className="text-xs font-bold text-white/40 uppercase tracking-wider">
                            Senha de Segurança
                        </label>
                        <Link
                            href="/esqueci-senha"
                            className="text-[10px] font-bold uppercase tracking-wider text-white/10 hover:text-primary transition-all"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
                        <input
                            id="senha"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className={cn(
                                "w-full bg-white/[0.02] border rounded-2xl py-4 pl-12 pr-12 text-white font-medium text-sm transition-all outline-none",
                                errors.senha ? 'border-red-500/40' : 'border-white/10 focus:border-primary/50 focus:bg-white/[0.04]'
                            )}
                            {...register('senha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.senha && (
                        <p className="mt-1 text-[10px] font-bold text-red-400 ml-1"> {errors.senha.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Autenticando...</span>
                        </>
                    ) : (
                        <>
                            <span>Acessar Plataforma</span>
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-xs font-medium text-white/20">
                    Ainda não tem uma conta?{' '}
                    <Link href="/cadastro" className="text-primary hover:underline font-bold ml-1">
                        Solicitar Acesso
                    </Link>
                </p>
            </div>
        </motion.div>
    )
}
