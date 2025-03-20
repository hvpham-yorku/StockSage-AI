"use client";

import { ArrowRight, BrainCircuit, ChevronUp, DollarSign, LineChart, Plus, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function MainDashboard() {
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Page header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Button size="sm" className="h-8 gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Widget</span>
                    </Button>
                </div>
            </div>

            {/* Portfolio summary cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,546.80</div>
                        <div className="flex items-center text-sm text-success">
                            <ChevronUp className="h-4 w-4" />
                            <span>2.5%</span>
                            <span className="ml-1 text-muted-foreground">from yesterday</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success">+$1,245.30</div>
                        <div className="flex items-center text-sm text-success">
                            <ChevronUp className="h-4 w-4" />
                            <span>11.2%</span>
                            <span className="ml-1 text-muted-foreground">all time</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$4,250.00</div>
                        <div className="text-sm text-muted-foreground">Available for trading</div>
                    </CardContent>
                </Card>
            </div>

            {/* Portfolio Comparison */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Portfolio Comparison</CardTitle>
                    <CardDescription>Compare your portfolio with different investment strategies.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Portfolio comparison charts and metrics table will go here */}
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full gap-1" asChild>
                        <Link href="/portfolios/compare">
                            <span>Compare Portfolios</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            {/* Educational Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        <CardTitle>Educational Resources</CardTitle>
                    </div>
                    <CardDescription>Learn about stock trading and financial strategies.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/education/terms" className="text-primary hover:underline">
                                📖 Stock Terms Glossary
                            </Link>
                        </li>
                        <li>
                            <Link href="/education/tips" className="text-primary hover:underline">
                                📈 Stock Trading Tips
                            </Link>
                        </li>
                        <li>
                            <Link href="/education" className="text-primary hover:underline">
                                📚 Beginner's Guide
                            </Link>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
