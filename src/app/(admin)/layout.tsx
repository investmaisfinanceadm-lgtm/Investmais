import { type ReactNode } from 'react'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 min-w-0 lg:overflow-y-auto">
                <div className="pt-16 lg:pt-0">{children}</div>
            </main>
        </div>
    )
}
