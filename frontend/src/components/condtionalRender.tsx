'use client'

import { redirect } from "next/navigation";
import { auth } from "@/firebase/config";
import React, { JSX, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { api } from "@/lib/api";


/**
 * Conditional render based on whether user is logged in or not.
 * Will have a plaveholder loading screen while waiting
 *
 * @param   fallback The JSX element or redirect link to go to if user is not logged in
 * @param   children The JSX element if the user is logged in
 * @returns A useful value.
 */
export default function PageLoader({
    fallback,
    children
} : {
    fallback: JSX.Element | string
    children: React.ReactNode
}) {

    //User starts out as null on page load AND when user is logged out
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    //Cause a reload once auth has come back
    //Only reloads when user state is changed
    useEffect(() => {
        let isMounted = true;
        console.log("Auth state changed:", user ? "User logged in" : "No user");
        
        if (!auth) {
            console.log("Firebase auth is not available");
            if (isMounted) {
                setIsLoading(false);
            }
            return;
        }
        
        const listen = onAuthStateChanged(auth, (user) => {
            if (!isMounted) return;
            
            setUser(user);
            
            // If user is logged in, verify token with backend after a short delay
            if (user) {
                console.log("User detected in auth state. Will verify token in 1.5 seconds.");
                // Add a delay to ensure token is ready
                setTimeout(async () => {
                    if (!isMounted) return;
                    
                    try {
                        console.log("Attempting to verify token...");
                        await api.auth.verifyToken();
                        console.log("Token verified successfully");
                        if (isMounted) {
                            setIsVerified(true);
                            setIsLoading(false);
                        }
                    } catch (error) {
                        console.error("Token verification failed:", error);
                        // Token verification failed, but we still have a user
                        // We could handle this by showing an error or forcing logout
                        if (isMounted) {
                            setIsVerified(false);
                            setIsLoading(false);
                        }
                    }
                }, 1500); // Longer delay to ensure Firebase token is ready
            } else {
                if (isMounted) {
                    setIsVerified(false);
                    setIsLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
            listen();
        }
    
    }, []);

    function printUser() {
        if (!auth) {
            console.log("Firebase auth is not available");
            return;
        }
        console.log(auth.currentUser);
    }

    //Returns generic loading while waiting for auth
    if (isLoading) {
        console.log("Loading auth state...");
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }
    else if (user == null || !isVerified) {
        if (typeof fallback == "string") {
            console.log("Redirecting to:", fallback);
            redirect(fallback);
        }
        
        return (
            <>
                {fallback}
                {/* <button onClick={printUser}>
                    printUser
                </button> */}
            </>
        )
    }
    else {
        console.log("User authenticated and verified");
        return (
            <>
                {children}
                {/* <button onClick={printUser}>
                    printUser
                </button> */}
            </>
        );
    }
}