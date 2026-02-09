'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'

export default function VerificationPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email] = useState(searchParams.get('email') || '')
    const [status, setStatus] = useState<'waiting' | 'verified' | 'error'>('waiting')
    const [error, setError] = useState('')
    const [checking, setChecking] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        // Listen for auth state changes (auto-redirect when verified in another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
                    setStatus('verified')
                    setTimeout(() => router.push('/dashboard'), 1000)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [router])

    const handleContinue = async () => {
        setChecking(true)
        setError('')
        
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user?.email_confirmed_at) {
            setStatus('verified')
            setTimeout(() => router.push('/dashboard'), 1000)
        } else {
            setError('Email not verified yet. Please check your inbox and click the verification link first.')
        }
        setChecking(false)
    }

    const handleResend = async () => {
        if (!email) return
        const supabase = createClient()
        const { error } = await supabase.auth.resend({ type: 'signup', email })
        if (error) {
            setError(error.message)
        } else {
            setError('')
            alert('Verification email resent!')
        }
    }

    if (status === 'verified') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary/30">
                <Card className="w-100 text-center">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <CardTitle>Email Verified!</CardTitle>
                        <CardDescription>Redirecting to dashboard...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/30">
            <Card className="w-100">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Mail className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle>Check Your Email</CardTitle>
                    <CardDescription>
                        We sent a verification link to
                        {email && <strong className="block mt-1">{email}</strong>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Click the link in your email to verify, then come back here and press Continue.
                    </p>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <Button className="w-full" onClick={handleContinue} disabled={checking}>
                        {checking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Continue
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={handleResend}>
                            Resend Email
                        </Button>
                        <Button variant="ghost" className="flex-1" onClick={() => router.push('/auth/login')}>
                            Back to Login
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
