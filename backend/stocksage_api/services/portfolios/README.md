# StockSage Portfolio Simulation API

This guide provides frontend integration instructions for the StockSage portfolio simulation API.

## Core Concepts

- **Time-Based Simulation**: Create portfolios with historical start dates and control simulation speed
- **Real-time Updates**: Subscribe to Firebase streams for live updates without polling
- **Historical Pricing**: Buy/sell stocks using accurate historical prices based on simulation date

## Frontend Integration Steps

### 1. Authentication

All portfolio endpoints require Firebase authentication. Include the auth token in your requests:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${await getFirebaseToken()}`
};
```

### 2. Portfolio Management Workflow

```javascript
// Step 1: Create a portfolio
async function createPortfolio() {
  const response = await fetch('/api/portfolios', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: "Tech Growth Portfolio",
      start_date: "2022-01-01",
      initial_balance: 10000
    })
  });
  
  const portfolio = await response.json();
  const portfolioId = portfolio.id;
  return portfolioId;
}

// Step 2: Configure Firebase for real-time updates
async function setupRealtimeUpdates(portfolioId) {
  const response = await fetch(`/api/portfolios/${portfolioId}/firebase-config`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      enabled: true,
      include_holdings: true,
      include_performance: true
    })
  });
  
  return await response.json();
}

// Step 3: Start the simulation
async function startSimulation(portfolioId) {
  const response = await fetch(`/api/portfolios/${portfolioId}/simulation`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: "start",
      simulation_speed: 7  // 7 days per real-time day
    })
  });
  
  return await response.json();
}

// Step 4: Trade stocks (buy example)
async function buyStock(portfolioId, symbol, quantity) {
  const response = await fetch(`/api/portfolios/${portfolioId}/buy`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      symbol,  // e.g., "AAPL"
      quantity // e.g., 10
      // price is optional, will use historical price if omitted
    })
  });
  
  return await response.json();
}

// Step 5: Track performance
async function getPerformance(portfolioId) {
  const response = await fetch(`/api/portfolios/${portfolioId}/performance`, {
    headers
  });
  
  return await response.json();
}
```

### 3. Firebase Real-time Updates

The core feature for a dynamic UI is Firebase real-time streaming:

```javascript
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, off } from "firebase/database";

// Initialize Firebase (replace with your config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Set up listeners based on the Firebase config response
function setupFirebaseListeners(firebasePaths, callbacks) {
  const listeners = {};
  
  // Main portfolio data
  if (firebasePaths.portfolio) {
    const portfolioRef = ref(database, firebasePaths.portfolio);
    onValue(portfolioRef, (snapshot) => {
      const data = snapshot.val();
      callbacks.onPortfolioUpdate(data);
    });
    listeners.portfolio = portfolioRef;
  }
  
  // Stock price history for charts
  if (firebasePaths.stock_history) {
    Object.entries(firebasePaths.stock_history).forEach(([symbol, path]) => {
      const historyRef = ref(database, path);
      onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        callbacks.onStockHistoryUpdate(symbol, data);
      });
      listeners[`history_${symbol}`] = historyRef;
    });
  }
  
  // Performance history for performance charts
  if (firebasePaths.performance) {
    const performanceRef = ref(database, firebasePaths.performance);
    onValue(performanceRef, (snapshot) => {
      const data = snapshot.val();
      callbacks.onPerformanceUpdate(data);
    });
    listeners.performance = performanceRef;
  }
  
  // Return cleanup function
  return () => {
    Object.values(listeners).forEach(listenerRef => {
      off(listenerRef);
    });
  };
}
```

### 4. Common Patterns

#### Portfolio Simulation Controls

```javascript
// Start simulation
function startSimulation(portfolioId) {
  return fetch(`/api/portfolios/${portfolioId}/simulation`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: "start", simulation_speed: 7 })
  }).then(res => res.json());
}

// Pause simulation
function pauseSimulation(portfolioId) {
  return fetch(`/api/portfolios/${portfolioId}/simulation`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: "pause" })
  }).then(res => res.json());
}

// Reset simulation back to start date
function resetSimulation(portfolioId) {
  return fetch(`/api/portfolios/${portfolioId}/simulation`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: "reset" })
  }).then(res => res.json());
}

// Jump to specific date
function setSimulationDate(portfolioId, date) {
  return fetch(`/api/portfolios/${portfolioId}/simulation`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      action: "set_date", 
      target_date: date // format: "YYYY-MM-DD"
    })
  }).then(res => res.json());
}

// Advance by X days (useful for testing)
function advanceSimulation(portfolioId, days) {
  return fetch(`/api/portfolios/${portfolioId}/advance`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ days })
  }).then(res => res.json());
}
```

#### Trading Operations

```javascript
// Buy stock
function buyStock(portfolioId, symbol, quantity) {
  return fetch(`/api/portfolios/${portfolioId}/buy`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ symbol, quantity })
  }).then(res => res.json());
}

// Sell stock
function sellStock(portfolioId, symbol, quantity) {
  return fetch(`/api/portfolios/${portfolioId}/sell`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ symbol, quantity })
  }).then(res => res.json());
}

// Get transaction history
function getTransactionHistory(portfolioId) {
  return fetch(`/api/portfolios/${portfolioId}/transactions`, {
    headers
  }).then(res => res.json());
}
```

#### Performance Analysis

```javascript
// Get detailed performance metrics
function getPerformanceMetrics(portfolioId) {
  return fetch(`/api/portfolios/${portfolioId}/performance`, {
    headers
  }).then(res => res.json());
}

// Compare multiple portfolios
function comparePortfolios(portfolioIds) {
  const idsParam = portfolioIds.join(',');
  return fetch(`/api/portfolios/compare?ids=${idsParam}`, {
    headers
  }).then(res => res.json());
}
```

### 5. Complete React Component Example

Here's a simple React component demonstrating the full integration:

```jsx
import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, off } from "firebase/database";

function PortfolioSimulator({ portfolioId }) {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cleanup, setCleanup] = useState(null);

  // Initialize on component mount
  useEffect(() => {
    const initializePortfolio = async () => {
      try {
        // Get initial portfolio data
        const portfolioResponse = await fetch(`/api/portfolios/${portfolioId}`, {
          headers: { 'Authorization': `Bearer ${await getFirebaseToken()}` }
        });
        const portfolioData = await portfolioResponse.json();
        setPortfolio(portfolioData);
        
        // Set up Firebase streaming
        const configResponse = await fetch(`/api/portfolios/${portfolioId}/firebase-config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getFirebaseToken()}`
          },
          body: JSON.stringify({
            enabled: true,
            include_holdings: true,
            include_performance: true
          })
        });
        
        const config = await configResponse.json();
        
        // Set up listeners
        const cleanupFn = setupFirebaseListeners(config.firebase_paths, {
          onPortfolioUpdate: (data) => setPortfolio(data),
          onPerformanceUpdate: (data) => setPerformance(data),
          onStockHistoryUpdate: (symbol, data) => {
            // Update charts with price history
            console.log(`Updated price history for ${symbol}`);
          }
        });
        
        setCleanup(() => cleanupFn);
        
        // Load transactions
        const transactionsResponse = await fetch(`/api/portfolios/${portfolioId}/transactions`, {
          headers: { 'Authorization': `Bearer ${await getFirebaseToken()}` }
        });
        setTransactions(await transactionsResponse.json());
      } catch (error) {
        console.error("Failed to initialize portfolio:", error);
      }
    };
    
    initializePortfolio();
    
    // Cleanup on unmount
    return () => {
      if (cleanup) cleanup();
    };
  }, [portfolioId]);
  
  // Buy stock handler
  const handleBuy = async () => {
    if (!symbol || quantity <= 0) return;
    
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getFirebaseToken()}`
        },
        body: JSON.stringify({ symbol, quantity: Number(quantity) })
      });
      
      const result = await response.json();
      console.log("Buy transaction complete:", result);
      
      // Refresh transactions
      const transactionsResponse = await fetch(`/api/portfolios/${portfolioId}/transactions`, {
        headers: { 'Authorization': `Bearer ${await getFirebaseToken()}` }
      });
      setTransactions(await transactionsResponse.json());
    } catch (error) {
      console.error("Failed to buy stock:", error);
    }
  };
  
  // Simulation control handlers
  const startSimulation = async () => {
    await fetch(`/api/portfolios/${portfolioId}/simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getFirebaseToken()}`
      },
      body: JSON.stringify({ action: "start", simulation_speed: 7 })
    });
  };
  
  const pauseSimulation = async () => {
    await fetch(`/api/portfolios/${portfolioId}/simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getFirebaseToken()}`
      },
      body: JSON.stringify({ action: "pause" })
    });
  };
  
  // Component rendering
  if (!portfolio) return <div>Loading portfolio...</div>;
  
  return (
    <div className="portfolio-simulator">
      <h1>{portfolio.name}</h1>
      
      <div className="portfolio-info">
        <p>Current Date: {portfolio.current_date}</p>
        <p>Balance: ${portfolio.current_balance.toFixed(2)}</p>
        <p>Cash: ${portfolio.cash_balance.toFixed(2)}</p>
        <p>Performance: {portfolio.performance.toFixed(2)}%</p>
      </div>
      
      <div className="simulation-controls">
        <button onClick={startSimulation}>Start</button>
        <button onClick={pauseSimulation}>Pause</button>
      </div>
      
      <div className="trading-panel">
        <input
          type="text" 
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Symbol (e.g., AAPL)"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />
        <button onClick={handleBuy}>Buy</button>
      </div>
      
      <div className="holdings">
        <h2>Holdings</h2>
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Current Price</th>
              <th>Value</th>
              <th>Gain/Loss</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.holdings.map(holding => (
              <tr key={holding.symbol}>
                <td>{holding.symbol}</td>
                <td>{holding.quantity}</td>
                <td>${holding.current_price.toFixed(2)}</td>
                <td>${holding.value.toFixed(2)}</td>
                <td className={holding.gain_loss >= 0 ? "positive" : "negative"}>
                  {holding.gain_loss.toFixed(2)} ({holding.gain_loss_percent.toFixed(2)}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="transactions">
        <h2>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map(tx => (
              <tr key={tx.id}>
                <td>{tx.trade_date}</td>
                <td>{tx.type}</td>
                <td>{tx.symbol}</td>
                <td>{tx.quantity}</td>
                <td>${tx.price.toFixed(2)}</td>
                <td>${tx.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PortfolioSimulator;
```

## Firebase Data Structure

For reference, here's the Firebase structure used by the API:

```
portfolios/
  {portfolio_id}/
    id: string
    user_id: string
    name: string
    start_date: string (YYYY-MM-DD)
    initial_balance: number
    current_balance: number
    cash_balance: number
    current_date: string (YYYY-MM-DD)
    is_active: boolean
    simulation_speed: number
    created_at: string
    performance: number
    holdings: [...]
    transactions: [...]
    performance_history: [...]
    stock_history/
      {symbol}/
        "2022-01-01": 185.34
        ...
```

## Error Handling

Always handle API errors appropriately:

```javascript
try {
  const response = await fetch('/api/portfolios/...');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'API call failed');
  }
  const data = await response.json();
  // Process data
} catch (error) {
  console.error("API error:", error);
  // Display user-friendly error message
}
```

Error status codes:
- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Missing/invalid Firebase token
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error 