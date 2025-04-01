"use client";

import { useAuthRedirect } from "@/hooks/userAuthRedirect";
import { MainDashboard } from "@/components/main-dashboard";
import MainDashboardLayout from "@/components/main-dashboard-layout";

import { useEffect } from "react";
import { getAuth } from "firebase/auth";
export function DebugToken() {
    useEffect(() => {
        const auth = getAuth();
        auth.currentUser?.getIdToken(true).then(token => {
            console.log("🔥 Firebase ID Token:", token);
        });
    }, []);

    return null;
}

export default function DashboardPage() {
    const isAuthenticated = useAuthRedirect();

    if (isAuthenticated === null) {
        return <p className="text-center">Checking authentication...</p>;
    }

    return (
        <MainDashboardLayout>
            <DebugToken />
            <MainDashboard />
        </MainDashboardLayout>
    );
}
