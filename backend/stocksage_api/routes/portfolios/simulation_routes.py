from fastapi import APIRouter, HTTPException, Depends, Security, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from ...services.firebase_service import firebase_service
from ...services.portfolios.portfolio_service import PortfolioService
from ...services import background_tasks
from ...routes.auth import get_current_user

# Create router (without prefix, prefix is set in __init__.py)
router = APIRouter()

# Create portfolio service
portfolio_service = PortfolioService()

# Security scheme
security = HTTPBearer(
    scheme_name="Bearer Authentication",
    description="Enter your Firebase ID token",
    auto_error=True,
)


# Models
class SimulationControl(BaseModel):
    """Model for controlling simulation"""

    action: str = Field(
        ..., description="Action to perform: start, pause, reset, or set_date"
    )
    target_date: Optional[str] = None
    simulation_speed: Optional[int] = None


class AdvanceSimulationRequest(BaseModel):
    """Model for advancing simulation date"""
    
    days: int = Field(1, description="Number of days to advance simulation")


class StreamConfigRequest(BaseModel):
    """Model for configuring real-time streaming"""
    
    enabled: bool = Field(..., description="Whether to enable real-time updates")
    symbols: Optional[List[str]] = Field(None, description="Symbols to track (if None, all holdings will be tracked)")


# Routes
@router.post(
    "/{portfolio_id}/simulation",
    summary="Control portfolio simulation",
    description="""
    Control the time simulation for a portfolio (start, pause, reset, or set a specific date).
    
    Action options:
    - **start**: Begin simulation with time advancing according to simulation_speed
    - **pause**: Pause the simulation (current holdings will retain their values)
    - **reset**: Return to the portfolio's start date and original cash position
    - **set_date**: Set the simulation to a specific date (must be after start_date)
    
    Parameters:
    - **action**: The simulation control command (required)
    - **target_date**: For 'set_date' action, specify the date to jump to (format: YYYY-MM-DD)
    - **simulation_speed**: For 'start' action, specify how fast time advances (days per real-time day)
    
    When simulation is active, the portfolio will automatically advance dates based on the
    specified simulation_speed. Stock prices will update according to historical data.
    
    Starting a simulation also activates real-time Firebase updates to the frontend.
    """
)
async def control_simulation(
    portfolio_id: str,
    control: SimulationControl,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Control the time simulation for a portfolio"""
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

        # Process action
        result = portfolio_service.control_simulation(
            portfolio_id=portfolio_id,
            action=control.action.lower(),
            target_date=control.target_date,
            simulation_speed=control.simulation_speed,
        )
        
        # Handle background tasks based on action
        if control.action.lower() == "start":
            # Start automatic simulation advancement
            background_tasks.start_portfolio_simulation(portfolio_id)
        elif control.action.lower() in ["pause", "reset", "set_date"]:
            # Stop automatic simulation advancement
            background_tasks.stop_portfolio_simulation(portfolio_id)

        return result

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to control simulation: {str(e)}",
        )


@router.post(
    "/{portfolio_id}/advance",
    summary="Advance simulation date",
    description="""
    Advance the simulation date by a specified number of days.
    
    This endpoint allows manual advancement of the simulation date, which is useful for:
    - Testing portfolio behavior over specific time periods
    - Quickly jumping ahead in time without waiting for automatic advancement
    - Demonstrating portfolio performance over extended periods
    
    Parameters:
    - **days**: Number of days to advance the simulation (default: 1)
    
    The action will:
    1. Calculate the new date by adding the specified days to the current date
    2. Update all stock prices to reflect their values on the new date
    3. Recalculate portfolio value and performance metrics
    4. Update the portfolio's simulation date
    
    Stock prices will be pulled from historical data for the new date.
    """
)
async def advance_simulation(
    portfolio_id: str,
    advance_request: AdvanceSimulationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Advance the simulation date for a portfolio"""
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

        # Advance simulation date
        result = portfolio_service.advance_simulation_date(
            portfolio_id=portfolio_id,
            days_to_advance=advance_request.days,
        )

        return {
            "id": portfolio_id,
            "message": f"Simulation advanced by {advance_request.days} day(s)",
            "current_date": result.get("current_date"),
            "is_active": result.get("is_active"),
        }

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to advance simulation: {str(e)}",
        )


@router.get(
    "/{portfolio_id}/stock_history/{symbol}",
    summary="Get stock price history",
    description="""
    Get historical price data for a stock in a portfolio.
    
    Retrieves the price history for a specific stock symbol within the portfolio's
    simulation timeframe. This data can be used to create price charts and analyze
    stock performance over time.
    
    The data is structured as a dictionary with dates as keys and prices as values:
    ```
    {
      "2022-01-15": 150.0,
      "2022-01-16": 152.3,
      ...
    }
    ```
    
    This endpoint returns only the dates that have been encountered during the
    simulation. For complete historical data, use the stocks API endpoints.
    """
)
async def get_stock_history(
    portfolio_id: str,
    symbol: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get historical price data for a stock in a portfolio"""
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

        # Get stock history
        stock_history = portfolio_service.get_stock_history(
            portfolio_id=portfolio_id,
            symbol=symbol.upper(),
        )

        return {
            "portfolio_id": portfolio_id,
            "symbol": symbol.upper(),
            "history": stock_history,
        }

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock history: {str(e)}",
        )
