'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function EmailConfirmedPage() {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/30">
            <Card className="w-100 text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle>Email Confirmed!</CardTitle>
                    <CardDescription>
                        Your email has been successfully verified.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You can close this tab and return to where you were signing up, 
                        or continue to the dashboard from here.
                    </p>
                    <Button 
                        className="w-full" 
                        onClick={() => router.push('/dashboard')}
                    >
                        Continue to Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
