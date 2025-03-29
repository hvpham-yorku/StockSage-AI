'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart2, DollarSign, Users, Calendar } from 'lucide-react';

interface StockMetricsCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
}

export default function StockMetricsCard({
  symbol,
  name,
  price,
  change,
  volume,
  marketCap,
  peRatio,
  dividendYield
}: StockMetricsCardProps) {
  
  const isPositiveChange = change >= 0;
  const changeIcon = isPositiveChange ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  const changeColor = isPositiveChange ? 'text-green-500' : 'text-red-500';
  const changeText = isPositiveChange ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;

  // Format large numbers
  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Key Metrics</CardTitle>
        <Badge variant={isPositiveChange ? "default" : "destructive"} className="ml-2">
          <span className="flex items-center">
            {changeIcon}
            <span className="ml-1">{changeText}</span>
          </span>
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Price */}
          <div className="bg-muted p-3 rounded-md flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current Price</p>
              <p className="text-lg font-semibold">${price.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary opacity-80" />
          </div>
          
          {/* Price Change */}
          <div className="bg-muted p-3 rounded-md flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Price Change</p>
              <p className={`text-lg font-semibold ${changeColor}`}>{changeText}</p>
            </div>
            <span className={changeColor}>{changeIcon}</span>
          </div>
          
          {/* Trading Volume */}
          <div className="bg-muted p-3 rounded-md flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Trading Volume</p>
              <p className="text-lg font-semibold">{volume.toLocaleString()}</p>
              {volume > 1000000 && <Badge variant="secondary" className="mt-1">High Volume</Badge>}
            </div>
            <BarChart2 className="h-8 w-8 text-primary opacity-80" />
          </div>
          
          {/* Market Cap */}
          <div className="bg-muted p-3 rounded-md flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="text-lg font-semibold">{formatLargeNumber(marketCap)}</p>
              {marketCap > 10e9 && <Badge variant="secondary" className="mt-1">Large Cap</Badge>}
              {marketCap > 100e9 && <Badge variant="secondary" className="mt-1">Mega Cap</Badge>}
              {marketCap < 2e9 && marketCap > 300e6 && <Badge variant="secondary" className="mt-1">Mid Cap</Badge>}
              {marketCap < 300e6 && <Badge variant="secondary" className="mt-1">Small Cap</Badge>}
            </div>
            <DollarSign className="h-8 w-8 text-primary opacity-80" />
          </div>
          
          {/* P/E Ratio */}
          <div className="bg-muted p-3 rounded-md flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">P/E Ratio</p>
              <p className="text-lg font-semibold">{peRatio.toFixed(2)}</p>
              {peRatio < 15 && <Badge variant="outline" className="mt-1">Value</Badge>}
              {peRatio > 30 && <Badge variant="outline" className="mt-1">Growth</Badge>}
            </div>
            <Calendar className="h-8 w-8 text-primary opacity-80" />
          </div>
          
          {/* Dividend Yield */}
          <div className="bg-muted p-3 rounded-md flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Dividend Yield</p>
              <p className="text-lg font-semibold">{dividendYield.toFixed(2)}%</p>
              {dividendYield > 4 && <Badge variant="secondary" className="mt-1">High Yield</Badge>}
            </div>
            <Users className="h-8 w-8 text-primary opacity-80" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 