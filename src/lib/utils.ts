import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

export function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

export function formatDuration(seconds: number) {
    return `${seconds}s`
}

export function getStatusColor(status: string) {
    switch (status) {
        case 'concluido':
            return 'text-emerald-400 bg-emerald-400/10'
        case 'processando':
            return 'text-yellow-400 bg-yellow-400/10'
        case 'erro':
            return 'text-red-400 bg-red-400/10'
        default:
            return 'text-gray-400 bg-gray-400/10'
    }
}

export function getStatusLabel(status: string) {
    switch (status) {
        case 'concluido':
            return 'Concluído'
        case 'processando':
            return 'Processando'
        case 'erro':
            return 'Erro'
        default:
            return status
    }
}
