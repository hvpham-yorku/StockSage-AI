# **Release Planning Meeting Document (RPM.md)**

## **1. Release Goal**
The goal of **Sprint 1** is to deliver the essential onboarding, exploration, and trading setup features that allow new users to begin using StockSage-AI. This includes user authentication, educational content, stock browsing, portfolio creation, and initial trading capabilities.

## **2. Project Scope**
### **Epics / Key Features Targeted in Sprint 1**

#### **User Authentication & Onboarding**
- Users can sign up and log in to StockSage.
- Users can explore StockSage before signing up.

#### **Stock Exploration **
- Users can check stock prices for specific stocks.
- Users can view company descriptions to understand their business.

#### **Portfolio & Trading Management**
- Users can create a portfolio with a start date.
- Users can buy stocks within a portfolio.
- Users can track their transaction history.
- Users can monitor portfolio performance (gains/losses).

## **3. Participants**
### **Development Team**
- **Backend Developer(s):** Akshat Joshi, Wilson Qiu
- **Frontend Developer(s):** James Paul, Somin Park

## **4. Sprint 1 User Stories**
- **As John, I want to sign up to StockSage to get started on my stock trading journey.**
- **As Mary, I want to see what StockSage is about to decide whether to sign up.**
- **As a new user, I want to be able to see a company's description to have an idea of what the company does.**
- **As a new user, I want to check the stock price of a specific stock to see its current value.**
- **As a new StockSage user, I want to add a portfolio to my account with a given start date to start adding stocks on StockSage.**
- **As a new StockSage user, I want to buy stocks in a certain portfolio to see how they perform in the future.**
- **As someone with trades on StockSage, I want to be able to see my transaction history for my portfolio.**
- **As a StockSage user, I want to view my portfolio’s gains/losses to assess my trading success.**

## **5. Backend Implementation Plan**
- **Day 1:** Firebase setup and authentication endpoints
- **Day 2:** Stock data integration
- **Day 3:** Portfolio management endpoints
- **Day 4:** Trading functionality (buy/sell stocks, transaction tracking)
- **Day 5:** Testing

## **6. Frontend Implementation Plan**
- **Day 1:** Project setup, landing page, and Firebase authentication integration
- **Day 2:** Dashboard and stock search implementation
- **Day 3:** Portfolio creation and management
- **Day 4:** Trading interface and transaction history
- **Day 5:** Testing

## **7. Risks & Mitigation Strategies**
| **Potential Risk**                          | **Mitigation Strategy**                                 |
|---------------------------------------------|------------------------------------------------------|
| API rate limits for stock price retrieval  | Implement caching and API request throttling        |
| Authentication failures with Firebase      | Ensure proper token management and error handling  |
| UI responsiveness issues                   | Regular UI testing across multiple screen sizes    |
| Database inconsistencies                    | Implement automated tests and data validation      |
| Scope creep affecting timeline              | Prioritize MVP features and defer additional features to future sprints |

## **8. Success Criteria**
Sprint 1 will be considered successful if the following are achieved:
- New users can sign up and access their profile.
- Stock prices and company information are accessible.
- Users can create a portfolio and execute basic trades.
- Users can view transaction history and performance summaries.

