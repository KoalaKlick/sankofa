'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp'
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
    pin: z.string().min(6, {
        message: 'Your one-time password must be 6 characters.',
    }),
})

export default function VerificationPage() {
    const { verifyOtp, loading } = useAuth()
    const [email, setEmail] = useState('') // Ideally passed via query param or store, mock for now
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: '',
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (!email) {
            // Check query params if possible or retrieve from store/context
            // Assuming email is passed via URL search params for simplicity in this example
            const params = new URLSearchParams(window.location.search)
            const emailParam = params.get('email')
            if (emailParam) {
                setEmail(emailParam)
                await verifyOtp(emailParam, data.pin)
            } else {
                console.error("Email not found for verification")
                // Handle missing email logic (redirect back to login?)
            }
        } else {
            await verifyOtp(email, data.pin)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/30">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Verify Account</CardTitle>
                    <CardDescription>Enter the One-Time Password sent to your email.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>One-Time Password</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup className="justify-center w-full">
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormDescription>
                                            Please enter the one-time password sent to your phone.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>Verify</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
