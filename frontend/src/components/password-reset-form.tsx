"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PasswordResetForm() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle password reset logic here
        console.log({ email })
        setIsSubmitted(true)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="mx-auto w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex items-center justify-center gap-1 font-semibold text-2xl mb-2">
                        <span className="text-primary">StockSage</span>
                        <span>-AI</span>
                    </div>
                    <CardTitle className="text-2xl">Reset your password</CardTitle>
                    <CardDescription>
                        {isSubmitted ? "Check your email for a reset link" : "Enter your email and we'll send you a reset link"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>. Please
                                check your email and follow the instructions to reset your password.
                            </p>
                            <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                                Try another email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Send Reset Link
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/auth/login" className="flex items-center text-sm text-primary hover:underline">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}

