# StockSage-AI: AI-Enhanced Stock Trading Simulator

StockSage-AI is an educational web application designed to simulate stock trading with AI-powered insights. The goal is to provide a risk-free environment for students and beginners to learn about stock trading using virtual currency and historical market data and for more advanced traders to test out trading strategies. The platform bridges the gap between theoretical knowledge and practical experience, leveraging AI to enhance learning and decision-making.

## Motivation

StockSage-AI is an educational web application designed to simulate stock trading with AI-powered insights. Our platform aims to solve the following problems:

1. Provide a risk-free environment for students and beginners to learn about stock trading.
2. Bridge the gap between theoretical knowledge and practical experience in stock trading.
3. Offer AI-enhanced insights to help users make informed trading decisions.
4. Allow more experienced traders to test and refine their strategies without financial risk.

By leveraging virtual currency, historical market data, and AI-driven recommendations, StockSage-AI creates a comprehensive learning experience for users at all levels of trading expertise.

## Installation

### Prerequisites
- Python 3.12+
- Node.js 16+
- npm or yarn
- Poetry (for Python dependency management)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install Poetry if you haven't already by following the official installation guide:
   [Install Poetry](https://python-poetry.org/docs/#installation)

3. Install dependencies using Poetry:
   ```
   poetry install
   ```

4. Run the FastAPI server:
   ```
   python -m stocksage_api.main
   ```
   The API will be available at http://localhost:8000
   
   You can verify the server is running by visiting:
   - http://localhost:8000/ - Welcome message
   - http://localhost:8000/api/health - Health status
   - http://localhost:8000/docs - Interactive API documentation

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the frontend directory with the following content:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```
   npm run dev
   ```
   
5. Open your browser and navigate to http://localhost:3000 to see the application

The frontend includes:
- A dark-themed UI for better readability
- Real-time connection to the backend API
- Stock listing with price information
- AI-powered stock recommendations

### API Structure
The frontend communicates with the backend through a typed API client located at `src/lib/api.ts`. This provides:
- Type-safe API calls
- Centralized error handling
- Consistent data fetching patterns

## Contribution

We welcome contributions to StockSage-AI! Here's how you can contribute to our project:

1. **Git Flow**: We use a simplified Git flow process.

2. **Branch Naming Convention**: 
   - Feature branches: `feature/short-description`
   - Bug fix branches: `bugfix/short-description`
   - Hotfix branches: `hotfix/short-description`

3. **Issues**: We use GitHub Issues for tracking tasks, enhancements, and bugs.

4. **Pull Requests**: All contributions should be made via pull requests:
   - Fork the repository
   - Create your feature branch
   - Commit your changes
   - Push to your fork
   - Submit a pull request

5. **Code Review**: All pull requests require review from at least one other team member before merging.

6. **Coding Standards**: (To be added later)
