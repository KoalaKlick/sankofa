'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'

const FormSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(1, {
        message: 'Password is required.',
    }),
})

export default function LoginPage() {
    const { signInWithPassword, signInWithOAuth, loading } = useAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setSubmitting(true)
        const { error } = await signInWithPassword({
            email: data.email,
            password: data.password,
        })
        setSubmitting(false)

        if (error) {
            form.setError('root', { message: error.message })
            return
        }

        // Redirect handled in hook or successful login state
    }

    const handleGoogleSignIn = async () => {
        await signInWithOAuth('google')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/30">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.formState.errors.root && (
                                <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={submitting || loading}>
                                {submitting ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                    </Form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                           <title>Google icon</title>
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Google
                    </Button>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account? <a href="/auth/register" className="underline hover:text-primary">Sign up</a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
