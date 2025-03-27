"use client";

import { redirect } from "next/navigation";
import { auth } from "@/firebase/config";
import React, { JSX, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Conditional render based on whether a user is logged in and satisfies a given condition.
 * Will show a placeholder loading screen while checking authentication.
 *
 * @param   {JSX.Element | string} fallback - The fallback UI or redirect URL if the condition is not met.
 * @param   {React.ReactNode} children - The JSX element(s) to render when the condition is met.
 * @param   {(user: User | null) => boolean} condition - A function that takes the user and returns `true` if the condition is met.
 * @returns {JSX.Element} Conditional UI based on authentication and condition.
 */
export default function PageLoader({
    fallback,
    children,
    condition = (user) => !!user, // Defaults to checking if the user exists
}: {
    fallback: JSX.Element | string;
    children: React.ReactNode;
    condition?: (user: User | null) => boolean;
}) {
    //User starts out as null on page load AND when user is logged out
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });

        return () => listen();
    }, [user]);

    // Show loading screen while checking authentication
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If condition is not met, show fallback (or redirect)
    if (!condition(user)) {
        if (typeof fallback === "string") {
            redirect(fallback);
        }
        return <>{fallback}</>;
    } else {
        // If condition is met, render children
        return <>{children}</>;
    }

}
