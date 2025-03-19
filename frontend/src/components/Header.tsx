"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
        router.push("/login")
    }
    const isAuthenticated = false;
    return (
        <header className="border-b bg-card">
            <div className="flex h-16 items-center px-4">

                {/* Header Name */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 font-semibold text-xl">
                        <span className="text-primary">StockSage-AI</span>
                    </div>
                </div>

                {/* Header top options */}
                <div className="ml-auto flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <input
                                type="text"
                                placeholder="Search stocks..."
                                className="px-3 py-2 border rounded"
                            />
                            <button className="px-4 py-2 border rounded">Profile</button>
                            <button className="px-4 py-2 border rounded">Settings</button>
                        </>
                    ) : (
                        <Button onClick={handleSignIn} className="px-4 py-2 bg-blue-500 text-white rounded">
                            Sign In
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}