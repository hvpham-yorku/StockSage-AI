"use client"

import { useState, useEffect } from "react"
import { api, Portfolio } from "@/lib/api"
import { ArrowDown, ArrowUp, DollarSign, LineChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import SimpleGraph from "./perfomance_chart"

interface StockPortfolioProps {
  id: string
}

export default function StockPortfolioFromAPI({ id }: StockPortfolioProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await api.portfolios.getOne(id)
        setPortfolio(data)
      } catch (error) {
        console.error("Failed to load portfolio data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [id])

  if (loading) return <p>Loading portfolio...</p>
  if (!portfolio) return <p>Portfolio not found</p>

  const cashBalance = portfolio.cash_balance || 0
  const stockList = portfolio.holdings || []

  const totalInvestments = stockList.reduce((total, s) => total + s.value, 0)
  const totalGainLoss = stockList.reduce((total, s) => total + s.gain_loss, 0)
  const totalValue = cashBalance + totalInvestments

  return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
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
              <div className="text-2xl font-bold">${totalInvestments.toFixed(2)}</div>
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

        <Card>
          <CardHeader>
            <CardTitle>Your Stock Holdings</CardTitle>
            <CardDescription>View your current holdings and gains</CardDescription>
          </CardHeader>
          <CardContent>
            {stockList.length === 0 ? (
                <p className="text-muted-foreground">No stocks held currently.</p>
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
                    {stockList.map((stock) => (
                      <TableRow key={stock.symbol}>
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell>{stock.name}</TableCell>
                        <TableCell>{stock.quantity}</TableCell>
                        <TableCell>${stock.average_buy_price.toFixed(2)}</TableCell>
                        <TableCell>${stock.current_price.toFixed(2)}</TableCell>
                        <TableCell>${stock.value.toFixed(2)}</TableCell>
                        <TableCell className={stock.gain_loss >= 0 ? "text-green-500" : "text-red-500"}>
                          ${stock.gain_loss.toFixed(2)} ({stock.gain_loss_percent.toFixed(2)}%)
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
  )
}