# StockSage-AI Frontend Implementation Plan

## Overview
This document outlines the implementation plan for the StockSage-AI frontend. The frontend will be built using Next.js and will communicate with the backend API. The plan is designed for a team of 2 developers to complete within 5 days.

## Technology Stack
- **Framework**: Next.js
- **UI Library**: React
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Firebase Authentication (client-side)
- **Data Visualization**: Chart.js or Recharts

## Day 1: Setup and Landing Page

### Tasks
1. **Project Setup**
   - Configure Next.js project
   - Set up Tailwind CSS
   - Configure Firebase client
   - Create basic layout components

2. **Landing Page Implementation**
   - Create hero section explaining StockSage
   - Implement features section
   - Add testimonials section
   - Create call-to-action for sign up

3. **Firebase Authentication Integration**
   - Set up Firebase Authentication in the frontend
   - Implement Firebase UI for authentication (optional)
   - Create sign-up form with Firebase Auth
   - Create login form with Firebase Auth
   - Implement password reset with Firebase Auth
   - Set up authentication context with Firebase
   - Implement social login options (Google, GitHub, etc.)
   - Create protected route wrapper component
   - Implement user profile initialization with backend after successful registration
   - Handle token refresh and expiration

### Pages to Implement
```
/                 # Landing page
/auth/signup      # Sign up page
/auth/login       # Login page
/auth/reset       # Password reset page
```

### Authentication Implementation Notes
- Use Firebase Authentication SDK directly in the frontend for user registration, login, and password reset
- After successful registration, call backend to initialize user profile
- Store authentication state in React Context
- Send Firebase ID tokens to backend for verification with all API requests
- Implement automatic token refresh to maintain authentication state
- Use Firebase's built-in methods for password reset and email verification
- Frontend is responsible for token refresh management
- After login/registration, initialize user data in the backend

## Day 2: Dashboard and Stock Search

### Tasks
1. **Dashboard Layout**
   - Create responsive dashboard layout
   - Implement sidebar navigation
   - Create header with user profile
   - Add dashboard overview widgets

2. **Stock Search and Details**
   - Implement stock search functionality
   - Create stock card components
   - Build stock details page
   - Implement company information display

### Pages to Implement
```
/dashboard              # Main dashboard
/stocks                 # Stock search page
/stocks/[symbol]        # Stock details page
```

## Day 3: Portfolio Creation and Management

### Tasks
1. **Portfolio Creation**
   - Create portfolio creation form
   - Implement date picker for start date
   - Add initial balance input
   - Create portfolio listing page

2. **Portfolio Details**
   - Build portfolio summary view
   - Implement holdings table
   - Create portfolio performance chart
   - Add portfolio settings

### Pages to Implement
```
/portfolios                    # Portfolio listing
/portfolios/new                # Create new portfolio
/portfolios/[id]               # Portfolio details
/portfolios/[id]/settings      # Portfolio settings
```

## Day 4: Trading Interface and History

### Tasks
1. **Trading Interface**
   - Create buy stock form
   - Implement sell stock form
   - Add real-time price updates
   - Implement order confirmation

2. **Transaction History**
   - Build transaction history table
   - Implement filtering and sorting
   - Create transaction details modal
   - Add export functionality

### Pages to Implement
```
/portfolios/[id]/trade         # Trading interface
/portfolios/[id]/transactions  # Transaction history
```

## Day 5: Educational Content and Portfolio Comparison

### Tasks
1. **Educational Content**
   - Create stock terms glossary page
   - Implement stock tips section
   - Add educational resources
   - Create beginner's guide

2. **Portfolio Comparison**
   - Build portfolio comparison interface
   - Implement performance comparison charts
   - Add metrics comparison table
   - Create export functionality

3. **Testing and Polishing**
   - Test all features
   - Fix bugs and edge cases
   - Optimize performance
   - Ensure responsive design

### Pages to Implement
```
/education                     # Educational resources
/education/terms               # Stock terms glossary
/education/tips                # Stock trading tips
/portfolios/compare            # Portfolio comparison
```

## Component Structure

### Layout Components
- `Layout` - Main application layout
- `Sidebar` - Navigation sidebar
- `Header` - Application header
- `Footer` - Application footer
- `AuthGuard` - Authentication wrapper

### UI Components
- `Button` - Reusable button component
- `Card` - Card container component
- `Input` - Form input component
- `Select` - Dropdown select component
- `Modal` - Modal dialog component
- `Alert` - Alert/notification component
- `Tabs` - Tabbed interface component
- `Table` - Data table component

### Feature Components
- `StockCard` - Stock information card
- `StockChart` - Stock price chart
- `PortfolioSummary` - Portfolio summary widget
- `PortfolioChart` - Portfolio performance chart
- `TransactionTable` - Transaction history table
- `TradeForm` - Buy/sell form
- `CompanyInfo` - Company information display
- `GlossaryItem` - Stock term definition

## State Management

### Authentication Context
```typescript
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshToken: () => Promise<string>;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  preferences?: {
    theme: 'light' | 'dark';
    notifications_enabled: boolean;
  };
}
```

### Portfolio Context
```typescript
interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  createPortfolio: (data: PortfolioData) => Promise<void>;
  fetchPortfolios: () => Promise<void>;
  fetchPortfolio: (id: string) => Promise<void>;
  updatePortfolio: (id: string, data: Partial<PortfolioData>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
}
```

## API Integration

Create a comprehensive API client to interact with the backend:

```typescript
// api/index.ts
import { getAuth } from "firebase/auth";

// Helper function to get the current user's ID token
const getIdToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.getIdToken(true); // Force refresh if needed
};

// Helper function to add auth headers to requests
const authHeader = async () => {
  const token = await getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};

const api = {
  auth: {
    getProfile: async () => {
      const headers = await authHeader();
      return axios.get('/api/auth/profile', { headers });
    },
    updateProfile: async (data) => {
      const headers = await authHeader();
      return axios.put('/api/auth/profile', data, { headers });
    },
    initializeUserProfile: async (userData) => {
      const headers = await authHeader();
      return axios.put('/api/auth/profile', userData, { headers });
    }
  },
  stocks: {
    search: (query) => axios.get(`/api/stocks/search?query=${query}`),
    getStock: (symbol) => axios.get(`/api/stocks/${symbol}`),
    getHistory: (symbol, days) => axios.get(`/api/stocks/${symbol}/history?days=${days}`),
    getCompanyInfo: (symbol) => axios.get(`/api/stocks/${symbol}/company-info`),
  },
  portfolios: {
    create: async (data) => {
      const headers = await authHeader();
      return axios.post('/api/portfolios', data, { headers });
    },
    getAll: async () => {
      const headers = await authHeader();
      return axios.get('/api/portfolios', { headers });
    },
    get: async (id) => {
      const headers = await authHeader();
      return axios.get(`/api/portfolios/${id}`, { headers });
    },
    update: async (id, data) => {
      const headers = await authHeader();
      return axios.put(`/api/portfolios/${id}`, data, { headers });
    },
    delete: async (id) => {
      const headers = await authHeader();
      return axios.delete(`/api/portfolios/${id}`, { headers });
    },
    compare: async (ids) => {
      const headers = await authHeader();
      return axios.get(`/api/portfolios/compare?ids=${ids.join(',')}`, { headers });
    },
  },
  trading: {
    buy: async (portfolioId, data) => {
      const headers = await authHeader();
      return axios.post(`/api/portfolios/${portfolioId}/buy`, data, { headers });
    },
    sell: async (portfolioId, data) => {
      const headers = await authHeader();
      return axios.post(`/api/portfolios/${portfolioId}/sell`, data, { headers });
    },
    getTransactions: async (portfolioId) => {
      const headers = await authHeader();
      return axios.get(`/api/portfolios/${portfolioId}/transactions`, { headers });
    },
    getPerformance: async (portfolioId) => {
      const headers = await authHeader();
      return axios.get(`/api/portfolios/${portfolioId}/performance`, { headers });
    },
  },
  education: {
    getTerms: () => axios.get('/api/education/terms'),
    getTerm: (term) => axios.get(`/api/education/terms/${term}`),
    getTips: () => axios.get('/api/education/tips'),
  },
};
```

## Implementation Notes
1. Use Next.js App Router for routing
2. Implement responsive design for all pages
3. Use Tailwind CSS for styling
4. Implement proper loading states and error handling
5. Use client-side Firebase for authentication
6. Implement proper form validation
7. Use Chart.js or Recharts for data visualization
8. Handle token refresh automatically
9. Create user profile in backend after successful registration
10. Follow atomic design principles for components 