'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, Transaction } from "@/lib/api"

export default function PortfolioTransactionsPage() {
    const { id } = useParams()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!id || typeof id !== "string") return

            try {
                const data = await api.portfolios.getTransactions(id)
                setTransactions(data)
            } catch (error) {
                console.error("Failed to fetch transactions:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [id])

    if (loading) return <div className="p-4">Loading transactions...</div>
    if (transactions.length === 0) return <div className="p-4">No transactions found.</div>

    return (
        <div className="p-6 max-w-3xl space-y-6">
            <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
            <ul className="space-y-4">
                {transactions.map((tx, index) => (
                    <li
                        key={index}
                        className={`p-4 border-l-4 ${
                            tx.type === "buy" ? "border-green-500" : "border-red-500"
                        } bg-white shadow-sm rounded`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{tx.symbol.toUpperCase()}</span>
                            <span className="text-sm text-muted-foreground">
                {new Date(tx.date).toLocaleDateString()}
              </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {tx.type === "buy" ? "Bought" : "Sold"} {tx.quantity} shares @ ${tx.price.toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
