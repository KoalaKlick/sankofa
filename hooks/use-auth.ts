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
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const getRedirectTo = () => `${location.origin}/auth/callback`

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
            redirectTo: `${location.origin}/auth/reset-password`,
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

        // With "Confirm email" ON, Supabase returns error if email not verified
        if (error?.message?.toLowerCase().includes('email not confirmed')) {
            router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
            return { error }
        }

        if (!error && data.user) {
            router.push('/dashboard')
        }

        return { error }
    }

    const signUp = async ({ email, password, full_name, phone }: { email: string, password: string, full_name: string, phone: string }) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    phone,
                },
                emailRedirectTo: getRedirectTo(),
            },
        })
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
