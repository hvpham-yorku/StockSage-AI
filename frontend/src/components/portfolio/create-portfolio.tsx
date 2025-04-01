"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { api } from "@/lib/api"

export default function CreatePortfolio() {
    const [name, setName] = useState("")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [balance, setBalance] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            console.error("Please enter a portfolio name")
            return
        }
        if (!date) {
            console.error("Please select a start date")
            return
        }
        if (!balance || isNaN(Number(balance)) || Number(balance) <= 0) {
            console.error("Please enter a valid starting balance")
            return
        }

        setIsSubmitting(true)

        try {
            // API 호출로 포트폴리오 생성
            const newPortfolio = await api.portfolios.create({
                name: name,
                start_date: date.toISOString().split('T')[0], // YYYY-MM-DD 형식
                initial_balance: parseFloat(balance),
            })

            console.log(`Portfolio "${name}" created successfully.`)

            // 생성한 포트폴리오 페이지로 이동
            router.push(`/portfolio/${newPortfolio.id}`)
        } catch (error) {
            console.error("Failed to create portfolio:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "")
        setBalance(value)
    }

    return (
        <div className="container max-w-md mx-auto py-12 px-4">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Create New Portfolio</CardTitle>
                    <CardDescription>Set up a new portfolio to start tracking your investments</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Portfolio Name</Label>
                            <Input
                                id="name"
                                placeholder="My Investment Portfolio"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : "Select a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="balance">Starting Balance ($)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    id="balance"
                                    className="pl-7"
                                    placeholder="10,000"
                                    value={balance}
                                    onChange={handleBalanceChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Portfolio"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
