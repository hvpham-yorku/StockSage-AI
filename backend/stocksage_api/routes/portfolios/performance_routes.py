from fastapi import APIRouter, HTTPException, Depends, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, Any, List
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
class PerformancePoint(BaseModel):
    """Model for a single point in performance history"""

    date: str
    value: float


class PortfolioPerformance(BaseModel):
    """Model for portfolio performance"""

    portfolio_id: str
    name: str
    initial_balance: float
    current_balance: float
    performance: float
    performance_history: List[PerformancePoint]
    metrics: Dict[str, float]


# Routes
@router.get(
    "/{portfolio_id}/performance",
    response_model=PortfolioPerformance,
    summary="Get portfolio performance",
    description="""
    Retrieve detailed performance metrics for a specific portfolio.
    
    This endpoint provides comprehensive performance analysis including:
    
    1. **Basic Metrics**:
       - Total return (percentage)
       - Current portfolio value
       - Performance vs. starting value
       
    2. **Advanced Metrics**:
       - Annualized return rate
       - Portfolio volatility
       - Sharpe ratio (risk-adjusted return)
       - Maximum drawdown (largest portfolio decline)
       
    3. **Performance History**:
       - Time series of portfolio values over the simulation timeframe
       - Data points for each date in the simulation
       
    The returned metrics are calculated as of the portfolio's current simulation date.
    Before calculations, all stock prices are updated to their values on that date,
    ensuring accuracy of the performance data.
    
    This data can be used to generate performance charts, compare against benchmarks,
    and analyze risk/return characteristics of the portfolio.
    """
)
async def get_portfolio_performance(
    portfolio_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get detailed performance metrics for a portfolio"""
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

        # Update portfolio prices to ensure metrics are based on current simulation date
        portfolio_service.update_portfolio_prices(portfolio_data)

        # Calculate performance metrics
        performance_data = portfolio_service.calculate_portfolio_metrics(portfolio_data)

        # Save updated portfolio
        portfolio_service.update_portfolio(portfolio_id, portfolio_data)

        return performance_data

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve portfolio performance: {str(e)}",
        )
