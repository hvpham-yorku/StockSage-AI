"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, Portfolio, PortfolioPerformance, Transaction } from "@/lib/api";
import StockPortfolio from "@/components/portfolio/portfolio";
import SimpleGraph from "@/components/portfolio/perfomance_chart";

export default function PortfolioDetailPage() {
    const params = useParams();
    const id = params?.id as string | undefined;

    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchPortfolioData = async () => {
            try {
                const [portfolioData, performanceData, transactionData] = await Promise.all([
                    api.portfolios.getOne(id),
                    api.portfolios.getPerformance(id),
                    api.portfolios.getTransactions(id),
                ]);

                setPortfolio(portfolioData);
                setPerformance(performanceData);
                setTransactions(transactionData);
            } catch (error) {
                console.error("Failed to load portfolio data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolioData();
    }, [id]);

    if (loading || !portfolio || !performance) {
        return <div className="text-center mt-10">Loading portfolio details...</div>;
    }

    const performanceChartData = transactions.map((txn) => ({
        date: txn.date,
        value: txn.price * txn.quantity,
    }));

    return (
        <div className="container mx-auto my-10">
            <h2 className="text-3xl font-bold mb-4">{portfolio.name}</h2>
            <p className="text-muted-foreground mb-6">
                Created on: {new Date(portfolio.start_date).toLocaleDateString()}
            </p>

            <StockPortfolio
                portfolioId={portfolio.id}
            />

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Portfolio Performance</h3>
                <SimpleGraph data={performanceChartData} />
                <div className="mt-4">
                    <p>
                        <strong>Portfolio Name:</strong> {portfolio.name}
                    </p>
                    <p>
                        <strong>Start Date:</strong> {new Date(portfolio.start_date).toLocaleDateString()}
                    </p>
                    <p>
                        <strong>Initial Balance:</strong> ${portfolio.initial_balance?.toFixed(2) || "0.00"}
                    </p>

                    {performance ? (
                        <>
                            <p>
                                <strong>Current Value:</strong> ${performance.value?.toFixed(2) || "0.00"}
                            </p>
                            <p>
                                <strong>Return (%):</strong> {(performance.return_pct * 100)?.toFixed(2) || "0"}%
                            </p>
                            <p>
                                <strong>Profit/Loss:</strong> ${performance.profit_loss?.toFixed(2) || "0.00"}
                            </p>
                        </>
                    ) : (
                        <p className="mt-2 text-muted-foreground">
                            No performance data available yet. Start trading to see performance!
                        </p>
                    )}
                </div>

            </div>

            <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
                {transactions.length === 0 ? (
                    <p>No transactions yet. Start trading!</p>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                        <tr>
                            <th className="py-2">Date</th>
                            <th className="py-2">Type</th>
                            <th className="py-2">Symbol</th>
                            <th className="py-2">Quantity</th>
                            <th className="py-2">Price</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map((txn, idx) => (
                            <tr key={idx}>
                                <td className="py-1">{new Date(txn.date).toLocaleDateString()}</td>
                                <td className="py-1 capitalize">{txn.type}</td>
                                <td className="py-1">{txn.symbol}</td>
                                <td className="py-1">{txn.quantity}</td>
                                <td className="py-1">${txn.price?.toFixed(2) || "0.00"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
