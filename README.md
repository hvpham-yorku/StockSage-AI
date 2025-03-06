# StockSage-AI: AI-Enhanced Stock Trading Simulator

StockSage-AI is an educational web application designed to simulate stock trading with AI-powered insights. The goal is to provide a risk-free environment for students and beginners to learn about stock trading using virtual currency and historical market data and for more advanced traders to test out trading strategies. The platform bridges the gap between theoretical knowledge and practical experience, leveraging AI to enhance learning and decision-making.

## Motivation

StockSage-AI is an educational web application designed to simulate stock trading with AI-powered insights. Our platform aims to solve the following problems:

1. Provide a risk-free environment for students and beginners to learn about stock trading.
2. Bridge the gap between theoretical knowledge and practical experience in stock trading.
3. Offer AI-enhanced insights to help users make informed trading decisions.
4. Allow more experienced traders to test and refine their strategies without financial risk.

By leveraging virtual currency, historical market data, and AI-driven recommendations, StockSage-AI creates a comprehensive learning experience for users at all levels of trading expertise.

## Documentation

- [Backend Documentation](backend/README.md) - Setup and API documentation for the FastAPI backend
- [Frontend Documentation](frontend/README.md) - Setup and component documentation for the Next.js frontend

## Installation

### Prerequisites
- Python 3.12+
- Node.js 16+
- npm or yarn
- Poetry (for Python dependency management)
- Firebase project with Realtime Database

### Backend Setup

#### Option 1: Using Poetry (Recommended)

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

4. Set up environment variables:
   Create a `.env` file in the backend directory with your Firebase configuration.

5. Run the FastAPI server:
   ```
   poetry run uvicorn stocksage_api.main:app --reload
   ```

#### Option 2: Using virtualenv

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```
     .\.venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source .venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   Create a `.env` file in the backend directory with your Firebase configuration.

6. Run the FastAPI server:
   ```
   python -m uvicorn stocksage_api.main:app --reload
   ```

The API will be available at http://localhost:8000
   
You can verify the server is running by visiting:
- http://localhost:8000/ - Welcome message
- http://localhost:8000/api/health - Health status
- http://localhost:8000/firebase/test - Firebase connection test
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

3. Run the development server:
   ```
   npm run dev
   ```
   
4. Open your browser and navigate to http://localhost:3000 to see the application

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

### Database
The application uses Firebase Realtime Database for data storage, providing:
- Real-time data synchronization
- User authentication (planned)
- Persistent storage of user portfolios and transactions

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
