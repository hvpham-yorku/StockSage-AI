'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StockChart from './StockChart';
import CompanyInfoCard from './CompanyInfoCard';
import StockMetricsCard from './StockMetricsCard';

interface StockDetailDashboardProps {
  symbol: string;
}

export default function StockDetailDashboard({ symbol }: StockDetailDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    const fetchAllStockData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch basic stock data
        const stockResult = await api.stocks.getOne(symbol);
        setStockData(stockResult);
        
        // Fetch company information
        const companyResult = await api.stocks.getCompanyInfo(symbol);
        setCompanyData(companyResult);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchAllStockData();
    }
  }, [symbol]);

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <Skeleton className="h-[380px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[250px] w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stockData) {
    return (
      <Alert>
        <AlertDescription>No stock data available for {symbol}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Stock Chart */}
      <div className="w-full">
        <StockChart symbol={symbol} />
      </div>
      
      {/* Stock Metrics */}
      {stockData && (
        <StockMetricsCard
          symbol={stockData.symbol}
          name={stockData.name}
          price={stockData.price}
          change={stockData.change}
          volume={stockData.volume || 0}
          marketCap={stockData.marketCap || 0}
          peRatio={stockData.peRatio || 0}
          dividendYield={stockData.dividendYield || 0}
        />
      )}
      
      {/* Company Information */}
      {companyData && (
        <CompanyInfoCard symbol={symbol} />
      )}
    </div>
  );
} 