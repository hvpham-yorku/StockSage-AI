"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StockHistoryPoint } from "@/lib/api";

interface StockChartProps {
    stockSymbol: string;
    stockName: string;
    isPositive: boolean;
    data: StockHistoryPoint[];
    color?: string; // New prop for customizing chart color
}

export function StockChart({ stockSymbol, stockName, isPositive, data, color }: StockChartProps) {
    const chartColor = color || (isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))");

    return (
        <div className="h-[250px] w-full">
            <h3 className="text-lg font-semibold text-center mb-2">{stockName} ({stockSymbol}) Price History</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis
                        domain={["dataMin - 1", "dataMax + 1"]}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--muted-foreground))",
                            color: "hsl(var(--foreground))",
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value) => [`$${value}`, "Price"]}
                        labelFormatter={(label) => `${label}`}
                    />
                    <Area type="monotone" dataKey="price" stroke={chartColor} fill={chartColor} fillOpacity={0.2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
