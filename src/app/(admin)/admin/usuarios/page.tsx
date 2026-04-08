'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit2,
    Ban,
    CheckCircle,
    Trash2,
    KeyRound,
    Loader2,
    X,
    Eye,
    EyeOff,
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface UserProfile {
    id: string
    nome: string
    email: string
    perfil: 'admin' | 'criador'
    status: 'ativo' | 'inativo'
    cota_mensal: number
    cota_usada: number
    created_at: string
    last_activity: string | null
    avatar_url: string | null
}

const newUserSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    senha: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Deve conter pelo menos 1 maiúscula')
        .regex(/[0-9]/, 'Deve conter pelo menos 1 número')
        .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos 1 caractere especial'),
    perfil: z.enum(['admin', 'criador']),
    cota_mensal: z.number().min(1).max(1000),
})

type NewUserForm = z.infer<typeof newUserSchema>

function CreateUserModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<NewUserForm>({
        resolver: zodResolver(newUserSchema),
        defaultValues: { perfil: 'criador', cota_mensal: 10 },
    })

    const onSubmit = async (data: NewUserForm) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error || 'Erro ao criar usuário')

            toast.success('Usuário criado com sucesso!')
            reset()
            onSuccess()
            onClose()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário')
        } finally {
            setIsLoading(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative z-10 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl w-full max-w-lg shadow-card-hover animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-main)]">
                    <h2 className="text-lg font-semibold text-white">Novo Usuário</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="label">Nome completo</label>
                            <input
                                type="text"
                                placeholder="João Silva"
                                className={`input-field ${errors.nome ? 'border-red-500/60' : ''}`}
                                {...register('nome')}
                            />
                            {errors.nome && (
                                <p className="mt-1 text-xs text-red-400">{errors.nome.message}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="label">E-mail</label>
                            <input
                                type="email"
                                placeholder="joao@empresa.com"
                                className={`input-field ${errors.email ? 'border-red-500/60' : ''}`}
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="label">Senha temporária</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Senha segura..."
                                    className={`input-field pr-12 ${errors.senha ? 'border-red-500/60' : ''}`}
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
                            {errors.senha && (
                                <p className="mt-1 text-xs text-red-400">{errors.senha.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Perfil</label>
                            <select className="input-field" {...register('perfil')}>
                                <option value="criador">Criador</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Cota mensal (vídeos)</label>
                            <input
                                type="number"
                                min={1}
                                max={1000}
                                className={`input-field ${errors.cota_mensal ? 'border-red-500/60' : ''}`}
                                {...register('cota_mensal', { valueAsNumber: true })}
                            />
                            {errors.cota_mensal && (
                                <p className="mt-1 text-xs text-red-400">{errors.cota_mensal.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                'Criar Usuário'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function EditUserModal({ user, onClose, onSuccess }: { user: UserProfile; onClose: () => void; onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [form, setForm] = useState({ nome: user.nome, email: user.email, perfil: user.perfil, cota_mensal: user.cota_mensal })

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/usuarios', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, ...form }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            toast.success('Usuário atualizado!')
            onSuccess()
            onClose()
        } catch (err: any) {
            toast.error(err.message || 'Erro ao atualizar')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl w-full max-w-lg shadow-card-hover animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-main)]">
                    <h2 className="text-lg font-semibold text-white">Editar Usuário</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="label">Nome completo</label>
                        <input className="input-field" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label">E-mail</label>
                        <input className="input-field" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Perfil</label>
                            <select className="input-field" value={form.perfil} onChange={e => setForm(p => ({ ...p, perfil: e.target.value as any }))}>
                                <option value="criador">Criador</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Cota mensal</label>
                            <input className="input-field" type="number" min={1} max={1000} value={form.cota_mensal} onChange={e => setForm(p => ({ ...p, cota_mensal: Number(e.target.value) }))} />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
                        <button onClick={handleSave} disabled={isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('todos')
    const [filterPerfil, setFilterPerfil] = useState('todos')
    const [activeMenu, setActiveMenu] = useState<string | null>(null)

    const loadUsers = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/usuarios')
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    const handleToggleStatus = async (user: UserProfile) => {
        const newStatus = user.status === 'ativo' ? 'inativo' : 'ativo'
        const response = await fetch(`/api/admin/usuarios/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
            toast.error('Erro ao atualizar status')
        } else {
            toast.success(`Usuário ${newStatus === 'ativo' ? 'ativado' : 'desativado'}`)
            loadUsers()
        }
        setActiveMenu(null)
    }

    const handleDelete = async (user: UserProfile) => {
        // Check if last admin
        if (user.perfil === 'admin') {
            const adminCount = users.filter((u) => u.perfil === 'admin').length
            if (adminCount <= 1) {
                toast.error('Não é possível excluir o único administrador do sistema')
                return
            }
        }

        if (!confirm(`Excluir usuário "${user.nome}"? Esta ação não pode ser desfeita.`)) return

        const response = await fetch(`/api/admin/usuarios/${user.id}`, {
            method: 'DELETE',
        })

        if (response.ok) {
            toast.success('Usuário excluído')
            loadUsers()
        } else {
            toast.error('Erro ao excluir usuário')
        }
        setActiveMenu(null)
    }

    const handleResetPassword = async (user: UserProfile) => {
        const response = await fetch('/api/admin/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
        })

        if (response.ok) {
            toast.success('Link de redefinição gerado!')
        } else {
            toast.error('Erro ao gerar link')
        }
        setActiveMenu(null)
    }

    const filteredUsers = users.filter((u) => {
        const matchSearch =
            u.nome.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'todos' || u.status === filterStatus
        const matchPerfil = filterPerfil === 'todos' || u.perfil === filterPerfil
        return matchSearch && matchStatus && matchPerfil
    })

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="section-title">Usuários</h1>
                    <p className="section-subtitle">
                        {users.length} usuários cadastrados
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-11 h-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input-field h-10 w-36"
                        >
                            <option value="todos">Todo status</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                        <select
                            value={filterPerfil}
                            onChange={(e) => setFilterPerfil(e.target.value)}
                            className="input-field h-10 w-36"
                        >
                            <option value="todos">Todo perfil</option>
                            <option value="criador">Criador</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--bg-primary)]">
                            <tr>
                                <th className="table-header">Usuário</th>
                                <th className="table-header">Perfil</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Cota</th>
                                <th className="table-header">Cadastro</th>
                                <th className="table-header">Última atividade</th>
                                <th className="table-header text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="table-row">
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="table-cell">
                                                <div className="shimmer h-4 rounded w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="table-row">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-gold text-xs font-bold">
                                                        {getInitials(user.nome)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">{user.nome}</p>
                                                    <p className="text-gray-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span
                                                className={
                                                    user.perfil === 'admin' ? 'badge badge-gold' : 'badge badge-blue'
                                                }
                                            >
                                                {user.perfil === 'admin' ? 'Admin' : 'Criador'}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <span
                                                className={
                                                    user.status === 'ativo' ? 'badge badge-green' : 'badge badge-red'
                                                }
                                            >
                                                {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <div>
                                                <p className="text-white text-sm font-medium">
                                                    {user.cota_usada}/{user.cota_mensal}
                                                </p>
                                                <div className="progress-bar w-20 mt-1">
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${Math.min((user.cota_usada / user.cota_mensal) * 100, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell text-xs">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="table-cell text-xs">
                                            {user.last_activity ? formatDate(user.last_activity) : '—'}
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() =>
                                                        setActiveMenu(
                                                            activeMenu === user.id ? null : user.id
                                                        )
                                                    }
                                                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>

                                                {activeMenu === user.id && (
                                                    <div className="absolute right-0 mt-1 w-48 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-card-hover z-10 overflow-hidden animate-fade-in">
                                                        <button
                                                            onClick={() => {
                                                                setActiveMenu(null)
                                                                setEditingUser(user)
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                                        >
                                                            {user.status === 'ativo' ? (
                                                                <>
                                                                    <Ban className="w-4 h-4" />
                                                                    Desativar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Ativar
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleResetPassword(user)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                                        >
                                                            <KeyRound className="w-4 h-4" />
                                                            Resetar senha
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Excluir
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateUserModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={loadUsers}
            />
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={loadUsers}
                />
            )}
        </div>
    )
}
