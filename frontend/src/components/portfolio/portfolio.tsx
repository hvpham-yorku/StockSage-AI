"use client";

import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, DollarSign, LineChart } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import SimpleGraph from "./perfomance_chart";
import { api, Transaction } from "@/lib/api";

interface Stock {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

interface PortfolioProps {
  portfolioId: string;
}

export default function StockPortfolio({ portfolioId }: PortfolioProps) {

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portfolioId) return;
    const fetchPortfolioData = async () => {
      setLoading(true);

      try {
        const portfolio = await api.portfolios.getOne(portfolioId);
        const transactionData = await api.portfolios.getTransactions(portfolioId);

        setCashBalance(portfolio.initial_balance);
        setTransactions(transactionData);

        const stockHoldings: Record<string, Stock> = {};

        transactionData.forEach((txn) => {
          if (!stockHoldings[txn.symbol]) {
            stockHoldings[txn.symbol] = {
              symbol: txn.symbol,
              name: txn.symbol,
              shares: 0,
              purchasePrice: txn.price,
              currentPrice: txn.price,
            };
          }

          if (txn.type === "buy") {
            stockHoldings[txn.symbol].shares += txn.quantity;
            stockHoldings[txn.symbol].purchasePrice = txn.price;
          } else if (txn.type === "sell") {
            stockHoldings[txn.symbol].shares -= txn.quantity;
          }
        });

        // 최신 현재 가격을 가져오는 API 호출 (실제 데이터를 가져오는 부분)
        const symbols = Object.keys(stockHoldings);
        const stockPrices = await Promise.all(
            symbols.map((symbol) => api.stocks.getOne(symbol))
        );

        stockPrices.forEach((stockPrice) => {
          if (stockHoldings[stockPrice.symbol]) {
            stockHoldings[stockPrice.symbol].currentPrice = stockPrice.price;
            stockHoldings[stockPrice.symbol].name = stockPrice.name;
          }
        });

        setStocks(Object.values(stockHoldings));
      } catch (error) {
        console.error("Failed to load portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [portfolioId]);

  const totalValue = stocks.reduce((acc, stock) => acc + stock.currentPrice * stock.shares, 0);
  const totalGainLoss = stocks.reduce(
      (acc, stock) => acc + (stock.currentPrice - stock.purchasePrice) * stock.shares,
      0
  );
  const totalPortfolioValue = cashBalance + totalValue;

  const performanceData = transactions.map((txn) => ({
    date: txn.date,
    value: txn.price * txn.quantity,
  }));

  return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Cash + Investments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cashBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Available for trading</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investments Value</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Current market value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
              {totalGainLoss >= 0 ? <ArrowUp className="h-4 w-4 text-green-500" /> : <ArrowDown className="h-4 w-4 text-red-500" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                ${Math.abs(totalGainLoss).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleGraph data={performanceData} />
          </CardContent>
        </Card>
      </div>
  );
}