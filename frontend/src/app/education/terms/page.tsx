"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"

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
import api, { StockTerm } from "@/lib/api"

export default function TermsPage() {
    const [terms, setTerms] = useState<StockTerm[]>([])

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const result = await api.education.getTerms()
                setTerms(result)
            } catch (error) {
                console.error("Failed to fetch stock terms:", error)
            }
        }

        fetchTerms()
    }, [])

    return (
        <MainDashboardLayout>
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Stock Market Terms</h1>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                        <Link href="/education">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Education
                        </Link>
                    </Button>
                </div>

                {/* Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Understand Financial Jargon</CardTitle>
                        <CardDescription>
                            Learn the language of investing with easy-to-understand definitions and examples.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            This glossary contains commonly used stock market terms to help you better understand the financial world.
                        </p>
                    </CardContent>
                </Card>

                {/* Terms Accordion */}
                <Card>
                    <CardHeader>
                        <CardTitle>Glossary</CardTitle>
                        <CardDescription>Click to expand each term and see its meaning</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {terms.map((term) => (
                                <AccordionItem key={term.term} value={term.term}>
                                    <AccordionTrigger>
                                        <span className="font-medium">{term.term}</span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-sm text-muted-foreground mb-2">{term.definition}</p>
                                        <p className="text-sm">
                                            <strong>Example:</strong> {term.example}
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </MainDashboardLayout>
    )
}
