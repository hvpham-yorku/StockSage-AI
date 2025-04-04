'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, Portfolio, PortfolioPerformance, StockRecommendation, PerformancePoint } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import SimpleGraph from "@/components/portfolio/perfomance_chart"
import { useRouter } from "next/navigation"
import { auth } from "@/firebase/config"

interface DataPoint {
    date: string
    value: number
}

export default function PortfolioDetailPage() {
    const { id } = useParams()
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
    const [performance, setPerformance] = useState<PortfolioPerformance | null>(null)
    const [loading, setLoading] = useState(true)

    const [symbol, setSymbol] = useState("")
    const [quantity, setQuantity] = useState("1")
    const [price, setPrice] = useState("")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [stocks, setStocks] = useState<{ symbol: string; name: string; price: number }[]>([])
    const [message, setMessage] = useState("")
    const [refreshToggle, setRefreshToggle] = useState(false)
    const [selectedStockHistory, setSelectedStockHistory] = useState<PerformancePoint[]>([])
    const [recommendation, setRecommendation] = useState<StockRecommendation | null>(null)
    const router = useRouter()


    useEffect(() => {
        const fetchPortfolioData = async () => {
            if (!id || typeof id !== "string") return

            try {
                const data = await api.portfolios.getOne(id)
                const perf = await api.portfolios.getPerformance(id)
                const stockList = await api.stocks.getAll()

                console.log("Perfomance history: ", perf.performance_history);
                setPortfolio(data)
                setPerformance(perf)
                setStocks(stockList)

            } catch (error) {
                console.error("Failed to fetch portfolio detail:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPortfolioData()
    }, [id, refreshToggle])



    useEffect(() => {
        const fetchPrice = async () => {
            if (symbol && date) {
                try {
                    const history = await api.stocks.getHistory(symbol, 365)
                    const targetDate = format(date, "yyyy-MM-dd")
                    const priceOnDate = history.find((h) => h.date === targetDate)?.price
                    if (priceOnDate !== undefined) setPrice(priceOnDate.toString())
                    else setPrice("")
                } catch (e) {
                    console.error("Failed to fetch price history:", e)
                    setPrice("")
                }
            }
        }

        fetchPrice()
    }, [symbol, date])

    useEffect(() => {
        const fetchPriceHistory = async () => {
            if (symbol && portfolio?.start_date) {
                try {
                    const history = await api.stocks.getHistory(symbol, 90)
                    const data = history.map(h => ({ date: h.date, value: h.price }))
                    setSelectedStockHistory(data)
                } catch (e) {
                    console.error("Failed to fetch stock history:", e)
                    setSelectedStockHistory([])
                }
            } else {
                setSelectedStockHistory([])
            }
        }

        const fetchRecommendation = async () => {
            if (symbol) {
                try {
                    const rec = await api.stocks.getRecommendation(symbol)
                    setRecommendation(rec)
                } catch (e) {
                    console.error("Failed to fetch recommendation:", e)
                    setRecommendation(null)
                }
            } else {
                setRecommendation(null)
            }
        }

        fetchPriceHistory()
        fetchRecommendation()
    }, [symbol, portfolio?.start_date])

    const handleTrade = async (type: "buy" | "sell") => {
        if (!id || typeof id !== "string") return
        if (!symbol || !quantity || !price || !date) return
        if (parseInt(quantity) < 1) return

        try {
            const request = {
                symbol,
                quantity: parseInt(quantity),
                price: parseFloat(price),
                date: portfolio?.current_date ? portfolio?.current_date : date.toISOString(),
            }
            if (type === "buy") {
                await api.portfolios.buyStock(id, request)
                setMessage("Stock purchased successfully!")
            } else {
                await api.portfolios.sellStock(id, request)
                setMessage("Stock sold successfully!")
            }
            setSymbol("")
            setQuantity("1")
            setPrice("")
            setDate(new Date())
            setRefreshToggle(prev => !prev)
        } catch (e) {
            console.error(e)
            setMessage("Trade failed. Please check balance or stock.")
        }
    }


    const [simulationStatus, setSimulationStatus] = useState<"running" | "paused" | "stopped">("stopped");

    // useEffect(() => {
    //     const fetchSimulationStatus = async () => {
    //         if (!id || typeof id !== "string") return;
    
    //         try {
    //             const status = await api.portfolios.simulation.getStatus(id);
    //             setSimulationStatus(status); // Expected values: "running", "paused", "stopped"
    //         } catch (error) {
    //             console.error("Failed to fetch simulation status:", error);
    //         }
    //     };
    
    //     fetchSimulationStatus();
    //     const interval = setInterval(fetchSimulationStatus, 5000); // Fetch every 5 seconds
    
    //     return () => clearInterval(interval); // Cleanup on unmount
    // }, [id]);
    

    const handleStartSimulation = async () => {
        if (!id || typeof id !== "string") return;
    
        try {
            await api.portfolios.simulation.start(id, 7);
            setSimulationStatus("running");
            setMessage("Simulation started successfully!");
        } catch (error) {
            console.error("Failed to start simulation:", error);
            setMessage("Failed to start simulation.");
        }
    };
    
    const handlePauseSimulation = async () => {
        if (!id || typeof id !== "string") return;
    
        try {
            await api.portfolios.simulation.pause(id);
            setSimulationStatus("paused");
            setMessage("Simulation paused.");
        } catch (error) {
            console.error("Failed to pause simulation:", error);
            setMessage("Failed to pause simulation.");
        }
    };
    
    

    if (loading) return <div className="p-4">Loading portfolio details...</div>
    if (!portfolio) return <div className="p-4">Portfolio not found</div>

    return (
        <main className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-end">
                <Button variant="outline" onClick={() => router.push("/portfolio")}>
                    ← Back to Portfolio List
                </Button>
            </div>

            {/*Portfolio basic info*/}
            <section>
                <h1 className="text-2xl font-bold">{portfolio.name}</h1>
                <p className="text-muted-foreground text-sm">
                    Start Date: {new Date(portfolio.start_date).toLocaleDateString()}
                </p>
                <p className="text-sm">
                    Initial Balance: ${portfolio.initial_balance.toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-green-700">
                    Current Balance: ${portfolio.current_balance.toLocaleString()}
                </p>
                <p className="text-sm">
                    Cash Balance: ${portfolio.cash_balance.toLocaleString()}
                </p>
            </section>

            {/*target performance , strategy - DELETED*/}



            {performance && (
                <>
                    <section className="border-t pt-4">
                        <h2 className="text-xl font-semibold mb-2">Performance</h2>
                        <div className="mb-4 space-y-1">
                            <p>Current Value: ${performance.current_balance.toLocaleString()}</p>
                            <p>Overall Performance: {performance.performance.toFixed(2)}%</p>
                            <p>Profit/Loss: ${(performance.current_balance - performance.initial_balance).toLocaleString()}</p>

                            {performance.metrics && (
                                <div className="mt-3 border-t pt-2">
                                    <h3 className="text-md font-semibold mb-1">Advanced Metrics</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(performance.metrics).map(([key, value]) => (
                                            <p key={key} className="text-sm">
                                                <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {value.toFixed(4)}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                    <section className="border-t pt-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Performance Graph</h3>
                            {performance.performance_history && performance.performance_history.length > 0 ? (
                                <SimpleGraph data={performance.performance_history} />
                            ) : (
                                <SimpleGraph // Fallback to mock data if no history available
                                    data={[
                                        {date: "2024-12-31", value: 10000},
                                        {date: "2025-01-10", value: 5000},
                                        {date: "2025-02-01", value: 10300},
                                        {date: "2025-02-15", value: 11000},
                                        {date: "2025-03-02", value: 21000},
                                        {date: "2025-03-30", value: 30000},
                                    ]}
                                />
                            )}
                        </div>
                        {/* Simulation Controls */}
                        <div className="mt-4 flex gap-4">
                            <Button 
                                onClick={handleStartSimulation} 
                                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                disabled={simulationStatus === "running"}
                            >
                                {simulationStatus === "running" ? "Simulation Running..." : "Start Simulation"}
                            </Button>

                            <Button 
                                onClick={handlePauseSimulation} 
                                className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1"
                                disabled={simulationStatus !== "running"}
                            >
                                Pause
                            </Button>
                        </div>

                    </section>
                </>
            )}

            {portfolio.holdings && (
                <section className="border-t pt-4">
                    <h2 className="text-xl font-semibold mb-2">Holdings</h2>
                    {portfolio.holdings.length === 0 ? (
                        <p className="text-muted-foreground">No holdings yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {portfolio.holdings.map((holding) => (
                                <li key={holding.symbol} className="p-3 border rounded shadow-sm bg-white">
                                    <div className="font-semibold">{holding.symbol} - {holding.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Quantity: {holding.quantity}<br />
                                        Buy Price: ${holding.average_buy_price.toLocaleString()}<br />
                                        Current Price: ${holding.current_price.toLocaleString()}<br />
                                        Value: ${holding.value.toLocaleString()}<br />
                                        Gain/Loss: ${holding.gain_loss.toLocaleString()} ({holding.gain_loss_percent.toFixed(2)}%)
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            <section className="border-t pt-4 space-y-4">
                <h2 className="text-xl font-semibold">Buy/Sell Stocks</h2>
                <p className="text-muted-foreground text-sm">Please select a weekday (weekends not allowed).</p>

                <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Stock Symbol" />
                    </SelectTrigger>
                    <SelectContent>
                        {stocks.map((s) => (
                            <SelectItem key={s.symbol} value={s.symbol}>
                                {s.symbol} - {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {symbol && selectedStockHistory.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Price Trend of {symbol} (Recent 3 months)</h3>
                            <SimpleGraph data={selectedStockHistory} />
                        </div>

                        {recommendation && (
                            <div className="w-full md:w-[280px] rounded-xl border p-4 bg-background shadow-sm space-y-2">
                                <h4 className="text-base font-semibold text-foreground">AI Recommendation</h4>
                                <div className="text-sm text-muted-foreground">
                                    <p><span className="font-medium text-foreground">Stock:</span> {recommendation.name} ({recommendation.symbol})</p>
                                    <p>
                                        <span className="font-medium text-foreground">Recommendation:</span>{" "}
                                        <span className={`font-bold ${recommendation.recommendation === "Buy" ? "text-green-600" : recommendation.recommendation === "Sell" ? "text-red-600" : "text-yellow-600"}`}>
                      {recommendation.recommendation}
                    </span>
                                    </p>
                                    <p><span className="font-medium text-foreground">Confidence:</span> {(recommendation.confidence * 100).toFixed(1)}%</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 leading-snug">
                                    {recommendation.analysis}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <Input placeholder="Quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                <Input placeholder="Price (auto-filled)" type="number" value={price} disabled />

                <Popover>
                    <PopoverTrigger asChild>
                        <div>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                {portfolio.current_date}
                            </Button>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <DayPicker
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(day) => {
                                const dayOfWeek = day.getDay()
                                return day < new Date(portfolio.start_date) || day > new Date() || dayOfWeek === 0 || dayOfWeek === 6
                            }}
                        />
                    </PopoverContent>
                </Popover>

                <div className="flex gap-4">
                    <Button onClick={() => handleTrade("buy")} className="bg-sky-500 hover:bg-sky-600 text-white">Buy</Button>
                    <Button onClick={() => handleTrade("sell")} variant="destructive">Sell</Button>
                </div>
                {message && <p className="text-sm text-muted-foreground">{message}</p>}
                <div className="pt-2">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/portfolio/${id}/transactions`)}
                    >
                        See All Transactions
                    </Button>
                </div>
            </section>
        </main>
    )
}