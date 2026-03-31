import { type ReactNode } from 'react'
import { CreatorSidebar } from '@/components/layout/CreatorSidebar'

export default function CreatorLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <CreatorSidebar />
            <main className="flex-1 min-w-0 overflow-y-auto bg-[#06091A]">
                <div className="pt-16 lg:pt-0">{children}</div>
            </main>
        </div>
    )
}
