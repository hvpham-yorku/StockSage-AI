"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

//Firebase
import { auth } from "@/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SignupForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match.");
            return;
        }

        if (!agreeTerms) {
            toast.error("You must agree to the terms and privacy policy.");
            return;
        }

        setIsLoading(true);

        try {
            if (!auth) {
                throw new Error("Authentication is not initialized");
            }
            
            console.log("Creating user with Firebase...");
            // First create the user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User created successfully in Firebase");
            
            // Wait for token to be available
            setTimeout(async () => {
                try {
                    // First verify the token with backend
                    console.log("Verifying token with backend...");
                    const verifyResult = await api.auth.verifyToken();
                    console.log("Token verified successfully:", verifyResult);
                    
                    // Then update the user profile with additional information
                    console.log("Updating user profile...");
                    const profileData = {
                        name: `${firstName} ${lastName}`,
                        email: email,
                        preferences: {
                            theme: 'light',
                            notifications_enabled: true,
                            default_view: 'dashboard'
                        }
                    };
                    
                    console.log("Sending profile data:", profileData);
                    const updatedProfile = await api.auth.updateProfile(profileData);
                    console.log("Profile updated successfully:", updatedProfile);
                    
                    // Redirect user to dashboard
                    toast.success("Account created successfully!");
                    router.push('/dashboard');
                } catch (error) {
                    console.error("Backend error during signup:", error);
                    
                    // More detailed error handling
                    const errorMessage = String(error);
                    if (errorMessage.includes("verify")) {
                        toast.error("Account created but unable to verify with backend. Please try logging in.");
                    } else if (errorMessage.includes("CORS")) {
                        toast.error("Server connection issue. Please try again later.");
                    } else if (errorMessage.includes("500")) {
                        toast.error("Server error. The account was created but profile setup failed.");
                    } else {
                        toast.error("Account created but profile setup failed. Please try logging in.");
                    }
                    
                    // Redirect to login page instead
                    setTimeout(() => router.push('/login'), 2000);
                } finally {
                    setIsLoading(false);
                }
            }, 2500); // Even longer delay to ensure Firebase token is ready
            
        } catch (error) {
            console.error("Firebase error during signup:", error);
            toast.error("Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="mx-auto w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Enter your information to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoading} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoading} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm password</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} required />
                        </div>
                        <div className="flex items-start space-x-2">
                            <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(checked) => setAgreeTerms(checked as boolean)} disabled={isLoading} required />
                            <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                                I agree to the{" "}
                                <Link href="/terms" className="text-primary hover:underline">
                                    terms of service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    privacy policy
                                </Link>
                            </Label>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-primary cursor-pointer hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
