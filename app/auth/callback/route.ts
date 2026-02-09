import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Redirect to confirmed page - user can close tab or continue from there
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            const redirectUrl = '/auth/confirmed'
            
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${redirectUrl}`)
            }
            if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
            }
            return NextResponse.redirect(`${origin}${redirectUrl}`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
