"""
Manage virtual investment portfolios with time simulation capabilities.

These endpoints allow you to:
- Create and manage portfolios with custom start dates and initial balances
- Buy and sell stocks with historical pricing based on simulation date
- Control time simulation (start, pause, reset, set specific dates)
- Get detailed performance metrics and transaction history
- Configure real-time Firebase updates for dynamic UI updates

The portfolio simulation features:
- Historical stock pricing based on the simulation date
- Time-based simulation with adjustable speeds
- Real-time updates via Firebase streaming
- Performance tracking and comparison

Authentication is required for all endpoints using Firebase JWT tokens.
"""


from fastapi import APIRouter
from . import portfolio_routes, trade_routes, simulation_routes, performance_routes

# Create a router for all portfolio-related routes
router = APIRouter(
    prefix="/api/portfolios",
    tags=["portfolios"],
)

# Include all sub-routers
router.include_router(portfolio_routes.router)
router.include_router(trade_routes.router)
router.include_router(simulation_routes.router)
router.include_router(performance_routes.router)
