import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/providers/SessionProvider'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#06091A',
}

export const metadata: Metadata = {
    title: {
        default: 'InvestMais Finance',
        template: '%s | InvestMais Finance',
    },
    description:
        'Plataforma especializada em geração de conteúdo por Inteligência Artificial para o mercado financeiro. Automatize a criação de vídeos profissionais para produtos como Home Equity e Financiamento.',
    keywords: [
        'fintech',
        'conteúdo financeiro',
        'IA',
        'inteligência artificial',
        'vídeos financeiros',
        'home equity',
        'financiamento',
    ],
    robots: 'noindex, nofollow',
    icons: {
        icon: [
            { url: '/icon.svg', type: 'image/svg+xml' },
        ],
        apple: '/icon.svg',
        shortcut: '/icon.svg',
    },
}


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="pt-BR" className={inter.variable}>
            <head>
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className="font-sans antialiased">
                <Providers>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#0f1e35',
                                color: '#ffffff',
                                border: '1px solid #1a2d4a',
                                borderRadius: '12px',
                                fontSize: '14px',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#C9A84C',
                                    secondary: '#0f1e35',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#0f1e35',
                                },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    )
}
