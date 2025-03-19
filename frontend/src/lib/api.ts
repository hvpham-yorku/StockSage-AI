'use client';

// API client for StockSage-AI backend
import { auth } from '@/firebase/config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  created_at?: number;
  updated_at?: number;
  preferences?: {
    theme: string;
    notifications_enabled: boolean;
    default_view: string;
  };
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
  preferences?: {
    theme?: string;
    notifications_enabled?: boolean;
    default_view?: string;
  };
}

// Get the current user's ID token
async function getCurrentUserToken(): Promise<string | null> {
  if (!auth) {
    console.error('Firebase auth is not initialized');
    return null;
  }
  
  const user = auth.currentUser;
  
  if (!user) {
    console.log('No user is currently signed in');
    return null;
  }
  
  try {
    // Force refresh to ensure we get the latest token
    const token = await user.getIdToken(true);
    console.log('Token successfully retrieved');
    return token;
  } catch (error) {
    console.error('Error getting user token:', error);
    throw error;
  }
}

// Generic fetch function with error handling and authentication
async function fetchFromAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  // Get the current user's token
  const token = await getCurrentUserToken();
  
  // If token is null and we're trying to access protected endpoints, throw an error
  if (token === null && endpoint.includes('/api/auth/') && !endpoint.endsWith('/register')) {
    throw new Error('Authentication required for this endpoint');
  }
  
  // Set up headers with authentication
  const headers = new Headers(options.headers);
  
  // Add authorization header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Add Content-Type if not already set and we have a body
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Create the request with the updated headers
  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: 'cors',           // Explicitly set CORS mode
  };
  
  // Make the request
  console.log(`Making API request to ${endpoint} with method ${options.method || 'GET'}`);
  try {
    // First try the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch (parseError) {
        // If JSON parsing fails, use status text
        console.error(`Error parsing error response (${response.status}):`, parseError);
      }
      
      throw new Error(
        `API error (${response.status}): ${errorMessage}`
      );
    }
    
    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    
    // For debugging CORS issues
    if (String(error).includes('Failed to fetch')) {
      console.error('This might be a CORS issue. Check that the server is running and properly configured for CORS.');
    }
    
    throw error;
  }
}

// API functions
export const api = {
  // Auth endpoints
  auth: {
    // Get the current user's profile
    getProfile: () => fetchFromAPI<UserProfile>('/api/auth/profile'),
    
    // Update the current user's profile
    updateProfile: (data: UserProfileUpdate) => 
      fetchFromAPI<UserProfile>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
      
    // Delete the user's profile
    deleteProfile: (deleteAuth = false) => 
      fetchFromAPI<void>(`/api/auth/profile?delete_auth=${deleteAuth}`, {
        method: 'DELETE'
      }),
      
    // Verify the current token
    verifyToken: () => fetchFromAPI<{valid: boolean, user_id: string, email: string}>('/api/auth/verify')
  },
  
  // Health check (no authentication required)
  checkHealth: () => fetchFromAPI<{ status: string }>('/api/health'),
  
  // Stock endpoints
  stocks: {
    // Get all stocks
    getAll: () => fetchFromAPI<Stock[]>('/api/stocks'),
    
    // Get a specific stock
    getOne: (symbol: string) => fetchFromAPI<Stock>(`/api/stocks/${symbol}`),
    
    // Search for stocks
    search: (query: string) => fetchFromAPI<Stock[]>(`/api/stocks/search?query=${encodeURIComponent(query)}`),
    
    // Get historical data for a stock
    getHistory: (symbol: string, days = 30) => 
      fetchFromAPI<StockHistoryPoint[]>(`/api/stocks/${symbol}/history?days=${days}`),
    
    // Get company information
    getCompanyInfo: (symbol: string) => 
      fetchFromAPI<any>(`/api/stocks/${symbol}/company-info`),
    
    // Get AI recommendation for a stock
    getRecommendation: (symbol: string) => 
      fetchFromAPI<StockRecommendation>(`/api/stocks/${symbol}/recommendation`)
  },
  
  // Portfolio endpoints
  portfolios: {
    // Create a new portfolio
    create: (data: { name: string, start_date: string, initial_balance: number }) => 
      fetchFromAPI<any>('/api/portfolios', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    // Get all portfolios for the current user
    getAll: () => fetchFromAPI<any[]>('/api/portfolios'),
    
    // Get a specific portfolio
    getOne: (portfolioId: string) => fetchFromAPI<any>(`/api/portfolios/${portfolioId}`),
    
    // Compare portfolios
    compare: (portfolioIds: string[]) => 
      fetchFromAPI<any>(`/api/portfolios/compare?ids=${portfolioIds.join(',')}`),
    
    // Buy stock in a portfolio
    buyStock: (portfolioId: string, data: { symbol: string, quantity: number, price: number }) => 
      fetchFromAPI<any>(`/api/portfolios/${portfolioId}/buy`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    // Sell stock from a portfolio
    sellStock: (portfolioId: string, data: { symbol: string, quantity: number, price: number }) => 
      fetchFromAPI<any>(`/api/portfolios/${portfolioId}/sell`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    // Get transaction history for a portfolio
    getTransactions: (portfolioId: string) => 
      fetchFromAPI<any[]>(`/api/portfolios/${portfolioId}/transactions`),
    
    // Get performance data for a portfolio
    getPerformance: (portfolioId: string) => 
      fetchFromAPI<any>(`/api/portfolios/${portfolioId}/performance`)
  },
  
  // Educational content endpoints
  education: {
    // Get all stock terms
    getTerms: () => fetchFromAPI<any[]>('/api/education/terms'),
    
    // Get a specific stock term
    getTerm: (term: string) => fetchFromAPI<any>(`/api/education/terms/${term}`),
    
    // Get stock trading tips
    getTips: () => fetchFromAPI<any[]>('/api/education/tips')
  }
};

export default api; 