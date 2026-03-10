import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Public routes that don't require auth
    const publicRoutes = ['/login', '/cadastro', '/esqueci-senha', '/redefinir-senha']
    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    )

    // Redirect to login if not authenticated and not on public route
    if (!user && !isPublicRoute && pathname !== '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect root to appropriate dashboard
    if (pathname === '/' && user) {
        // Get user profile to determine role
        const { data: profile } = await supabase
            .from('im.profiles' as 'profiles')
            .select('perfil')
            .eq('id', user.id)
            .single()

        const role = (profile as { perfil?: string } | null)?.perfil
        const url = request.nextUrl.clone()
        url.pathname = role === 'admin' ? '/admin/dashboard' : '/dashboard'
        return NextResponse.redirect(url)
    }

    // Redirect root to login if not authenticated
    if (pathname === '/' && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Block admin routes for non-admins
    if (pathname.startsWith('/admin') && user) {
        const { data: profile } = await supabase
            .from('im.profiles' as 'profiles')
            .select('perfil')
            .eq('id', user.id)
            .single()

        const role = (profile as { perfil?: string } | null)?.perfil
        if (role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // Redirect authenticated users away from auth pages
    if (user && isPublicRoute) {
        const { data: profile } = await supabase
            .from('im.profiles' as 'profiles')
            .select('perfil')
            .eq('id', user.id)
            .single()

        const role = (profile as { perfil?: string } | null)?.perfil
        const url = request.nextUrl.clone()
        url.pathname = role === 'admin' ? '/admin/dashboard' : '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes)
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
