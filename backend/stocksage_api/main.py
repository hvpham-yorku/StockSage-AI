from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random
from .routes import firebase_test  # Import the new route

app = FastAPI(
    title="StockSage API",
    description="FastAPI backend for StockSage-AI stock trading simulator",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for demonstration
mock_stocks = [
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 175.34, "change": 2.34},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 328.79, "change": -1.23},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 142.56, "change": 0.78},
    {"symbol": "AMZN", "name": "Amazon.com, Inc.", "price": 178.12, "change": 3.45},
    {"symbol": "TSLA", "name": "Tesla, Inc.", "price": 193.57, "change": -2.67},
]

# Include routers
app.include_router(firebase_test.router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to StockSage API"}

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Get all available stocks
@app.get("/api/stocks", response_model=List[Dict[str, Any]])
async def get_stocks():
    return mock_stocks

# Get a specific stock by symbol
@app.get("/api/stocks/{symbol}", response_model=Dict[str, Any])
async def get_stock(symbol: str):
    for stock in mock_stocks:
        if stock["symbol"] == symbol.upper():
            return stock
    raise HTTPException(status_code=404, detail=f"Stock with symbol {symbol} not found")

# Get historical data for a stock
@app.get("/api/stocks/{symbol}/history", response_model=List[Dict[str, Any]])
async def get_stock_history(symbol: str, days: int = 30):
    # Check if stock exists
    stock_exists = False
    current_price = 0
    for stock in mock_stocks:
        if stock["symbol"] == symbol.upper():
            stock_exists = True
            current_price = stock["price"]
            break
    
    if not stock_exists:
        raise HTTPException(status_code=404, detail=f"Stock with symbol {symbol} not found")
    
    # Generate mock historical data
    history = []
    today = datetime.now()
    
    for i in range(days, 0, -1):
        date = today - timedelta(days=i)
        # Generate a random price within a reasonable range of the current price
        price_change = random.uniform(-5, 5)
        price = max(0.01, current_price + price_change * (i / days))
        
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "price": round(price, 2),
            "volume": random.randint(1000000, 10000000)
        })
    
    return history

# Get AI recommendation for a stock
@app.get("/api/stocks/{symbol}/recommendation")
async def get_stock_recommendation(symbol: str):
    # Check if stock exists
    stock_exists = False
    for stock in mock_stocks:
        if stock["symbol"] == symbol.upper():
            stock_exists = True
            current_stock = stock
            break
    
    if not stock_exists:
        raise HTTPException(status_code=404, detail=f"Stock with symbol {symbol} not found")
    
    # Generate a mock recommendation
    sentiment = random.choice(["Buy", "Hold", "Sell"])
    confidence = random.uniform(0.6, 0.95)
    
    return {
        "symbol": symbol.upper(),
        "name": current_stock["name"],
        "recommendation": sentiment,
        "confidence": round(confidence, 2),
        "analysis": f"Based on recent market trends and company performance, our AI model recommends a {sentiment} position for {current_stock['name']} with {round(confidence*100)}% confidence."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("stocksage_api.main:app", host="0.0.0.0", port=8000, reload=True)