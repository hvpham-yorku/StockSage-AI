'use client';

import { useState, useEffect } from 'react';
import api, { Stock, StockRecommendation } from '@/lib/api';

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<StockRecommendation | null>(null);

  useEffect(() => {
    async function fetchStocks() {
      try {
        const data = await api.getStocks();
        setStocks(data);
        setLoading(false);
      } catch (err) {
        setError('Error connecting to backend. Make sure the backend server is running.');
        setLoading(false);
      }
    }

    fetchStocks();
  }, []);

  async function getRecommendation(symbol: string) {
    try {
      setSelectedStock(symbol);
      const data = await api.getStockRecommendation(symbol);
      setRecommendation(data);
    } catch (err) {
      setError('Error fetching recommendation');
    }
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">StockSage-AI</h1>
        <p className="text-gray-400">AI-Enhanced Stock Trading Simulator</p>
      </header>

      {loading ? (
        <div className="text-center text-gray-300">Loading stocks...</div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Available Stocks</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="min-w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="py-3 px-4 border-b border-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 border-b border-gray-800 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="py-3 px-4 border-b border-gray-800 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
                    <th className="py-3 px-4 border-b border-gray-800 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800">
                  {stocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-gray-700">
                      <td className="py-3 px-4 border-b border-gray-700 text-gray-200">{stock.symbol}</td>
                      <td className="py-3 px-4 border-b border-gray-700 text-gray-200">{stock.name}</td>
                      <td className="py-3 px-4 border-b border-gray-700 text-right text-gray-200">${stock.price.toFixed(2)}</td>
                      <td className={`py-3 px-4 border-b border-gray-700 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 border-b border-gray-700 text-center">
                        <button
                          onClick={() => getRecommendation(stock.symbol)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                        >
                          Get AI Insight
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">AI Recommendation</h2>
            {recommendation ? (
              <div className="bg-gray-800 p-5 border border-gray-700 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg text-white">{recommendation.name} ({recommendation.symbol})</h3>
                <div className={`text-lg font-bold my-2 ${
                  recommendation.recommendation === 'Buy' ? 'text-green-400' : 
                  recommendation.recommendation === 'Sell' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {recommendation.recommendation} ({(recommendation.confidence * 100).toFixed(0)}% confidence)
                </div>
                <p className="text-gray-300">{recommendation.analysis}</p>
              </div>
            ) : selectedStock ? (
              <div className="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
                <div className="animate-pulse text-gray-400">Loading recommendation...</div>
              </div>
            ) : (
              <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 text-center py-8">
                <p className="text-gray-400">Select a stock to see AI recommendations</p>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500">
        <p>StockSage-AI - Educational Stock Trading Simulator</p>
        <div className="mt-4 flex justify-center gap-4">
          <a href="http://localhost:8000/docs" className="text-blue-400 hover:text-blue-300 hover:underline">API Docs</a>
          <a href="https://github.com/hvpham-yorku/StockSage-AI" className="text-blue-400 hover:text-blue-300 hover:underline">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
