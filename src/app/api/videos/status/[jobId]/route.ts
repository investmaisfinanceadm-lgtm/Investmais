export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'
import { getVideoStatus } from '@/lib/api/nano-banana'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: { jobId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { jobId } = params

        // If it's a mock job (no API key configured), simulate completion after delay
        if (jobId.startsWith('mock_job_')) {
            const jobTime = parseInt(jobId.replace('mock_job_', ''))
            const elapsed = Date.now() - jobTime

            if (elapsed > 10000) {
                // 10 seconds = "completed" for demo
                return NextResponse.json({
                    id: jobId,
                    status: 'completed',
                    video_url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                    progress: 100,
                })
            } else {
                return NextResponse.json({
                    id: jobId,
                    status: 'processing',
                    progress: Math.floor((elapsed / 10000) * 90),
                })
            }
        }

        // Real Nano Banana API status check
        const status = await getVideoStatus(jobId)

        return NextResponse.json({
            id: status.id,
            status: status.status === 'completed' ? 'completed'
                : status.status === 'failed' ? 'failed'
                    : 'processing',
            video_url: status.video_url,
            error: status.error,
            progress: status.progress,
        })
    } catch (error: unknown) {
        console.error('Status check error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao verificar status' },
            { status: 500 }
        )
    }
}
