"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, DollarSign, LineChart } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import SimpleGraph from "./perfomance_chart"

interface Stock {
  symbol: string
  name: string
  shares: number
  purchasePrice: number
  currentPrice: number
}

interface PortfolioProps {
  cashBalance: number
  stocks: Stock[]
}

/**
 * 
 * @todo Remove props from StockPortfolio, an api call should be made to get
 * cash balance and stocks.
 * @todo Remove dummy Stock interface needed for overlay, purchase price
 * doesn't exist in current stock interface
 */
export default function StockPortfolio({ cashBalance = 12500.75, stocks = [] }: PortfolioProps) {
  const [portfolio, setPortfolio] = useState<Stock[]>(stocks)
  const [loading, setLoading] = useState(true)

  // Mock API call to get current stock prices
  useEffect(() => {
    const fetchStockPrices = async () => {
      setLoading(true)
      // In a real app, you would fetch actual stock prices from an API
      // For demo purposes, we're just simulating a delay and using sample data
      setTimeout(() => {
        if (stocks.length === 0) {
          // Sample data if none provided
          setPortfolio([
            { symbol: "AAPL", name: "Apple Inc.", shares: 10, purchasePrice: 150.25, currentPrice: 173.45 },
            { symbol: "MSFT", name: "Microsoft Corp.", shares: 5, purchasePrice: 290.12, currentPrice: 315.78 },
            { symbol: "GOOGL", name: "Alphabet Inc.", shares: 3, purchasePrice: 2750.0, currentPrice: 2830.5 },
            { symbol: "AMZN", name: "Amazon.com Inc.", shares: 8, purchasePrice: 3200.5, currentPrice: 3150.25 },
            { symbol: "TSLA", name: "Tesla Inc.", shares: 15, purchasePrice: 800.75, currentPrice: 850.2 },
          ])
        } else {
          setPortfolio(stocks)
        }
        setLoading(false)
      }, 1000)
    }

    fetchStockPrices()
  }, [stocks])

  const calculateTotalValue = () => {
    return portfolio.reduce((total, stock) => total + stock.currentPrice * stock.shares, 0)
  }

  const calculateTotalGainLoss = () => {
    return portfolio.reduce((total, stock) => {
      const gainLoss = (stock.currentPrice - stock.purchasePrice) * stock.shares
      return total + gainLoss
    }, 0)
  }

  const totalValue = calculateTotalValue()
  const totalGainLoss = calculateTotalGainLoss()
  const totalPortfolioValue = cashBalance + totalValue


  const sampleData = [
    { date: "2023-10-01", value: 10000 },
    { date: "2023-10-15", value: 10500 },
    { date: "2023-11-01", value: 10300 },
    { date: "2023-11-15", value: 11000 },
    { date: "2023-12-01", value: 10800 },
    { date: "2023-12-15", value: 11200 },
    { date: "2024-01-01", value: 11500 },
    { date: "2024-01-15", value: 11800 },
    { date: "2024-02-01", value: 12100 },
    { date: "2024-02-15", value: 12300 },
    { date: "2024-03-01", value: 12000 },
    { date: "2024-03-15", value: 12500 },
]


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Cash + Investments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cashBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investments Value</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current market value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {totalGainLoss >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
              ${Math.abs(totalGainLoss).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{totalGainLoss >= 0 ? "Profit" : "Loss"} since purchase</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Track your investment performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for the graph component */}
            <div
              id="portfolio-graph"
              className="h-[400px] w-full border border-dashed border-gray-300 rounded-md flex items-center justify-center bg-muted/40"
            >
                <SimpleGraph 
                    data = {sampleData}
                />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Stock Holdings</CardTitle>
            <CardDescription>View and manage your stock portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">Loading stock data...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Market Value</TableHead>
                    <TableHead>Gain/Loss</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((stock) => {
                    const marketValue = stock.shares * stock.currentPrice
                    const gainLoss = (stock.currentPrice - stock.purchasePrice) * stock.shares
                    const gainLossPercent = ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100

                    return (
                      <TableRow key={stock.symbol}>
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell>{stock.name}</TableCell>
                        <TableCell>{stock.shares}</TableCell>
                        <TableCell>${stock.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>${stock.currentPrice.toFixed(2)}</TableCell>
                        <TableCell>${marketValue.toFixed(2)}</TableCell>
                        <TableCell className={gainLoss >= 0 ? "text-green-500" : "text-red-500"}>
                          ${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

