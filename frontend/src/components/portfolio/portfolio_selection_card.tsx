"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PortfolioSelection from "./portfolio_selection"
import { api } from "@/lib/api"

interface PortfolioUI {
  id: string;
  name: string;
  description: string;
  totalValue: number;
  cashBalance: number;
  stocksCount: number;
  performance: {
    percentage: number;
    isPositive: boolean;
  }
}

export default function PortfolioContainer() {
  const [portfolios, setPortfolios] = useState<PortfolioUI[]>([])
  const router = useRouter()

  const fetchData = async () => {
    try {
      const data = await api.portfolios.getAll()

      const enriched = await Promise.all(
          data.map(async (portfolio) => {
            try {
              const performance = await api.portfolios.getPerformance(portfolio.id)
              return {
                id: portfolio.id,
                name: portfolio.name,
                description: `Started ${new Date(portfolio.start_date).toLocaleDateString()}`,
                performance: {
                  percentage: performance.performance,
                  isPositive: performance.performance >= 0,
                },
                totalValue: performance.current_balance,
                cashBalance: portfolio.current_balance || portfolio.initial_balance,
                stocksCount: performance.performance_history?.length || 0,
              } as PortfolioUI
            } catch {
              return {
                id: portfolio.id,
                name: portfolio.name,
                description: `Started ${new Date(portfolio.start_date).toLocaleDateString()}`,
                performance: { percentage: 0, isPositive: true },
                totalValue: portfolio.current_balance || portfolio.initial_balance,
                cashBalance: portfolio.current_balance || portfolio.initial_balance,
                stocksCount: 0,
              } as PortfolioUI
            }
          }),
      )
      setPortfolios(enriched)
    } catch (err) {
      console.error("Failed to fetch portfolios:", err)
    }
  }

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return
    try {
      await api.portfolios.delete(id)
      setPortfolios((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Failed to delete portfolio:", err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
      <PortfolioSelection
          portfolios={portfolios}
          onSelectPortfolio={(id) => router.push(`/portfolio/${id}`)}
          onCreatePortfolio={() => router.push("/portfolio/create")}
          onDeletePortfolio={handleDeletePortfolio}
      />
  )
}
