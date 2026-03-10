'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
    email: z.string().email('E-mail inválido'),
})

type FormData = z.infer<typeof schema>

export default function EsqueciSenhaPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const supabase = createClient()

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
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/redefinir-senha`,
            })

            if (error) {
                toast.error('Erro ao enviar e-mail. Tente novamente')
                return
            }

            setSent(true)
        } catch {
            toast.error('Erro inesperado. Tente novamente')
        } finally {
            setIsLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="animate-fade-in text-center">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">E-mail enviado!</h2>
                <p className="text-gray-400 mb-2">
                    Enviamos um link de recuperação para:
                </p>
                <p className="text-white font-medium mb-6">{getValues('email')}</p>
                <p className="text-sm text-gray-500 mb-8">
                    Verifique sua caixa de entrada e spam. O link expira em 1 hora.
                </p>
                <Link href="/login" className="btn-secondary inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                </Link>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Recuperar senha</h2>
                <p className="text-gray-400 mt-2">
                    Informe seu e-mail para receber o link de recuperação
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="email" className="label">
                        E-mail cadastrado
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            className={`input-field pl-11 ${errors.email ? 'border-red-500/60' : ''}`}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        'Enviar link de recuperação'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                </Link>
            </div>
        </div>
    )
}
