"use client"

import { GraduationCap, BookOpen, Lightbulb, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import MainDashboardLayout from "@/components/main-dashboard-layout"

export function EducationPage() {
    return (
        <MainDashboardLayout>
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                {/* Page header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Education Center</h1>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Stock Market Terms */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <CardTitle>Stock Market Terms</CardTitle>
                            </div>
                            <CardDescription>
                                Learn essential stock market terminology
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">
                                Explore a comprehensive glossary of stock market terms and definitions
                                to help you understand financial jargon and make informed investment
                                decisions.
                            </p>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                    <span>Over 100 financial terms explained</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                    <span>Clear, concise definitions</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                    <span>Categorized by topic</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/education/terms">Browse Terms</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Trading Tips */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-primary" />
                                <CardTitle>Trading Tips for Beginners</CardTitle>
                            </div>
                            <CardDescription>
                                Essential advice for new investors
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">
                                Get practical trading tips and strategies designed specifically for
                                beginners. Learn how to avoid common mistakes and build a solid
                                foundation for your investment journey.
                            </p>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                    <span>Risk management strategies</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                    <span>Portfolio building advice</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                    <span>Common pitfalls to avoid</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/education/tips">View Tips</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Featured Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Featured Educational Content</CardTitle>
                        <CardDescription>
                            Curated resources to enhance your investment knowledge
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">Understanding Market Cycles</h3>
                                <p className="text-sm text-muted-foreground">
                                    Learn how to identify different market cycles and adjust your
                                    strategy accordingly.
                                </p>
                                <Button variant="link" className="px-0 mt-2" asChild>
                                    <Link href="#">Read Article</Link>
                                </Button>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">Technical Analysis Fundamentals</h3>
                                <p className="text-sm text-muted-foreground">
                                    Master the basics of chart patterns, indicators, and technical
                                    analysis principles.
                                </p>
                                <Button variant="link" className="px-0 mt-2" asChild>
                                    <Link href="#">Read Article</Link>
                                </Button>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">Fundamental Analysis Guide</h3>
                                <p className="text-sm text-muted-foreground">
                                    Learn how to evaluate a company&#39;s financial health and determine
                                    stock value.
                                </p>
                                <Button variant="link" className="px-0 mt-2" asChild>
                                    <Link href="#">Read Article</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainDashboardLayout>
    )
}
