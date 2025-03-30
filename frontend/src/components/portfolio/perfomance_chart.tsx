"use client"

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useState } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataPoint {
  date: string
  value: number
}

interface SimpleGraphProps {
  data: DataPoint[]
  valuePrefix?: string
}

export default function SimpleGraph({ data, valuePrefix = "$" }: SimpleGraphProps) {
  const [chartType, setChartType] = useState("area")

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatValue = (value: number) => {
    return `${valuePrefix}${value.toFixed(2)}`
  }

  return (
    <div className="w-full h-full content-center p-5">
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          {(
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tickFormatter={formatDate} stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis tickFormatter={formatValue} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                formatter={(value: number) => formatValue(value)}
                labelFormatter={(label) => formatDate(label as string)}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

