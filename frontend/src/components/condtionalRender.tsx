"use client";

import { redirect } from "next/navigation";
import { auth } from "@/firebase/config";
import React, { JSX, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Conditional render based on whether a user is logged in and satisfies a given condition.
 * Will show a placeholder loading screen while checking authentication and async conditions.
 *
 * @param   {JSX.Element | string} fallback - The fallback UI or redirect URL if the condition is not met.
 * @param   {React.ReactNode} children - The JSX element(s) to render when the condition is met.
 * @param   {(user: User | null) => boolean | Promise<boolean>} condition - A function that takes the user and returns `true` if the condition is met.
 * @returns {JSX.Element} Conditional UI based on authentication and condition.
 */
export default function PageLoader({
    fallback,
    children,
    condition = (user) => !!user, // Defaults to checking if the user exists
}: {
    fallback: JSX.Element | string;
    children: React.ReactNode;
    condition?: (user: User | null) => boolean | Promise<boolean>; // Allow async conditions
}) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [meetsCondition, setMeetsCondition] = useState<boolean | null>(null); // Store result of condition check

    //When the auth state changes
    //This rerenders the page 
    useEffect(() => {
        const listen = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setIsLoading(false);

            // Handle async condition functions
            if (condition) {
                if (typeof condition === "function") {
                    const result = await condition(user);
                    setMeetsCondition(result);
                }
            }
        });

        return () => listen();
    }, []);

    // Show loading screen while checking authentication
    if (isLoading || meetsCondition === null) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    } else if (!meetsCondition) { // If condition is not met, show fallback (or redirect)
        if (typeof fallback === "string") {
            redirect(fallback);
        }
        return <>{fallback}</>;
    } else { // If condition is met, render children
        return <>{children}</>;
    }
}