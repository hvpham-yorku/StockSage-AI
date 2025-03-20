"use client";

import { useAuthRedirect } from "@/hooks/userAuthRedirect";
import { MainDashboard } from "@/components/main-dashboard";
import MainDashboardLayout from "@/components/main-dashboard-layout";

export default function DashboardPage() {
    const isAuthenticated = useAuthRedirect();

    if (isAuthenticated === null) {
        return <p className="text-center">Checking authentication...</p>;
    }

    return (
        <MainDashboardLayout>
            <MainDashboard />
        </MainDashboardLayout>
    );
}
