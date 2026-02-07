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
    }, [])

    const signInWithOtp = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })
        return { error }
    }

    const signInWithPassword = async ({ email, password }: { email: string, password: string }) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (!error) {
            router.push('/')
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
                emailRedirectTo: `${location.origin}/auth/callback`, // Important for email verification flow
            },
        })
        return { error }
    }

    const signInWithOAuth = async (provider: 'google') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
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
            router.push('/')
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
        signOut,
    }
}
