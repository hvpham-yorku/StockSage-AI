"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import ProfileDropdown from "./profile-dropdown";
import PageLoader from "./condtionalRender";

import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import {Menu} from "lucide-react";

import { useSidebar} from "@/context/sidebarContext"

export function Header() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const { sidebarOpen, setSidebarOpen } = useSidebar();

        //TODO
    const handleSignIn = () => {
        router.push("/login");
    };

    const handleLogout = () => {
        signOut(auth).then(() => {
            console.log("Signed Out!");
        }).catch((e) => {
            console.log(e);
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/stocks/${encodeURIComponent(searchQuery)}`);
            setSearchQuery(""); // Clear the input field after submission
        }
    };


    let loggedOutHeader = (
        <>
            <Button onClick={() => router.push("/about")} className="px-4 py-2 bg-primary cursor-pointer text-primary-foreground rounded">
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
                {/* Sidebar Toggle Button */}
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>

                {/* Header Name */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 font-semibold text-xl">
                        <span onClick={() => router.push("/")} className="text-primary cursor-pointer">
                            StockSage-AI
                        </span>
                    </div>
                </div>

                {/* Header top options */}
                <div className="ml-auto flex items-center gap-4">
                    <PageLoader fallback={loggedOutHeader}>
                        {/* Logged in header */}
                        <>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search stocks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-3 py-2 border rounded"
                                />
                                <Button type="submit">Search</Button>
                            </form>
                            <ProfileDropdown onLogout={handleLogout} />
                            <button className="px-4 py-2 border rounded">Settings</button>
                        </>
                    </PageLoader>
                </div>
            </div>
        </header>
    );
}
