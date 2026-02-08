'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { User, Session } from '@/types/auth'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const getRedirectTo = () => {
        // In development, we usually want to stick to localhost to avoid issues with production redirects on local.
        if (process.env.NODE_ENV === 'development') {
            return 'http://localhost:3000/auth/callback'
        }
        // In production, prioritize the environment variable, fallback to origin.
        const baseUrl = process.env.NEXT_PUBLIC_DOMAIN_URL || location.origin || window.location.origin
        return `${baseUrl}/auth/callback`
    }

    const signInWithOtp = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: getRedirectTo(),
            },
        })
        return { error }
    }

    const resetPasswordForEmail = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_DOMAIN_URL || location.origin}/auth/reset-password`,
        })
        return { error }
    }

    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        })
        return { error }
    }

    const signInWithPassword = async ({ email, password }: { email: string, password: string }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (!error && data.user) {
            // Check if email is verified
            if (!data.user.email_confirmed_at) {
                // Email not verified - redirect to verify page
                router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
            } else {
                // Email verified - redirect to protected index page
                router.push('/dashboard')
            }
        }

        return { error }
    }

    const signUp = async ({ email, password, full_name, phone }: { email: string, password: string, full_name: string, phone: string }) => {
        console.log("email:", email, "full_name: ", full_name, "phone: ", phone)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    phone,
                },
                emailRedirectTo: getRedirectTo(), // Important for email verification flow
            },
        })
        console.log("error: ", error)
        return { error }
    }

    const signInWithOAuth = async (provider: 'google') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: getRedirectTo(),
            },
        })
        return { error }
    }

    const verifyOtp = async (email: string, token: string, type: 'email' | 'signup' | 'invite' | 'recovery' | 'magiclink' = 'email') => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type,
        })

        if (!error) {
            router.push('/dashboard')
        }

        return { data, error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    return {
        user,
        session,
        loading,
        signInWithOtp,
        signInWithPassword,
        signUp,
        signInWithOAuth,
        verifyOtp,
        resetPasswordForEmail,
        updatePassword,
        signOut,
    }
}
