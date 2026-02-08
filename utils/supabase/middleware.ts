import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const protectedRoutes = ['/dashboard', '/profile', '/settings', '/orders', '/cart', '/checkout']

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Check if route is protected
    if (protectedRoutes.includes(request.nextUrl.pathname)) {
        // No user at all - redirect to login
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }

        // User exists but email not verified - redirect to verify page
        if (!user.email_confirmed_at) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/verify'
            url.searchParams.set('email', user.email || '')
            return NextResponse.redirect(url)
        }
    }

    return response
}
