from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

router = APIRouter(
    prefix="/api/education",
    tags=["education"],
    responses={
        404: {"description": "Educational content not found"}
    }
)

# Mock educational content
stock_terms = [
    {
        "term": "stock",
        "definition": "A stock (also known as equity) is a security that represents the ownership of a fraction of a corporation.",
        "example": "Buying Apple (AAPL) stock means you own a small piece of Apple Inc."
    },
    {
        "term": "dividend",
        "definition": "A dividend is a distribution of a portion of a company's earnings, decided by the board of directors, to a class of its shareholders.",
        "example": "Apple Inc. pays a quarterly dividend of $0.24 per share to its shareholders."
    },
    {
        "term": "market cap",
        "definition": "Market capitalization is the total value of a company's outstanding shares of stock, calculated by multiplying the stock's price by the total number of shares outstanding.",
        "example": "With a stock price of $175 and about 16 billion shares, Apple has a market cap of approximately $2.8 trillion."
    },
    {
        "term": "bull market",
        "definition": "A bull market is a period of time in financial markets when the price of an asset or security rises continuously by 20% or more.",
        "example": "The stock market was in a bull market from 2009 to 2020, with stock prices rising steadily over that period."
    },
    {
        "term": "bear market",
        "definition": "A bear market is when a market experiences prolonged price declines, typically by 20% or more from recent highs.",
        "example": "The stock market entered a bear market in March 2020 when COVID-19 caused stock prices to drop more than 30%."
    },
    {
        "term": "volatility",
        "definition": "Volatility is a statistical measure of the dispersion of returns for a given security or market index, indicating how much the price fluctuates over time.",
        "example": "Technology stocks often have higher volatility than utility stocks, meaning their prices tend to move up and down more dramatically."
    },
    {
        "term": "P/E ratio",
        "definition": "The price-to-earnings ratio (P/E ratio) is the ratio of a company's share price to its earnings per share, used to evaluate if a stock is overvalued or undervalued.",
        "example": "A company with a stock price of $100 and earnings of $5 per share has a P/E ratio of 20."
    }
]

trading_tips = [
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
    },
    {
        "id": "tip3",
        "title": "Understand What You're Buying",
        "content": "Before investing in a company, research its business model, financial health, and growth prospects.",
        "category": "research"
    },
    {
        "id": "tip4",
        "title": "Start Small and Consistent",
        "content": "Begin with small investments and gradually increase your portfolio size as you gain experience and confidence.",
        "category": "beginner"
    },
    {
        "id": "tip5",
        "title": "Use Dollar-Cost Averaging",
        "content": "Invest a fixed amount at regular intervals regardless of market conditions to smooth out the impact of volatility.",
        "category": "strategy"
    }
]

@router.get("/terms", response_model=List[Dict[str, Any]])
async def get_stock_terms():
    """Get a list of stock market terms and definitions"""
    return stock_terms

@router.get("/terms/{term}", response_model=Dict[str, Any])
async def get_stock_term(term: str):
    """Get definition for a specific stock market term"""
    for stock_term in stock_terms:
        if stock_term["term"].lower() == term.lower():
            # Add related terms
            related = []
            if term.lower() == "stock":
                related = ["equity", "share", "security"]
            elif term.lower() == "dividend":
                related = ["yield", "payout ratio", "ex-dividend date"]
            elif term.lower() == "market cap":
                related = ["valuation", "enterprise value", "large cap", "small cap"]
            elif term.lower() in ["bull market", "bear market"]:
                related = ["market trend", "correction", "rally"]
            
            return {
                **stock_term,
                "related_terms": related
            }
    
    raise HTTPException(status_code=404, detail=f"Term '{term}' not found")

@router.get("/tips", response_model=List[Dict[str, Any]])
async def get_trading_tips():
    """Get stock trading tips for beginners"""
    return trading_tips
