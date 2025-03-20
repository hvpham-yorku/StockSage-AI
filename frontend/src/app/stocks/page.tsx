"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { api, Stock, StockRecommendation } from "@/lib/api";

export default function StocksPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const response = await api.stocks.getAll();

                console.log("API Response:", response);
                const stockData = response;

                if (!Array.isArray(stockData)) {
                    throw new Error("Invalid API response format");
                }

                setStocks(stockData);
                setFilteredStocks(stockData);
                setError(null);
            } catch (err) {
                console.error("Error fetching stocks:", err);
                setError("Failed to fetch stocks. Please try again later.");
                setStocks([]);
                setFilteredStocks([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStocks();
    }, []);

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (!query) {
            setFilteredStocks(stocks);
            return;
        }

        // Filter stocks based on name or symbol
        const filtered = stocks.filter(
            (stock) =>
                stock.name.toLowerCase().includes(query) ||
                stock.symbol.toLowerCase().includes(query)
        );

        setFilteredStocks(filtered);
    };

    if (isLoading) return <p className="text-center">Loading stock market data...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-5xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-4">All Available Stocks</h1>

            {/* Search Bar */}
            <div className="mb-4 flex gap-2">
                <Input
                    type="text"
                    placeholder="Search stocks by name or symbol..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full px-3 py-2 border rounded"
                />
                <Button onClick={() => { setSearchQuery(""); setFilteredStocks(stocks); }}>Clear</Button>
            </div>

            {/* Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
                        <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} passHref>
                            <Card className="cursor-pointer hover:shadow-lg transition">
                                <CardHeader>
                                    <CardTitle>{stock.name} ({stock.symbol})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold">
                                        Price: ${stock.price !== null ? stock.price.toFixed(2) : "N/A"}
                                    </p>
                                    <p className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        Change: {stock.change >= 0 ? `+${stock.change}` : stock.change}%
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No stocks found.</p>
                )}
            </div>
        </div>
    );
}
