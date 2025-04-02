from .portfolio_service import PortfolioService

# Create a singleton instance of the portfolio service for convenience
portfolio_service = PortfolioService()

__all__ = ["PortfolioService", "portfolio_service"]