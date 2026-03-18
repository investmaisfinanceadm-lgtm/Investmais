'use client'

import { useState, useEffect } from 'react'
import { Save, ChevronDown, ChevronUp, History } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UserQuota {
    id: string
    nome: string
    email: string
    cota_mensal: number
    cota_usada: number
    avatar_url: string | null
}

export default function AdminCotasPage() {
    const [users, setUsers] = useState<UserQuota[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [defaultQuota, setDefaultQuota] = useState(10)
    const [editingQuotas, setEditingQuotas] = useState<Record<string, number>>({})
    const [savingId, setSavingId] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<'nome' | 'uso'>('nome')
    const [sortDesc, setSortDesc] = useState(false)

    useEffect(() => {
        async function loadUsers() {
            setIsLoading(true)
            try {
                const response = await fetch('/api/admin/cotas')
                if (response.ok) {
                    const data = await response.json()
                    setUsers(data)
                    const quotas: Record<string, number> = {}
                    data.forEach((u: UserQuota) => {
                        quotas[u.id] = u.cota_mensal
                    })
                    setEditingQuotas(quotas)
                }
            } finally {
                setIsLoading(false)
            }
        }
        loadUsers()
    }, [])

    const handleSaveQuota = async (userId: string) => {
        setSavingId(userId)
        try {
            const response = await fetch('/api/admin/cotas', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, cota_mensal: editingQuotas[userId] }),
            })

            if (!response.ok) {
                toast.error('Erro ao salvar cota')
            } else {
                toast.success('Cota atualizada!')
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === userId ? { ...u, cota_mensal: editingQuotas[userId] } : u
                    )
                )
            }
        } finally {
            setSavingId(null)
        }
    }

    const handleApplyDefaultToAll = async () => {
        if (!confirm(`Definir cota padrão de ${defaultQuota} para todos os usuários?`)) return

        const newQuotas: Record<string, number> = {}
        users.forEach((u) => {
            newQuotas[u.id] = defaultQuota
        })
        setEditingQuotas(newQuotas)

        const response = await fetch('/api/admin/cotas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cota_mensal: defaultQuota }),
        })

        if (!response.ok) {
            toast.error('Erro ao aplicar cota padrão')
        } else {
            toast.success(`Cota padrão de ${defaultQuota} aplicada a todos!`)
            setUsers((prev) => prev.map((u) => ({ ...u, cota_mensal: defaultQuota })))
        }
    }

    const sortedUsers = [...users].sort((a, b) => {
        if (sortBy === 'nome') {
            return sortDesc ? b.nome.localeCompare(a.nome) : a.nome.localeCompare(b.nome)
        } else {
            const percA = a.cota_usada / a.cota_mensal
            const percB = b.cota_usada / b.cota_mensal
            return sortDesc ? percA - percB : percB - percA
        }
    })

    const toggleSort = (field: 'nome' | 'uso') => {
        if (sortBy === field) {
            setSortDesc(!sortDesc)
        } else {
            setSortBy(field)
            setSortDesc(false)
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="section-title">Gestão de Cotas</h1>
                <p className="section-subtitle">Gerencie a cota mensal de vídeos de cada usuário</p>
            </div>

            {/* Default Quota Config */}
            <div className="card">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-white">Cota Padrão Global</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Defina a cota padrão e aplique a todos os usuários de uma vez
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min={1}
                            max={1000}
                            value={defaultQuota}
                            onChange={(e) => setDefaultQuota(Number(e.target.value))}
                            className="input-field w-24 text-center"
                        />
                        <span className="text-gray-400 text-sm">vídeos/mês</span>
                        <button
                            onClick={handleApplyDefaultToAll}
                            className="btn-secondary text-sm whitespace-nowrap"
                        >
                            Aplicar a todos
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Quota Table */}
            <div className="card overflow-hidden p-0">
                <div className="px-6 py-4 border-b border-dark-border">
                    <h2 className="text-base font-semibold text-white">Cotas Individuais</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-muted">
                            <tr>
                                <th className="table-header">
                                    <button
                                        onClick={() => toggleSort('nome')}
                                        className="flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        Usuário
                                        {sortBy === 'nome' && (
                                            sortDesc ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                                        )}
                                    </button>
                                </th>
                                <th className="table-header">
                                    <button
                                        onClick={() => toggleSort('uso')}
                                        className="flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        Uso do mês
                                        {sortBy === 'uso' && (
                                            sortDesc ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                                        )}
                                    </button>
                                </th>
                                <th className="table-header">Cota mensal</th>
                                <th className="table-header text-right">Salvar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="table-row">
                                        {Array.from({ length: 4 }).map((_, j) => (
                                            <td key={j} className="table-cell">
                                                <div className="shimmer h-4 rounded w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                                : sortedUsers.map((user) => {
                                    const percent = Math.min(
                                        Math.round((user.cota_usada / user.cota_mensal) * 100),
                                        100
                                    )
                                    return (
                                        <tr key={user.id} className="table-row">
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                                                        <span className="text-gold text-xs font-bold">
                                                            {getInitials(user.nome)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{user.nome}</p>
                                                        <p className="text-gray-500 text-xs">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3 min-w-40">
                                                    <div className="progress-bar flex-1">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                                        {user.cota_usada}/{user.cota_mensal} ({percent}%)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={1000}
                                                    value={editingQuotas[user.id] ?? user.cota_mensal}
                                                    onChange={(e) =>
                                                        setEditingQuotas((prev) => ({
                                                            ...prev,
                                                            [user.id]: Number(e.target.value),
                                                        }))
                                                    }
                                                    className="input-field w-24 text-center h-9 text-sm"
                                                />
                                            </td>
                                            <td className="table-cell text-right">
                                                <button
                                                    onClick={() => handleSaveQuota(user.id)}
                                                    disabled={
                                                        savingId === user.id ||
                                                        editingQuotas[user.id] === user.cota_mensal
                                                    }
                                                    className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold transition-colors disabled:opacity-40"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center gap-3 mb-4">
                    <History className="w-5 h-5 text-gold" />
                    <h2 className="text-base font-semibold text-white">Histórico de Consumo</h2>
                </div>
                <p className="text-sm text-gray-400">
                    O histórico detalhado de consumo por usuário está disponível na aba de Monitoramento.
                    As cotas são resetadas automaticamente no dia 1 de cada mês.
                </p>
            </div>
        </div>
    )
}
