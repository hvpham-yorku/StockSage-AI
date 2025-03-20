"use client"

import { Header } from '@/components/header';
import { Button } from "@/components/ui/button";
import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import PageLoader from '@/components/condtionalRender';
import Link from "next/link";

import { api } from "@/lib/api";

export default function Home() {
    const router = useRouter();

    /** REMOVE
     * This is just a debug console.log
     */
    api.auth.updateProfile( {} );

    const signUp = (
    <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
        <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-full"
            onClick={() => router.push("/signup")} // Redirects to signup page
        >
            Sign Up Now
        </Button>
    </div>
    )

    const home = (
    <div>
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

                <PageLoader fallback={signUp}>
                    {/* Don't render signUp button when user is signed in */}
                    <></>
                </PageLoader>
            </div>
        </div>
    </div>
    );

    return (
        //TODO 
        //Not quite sure what I should do if the user is signed in
        //TODO
        <PageLoader fallback={home}>
            {home}
        </PageLoader>
    );
}
