"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Separator} from "@/components/ui/separator";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

import {auth} from "@/firebase/config";
import {signInWithEmailAndPassword} from "firebase/auth";
import {api} from "@/lib/api";

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
            console.log("Attempting to sign in with Firebase...");
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Firebase sign-in successful");

            console.log("Fetching user profile...");
            const profile = await api.auth.getProfile();
            console.log("Profile fetched successfully");

            const defaultView = profile.preferences?.default_view || "dashboard";
            router.push(defaultView === "portfolio" ? "/portfolio" : "/dashboard");

        } catch (error) {
            console.error("Login error:", error);
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
                            <Input id="email" type="email" placeholder="name@example.com" value={email}
                                   onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password}
                                   onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required/>

                            <div className="text-right">
                                <Link href="/auth/reset" className="text-sm text-blue-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>

                        {/* Sign Up Button */}
                        <Link href="/signup" className="block w-full">
                            <Button variant="outline" className="w-full mt-2" disabled={isLoading}>
                                Sign Up
                            </Button>
                        </Link>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
