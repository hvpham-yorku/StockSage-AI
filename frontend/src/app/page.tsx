"use client"

import { Header } from '@/components/Header';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if the user is authenticated (e.g., from cookies, localStorage, or backend API)
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/auth/status", { credentials: "include" });
                if (response.ok) {
                    setIsAuthenticated(true);
                    router.push("/dashboard"); // Redirect to dashboard if logged in
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div>
                <Header />
                <div className="container relative mx-auto px-4 py-24 flex h-screen items-center px-8">
                    <div className="max-w-3xl text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start mb-6">
                            <div className="flex items-center space-x-2 bg-primary rounded-full px-4 py-2">
                                <span className="font-semibold text-lg text-primary-foreground">StockSage-AI</span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                            Trade Smarter with
                            <span className="block text-primary">AI-Powered Insights</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground mx-0">
                            StockSage-AI combines advanced artificial intelligence with real-time market data to help you make informed
                            investment decisions and maximize your returns.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6 rounded-full"
                                onClick={() => router.push("/signup")} // Redirects to signup page
                            >
                                Sign Up Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null; // If the user is already authenticated, this part won't render
}
