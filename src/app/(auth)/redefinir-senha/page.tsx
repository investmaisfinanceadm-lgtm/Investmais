'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const schema = z.object({
    senha: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Deve ter uma maiúscula')
        .regex(/[0-9]/, 'Deve ter um número')
        .regex(/[^A-Za-z0-9]/, 'Deve ter um caractere especial'),
    confirmar: z.string(),
}).refine((d) => d.senha === d.confirmar, {
    message: 'Senhas não coincidem',
    path: ['confirmar'],
})

type FormData = z.infer<typeof schema>

export default function RedefinirSenhaPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [showPw1, setShowPw1] = useState(false)
    const [showPw2, setShowPw2] = useState(false)
    const supabase = createClient()

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        const { error } = await supabase.auth.updateUser({ password: data.senha })
        if (error) {
            toast.error('Erro ao redefinir senha. Link pode ter expirado.')
        } else {
            setDone(true)
            setTimeout(() => router.push('/login'), 3000)
        }
        setIsLoading(false)
    }

    if (done) {
        return (
            <div className="animate-fade-in text-center">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Senha redefinida!</h2>
                <p className="text-gray-400">Redirecionando para o login...</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Nova senha</h2>
                <p className="text-gray-400 mt-2">Defina uma nova senha segura para sua conta</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="label">Nova senha</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type={showPw1 ? 'text' : 'password'}
                            placeholder="Nova senha segura"
                            className={`input-field pl-11 pr-12 ${errors.senha ? 'border-red-500/60' : ''}`}
                            {...register('senha')}
                        />
                        <button type="button" onClick={() => setShowPw1(!showPw1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {showPw1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.senha && <p className="mt-1 text-xs text-red-400">{errors.senha.message}</p>}
                </div>

                <div>
                    <label className="label">Confirmar nova senha</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type={showPw2 ? 'text' : 'password'}
                            placeholder="Repita a nova senha"
                            className={`input-field pl-11 pr-12 ${errors.confirmar ? 'border-red-500/60' : ''}`}
                            {...register('confirmar')}
                        />
                        <button type="button" onClick={() => setShowPw2(!showPw2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {showPw2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirmar && <p className="mt-1 text-xs text-red-400">{errors.confirmar.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Redefinir senha'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Voltar para o login
                </Link>
            </div>
        </div>
    )
}
