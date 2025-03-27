# **Release Planning Meeting Document (RPM.md)**

## **1. Release Goal**
The goal of this release is to build and deploy **StockSage-AI**, a full-stack web application that allows users to explore stocks, learn about trading, and simulate portfolio performance. This includes all functionality needed from onboarding to educational insights, portfolio creation, and transaction history.

## **2. Project Scope**

### **Epics / Key Features**

#### **User Authentication & Onboarding**
- User registration, login, logout, password reset
- Firebase Authentication integration
- Onboarding UI/UX flow for new users

#### **Stock Exploration & AI Recommendations**
- Search for stocks by name or symbol
- View stock details and price history
- Company descriptions
- AI-generated buy/sell/hold recommendations

#### **Portfolio Management**
- Create portfolios with a start date and initial balance
- View, update, and delete portfolios
- Compare performance across multiple portfolios

#### **Trading Functionality**
- Buy/sell stocks inside a portfolio
- View transaction history
- Display gains/losses and performance metrics

#### **Educational Resources**
- Glossary of stock trading terms
- Tips for new users
- Learning hub for stock market fundamentals

#### **Dashboard & UI Features**
- Responsive dashboard layout
- Mobile support and dark mode
- Chart visualizations of stock and portfolio data

## **3. Participants**
### **Development Team**
- **Backend Developer(s):** Akshat Joshi, Wilson Qiu
- **Frontend Developer(s):** James Paul, Somin Park


## **4. Implementation Plan**

### **Backend Plan (5 Tasks)**
- **Task 1:** Firebase setup, token verification, and authentication endpoints
- **Task 2:** Stock data integration (search, details, history, company info)
- **Task 3:** Portfolio creation and management endpoints
- **Task 4:** Trading endpoints for buy/sell, transaction tracking, performance
- **Task 5:** Educational endpoints and final testing

### **Frontend Plan (5 Tasks)**
- **Task 1:** Project setup, Firebase Auth, Landing/Auth pages
- **Task 2:** Dashboard layout, stock search, stock details
- **Task 3:** Portfolio creation, listing, and details page
- **Task 4:** Trading interface and transaction history
- **Task 5:** Education pages, comparison view, and polish

## **5. Risks & Mitigation Strategies**
| **Potential Risk**                          | **Mitigation Strategy**                                 |
|---------------------------------------------|------------------------------------------------------|
| API rate limits for stock price retrieval  | Implement caching and API request throttling        |
| Authentication failures with Firebase      | Ensure proper token management and error handling  |
| UI responsiveness issues                   | Regular UI testing across multiple screen sizes    |
| Database inconsistencies                   | Implement automated tests and data validation      |
| Scope creep affecting timeline             | Prioritize MVP features and defer additional features to future sprints |

## **6. Success Criteria**
The project will be considered successful if:
- Users can register and log in with Firebase
- Stocks can be searched and viewed with price history and recommendations
- Users can create and manage portfolios
- Trading and transaction history functionality is complete
- Educational resources are accessible and well-integrated
- Frontend is responsive and styled with dark/light themes

## **7. Timeline and Milestones**
| **Milestone**                         | **Timeline**     |
|--------------------------------------|------------------|
| Authentication working (frontend/backend) | Sprint 1           |
| Stock search and details              | Sprint 1           |
| Portfolio creation and listing        | Sprint 1, 2           |
| Buy/sell stock + transaction view     | Sprint 2           |
| Education and final bug fixes         | Sprint 2           |



