'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Lock, Mail, User, ChevronRight, Check } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'

const cadastroSchema = z.object({
    nome: z.string().min(3, 'Nome deve conter pelo menos 3 caracteres'),
    email: z.string().email('E-mail institucional inválido'),
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

export default function CadastroPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CadastroForm>({
        resolver: zodResolver(cadastroSchema),
    })

    const senhaValue = watch('senha', '')
    
    const requirements = [
        { label: '8+ Caracteres', met: senhaValue.length >= 8 },
        { label: 'Maiúscula', met: /[A-Z]/.test(senhaValue) },
        { label: 'Número', met: /[0-9]/.test(senhaValue) },
        { label: 'Símbolo', met: /[^A-Za-z0-9]/.test(senhaValue) },
    ]

    const onSubmit = async (data: CadastroForm) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: data.nome,
                    email: data.email,
                    password: data.senha,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                toast.error(result.error || 'ERRO: Falha ao registrar credencial.')
                return
            }

            toast.success('CONTA CRIADA: Sincronizando acesso...')

            const signInResult = await signIn('credentials', {
                email: data.email,
                password: data.senha,
                redirect: false,
            })

            if (signInResult?.ok) {
                router.push('/dashboard')
                router.refresh()
            } else {
                router.push('/login')
            }
        } catch {
            toast.error('ERRO CRÍTICO: Protocolo de registro falhou.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="animate-fade-in space-y-10">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                     <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Novo Registro de Parceiro</span>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Criar Credencial</h2>
                <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px]">
                    Cadastre-se para acessar o núcleo de <br /> inteligência criativa da InvestMais.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Nome */}
                <div className="space-y-3">
                    <label htmlFor="nome" className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">Nome Completo</label>
                    <div className="relative group">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                        <input
                            id="nome"
                            type="text"
                            placeholder="Ex: João da Silva"
                            className={cn(
                                "w-full bg-white/5 border rounded-[28px] py-4 pl-14 pr-6 text-white font-semibold text-[13px] focus:bg-white/[0.08] focus:ring-0 transition-all outline-none",
                                errors.nome ? 'border-red-500/60' : 'border-white/5 focus:border-accent/40'
                            )}
                            {...register('nome')}
                        />
                    </div>
                    {errors.nome && <p className="mt-2 text-[9px] font-black text-red-500 uppercase tracking-widest pr-4 text-right italic">{errors.nome.message}</p>}
                </div>

                {/* E-mail */}
                <div className="space-y-3">
                    <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">E-mail Institucional</label>
                    <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@investmais.com"
                            className={cn(
                                "w-full bg-white/5 border rounded-[28px] py-4 pl-14 pr-6 text-white font-semibold text-[13px] focus:bg-white/[0.08] focus:ring-0 transition-all outline-none",
                                errors.email ? 'border-red-500/60' : 'border-white/5 focus:border-accent/40'
                            )}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && <p className="mt-2 text-[9px] font-black text-red-500 uppercase tracking-widest pr-4 text-right italic">{errors.email.message}</p>}
                </div>

                {/* Senha */}
                <div className="space-y-4">
                    <label htmlFor="senha" className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">Chave de Segurança</label>
                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                        <input
                            id="senha"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={cn(
                                "w-full bg-white/5 border rounded-[28px] py-4 pl-14 pr-14 text-white font-semibold text-[13px] focus:bg-white/[0.08] focus:ring-0 transition-all outline-none",
                                errors.senha ? 'border-red-500/60' : 'border-white/5 focus:border-accent/40'
                            )}
                            {...register('senha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Requirements Tags */}
                    <div className="flex flex-wrap gap-2 px-2">
                        {requirements.map((req, i) => (
                            <div key={i} className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all",
                                req.met ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-700 opacity-50'
                            )}>
                                {req.met && <Check className="w-2.5 h-2.5" />}
                                <span className="text-[8px] font-black uppercase tracking-widest">{req.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-3">
                    <label htmlFor="confirmarSenha" className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">Confirmar Chave</label>
                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                        <input
                            id="confirmarSenha"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={cn(
                                "w-full bg-white/5 border rounded-[28px] py-4 pl-14 pr-14 text-white font-semibold text-[13px] focus:bg-white/[0.08] focus:ring-0 transition-all outline-none",
                                errors.confirmarSenha ? 'border-red-500/60' : 'border-white/5 focus:border-accent/40'
                            )}
                            {...register('confirmarSenha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirmarSenha && <p className="mt-2 text-[9px] font-black text-red-500 uppercase tracking-widest pr-4 text-right italic">{errors.confirmarSenha.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-4 py-6 rounded-[32px] group mt-4 transition-all"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="uppercase tracking-[0.4em] font-black text-[11px]">Sincronizando...</span>
                        </>
                    ) : (
                        <>
                            <span className="uppercase tracking-[0.4em] font-black text-[11px]">Consolidar Registro</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">
                    Já possui acesso?{' '}
                    <Link href="/login" className="text-accent hover:opacity-80 transition-all ml-4 inline-flex items-center gap-2 group">
                        Autorizar Login
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </p>
            </div>
        </div>
    )
}
