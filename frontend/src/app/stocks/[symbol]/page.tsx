"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api, Stock, StockRecommendation } from "@/lib/api";
import StockDetailDashboard from "@/components/StockDetailDashboard";

export default function StockDetailPage() {
    const { symbol } = useParams();
    const [stock, setStock] = useState<Stock | null>(null);
    const [recommendation, setRecommendation] = useState<StockRecommendation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!symbol) return;

        // Fetch stock details and recommendation data
        const fetchStockData = async () => {
            try {
                const [stockResponse, recommendationResponse] = await Promise.all([
                    api.stocks.getOne(symbol as string),
                    api.stocks.getRecommendation(symbol as string),
                ]);
                setStock(stockResponse);
                setRecommendation(recommendationResponse);
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
    }, [symbol, router]);

    if (isLoading) return (
        <div className="max-w-5xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-[36px] w-[300px]" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <Skeleton className="h-[250px] w-full rounded-xl" />
                        <Skeleton className="h-[100px] w-full rounded-xl" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    if (error) return (
        <div className="max-w-5xl mx-auto p-4">
            <Alert variant="destructive">
                <AlertDescription className="text-center">{error}</AlertDescription>
            </Alert>
        </div>
    );

    if (!stock) return null;

    return (
        <div className="max-w-5xl mx-auto p-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle>{stock.name} ({stock.symbol})</CardTitle>
                        <Badge variant="outline">{stock.symbol}</Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Primary Dashboard */}
                    <StockDetailDashboard symbol={symbol as string} />
                    
                    {/* Recommendation Section */}
                    {recommendation && (
                        <div className="mt-6 p-4 border rounded-lg bg-muted">
                            <h3 className="text-xl font-semibold">AI Recommendation</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <strong>Recommendation: </strong>
                                <Badge 
                                    variant={
                                        recommendation.recommendation === "Sell" ? "destructive" :
                                        recommendation.recommendation === "Buy" ? "default" : "secondary"
                                    }
                                >
                                    {recommendation.recommendation}
                                </Badge>
                                <span className="ml-4">
                                    <strong>Confidence:</strong> {Math.round(recommendation.confidence * 100)}%
                                </span>
                            </div>
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
