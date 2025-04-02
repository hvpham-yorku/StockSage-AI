from fastapi import APIRouter, HTTPException, Depends, Security, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
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
class PortfolioCreate(BaseModel):
    """Model for creating a new portfolio"""

    name: str = Field(..., description="Portfolio name")
    start_date: str = Field(
        ..., description="Start date for portfolio simulation in YYYY-MM-DD format"
    )
    initial_balance: float = Field(
        ..., gt=0, description="Initial balance for portfolio in USD"
    )
    simulation_speed: Optional[int] = Field(
        1, description="Simulation speed (1 second = X trading days)"
    )


class PortfolioSummary(BaseModel):
    """Model for portfolio summary"""

    id: str
    name: str
    start_date: str
    initial_balance: float
    current_balance: float
    performance: float
    current_date: Optional[str] = None
    is_active: Optional[bool] = False


class StockHolding(BaseModel):
    """Model for stock holdings in a portfolio"""

    symbol: str
    name: str
    quantity: float
    average_buy_price: float
    current_price: float
    value: float
    gain_loss: float
    gain_loss_percent: float


class PortfolioDetail(BaseModel):
    """Model for portfolio details"""

    id: str
    user_id: str
    name: str
    start_date: str
    initial_balance: float
    current_balance: float
    cash_balance: float
    performance: float
    holdings: List[StockHolding]
    created_at: str
    current_date: Optional[str] = None
    is_active: Optional[bool] = False
    simulation_speed: Optional[int] = 1


class PortfolioComparison(BaseModel):
    """Model for portfolio comparison"""

    portfolios: List[Dict[str, Any]]
    comparison_metrics: Dict[str, List[float]]


class StreamConfig(BaseModel):
    """Model for configuring real-time Firebase streaming for portfolio updates"""
    
    enabled: bool = Field(..., description="Whether to enable real-time updates")
    include_holdings: bool = Field(True, description="Whether to include holdings updates")
    include_transactions: bool = Field(False, description="Whether to include transaction updates")
    include_performance: bool = Field(True, description="Whether to include performance history updates")


# Routes
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=PortfolioDetail,
    summary="Create portfolio",
    description="""
    Create a new virtual trading portfolio with initial settings.
    
    - **name**: Name of the portfolio (required)
    - **start_date**: Starting date for the portfolio simulation (YYYY-MM-DD)
    - **initial_balance**: Initial cash balance for the portfolio
    
    The API will create a portfolio with the specified parameters and set the current date to the start date.
    By default, the simulation will be inactive until explicitly started through the simulation endpoint.
    """
)
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new portfolio for the authenticated user"""
    try:
        user_id = current_user.get("uid")

        # Validate date format
        if not portfolio_service.validate_date_string(portfolio_data.start_date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Please use YYYY-MM-DD format.",
            )
        
        if not portfolio_data.name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Portfolio must have a name",
            )

        # Create portfolio
        portfolio = portfolio_service.create_portfolio(
            user_id=user_id, portfolio_data=portfolio_data.model_dump()
        )

        return portfolio

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create portfolio: {str(e)}",
        )


@router.get(
    "/",
    response_model=List[PortfolioSummary],
    summary="Get user portfolios",
    description="""
    Retrieve all portfolios for the authenticated user.
    
    Returns a list of portfolio summaries containing basic information:
    - Portfolio ID
    - Name
    - Start date
    - Initial balance
    - Current balance
    - Performance metrics
    
    For detailed information about a specific portfolio, use the GET portfolio/{portfolio_id} endpoint.
    """
)
async def get_user_portfolios(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all portfolios for the authenticated user"""
    try:
        user_id = current_user.get("uid")

        # Get portfolios
        portfolios = portfolio_service.get_user_portfolios(user_id)

        return portfolios

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve portfolios: {str(e)}",
        )


@router.get(
    "/{portfolio_id}",
    response_model=PortfolioDetail,
    summary="Get portfolio details",
    description="""
    Retrieve detailed information about a specific portfolio.
    
    Returns comprehensive portfolio data including:
    - Portfolio metadata (name, dates, balances)
    - Current holdings with real-time pricing
    - Performance metrics
    - Simulation state
    
    This endpoint will automatically update stock prices based on the current simulation date
    before returning the data, ensuring you have the most up-to-date portfolio valuation.
    """
)
async def get_portfolio_details(
    portfolio_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get detailed information about a specific portfolio"""
    try:
        user_id = current_user.get("uid")

        # Validate portfolio access and get portfolio data
        try:
            portfolio_data = portfolio_service.validate_user_portfolio_access(portfolio_id, user_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND if "not found" in str(e) else status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )

        # Update portfolio prices
        portfolio_service.update_portfolio_prices(portfolio_data)

        # Save updated portfolio
        portfolio_service.update_portfolio(portfolio_id, portfolio_data)

        return portfolio_data

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve portfolio details: {str(e)}",
        )


@router.get(
    "/compare",
    response_model=PortfolioComparison,
    summary="Compare portfolios",
    description="""
    Compare performance of multiple portfolios.
    
    Provide a comma-separated list of portfolio IDs to compare their performance metrics:
    - Total returns
    - Annualized returns
    - Volatility 
    - Sharpe ratio
    
    The endpoint will also return simplified portfolio data and performance history
    for each portfolio to facilitate charting and visual comparison.
    
    Example: /api/portfolios/compare?ids=portfolio1,portfolio2,portfolio3
    """
)
async def compare_portfolios(
    ids: str = Query(
        ..., description="Comma-separated list of portfolio IDs to compare"
    ),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Compare multiple portfolios"""
    try:
        user_id = current_user.get("uid")

        # Split portfolio IDs
        portfolio_ids = [id.strip() for id in ids.split(",")]

        if len(portfolio_ids) < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one portfolio ID must be provided",
            )

        # Get portfolio data for each ID
        portfolios = []
        total_returns = []
        annualized_returns = []
        volatilities = []
        sharpe_ratios = []

        for portfolio_id in portfolio_ids:
            try:
                portfolio_data = portfolio_service.validate_user_portfolio_access(portfolio_id, user_id)
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND if "not found" in str(e) else status.HTTP_403_FORBIDDEN,
                    detail=str(e)
                )

            # Update portfolio prices
            portfolio_service.update_portfolio_prices(portfolio_data)

            # Calculate portfolio metrics
            performance_data = portfolio_service.calculate_portfolio_metrics(
                portfolio_data
            )

            # Extract metrics
            metrics = performance_data.get("metrics", {})
            total_returns.append(metrics.get("total_return", 0))
            annualized_returns.append(metrics.get("annualized_return", 0))
            volatilities.append(metrics.get("volatility", 0))
            sharpe_ratios.append(metrics.get("sharpe_ratio", 0))

            # Create simplified portfolio object for comparison
            simplified_portfolio = {
                "id": portfolio_data.get("id"),
                "name": portfolio_data.get("name"),
                "start_date": portfolio_data.get("start_date"),
                "initial_balance": portfolio_data.get("initial_balance"),
                "current_balance": portfolio_data.get("current_balance"),
                "performance": portfolio_data.get("performance"),
                "performance_history": portfolio_data.get("performance_history", []),
            }

            portfolios.append(simplified_portfolio)

            # Save updated portfolio
            portfolio_service.update_portfolio(portfolio_id, portfolio_data)

        # Create comparison metrics
        comparison_metrics = {
            "total_return": total_returns,
            "annualized_return": annualized_returns,
            "volatility": volatilities,
            "sharpe_ratio": sharpe_ratios,
        }

        return {"portfolios": portfolios, "comparison_metrics": comparison_metrics}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare portfolios: {str(e)}",
        )


@router.post(
    "/{portfolio_id}/firebase-config",
    summary="Configure Firebase streaming",
    description="""
    Configure client-side Firebase streaming for real-time portfolio updates.
    
    This endpoint provides the necessary Firebase database references for the frontend
    to set up real-time listeners. The config options allow you to specify which types
    of data you want to receive updates for:
    
    - **enabled**: Whether to enable Firebase streaming
    - **include_holdings**: Whether to include real-time updates for holdings
    - **include_transactions**: Whether to include real-time updates for transactions
    - **include_performance**: Whether to include real-time updates for performance history
    
    The response includes all the necessary Firebase paths to set up database listeners.
    """
)
async def configure_firebase_streaming(
    portfolio_id: str,
    config: StreamConfig,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Configure Firebase real-time updates for a portfolio"""
    try:
        user_id = current_user.get("uid")

        # Validate portfolio access and get portfolio data
        try:
            portfolio_data = portfolio_service.validate_user_portfolio_access(portfolio_id, user_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND if "not found" in str(e) else status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )

        # Create a Firebase configuration object for the client
        firebase_paths = {
            "portfolio": f"portfolios/{portfolio_id}",
            "enabled": config.enabled
        }
        
        # Add optional paths based on configuration
        if config.include_holdings:
            firebase_paths["holdings"] = f"portfolios/{portfolio_id}/holdings"
        
        if config.include_transactions:
            firebase_paths["transactions"] = f"portfolios/{portfolio_id}/transactions"
        
        if config.include_performance:
            firebase_paths["performance"] = f"portfolios/{portfolio_id}/performance_history"
        
        # Add stock history paths for each holding
        if config.include_holdings:
            stock_history_paths = {}
            for holding in portfolio_data.get("holdings", []):
                symbol = holding.get("symbol")
                stock_history_paths[symbol] = f"portfolios/{portfolio_id}/stock_history/{symbol}"
            
            firebase_paths["stock_history"] = stock_history_paths

        return {
            "portfolio_id": portfolio_id,
            "firebase_paths": firebase_paths,
            "config": config.model_dump()
        }

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to configure Firebase streaming: {str(e)}",
        )


@router.delete(
    "/{portfolio_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete portfolio",
    description="""
    Delete a portfolio and all its associated data.
    
    This operation:
    1. Stops any running simulation for this portfolio
    2. Closes all Firebase streams associated with the portfolio
    3. Deletes all portfolio data (holdings, transactions, history)
    4. Removes the portfolio from the user's portfolio list
    
    This operation cannot be undone, and all portfolio data will be permanently deleted.
    """
)
async def delete_portfolio(
    portfolio_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete a portfolio for the authenticated user"""
    try:
        user_id = current_user.get("uid")

        # Validate portfolio access
        try:
            portfolio_service.validate_user_portfolio_access(portfolio_id, user_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND if "not found" in str(e) else status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )

        # Stop any background tasks associated with this portfolio
        from ...services import background_tasks
        background_tasks.stop_portfolio_simulation(portfolio_id)
        
        # Delete the portfolio
        portfolio_service.delete_portfolio(portfolio_id, user_id)

        return {"message": f"Portfolio {portfolio_id} deleted successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete portfolio: {str(e)}",
        )
