"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import ProfileDropdown from "./profile-dropdown";
import PageLoader from "./condtionalRender";

import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";

export function Header() {

    /*
        TODO
        Header has StockSage Name, Search, Profile, and Settings
        TODO

        TODO
        Add Search, Profile, and Settings only when signed in
        TODO
    */
    const router = useRouter()
    const handleSignIn = () => {
        router.push("/login");
    } //Why not just put router.push in the on click?

    const handleLogout = async () => {
        try {
            if (!auth) {
                throw new Error("Authentication is not initialized");
            }
            
            await signOut(auth);
            console.log("Signed Out!");
            
            // You could optionally perform any API clean-up here
            // Such as notifying the backend that the user has logged out
            // e.g., api.auth.logout() if such an endpoint exists
            
            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    
    let loggedOutHeader = (
    <>
        <Button onClick={() => { router.push("/about"); }} className="px-4 py-2 bg-primary cursor-pointer text-primary-foreground rounded">
            About us
        </Button>
        <Button onClick={handleSignIn} className="px-4 py-2 bg-primary cursor-pointer text-primary-foreground rounded">
            Sign In
        </Button>
    </>
    );

    return (
        <header className="border-b bg-card">
            <div className="flex h-16 items-center px-4">

                {/* Header Name */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 font-semibold text-xl">
                        <span onClick={() => { router.push("/")}}className="text-primary cursor-pointer">StockSage-AI</span>
                    </div>
                </div>

                {/* Header top options */}
                <div className="ml-auto flex items-center gap-4">
                    <PageLoader fallback={loggedOutHeader}>
                        {/* Logged in header */}
                        <>
                            <input
                                type="text"
                                placeholder="Search stocks..."
                                className="px-3 py-2 border rounded"
                            />
                            <ProfileDropdown onLogout={handleLogout} />
                            <button className="px-4 py-2 border rounded">Settings</button>
                        </>
                    </PageLoader>
                </div>
            </div>
        </header>
    )
}