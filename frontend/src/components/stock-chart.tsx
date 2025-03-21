"use client"

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, StockHistoryPoint } from "@/lib/api";


interface StockChartProps {
  stockSymbol?: string
  stockName?: string
  isPositive?: boolean
}

export function StockChart({ stockSymbol = "AAPL", stockName = "Apple Inc.", isPositive = true }: StockChartProps) {
  const chartColor = isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"

  const [data, setData] = useState<StockHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await api.stocks.getHistory(stockSymbol, 30);
        setData(history);
      } catch (err) {
        console.error("Error fetching stock history:", err);
        setError("Failed to load stock data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [stockSymbol]);

  if (!data) {
    return <div> LOADING PLACEHOLDER TODO REMOVE </div>;
  }


  return (
    <div className="h-[200px] w-full mt-5">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip formatter={(value) => [`$${value}`, "Price"]} labelFormatter={(label) => `${label}`} />
          <Area type="monotone" dataKey="price" stroke={chartColor} fill={chartColor} fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}