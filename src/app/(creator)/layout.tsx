import { type ReactNode } from 'react'
import { CreatorSidebar } from '@/components/layout/CreatorSidebar'

export default function CreatorLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <CreatorSidebar />
            <main className="flex-1 min-w-0 lg:overflow-y-auto">
                <div className="pt-16 lg:pt-0">{children}</div>
            </main>
        </div>
    )
}
