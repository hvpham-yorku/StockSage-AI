"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { api, Stock, StockHistoryPoint, StockRecommendation } from "@/lib/api";
import { StockChart } from "@/components/stockChart";

export default function StockDetailPage() {
    const { symbol } = useParams();
    const [stock, setStock] = useState<Stock | null>(null);
    const [history, setHistory] = useState<StockHistoryPoint[]>([]);
    const [recommendation, setRecommendation] = useState<StockRecommendation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!symbol) return;

        const fetchStockData = async () => {
            try {
                const [stockResponse, historyResponse, recommendationResponse] = await Promise.all([
                    api.stocks.getOne(symbol as string),
                    api.stocks.getHistory(symbol as string, 30), // Fetch 30 days of history
                    api.stocks.getRecommendation(symbol as string),
                ]);

                setStock(stockResponse);
                setHistory(historyResponse);
                setRecommendation(recommendationResponse);
                setError(null);
            } catch (err) {
                console.error("Error fetching stock details:", err);
                setError(`Stock symbol "${symbol}" not found. Redirecting to stock list...`);
                setTimeout(() => router.push("/stocks"), 3000);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStockData();
    }, [symbol]);

    if (isLoading) return <p className="text-center">Loading stock details...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-3xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>{stock?.name} ({stock?.symbol})</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-semibold">Price: ${stock?.price.toFixed(2)}</p>
                    {stock && (
                        <p className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            Change: {stock.change >= 0 ? `+${stock.change}` : stock.change}%
                        </p>
                    )}
                    {/* Price History Graph */}
                    {stock && history.length > 0 && (
                        <div className="mt-6">
                            <StockChart
                                stockSymbol={stock.symbol}
                                stockName={stock.name}
                                isPositive={stock.change >= 0}
                                data={history}
                                color={stock.change >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                            />
                        </div>
                    )}



                    {/* AI Recommendation Section */}
                    {recommendation && (
                        <div className="mt-6 p-4 border rounded-lg bg-muted">
                            <h3 className="text-xl font-semibold">AI Recommendation</h3>
                            <p className="mt-2">
                                <strong>Recommendation: </strong>
                                <span className={`font-bold ${recommendation.recommendation === "Sell" ? "text-red-500" : recommendation.recommendation === "Buy" ? "text-green-500" : "text-yellow-500"}`}>
                                    {recommendation.recommendation}
                                </span>
                            </p>
                            <p><strong>Confidence:</strong> {Math.round(recommendation.confidence * 100)}%</p>
                            <p className="mt-2 text-gray-500">{recommendation.analysis}</p>
                        </div>
                    )}

                    <div className="mt-4">
                        <Link href="/stocks">
                            <Button>Back to Stocks</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
