"use client"

import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";

import PortfolioSelection from "./portfolio_selection";

interface Stock {
  symbol: string
  name: string
  shares: number
  purchasePrice: number
  currentPrice: number
}

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
  stocks: Stock[]
}

// Sample data for demonstration
const samplePortfolios: Portfolio[] = [
  {
    id: "portfolio-1",
    name: "Growth Portfolio",
    description: "High-growth tech stocks",
    totalValue: 25750.45,
    cashBalance: 5000.75,
    stocksCount: 5,
    performance: {
      percentage: 12.5,
      isPositive: true,
    },
    stocks: [
      { symbol: "AAPL", name: "Apple Inc.", shares: 10, purchasePrice: 150.25, currentPrice: 173.45 },
      { symbol: "MSFT", name: "Microsoft Corp.", shares: 5, purchasePrice: 290.12, currentPrice: 315.78 },
      { symbol: "GOOGL", name: "Alphabet Inc.", shares: 3, purchasePrice: 2750.0, currentPrice: 2830.5 },
      { symbol: "AMZN", name: "Amazon.com Inc.", shares: 8, purchasePrice: 3200.5, currentPrice: 3150.25 },
      { symbol: "TSLA", name: "Tesla Inc.", shares: 15, purchasePrice: 800.75, currentPrice: 850.2 },
    ],
  },
  {
    id: "portfolio-2",
    name: "Dividend Portfolio",
    description: "Stable dividend-paying stocks",
    totalValue: 18250.3,
    cashBalance: 2500.5,
    stocksCount: 4,
    performance: {
      percentage: 5.2,
      isPositive: true,
    },
    stocks: [
      { symbol: "JNJ", name: "Johnson & Johnson", shares: 12, purchasePrice: 160.75, currentPrice: 165.3 },
      { symbol: "PG", name: "Procter & Gamble", shares: 15, purchasePrice: 140.25, currentPrice: 145.8 },
      { symbol: "KO", name: "Coca-Cola Company", shares: 30, purchasePrice: 55.5, currentPrice: 58.25 },
      { symbol: "VZ", name: "Verizon Communications", shares: 25, purchasePrice: 52.75, currentPrice: 50.2 },
    ],
  },
  {
    id: "portfolio-3",
    name: "Speculative Portfolio",
    description: "High-risk, high-reward investments",
    totalValue: 12350.75,
    cashBalance: 7500.25,
    stocksCount: 3,
    performance: {
      percentage: 8.7,
      isPositive: false,
    },
    stocks: [
      { symbol: "COIN", name: "Coinbase Global Inc.", shares: 10, purchasePrice: 250.5, currentPrice: 220.75 },
      { symbol: "PLTR", name: "Palantir Technologies", shares: 50, purchasePrice: 25.75, currentPrice: 22.5 },
      { symbol: "RBLX", name: "Roblox Corporation", shares: 20, purchasePrice: 90.25, currentPrice: 85.3 },
    ],
  },
]

export default function PortfolioContainer() {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>(samplePortfolios)

  // In a real app, you would fetch portfolios from an API
  useEffect(() => {
    // Simulating API call
    const fetchPortfolios = async () => {
      // In a real app: const response = await fetch('/api/portfolios')
      // const data = await response.json()
      // setPortfolios(data)

      // Using sample data for demonstration
      setPortfolios(samplePortfolios)
    }

    fetchPortfolios()
  }, [])

  const handleSelectPortfolio = (portfolioId: string) => {
    setSelectedPortfolioId(portfolioId)
  }

  const handleCreatePortfolio = () => {
    // In a real app, this would navigate to a portfolio creation page or open a modal
    console.log("Create portfolio")
  }

  const handleBackToSelection = () => {
    setSelectedPortfolioId(null)
  }

  // Find the selected portfolio
  const selectedPortfolio = portfolios.find((p) => p.id === selectedPortfolioId)

  return (
    <div>
        <PortfolioSelection
          portfolios={portfolios}
          onSelectPortfolio={handleSelectPortfolio}
          onCreatePortfolio={handleCreatePortfolio}
        />
    </div>
  )
}

