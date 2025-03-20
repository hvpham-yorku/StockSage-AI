'use client'

import { redirect } from "next/navigation";
import { auth } from "@/firebase/config";
import React, { JSX, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";


/**
 * Conditional render based on whether user is logged in or not.
 * Will have a placeholder loading screen while waiting
 *
 * @param   fallback The JSX element or redirect link to go to if user is not logged in
 * @param   children The JSX element if the user is logged in
 * @returns { JSX.Element } dependent on auth 
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

    //Cause a reload once auth has come back
    //Only reloads when user state is changed
    useEffect(() => {
        console.log(user);
        const listen = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        })

        return () => {
            listen();
        }
    
      }, [user]);

    function printUser() {
        console.log(auth.currentUser);
    }

    //Returns generic loading while waiting for auth
    if (isLoading) {
        console.log("Loading");
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }
    else if (user == null) {
        if (typeof fallback == "string") {
            console.log("Redirected!");
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
        console.log("Logged in!");
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