'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Lock, Mail, ChevronRight, UserPlus, Shield, Activity, Zap } from 'lucide-react'
import Link from 'next/link'
import { signIn, getSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
    email: z.string().email('Invalid institutional email address'),
    senha: z.string().min(1, 'Security key is mandatory'),
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
                    toast.error('ACCESS DENIED: Account Deactivated.')
                } else {
                    toast.error('INVALID CREDENTIALS: Verify Email/Key.')
                }
                return
            }

            if (!result?.ok) {
                toast.error('AUTHENTICATION ERROR: Protocol Failure.')
                return
            }

            toast.success('AUTHENTICATION SECURED: Entering Studio.')

            const session = await getSession()
            if ((session?.user as any)?.perfil === 'admin') {
                router.push('/admin/dashboard')
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        } catch {
            toast.error('UNEXPECTED SYSTEM ERROR: Network Failure.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
                        <Shield className="w-5 h-5 text-sidebar-primary" />
                     </div>
                     <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.4em] italic">Secure Vector Active</span>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Access Studio</h2>
                     </div>
                </div>
                <p className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px] leading-relaxed italic max-w-sm">
                    Synchronize your executive credentials <br /> to authorize access to the neural core.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                {/* Email */}
                <div className="space-y-4">
                    <label htmlFor="email" className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block ml-2">
                        Institutional E-mail
                    </label>
                    <div className="relative group">
                        <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-sidebar-primary transition-colors duration-500" />
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="executive@investmais.net"
                            className={cn(
                                "w-full bg-black/40 border rounded-[28px] py-6 pl-16 pr-8 text-white font-black text-xs uppercase tracking-widest focus:bg-black/60 transition-all outline-none duration-700",
                                errors.email ? 'border-red-500/40' : 'border-white/5 focus:border-sidebar-primary/40'
                            )}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-3 text-[9px] uppercase font-black text-red-400 tracking-widest ml-2 italic">! {errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-4">
                    <label htmlFor="senha" className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block ml-2">
                        Security Key
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-sidebar-primary transition-colors duration-500" />
                        <input
                            id="senha"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className={cn(
                                "w-full bg-black/40 border rounded-[28px] py-6 pl-16 pr-16 text-white font-black text-xs uppercase tracking-widest focus:bg-black/60 transition-all outline-none duration-700",
                                errors.senha ? 'border-red-500/40' : 'border-white/5 focus:border-sidebar-primary/40'
                            )}
                            {...register('senha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors duration-500"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {errors.senha && (
                        <p className="mt-3 text-[9px] uppercase font-black text-red-400 tracking-widest ml-2 italic">! {errors.senha.message}</p>
                    )}
                    <div className="flex justify-end pr-2">
                         <Link
                            href="/esqueci-senha"
                            className="text-[9px] font-black uppercase tracking-widest text-white/10 hover:text-sidebar-primary transition-all italic"
                        >
                            Rotate Security Key?
                        </Link>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-4 py-7 netlife-glow shadow-none group transition-all duration-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="uppercase tracking-[0.4em] font-black text-[11px] italic">Securing Protocol...</span>
                            </>
                        ) : (
                            <>
                                <span className="uppercase tracking-[0.4em] font-black text-[11px] italic">Authorize Neural Access</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-700" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="pt-12 border-t border-white/5 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 italic">
                    New Partner Entity?{' '}
                    <Link href="/cadastro" className="text-sidebar-primary hover:text-white transition-all ml-6 group inline-flex items-center gap-3">
                        <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Initialize Credential
                    </Link>
                </p>
            </div>
        </motion.div>
    )
}

import { motion } from 'framer-motion'
