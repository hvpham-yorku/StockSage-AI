# StockSage-AI Backend Implementation Plan

## Overview
This document outlines the implementation plan for the StockSage-AI backend API. The backend will be built using FastAPI and Firebase for database storage. The plan is designed for a team of 2 developers to complete within 5 days.

## Technology Stack
- **Framework**: FastAPI
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Authentication
- **Stock Data**: Alpha Vantage API or Yahoo Finance API (via yfinance)

## Day 1: Setup and Authentication

### Tasks
1. **Setup Firebase Integration**
   - Configure Firebase Admin SDK for token verification and administrative operations
   - Configure Pyrebase for real-time database operations
   - Implement Firebase token verification middleware
   - Create user profile storage in Firebase Realtime Database
   - Set up Firebase configuration for authentication

2. **Create Authentication Endpoints**
   - Implement middleware to verify Firebase tokens on protected routes
   - Create endpoint to fetch user profile data
   - Set up endpoint to initialize and update user profile
   - Implement token verification utility functions

### API Endpoints to Implement
```
GET /api/auth/profile
PUT /api/auth/profile
```

### Authentication Implementation Notes
- Backend will NOT handle user registration, login, or password reset - these are handled by Firebase Authentication on the frontend
- Backend will only verify tokens and manage user profiles
- Backend will create user profiles in Firebase Realtime Database after receiving verification that a new user has registered
- All protected endpoints will verify Firebase ID tokens via middleware
- Token verification will be handled automatically for each protected route, not as a separate API call
- Will use Firebase Admin SDK for token verification and user management
- Will use Pyrebase for real-time database operations

## Day 2: Stock Data Integration

### Tasks
1. **Integrate Stock Data API**
   - Set up Alpha Vantage or Yahoo Finance API client
   - Implement stock search functionality
   - Implement stock details retrieval
   - Create caching mechanism for frequently accessed stocks

2. **Create Stock Information Endpoints**
   - Implement endpoint to get stock details
   - Implement endpoint to get stock price history
   - Implement endpoint to search for stocks
   - Create endpoint for company descriptions

### API Endpoints to Implement
```
GET /api/stocks/search?query={query}
GET /api/stocks/{symbol}
GET /api/stocks/{symbol}/history?days={days}
GET /api/stocks/{symbol}/company-info
```

## Day 3: Portfolio Management

### Tasks
1. **Create Portfolio Model**
   - Define portfolio schema
   - Implement portfolio creation
   - Implement portfolio listing
   - Implement portfolio details retrieval

2. **Implement Portfolio Endpoints**
   - Create endpoint to create a new portfolio
   - Create endpoint to list user portfolios
   - Create endpoint to get portfolio details
   - Implement portfolio comparison functionality

### API Endpoints to Implement
```
POST /api/portfolios
GET /api/portfolios
GET /api/portfolios/{portfolio_id}
GET /api/portfolios/compare?ids={portfolio_ids}
```

## Day 4: Trading Functionality

### Tasks
1. **Implement Trading Logic**
   - Create transaction model
   - Implement buy stock functionality
   - Implement sell stock functionality
   - Calculate portfolio performance

2. **Create Trading Endpoints**
   - Implement endpoint to buy stocks
   - Implement endpoint to sell stocks
   - Create endpoint to view transaction history
   - Create endpoint to calculate gains/losses

### API Endpoints to Implement
```
POST /api/portfolios/{portfolio_id}/buy
POST /api/portfolios/{portfolio_id}/sell
GET /api/portfolios/{portfolio_id}/transactions
GET /api/portfolios/{portfolio_id}/performance
```

## Day 5: Educational Content and Testing

### Tasks
1. **Implement Educational Content**
   - Create stock terms glossary
   - Implement endpoint to get stock term definitions
   - Add basic stock trading tips

2. **Testing and Documentation**
   - Write comprehensive API documentation
   - Test all endpoints
   - Fix bugs and edge cases
   - Ensure proper error handling

### API Endpoints to Implement
```
GET /api/education/terms
GET /api/education/terms/{term}
GET /api/education/tips
```

## API Schema

### User
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "created_at": "timestamp"
}
```

### Portfolio
```json
{
  "id": "string",
  "user_id": "string",
  "name": "string",
  "start_date": "date",
  "initial_balance": "number",
  "current_balance": "number",
  "created_at": "timestamp"
}
```

### Stock Position
```json
{
  "portfolio_id": "string",
  "symbol": "string",
  "quantity": "number",
  "average_buy_price": "number",
  "current_price": "number"
}
```

### Transaction
```json
{
  "id": "string",
  "portfolio_id": "string",
  "symbol": "string",
  "type": "buy|sell",
  "quantity": "number",
  "price": "number",
  "timestamp": "timestamp"
}
```

### Stock
```json
{
  "symbol": "string",
  "name": "string",
  "price": "number",
  "change": "number",
  "company_description": "string"
}
```

## Firebase Database Structure
```
/users/{user_id}
  - email
  - name
  - created_at

/portfolios/{portfolio_id}
  - user_id
  - name
  - start_date
  - initial_balance
  - current_balance
  - created_at

/positions/{portfolio_id}/{symbol}
  - quantity
  - average_buy_price
  - current_price

/transactions/{portfolio_id}/{transaction_id}
  - symbol
  - type
  - quantity
  - price
  - timestamp

/stock_terms/{term}
  - definition
  - example
```

## Implementation Notes
1. Use both Firebase Admin SDK and Pyrebase for different purposes:
   - Firebase Admin SDK: Authentication, token verification, user management
   - Pyrebase: Real-time database operations, data streaming
2. Implement proper error handling for all endpoints
3. Use dependency injection for services
4. Cache frequently accessed stock data to reduce API calls
5. Implement proper authentication middleware for protected endpoints
6. Use async/await for all database and API operations
7. Follow RESTful API design principles 

## Firebase Authentication Integration

### Firebase Admin SDK Setup
```python
# services/firebase_auth.py
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Initialize Firebase Admin with service account
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Firebase ID token and return user_id"""
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {str(e)}"
        )

async def get_user_id(decoded_token: dict = Depends(get_current_user)):
    """Extract user_id from decoded token"""
    return decoded_token.get("uid")
```

### Protected Route Example
```python
# routes/portfolios.py
from fastapi import APIRouter, Depends
from ..services.firebase_auth import get_user_id

router = APIRouter(prefix="/api/portfolios", tags=["portfolios"])

@router.get("/")
async def get_user_portfolios(user_id: str = Depends(get_user_id)):
    """Get all portfolios for the authenticated user"""
    # Use user_id to fetch portfolios from Firebase
    # ...
    return portfolios
```

### Firebase Authentication Flow
1. User authenticates in the frontend using Firebase Authentication
2. Frontend obtains ID token from Firebase
3. Frontend includes ID token in Authorization header for API requests
4. Backend verifies token using Firebase Admin SDK
5. Backend extracts user ID from verified token 
6. Backend creates user profile in database if it's a new user
7. Backend uses user ID to fetch/modify user-specific data 