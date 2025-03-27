"use client";

import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/context/sidebarContext"
import { Sidebar } from "@/components/sidebar";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainDashboardLayout({ children }: MainLayoutProps) {
    const { isDark, toggleTheme } = useTheme(); // will be updating this later
    const {sidebarOpen, setSidebarOpen} = useSidebar(); // Sidebar initially closed

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Mobile sidebar backdrop (closes sidebar when clicked) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            {/* Sidebar */}
            <Sidebar  />

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Page content */}
                <main className="flex-1 overflow-auto bg-muted/40 pb-6">{children}</main>
            </div>
        </div>
    );
}
