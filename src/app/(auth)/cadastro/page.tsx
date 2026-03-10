'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import clsx from 'clsx'

const cadastroSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    senha: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Deve conter pelo menos 1 maiúscula')
        .regex(/[0-9]/, 'Deve conter pelo menos 1 número')
        .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos 1 caractere especial'),
    confirmarSenha: z.string(),
}).refine((d) => d.senha === d.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
})

type CadastroForm = z.infer<typeof cadastroSchema>

// Helper to calculate password strength (0 to 4)
const calculateStrength = (password: string) => {
    let strength = 0
    if (!password) return strength
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
}

export default function CadastroPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CadastroForm>({
        resolver: zodResolver(cadastroSchema),
    })

    // Watch password to calculate strength
    const senhaValue = watch('senha', '')
    const strength = calculateStrength(senhaValue)

    const getStrengthColor = () => {
        if (strength === 0) return 'bg-gray-700'
        if (strength <= 2) return 'bg-red-500'       // Fraca
        if (strength === 3) return 'bg-yellow-500' // Média
        return 'bg-green-500'                      // Forte
    }

    const getStrengthLabel = () => {
        if (strength === 0) return 'Digite uma senha'
        if (strength <= 2) return 'Fraca'
        if (strength === 3) return 'Média'
        return 'Forte'
    }

    const onSubmit = async (data: CadastroForm) => {
        setIsLoading(true)
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.senha,
                options: {
                    data: { nome: data.nome },
                },
            })

            if (authError) {
                if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
                    toast.error('Este e-mail já está em uso. Tente fazer login.')
                } else {
                    toast.error('Erro ao criar conta. Tente novamente.')
                }
                return
            }

            if (!authData.user) {
                toast.error('Erro ao criar conta. Tente novamente.')
                return
            }

            // 2. Create profile record
            const { error: profileError } = await supabase.schema('im').from('profiles').upsert({
                id: authData.user.id,
                nome: data.nome,
                email: data.email,
                perfil: 'criador',
                cota_mensal: 10,
                cota_usada: 0,
                status: 'ativo',
            })

            if (profileError) {
                toast.error('Erro ao salvar perfil. Contate o suporte.')
                return
            }

            // 3. Success Behavior
            toast.success('Conta criada com sucesso! Bem-vindo ao InvestMais.')
            router.push('/dashboard')
            router.refresh()
        } catch {
            toast.error('Erro ao criar conta. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-7">
                <h2 className="text-3xl font-bold text-white">Crie sua conta</h2>
                <p className="text-gray-400 mt-2">
                    Comece a gerar conteúdo profissional hoje
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nome */}
                <div>
                    <label htmlFor="nome" className="label">Nome completo</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            id="nome"
                            type="text"
                            autoComplete="name"
                            placeholder="João Silva"
                            className={clsx('input-field pl-11', errors.nome && 'border-red-500/60')}
                            {...register('nome')}
                        />
                    </div>
                    {errors.nome && <p className="mt-1.5 text-xs text-red-400">{errors.nome.message}</p>}
                </div>

                {/* E-mail */}
                <div>
                    <label htmlFor="email" className="label">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="seu@email.com"
                            className={clsx('input-field pl-11', errors.email && 'border-red-500/60')}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
                </div>

                {/* Senha */}
                <div>
                    <label htmlFor="senha" className="label">Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            id="senha"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Crie uma senha segura"
                            className={clsx('input-field pl-11 pr-12', errors.senha && 'border-red-500/60')}
                            {...register('senha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Indicador de Força */}
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-1 flex-1 mr-4">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={clsx(
                                        'h-1 rounded-full flex-1 transition-colors duration-300',
                                        strength >= level ? getStrengthColor() : 'bg-gray-800'
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">
                            {getStrengthLabel()}
                        </span>
                    </div>

                    {errors.senha && <p className="mt-1.5 text-xs text-red-400">{errors.senha.message}</p>}
                    {!errors.senha && (
                        <p className="mt-1 text-xs text-gray-500">
                            Mínimo 8 caracteres, com maiúscula, número e símbolo
                        </p>
                    )}
                </div>

                {/* Confirmar senha */}
                <div>
                    <label htmlFor="confirmarSenha" className="label">Confirmar senha</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            id="confirmarSenha"
                            type={showConfirm ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Repita a senha"
                            className={clsx('input-field pl-11 pr-12', errors.confirmarSenha && 'border-red-500/60')}
                            {...register('confirmarSenha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirmarSenha && (
                        <p className="mt-1.5 text-xs text-red-400">{errors.confirmarSenha.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Criando Conta...
                        </>
                    ) : (
                        'Criar Conta'
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-gold hover:text-gold-300 font-medium transition-colors">
                    Fazer login
                </Link>
            </p>
        </div>
    )
}
