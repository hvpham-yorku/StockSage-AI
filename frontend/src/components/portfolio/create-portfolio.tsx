"use client"

import type React from "react"

import { JSX, useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

import { api } from "@/lib/api";

/**
 * 
 * @returns { JSX.Element } Create portfolio form
 */
export default function CreatePortfolio() {
  const [name, setName] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [balance, setBalance] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!name.trim()) {
            console.error("Error: Please enter a portfolio name");
            return;
        }

        if (!date) {
            console.error("Error: Please select a start date");
            return;
        }

        if (!balance || isNaN(Number(balance)) || Number(balance) <= 0) {
            console.error("Error: Please enter a valid starting balance");
            return;
        }

        setIsSubmitting(true);

        try {
            //TODO uncomment
            // Simulate API call
            // await api.portfolios.create({
            //     name: name,
            //     start_date: date.toString(), //TODO Rename date to start date
            //     initial_balance: parseInt(balance) //TODO Refactor
            // })

            // Success message
            console.log(
                `Portfolio Created: Successfully created portfolio "${name}" with $${Number(balance).toLocaleString()} starting balance.`
            );

            // Reset form
            setName("");
            setDate(new Date());
            setBalance("");
        } catch (error) {
            console.error("Error: Failed to create portfolio. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

  // Format currency input
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