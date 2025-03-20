"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import api from "@/api";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    company_description: string;
}

interface Recommendation {
    symbol: string;
    name: string;
    recommendation: string;
    confidence: number;
    analysis: string;
}

export default function StockDetailPage() {
    const {symbol} = useParams();
    const [stock, setStock] = useState<Stock | null>(null);
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!symbol) return;

        // Fetch stock details and recommendation data
        const fetchStockData = async () => {
            try {
                const [stockResponse, recommendationResponse] = await Promise.all([
                    api.stocks.getStock(symbol as string),
                    api.stocks.getRecommendation(symbol as string),
                ]);
                setStock(stockResponse.data);
                setRecommendation(recommendationResponse.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching stock details:", err);
                setError(`Stock symbol "${symbol}" not found. Redirecting to stock list...`);

                // Redirect user to /stocks after 3 seconds
                setTimeout(() => {
                    router.push("/stocks");
                }, 3000);
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
                    <p className={`text-sm ${stock?.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        Change: {stock?.change >= 0 ? `+${stock?.change}` : stock?.change}%
                    </p>
                    <p className="text-gray-600 mt-4">{stock?.company_description}</p>

                    {/* Recommendation Section */}
                    {recommendation && (
                        <div className="mt-6 p-4 border rounded-lg bg-muted">
                            <h3 className="text-xl font-semibold">AI Recommendation</h3>
                            <p className="mt-2">
                                <strong>Recommendation: </strong>
                                <span
                                    className={`font-bold ${
                                        recommendation.recommendation === "Sell" ? "text-red-500" :
                                            recommendation.recommendation === "Buy" ? "text-green-500" :
                                                "text-yellow-500"
                                    }`}>
                                     {recommendation.recommendation }
                                </span>
                            </p>
                            <p>
                                <strong>Confidence:</strong> {Math.round(recommendation.confidence * 100)}%
                            </p>
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
