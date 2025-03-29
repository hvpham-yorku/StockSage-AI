'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api, StockHistoryPoint } from '@/lib/api';
import { Loader2 } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockChartProps {
  symbol: string;
}

export default function StockChart({ symbol }: StockChartProps) {
  const [historyData, setHistoryData] = useState<StockHistoryPoint[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30); // Default to 30 days

  // Function to change time range
  const handleTimeRangeChange = (days: number) => {
    if (timeRange === days) return; // Don't refetch if selecting the same range
    setTimeRange(days);
    setIsRefreshing(true);
  };

  useEffect(() => {
    const fetchStockHistory = async () => {
      try {
        // Only set loading on initial load, not on refreshes
        if (historyData.length === 0) {
          setIsInitialLoading(true);
        }
        
        const data = await api.stocks.getHistory(symbol, timeRange);
        setHistoryData(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching stock history for ${symbol}:`, err);
        setError('Failed to load stock history data');
        // Don't clear existing data on error - keep showing the old chart
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchStockHistory();
  }, [symbol, timeRange]);

  // Format data for Chart.js
  const chartData = {
    labels: historyData.map(item => item.date),
    datasets: [
      {
        label: `${symbol} Price`,
        data: historyData.map(item => item.price),
        borderColor: historyData.length > 1 && historyData[0].price < historyData[historyData.length-1].price 
          ? 'rgb(34, 197, 94)' // green for upward trend
          : 'rgb(239, 68, 68)', // red for downward trend
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return;
          }
          // Create gradient background
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          
          // Set gradient colors based on trend
          if (historyData.length > 1 && historyData[0].price < historyData[historyData.length-1].price) {
            // Green gradient for upward trend
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');
          } else {
            // Red gradient for downward trend
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          }
          return gradient;
        },
        fill: true,
        tension: 0.1,
        pointRadius: 0, // Hide points
        pointHoverRadius: 6, // Show points on hover
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${symbol} Stock Price History (${timeRange} Days)`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Price: $${context.raw}`;
          }
        }
      }
    }
  };

  // Time range selector buttons
  const timeRangeOptions = [
    { days: 7, label: '1W' },
    { days: 30, label: '1M' },
    { days: 90, label: '3M' },
    { days: 180, label: '6M' },
    { days: 365, label: '1Y' },
  ];

  // Render initial loading state
  if (isInitialLoading) {
    return (
      <Card className="w-full mt-6">
        <CardHeader className="pb-2">
          <CardTitle>Price History</CardTitle>
          <div className="flex space-x-2 pt-2">
            {timeRangeOptions.map((option) => (
              <Button 
                key={option.days}
                variant="outline"
                size="sm"
                disabled
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="w-full">
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show error state while keeping the UI structure
  if (error && historyData.length === 0) {
    return (
      <Card className="w-full mt-6">
        <CardHeader className="pb-2">
          <CardTitle>Price History</CardTitle>
          <div className="flex space-x-2 pt-2">
            {timeRangeOptions.map((option) => (
              <Button 
                key={option.days}
                variant={timeRange === option.days ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange(option.days)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="w-full">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Price History</CardTitle>
          {isRefreshing && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2 pt-2">
          {timeRangeOptions.map((option) => (
            <Button 
              key={option.days}
              variant={timeRange === option.days ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange(option.days)}
              disabled={isRefreshing}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="w-full">
        <div className="h-80 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="text-sm text-muted-foreground mt-2">
          <p>Volume: {historyData.length > 0 ? historyData[historyData.length - 1].volume.toLocaleString() : 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 