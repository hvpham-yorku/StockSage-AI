"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, Portfolio } from "@/lib/api"
import PortfolioSelection from "@/components/portfolio/portfolio_selection"



interface PortfolioUI extends Portfolio {
    description: string
    totalValue: number
    cashBalance: number
    stocksCount: number
    performance: {
        percentage: number
        isPositive: boolean
    }
}

export default function PortfolioPage() {
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
                            ...portfolio,
                            performance: {
                                percentage: performance.return_percentage,
                                isPositive: performance.return_percentage >= 0,
                            },
                            totalValue: performance.current_value,
                            cashBalance: portfolio.initial_balance,
                            stocksCount: Object.keys(portfolio.holdings || {}).length,
                            description: "",
                        }
                    } catch {
                        return {
                            ...portfolio,
                            performance: { percentage: 0, isPositive: true },
                            totalValue: portfolio.initial_balance,
                            cashBalance: portfolio.initial_balance,
                            stocksCount: 0,
                            description: "",
                        }
                    }
                })
            )
            setPortfolios(enriched)
        } catch (err) {
            console.error("Failed to fetch portfolios:", err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this portfolio?")) {
            try {
                await api.portfolios.delete(id)
                await fetchData()
            } catch (e) {
                console.error("Failed to delete portfolio:", e)
            }
        }
    }

    return (
        <PortfolioSelection
            portfolios={portfolios}
            onSelectPortfolio={(id) => router.push(`/portfolio/${id}`)}
            onCreatePortfolio={() => router.push("/portfolio/create")}
            onDeletePortfolio={handleDelete}
        />
    )
}
