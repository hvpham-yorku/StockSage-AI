"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Lightbulb } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import MainDashboardLayout from "@/components/main-dashboard-layout"
import api, { TradingTip } from "@/lib/api"

// Format category slug to title case
function formatCategory(slug: string) {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default function TipsPage() {
    const [tradingTips, setTradingTips] = useState<TradingTip[]>([])

    useEffect(() => {
        const fetchTips = async () => {
            try {
                const tips = await api.education.getTips()
                setTradingTips(tips)
            } catch (error) {
                console.error("Failed to fetch trading tips:", error)
            }
        }

        fetchTips()
    }, [])

    const categories = Array.from(new Set(tradingTips.map((tip) => tip.category)))

    return (
        <MainDashboardLayout>
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                {/* Page header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Trading Tips for Beginners</h1>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                        <Link href="/education">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Education
                        </Link>
                    </Button>
                </div>

                {/* Intro */}
                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started with Stock Trading</CardTitle>
                        <CardDescription>Essential advice for new investors</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Stock trading can be both exciting and intimidating for beginners.
                            These tips are designed to help you build a solid foundation for
                            your investment journey, avoid common pitfalls, and develop good
                            habits from the start.
                        </p>
                    </CardContent>
                </Card>

                {/* Tips grouped by category */}
                {categories.map((category) => (
                    <Card key={category}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-primary" />
                                <CardTitle>{formatCategory(category)}</CardTitle>
                            </div>
                            <CardDescription>
                                {{
                                    beginner: "Start small and build confidence",
                                    strategy: "Approaches for long-term success",
                                    "risk-management": "Strategies to reduce investment risks",
                                    research: "Do your homework before investing"
                                }[category] || "Helpful trading advice"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {tradingTips
                                    .filter((tip) => tip.category === category)
                                    .map((tip) => (
                                        <AccordionItem key={tip.id} value={`tip-${tip.id}`}>
                                            <AccordionTrigger className="hover:no-underline">
                                                <div className="flex flex-col items-start text-left">
                                                    <div className="font-medium">{tip.title}</div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="pt-2 pb-1 px-1">
                                                    <p className="text-sm">{tip.content}</p>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                ))}

                {/* Additional Resources */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Resources</CardTitle>
                        <CardDescription>
                            Further your knowledge with these recommended resources
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">Books for Beginners</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>&#34;The Intelligent Investor&#34; by Benjamin Graham</li>
                                    <li>&#34;A Random Walk Down Wall Street&#34; by Burton Malkiel</li>
                                    <li>&#34;The Little Book of Common Sense Investing&#34; by John Bogle</li>
                                </ul>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">Online Courses</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>Investopedia Academy: Stock Trading Course</li>
                                    <li>Khan Academy: Finance and Capital Markets</li>
                                    <li>Coursera: Financial Markets by Yale University</li>
                                </ul>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">Recommended Websites</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>Investopedia.com - Educational articles</li>
                                    <li>Investor.gov - SEC&#39;s educational resources</li>
                                    <li>Morningstar.com - Research and analysis</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation buttons */}
                <div className="flex justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/education/terms">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Stock Market Terms
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/education">Education Center</Link>
                    </Button>
                </div>
            </div>
        </MainDashboardLayout>
    )
}
