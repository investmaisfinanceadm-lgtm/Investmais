'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { signIn, getSession } from 'next-auth/react'

const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(1, 'Senha é obrigatória'),
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
                    toast.error('Sua conta está desativada. Contate o administrador')
                } else {
                    toast.error('E-mail ou senha incorretos')
                }
                return
            }

            if (!result?.ok) {
                toast.error('Erro ao fazer login. Tente novamente')
                return
            }

            toast.success('Login realizado com sucesso!')

            const session = await getSession()
            if ((session?.user as any)?.perfil === 'admin') {
                router.push('/admin/dashboard')
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        } catch {
            toast.error('Erro inesperado. Tente novamente')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Bem-vindo de volta</h2>
                <p className="text-gray-400 mt-2">
                    Faça login para acessar sua plataforma
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div>
                    <label htmlFor="email" className="label">
                        E-mail
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="seu@email.com"
                            className={`input-field pl-11 ${errors.email ? 'border-red-500/60' : ''}`}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="senha" className="label">
                        Senha
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            id="senha"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="Sua senha"
                            className={`input-field pl-11 pr-12 ${errors.senha ? 'border-red-500/60' : ''}`}
                            {...register('senha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.senha && (
                        <p className="mt-1.5 text-xs text-red-400">{errors.senha.message}</p>
                    )}
                </div>

                {/* Forgot password */}
                <div className="flex justify-end">
                    <Link
                        href="/esqueci-senha"
                        className="text-sm text-gold hover:text-gold-300 transition-colors"
                    >
                        Esqueci minha senha
                    </Link>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="text-gold hover:text-gold-300 font-medium transition-colors">
                    Cadastre-se grátis
                </Link>
            </p>
        </div>
    )
}
