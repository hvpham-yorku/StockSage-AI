# StockSage-AI API Specification

This document outlines the API endpoints that will be implemented for the StockSage-AI application. Both frontend and backend teams should refer to this document to ensure consistent implementation.

## Base URL
```
http://localhost:8000
```

## Authentication Endpoints

### Verify Firebase Token
```
POST /api/auth/verify-token
```

**Request Body:**
```json
{
  "token": "firebase-id-token-here"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user_id": "user123",
  "expires": 1678104000
}
```

### Get User Profile
```
GET /api/auth/profile
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Response (200 OK):**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2023-03-06T12:00:00Z",
  "preferences": {
    "theme": "dark",
    "notifications_enabled": true
  }
}
```

### Update User Profile
```
PUT /api/auth/profile
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Request Body:**
```json
{
  "name": "John Smith",
  "preferences": {
    "theme": "light",
    "notifications_enabled": false
  }
}
```

**Response (200 OK):**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "name": "John Smith",
  "created_at": "2023-03-06T12:00:00Z",
  "updated_at": "2023-03-07T09:30:00Z",
  "preferences": {
    "theme": "light",
    "notifications_enabled": false
  }
}
```

### Authentication Implementation Notes
- User registration, login, and password reset are handled directly by Firebase Authentication in the frontend
- The backend only needs to verify tokens and manage user profile data
- All protected endpoints will require a valid Firebase ID token in the Authorization header
- Token verification is handled by Firebase Admin SDK on the backend

## Stock Endpoints

### Search Stocks
```
GET /api/stocks/search?query={query}
```

**Response (200 OK):**
```json
[
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 175.34,
    "change": 2.34
  },
  {
    "symbol": "AMZN",
    "name": "Amazon.com, Inc.",
    "price": 178.12,
    "change": 3.45
  }
]
```

### Get Stock Details
```
GET /api/stocks/{symbol}
```

**Response (200 OK):**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 175.34,
  "change": 2.34,
  "volume": 78945612,
  "market_cap": 2800000000000,
  "pe_ratio": 28.5,
  "dividend_yield": 0.5
}
```

### Get Stock Price History
```
GET /api/stocks/{symbol}/history?days={days}
```

**Response (200 OK):**
```json
[
  {
    "date": "2023-03-01",
    "price": 170.34,
    "volume": 75123456
  },
  {
    "date": "2023-03-02",
    "price": 172.45,
    "volume": 68945123
  },
  {
    "date": "2023-03-03",
    "price": 175.34,
    "volume": 78945612
  }
]
```

### Get Company Information
```
GET /api/stocks/{symbol}/company-info
```

**Response (200 OK):**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones...",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "employees": 154000,
  "headquarters": "Cupertino, California",
  "founded": 1976,
  "ceo": "Tim Cook",
  "website": "https://www.apple.com"
}
```

## Portfolio Endpoints

### Create Portfolio
```
POST /api/portfolios
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Request Body:**
```json
{
  "name": "My Tech Portfolio",
  "start_date": "2023-03-01",
  "initial_balance": 10000
}
```

**Response (201 Created):**
```json
{
  "id": "portfolio123",
  "user_id": "user123",
  "name": "My Tech Portfolio",
  "start_date": "2023-03-01",
  "initial_balance": 10000,
  "current_balance": 10000,
  "created_at": "2023-03-06T12:00:00Z"
}
```

### Get User Portfolios
```
GET /api/portfolios
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Response (200 OK):**
```json
[
  {
    "id": "portfolio123",
    "name": "My Tech Portfolio",
    "start_date": "2023-03-01",
    "initial_balance": 10000,
    "current_balance": 10250.75,
    "performance": 2.51
  },
  {
    "id": "portfolio456",
    "name": "My Energy Portfolio",
    "start_date": "2023-02-15",
    "initial_balance": 5000,
    "current_balance": 5125.50,
    "performance": 2.51
  }
]
```

### Get Portfolio Details
```
GET /api/portfolios/{portfolio_id}
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Response (200 OK):**
```json
{
  "id": "portfolio123",
  "user_id": "user123",
  "name": "My Tech Portfolio",
  "start_date": "2023-03-01",
  "initial_balance": 10000,
  "current_balance": 10250.75,
  "cash_balance": 5250.75,
  "performance": 2.51,
  "holdings": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "quantity": 10,
      "average_buy_price": 170.00,
      "current_price": 175.34,
      "value": 1753.40,
      "gain_loss": 53.40,
      "gain_loss_percent": 3.14
    },
    {
      "symbol": "MSFT",
      "name": "Microsoft Corporation",
      "quantity": 5,
      "average_buy_price": 320.00,
      "current_price": 328.79,
      "value": 1643.95,
      "gain_loss": 43.95,
      "gain_loss_percent": 2.75
    }
  ],
  "created_at": "2023-03-06T12:00:00Z"
}
```

### Compare Portfolios
```
GET /api/portfolios/compare?ids={portfolio_id1},{portfolio_id2}
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Response (200 OK):**
```json
{
  "portfolios": [
    {
      "id": "portfolio123",
      "name": "My Tech Portfolio",
      "start_date": "2023-03-01",
      "initial_balance": 10000,
      "current_balance": 10250.75,
      "performance": 2.51,
      "performance_history": [
        {"date": "2023-03-01", "value": 10000},
        {"date": "2023-03-02", "value": 10050},
        {"date": "2023-03-03", "value": 10150},
        {"date": "2023-03-04", "value": 10200},
        {"date": "2023-03-05", "value": 10250.75}
      ]
    },
    {
      "id": "portfolio456",
      "name": "My Energy Portfolio",
      "start_date": "2023-02-15",
      "initial_balance": 5000,
      "current_balance": 5125.50,
      "performance": 2.51,
      "performance_history": [
        {"date": "2023-02-15", "value": 5000},
        {"date": "2023-02-20", "value": 5025},
        {"date": "2023-02-25", "value": 5050},
        {"date": "2023-03-01", "value": 5075},
        {"date": "2023-03-05", "value": 5125.50}
      ]
    }
  ],
  "comparison_metrics": {
    "total_return": [2.51, 2.51],
    "annualized_return": [30.12, 18.25],
    "volatility": [0.8, 1.2],
    "sharpe_ratio": [1.5, 1.2]
  }
}
```

## Trading Endpoints

### Buy Stock
```
POST /api/portfolios/{portfolio_id}/buy
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Request Body:**
```json
{
  "symbol": "AAPL",
  "quantity": 5,
  "price": 175.34
}
```

**Response (201 Created):**
```json
{
  "id": "transaction123",
  "portfolio_id": "portfolio123",
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "type": "buy",
  "quantity": 5,
  "price": 175.34,
  "total": 876.70,
  "timestamp": "2023-03-06T12:00:00Z",
  "new_balance": 9123.30
}
```

### Sell Stock
```
POST /api/portfolios/{portfolio_id}/sell
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Request Body:**
```json
{
  "symbol": "AAPL",
  "quantity": 2,
  "price": 180.50
}
```

**Response (201 Created):**
```json
{
  "id": "transaction456",
  "portfolio_id": "portfolio123",
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "type": "sell",
  "quantity": 2,
  "price": 180.50,
  "total": 361.00,
  "timestamp": "2023-03-06T12:00:00Z",
  "new_balance": 9484.30,
  "gain_loss": 21.00,
  "gain_loss_percent": 6.18
}
```

### Get Transaction History
```
GET /api/portfolios/{portfolio_id}/transactions
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Response (200 OK):**
```json
[
  {
    "id": "transaction123",
    "portfolio_id": "portfolio123",
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "type": "buy",
    "quantity": 5,
    "price": 175.34,
    "total": 876.70,
    "timestamp": "2023-03-06T12:00:00Z"
  },
  {
    "id": "transaction456",
    "portfolio_id": "portfolio123",
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "type": "sell",
    "quantity": 2,
    "price": 180.50,
    "total": 361.00,
    "timestamp": "2023-03-06T14:30:00Z",
    "gain_loss": 21.00,
    "gain_loss_percent": 6.18
  }
]
```

### Get Portfolio Performance
```
GET /api/portfolios/{portfolio_id}/performance
```

**Headers:**
```
Authorization: Bearer firebase-id-token-here
```

**Response (200 OK):**
```json
{
  "portfolio_id": "portfolio123",
  "name": "My Tech Portfolio",
  "initial_balance": 10000,
  "current_balance": 10250.75,
  "performance": 2.51,
  "performance_history": [
    {"date": "2023-03-01", "value": 10000},
    {"date": "2023-03-02", "value": 10050},
    {"date": "2023-03-03", "value": 10150},
    {"date": "2023-03-04", "value": 10200},
    {"date": "2023-03-05", "value": 10250.75}
  ],
  "metrics": {
    "total_return": 2.51,
    "annualized_return": 30.12,
    "volatility": 0.8,
    "sharpe_ratio": 1.5
  }
}
```

## Educational Content Endpoints

### Get Stock Terms
```
GET /api/education/terms
```

**Response (200 OK):**
```json
[
  {
    "term": "stock",
    "definition": "A stock (also known as equity) is a security that represents the ownership of a fraction of a corporation.",
    "example": "Buying Apple (AAPL) stock means you own a small piece of Apple Inc."
  },
  {
    "term": "dividend",
    "definition": "A dividend is a distribution of a portion of a company's earnings, decided by the board of directors, to a class of its shareholders.",
    "example": "Apple Inc. pays a quarterly dividend of $0.24 per share to its shareholders."
  }
]
```

### Get Stock Term Definition
```
GET /api/education/terms/{term}
```

**Response (200 OK):**
```json
{
  "term": "stock",
  "definition": "A stock (also known as equity) is a security that represents the ownership of a fraction of a corporation.",
  "example": "Buying Apple (AAPL) stock means you own a small piece of Apple Inc.",
  "related_terms": ["equity", "share", "security"]
}
```

### Get Stock Trading Tips
```
GET /api/education/tips
```

**Response (200 OK):**
```json
[
  {
    "id": "tip1",
    "title": "Diversify Your Portfolio",
    "content": "Don't put all your eggs in one basket. Spread your investments across different sectors and asset classes to reduce risk.",
    "category": "risk-management"
  },
  {
    "id": "tip2",
    "title": "Invest for the Long Term",
    "content": "The stock market can be volatile in the short term, but historically has provided good returns over the long term.",
    "category": "strategy"
  }
]
```

## Error Responses

### 400 Bad Request
```json
{
  "status_code": 400,
  "detail": "Invalid request parameters",
  "errors": {
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "status_code": 401,
  "detail": "Invalid authentication credentials"
}
```

### 403 Forbidden
```json
{
  "status_code": 403,
  "detail": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "status_code": 404,
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status_code": 500,
  "detail": "Internal server error"
}
``` 