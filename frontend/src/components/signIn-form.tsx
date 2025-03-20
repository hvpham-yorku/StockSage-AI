"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { auth } from "@/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { api } from "@/lib/api";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!auth) {
                throw new Error("Authentication is not initialized");
            }
            
            console.log("Attempting to sign in with Firebase...");
            // First authenticate with Firebase
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Firebase sign-in successful");
            
            // Wait for token to be available
            setTimeout(async () => {
                try {
                    console.log("Verifying token with backend...");
                    // Verify the token with the backend
                    await api.auth.verifyToken();
                    console.log("Token verified successfully");
                    
                    console.log("Fetching user profile...");
                    // Fetch the user profile
                    await api.auth.getProfile();
                    console.log("Profile fetched successfully");
                    
                    router.push("/dashboard");
                } catch (error) {
                    console.error("Backend verification error:", error);
                    toast.error("Failed to authenticate with backend. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            }, 1500); // Longer delay to ensure Firebase token is ready
            
        } catch (error) {
            console.error("Firebase auth error:", error);
            toast.error("Failed to sign in. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="mx-auto w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required />

                            <div className="text-right">
                                <Link href="/auth/reset" className="text-sm text-blue-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
