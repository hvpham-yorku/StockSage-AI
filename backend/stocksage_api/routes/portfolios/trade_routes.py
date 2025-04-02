from fastapi import APIRouter, HTTPException, Depends, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from ...services.firebase_service import firebase_service
from ...services.portfolios.portfolio_service import PortfolioService
from ...routes.auth import get_current_user

# Create router (without prefix, prefix is set in __init__.py)
router = APIRouter()

# Create portfolio service instance
portfolio_service = PortfolioService()

# Security scheme
security = HTTPBearer(
    scheme_name="Bearer Authentication",
    description="Enter your Firebase ID token",
    auto_error=True,
)


# Models
class TradeRequest(BaseModel):
    """Model for buy/sell stock request"""

    symbol: str = Field(..., description="Stock symbol")
    quantity: float = Field(..., gt=0, description="Quantity to buy/sell")
    price: Optional[float] = Field(
        None,
        gt=0,
        description="Price per share (optional, will use historical data for simulation date if not provided)",
    )


class Transaction(BaseModel):
    """Model for a transaction"""

    id: str
    portfolio_id: str
    symbol: str
    name: str
    type: str
    quantity: float
    price: float
    total: float
    trade_date: str
    timestamp: str
    new_balance: float
    gain_loss: Optional[float] = None
    gain_loss_percent: Optional[float] = None


# Routes
@router.post(
    "/{portfolio_id}/buy",
    status_code=status.HTTP_201_CREATED,
    response_model=Transaction,
    summary="Buy stock",
    description="""
    Buy a stock for the specified portfolio using the historical price for the current simulation date.
    
    Required parameters:
    - **symbol**: The stock symbol to buy (e.g., AAPL, MSFT, GOOGL)
    - **quantity**: Number of shares to buy (must be positive)
    
    Optional parameters:
    - **price**: Price per share (if not provided, the API will use the historical price for the current simulation date)
    
    The transaction will:
    1. Check if sufficient funds are available
    2. Look up the stock price for the current simulation date
    3. Execute the trade and update portfolio holdings
    4. Record the transaction in the portfolio history
    
    Returns the created transaction with all details including the executed price.
    """
)
async def buy_stock(
    portfolio_id: str,
    trade_request: TradeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Buy stock for a portfolio"""
    try:
        user_id = current_user.get("uid")

        # Verify portfolio exists and belongs to user
        try:
            portfolio_data = portfolio_service.validate_user_portfolio_access(portfolio_id, user_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND if "not found" in str(e) else status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )

        # Execute buy trade
        transaction = portfolio_service.execute_trade(
            portfolio_id=portfolio_id,
            trade_data=trade_request.model_dump(),
            trade_type="buy",
        )
        
        # Update stock history for the purchased symbol
        current_date = portfolio_data.get("current_date")
        symbol = trade_request.symbol.upper()
        price = transaction.get("price", 0)
        
        if current_date and price > 0:
            # Add to stock history in Firebase
            stock_history_path = f"portfolios/{portfolio_id}/stock_history/{symbol}"
            stock_history = firebase_service.get_data(stock_history_path) or {}
            
            # Only add if date doesn't already exist in history
            if current_date not in stock_history:
                stock_history[current_date] = price
                firebase_service.set_data(stock_history_path, stock_history)

        return transaction

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to buy stock: {str(e)}",
        )


@router.post(
    "/{portfolio_id}/sell",
    status_code=status.HTTP_201_CREATED,
    response_model=Transaction,
    summary="Sell stock",
    description="""
    Sell a stock from the specified portfolio using the historical price for the current simulation date.
    
    Required parameters:
    - **symbol**: The stock symbol to sell (e.g., AAPL, MSFT, GOOGL)
    - **quantity**: Number of shares to sell (must be positive and not exceed owned quantity)
    
    Optional parameters:
    - **price**: Price per share (if not provided, the API will use the historical price for the current simulation date)
    
    The transaction will:
    1. Verify you own sufficient shares of the stock
    2. Look up the stock price for the current simulation date
    3. Execute the sale and update portfolio holdings
    4. Calculate gain/loss based on average purchase price
    5. Record the transaction in the portfolio history
    
    Returns the created transaction with all details including gain/loss metrics.
    """
)
async def sell_stock(
    portfolio_id: str,
    trade_request: TradeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Sell stock from a portfolio"""
    try:
        user_id = current_user.get("uid")

        # Verify portfolio exists and belongs to user
        try:
            portfolio_data = portfolio_service.validate_user_portfolio_access(portfolio_id, user_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND if "not found" in str(e) else status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )

        # Execute sell trade
        transaction = portfolio_service.execute_trade(
            portfolio_id=portfolio_id,
            trade_data=trade_request.model_dump(),
            trade_type="sell",
        )
        
        # Update stock history for the sold symbol
        current_date = portfolio_data.get("current_date")
        symbol = trade_request.symbol.upper()
        price = transaction.get("price", 0)
        
        if current_date and price > 0:
            # Add to stock history in Firebase
            stock_history_path = f"portfolios/{portfolio_id}/stock_history/{symbol}"
            stock_history = firebase_service.get_data(stock_history_path) or {}
            
            # Only add if date doesn't already exist in history
            if current_date not in stock_history:
                stock_history[current_date] = price
                firebase_service.set_data(stock_history_path, stock_history)

        return transaction

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sell stock: {str(e)}",
        )


@router.get(
    "/{portfolio_id}/transactions",
    response_model=List[Transaction],
    summary="Get transaction history",
    description="""
    Retrieve complete transaction history for a specific portfolio.
    
    Returns a chronological list of all trades (buys and sells) for the portfolio, with the most recent transactions first.
    Each transaction includes:
    - Transaction ID
    - Stock symbol and name
    - Transaction type (buy/sell)
    - Quantity and price
    - Total transaction value
    - Transaction date and timestamp
    - New portfolio balance after the transaction
    - For sell transactions: realized gain/loss and gain/loss percentage
    
    This provides a complete audit trail of all portfolio activity.
    """
)
async def get_transaction_history(
    portfolio_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get transaction history for a portfolio"""
    try:
        user_id = current_user.get("uid")

        # Verify portfolio exists and belongs to user
        try:
            portfolio_service.validate_user_portfolio_access(portfolio_id, user_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND if "not found" in str(e) else status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )

        # Get transactions
        transactions = portfolio_service.get_portfolio_transactions(portfolio_id)

        return transactions

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve transaction history: {str(e)}",
        )
