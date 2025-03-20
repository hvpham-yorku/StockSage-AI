"use client";

import Link from "next/link";
import { BarChart3, BookOpen, Briefcase, Home, PieChart, School, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/context/sidebarContext"; // ✅ Import sidebar context

export function Sidebar() {
    const { sidebarOpen, setSidebarOpen } = useSidebar(); // ✅ Get sidebar state from context

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            {/* Sidebar Header */}
            <div className="flex h-16 items-center justify-between border-b px-4">
                <div className="flex items-center gap-1 font-semibold text-xl">
                    <span className="text-primary">StockSage</span>
                    <span>-AI</span>
                </div>
                {/* Close Button */}
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close sidebar</span>
                </Button>
            </div>

            {/* Sidebar Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Main</h3>
                        <div className="space-y-1">
                            <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
                            <SidebarLink href="/portfolio" icon={PieChart} label="Portfolio" />
                            <SidebarLink href="/portfolios/compare" icon={Briefcase} label="Compare Portfolios" />
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="space-y-2">
                        <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Education</h3>
                        <div className="space-y-1">
                            <SidebarLink href="/education" icon={School} label="Education Hub" />
                            <SidebarLink href="/education/terms" icon={BookOpen} label="Stock Glossary" />
                            <SidebarLink href="/education/tips" icon={BarChart3} label="Trading Tips" />
                        </div>
                    </div>

                    {/* Profile */}
                    <div className="space-y-2">
                        <SidebarLink href="/profile" icon={User} label="Profile" />
                    </div>
                </nav>
            </ScrollArea>
        </div>
    );
}

interface SidebarLinkProps {
    href: string;
    icon: React.ElementType;
    label: string;
}

function SidebarLink({ href, icon: Icon, label }: SidebarLinkProps) {
    const { setSidebarOpen } = useSidebar(); // ✅ Sidebar closes on click

    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-muted-foreground rounded-lg hover:bg-muted transition-all"
            onClick={() => setSidebarOpen(false)} // ✅ Close sidebar when clicking a link
        >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}
