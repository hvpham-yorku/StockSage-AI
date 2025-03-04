// API client for StockSage-AI backend

const API_BASE_URL = 'http://localhost:8000';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export interface StockHistoryPoint {
  date: string;
  price: number;
  volume: number;
}

export interface StockRecommendation {
  symbol: string;
  name: string;
  recommendation: string;
  confidence: number;
  analysis: string;
}

// Generic fetch function with error handling
async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `API error (${response.status}): ${errorData.detail || response.statusText}`
    );
  }
  
  return response.json() as Promise<T>;
}

// API functions
export const api = {
  // Health check
  checkHealth: () => fetchFromAPI<{ status: string }>('/api/health'),
  
  // Get all stocks
  getStocks: () => fetchFromAPI<Stock[]>('/api/stocks'),
  
  // Get a specific stock
  getStock: (symbol: string) => fetchFromAPI<Stock>(`/api/stocks/${symbol}`),
  
  // Get historical data for a stock
  getStockHistory: (symbol: string, days = 30) => 
    fetchFromAPI<StockHistoryPoint[]>(`/api/stocks/${symbol}/history?days=${days}`),
  
  // Get AI recommendation for a stock
  getStockRecommendation: (symbol: string) => 
    fetchFromAPI<StockRecommendation>(`/api/stocks/${symbol}/recommendation`),
}

export default api; 