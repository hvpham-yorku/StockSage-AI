# **Sprint 1 Plan: StockSage-AI**

## **1. Sprint Goal**
The goal of Sprint 1 is to establish the foundation for StockSage-AI, enabling user authentication, stock exploration, portfolio management, and basic educational features. This sprint will focus on implementing the core backend APIs and frontend functionalities to allow users to sign up, explore stocks, and start managing their portfolios.

## **2. Sprint Scope**
### **User Stories to Complete**
1. **As John**, I want to sign up to StockSage to get started on my stock trading journey.
2. **As Mary**, I want to see what StockSage is about to decide whether to sign up.
3. **As a new user**, I want to be able to get basic tips on stock terms.
4. **As a new user**, I want to be able to see a company's description to have an idea of what the company does.
5. **As a new user**, I want to check the stock price of a specific stock to see its current value.
6. **As a new StockSage user**, I want to add a portfolio to my account with a given start date to start adding stocks on StockSage.
7. **As a new StockSage user**, I want to buy stocks in a certain portfolio to see how they perform in the future.
8. **As someone with trades on StockSage**, I want to be able to see my transaction history for my portfolio.
9. **As a StockSage user**, I want to view my portfolio’s gains/losses to assess my trading success.

## **3. Backend API Implementation for Sprint 1**
#### **Authentication**
- **POST** `/api/auth/register` - Register new user
- **GET** `/api/auth/profile` - Get user profile
- **PUT** `/api/auth/profile` - Update user profile
- **DELETE** `/api/auth/profile` - Delete user profile
- **GET** `/api/auth/verify` - Verify auth token

#### **Stocks & Market Data**
- **GET** `/api/stocks` - Get popular stocks
- **GET** `/api/stocks/search` - Search for stocks
- **GET** `/api/stocks/{symbol}` - Get detailed stock information
- **GET** `/api/stocks/{symbol}/history` - Get stock price history
- **GET** `/api/stocks/{symbol}/company-info` - Get company information
- **GET** `/api/stocks/{symbol}/recommendation` - Get stock recommendation

#### **Education**
- **GET** `/api/education/terms` - Get stock terms
- **GET** `/api/education/terms/{term}` - Get specific stock term
- **GET** `/api/education/tips` - Get trading tips

#### **Firebase Connection & Health Check**
- **GET** `/firebase/test` - Test Firebase connection
- **GET** `/api/health` - Health check

## **4. Frontend Implementation Plan for Sprint 1**
### **Pages to Implement**
1. **Landing Page (`/`)** - Introduces StockSage and encourages sign-ups
2. **Signup Page (`/auth/signup`)** - Allows users to register via Firebase Authentication
3. **Login Page (`/auth/login`)** - Enables users to log in and access features
4. **Dashboard (`/dashboard`)** - Provides an overview of stock and portfolio activities
5. **Stock Search (`/stocks`)** - Allows users to search for and explore stocks
6. **Stock Details (`/stocks/{symbol}`)** - Displays stock price history, recommendations, and company info
7. **Portfolio Management (`/portfolios`)** - Enables users to create and manage portfolios
8. **Trade Execution (`/portfolios/{id}/trade`)** - Allows users to buy/sell stocks
9. **Transaction History (`/portfolios/{id}/transactions`)** - Displays users' trading history
10. **Educational Pages (`/education`)** - Provides stock trading tips and a glossary

## **5. Risks & Mitigation Strategies**
| **Risk**                                       | **Mitigation Strategy**                              |
|-----------------------------------------------|---------------------------------------------------|
| Firebase authentication issues               | Thorough testing and proper error handling       |
| API rate limits for stock data               | Implement caching and optimize API requests      |
| Inconsistent UI/UX between pages             | Use reusable components and Tailwind CSS         |
| Delayed backend API readiness                | Ensure backend APIs are developed in parallel    |
| Portfolio transaction errors                 | Implement transaction validation and logging     |

## **6. Sprint Timeline & Deliverables**
| **Milestone**                        | **Timeline** |
|--------------------------------------|-------------|
| Authentication (Signup/Login)       | Day 1      |
| Stock search and stock details      | Day 2      |
| Portfolio creation and management   | Day 3      |
| Buy/Sell transactions & history     | Day 4      |
| Educational pages & testing         | Day 5      |

## **7. Success Criteria**
- Users can sign up, log in, and manage their profiles
- Stocks can be searched and viewed with company details and price history
- Users can create portfolios and add stocks to them
- Buy/sell functionality is working with transaction history
- Educational resources are accessible from the frontend
- Backend APIs are fully integrated with the frontend
