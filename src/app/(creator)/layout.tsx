import { type ReactNode } from 'react'
import { CreatorSidebar } from '@/components/layout/CreatorSidebar'

export default function CreatorLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <CreatorSidebar />
            <main className="flex-1 min-w-0 overflow-y-auto bg-transparent">
                {/* pt-16 = mobile top header | pb-24 = mobile bottom nav | lg:pt-0 lg:pb-0 = desktop resets */}
                <div className="pt-[60px] pb-24 lg:pt-0 lg:pb-0">{children}</div>
            </main>
        </div>
    )
}
