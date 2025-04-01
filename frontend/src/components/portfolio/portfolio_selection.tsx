"use client"

import { useState } from "react"
import { ArrowRight, Briefcase, DollarSign, LineChart, Plus, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Portfolio {
  id: string
  name: string
  description: string
  totalValue: number
  cashBalance: number
  stocksCount: number
  performance: {
    percentage: number
    isPositive: boolean
  }
}

interface PortfolioSelectionProps {
  portfolios: Portfolio[]
  onSelectPortfolio: (portfolioId: string) => void
  onCreatePortfolio?: () => void
}

export default function PortfolioSelection({
  portfolios = [],
  onSelectPortfolio,
  onCreatePortfolio,
}: PortfolioSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPortfolios = portfolios.filter(
    (portfolio) =>
      portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Portfolios</h1>
          <p className="text-muted-foreground">Select a portfolio to view or create a new one</p>
        </div>
        {onCreatePortfolio && (
          <Button onClick={onCreatePortfolio} className="sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Portfolio
          </Button>
        )}
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Search portfolios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
      </div>

      {filteredPortfolios.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No portfolios found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {searchQuery ? "Try a different search term" : "Create your first portfolio to get started"}
          </p>
          {onCreatePortfolio && (
            <Button onClick={onCreatePortfolio}>
              <Plus className="mr-2 h-4 w-4" />
              Create Portfolio
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPortfolios.map((portfolio) => (
            <Card key={portfolio.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{portfolio.name}</CardTitle>
                <CardDescription>{portfolio.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Total Value</span>
                    <span className="flex items-center text-xl font-bold">
                      <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                      {portfolio.totalValue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Performance</span>
                    <span
                      className={`flex items-center text-xl font-bold ${
                        portfolio.performance.isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {portfolio.performance.isPositive ? "+" : "-"}
                      {Math.abs(portfolio.performance.percentage).toFixed(2)}%
                      <TrendingUp
                        className={`ml-1 h-4 w-4 ${
                          portfolio.performance.isPositive ? "text-green-500" : "text-red-500"
                        }`}
                      />
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Briefcase className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>{portfolio.stocksCount} Stocks</span>
                  </div>
                  <div className="flex items-center">
                    <LineChart className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>${portfolio.cashBalance.toLocaleString()} Cash</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => onSelectPortfolio(portfolio.id)}
                >
                  View Portfolio
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

