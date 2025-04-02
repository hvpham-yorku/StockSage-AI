import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Callable
import yfinance as yf
from ...services.firebase_service import firebase_service

logger = logging.getLogger(__name__)


class PortfolioService:
    """Service for portfolio operations"""

    def validate_date_string(self, date_str: str) -> bool:
        """Validate if a string is a valid date in YYYY-MM-DD format"""
        try:
            logger.info(f"Validating date string: {date_str}")
            datetime.strptime(date_str, "%Y-%m-%d")
            return True
        except ValueError:
            return False

    def calculate_performance(
        self, current_balance: float, initial_balance: float
    ) -> float:
        """Calculate performance percentage"""
        if initial_balance <= 0:
            return 0
        return round(((current_balance - initial_balance) / initial_balance) * 100, 2)

    def get_stock_info(self, symbol: str) -> Dict[str, Any]:
        """Get current stock information"""
        try:
            stock = yf.Ticker(symbol)
            info = stock.info

            return {
                "symbol": symbol,
                "name": info.get("shortName", info.get("longName", symbol)),
                "current_price": info.get("regularMarketPrice", 0),
            }
        except Exception as e:
            logger.error(f"Error fetching stock info for {symbol}: {str(e)}")
            # Return minimal info if we can't fetch from yfinance
            return {"symbol": symbol, "name": symbol, "current_price": 0}

    def get_historical_price(self, symbol: str, date_str: str) -> float:
        """Get historical price for a stock on a specific date"""
        try:
            # If date is a weekend or holiday, get the previous business day
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")

            # Try to get data for 7 days before the requested date to handle weekends/holidays
            start_date = (date_obj - timedelta(days=7)).strftime("%Y-%m-%d")
            end_date = (date_obj + timedelta(days=1)).strftime("%Y-%m-%d")

            stock = yf.Ticker(symbol)
            hist = stock.history(start=start_date, end=end_date)

            if hist.empty:
                logger.warning(
                    f"No historical data for {symbol} on or before {date_str}"
                )
                return 0

            # Get the last available price on or before the requested date
            # Sort history by date and find the closest date
            hist = hist.sort_index()
            closest_date = None

            for hist_date in hist.index:
                hist_date_str = hist_date.strftime("%Y-%m-%d")
                if hist_date_str <= date_str:
                    closest_date = hist_date

            if closest_date:
                return float(hist.loc[closest_date]["Close"])
            else:
                logger.warning(
                    f"No historical data for {symbol} on or before {date_str}"
                )
                return 0

        except Exception as e:
            logger.error(
                f"Error fetching historical price for {symbol} on {date_str}: {str(e)}"
            )
            return 0

    def create_portfolio(
        self, user_id: str, portfolio_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new portfolio"""
        # Create a new portfolio ID
        portfolio_id = str(uuid.uuid4())

        # Create portfolio object
        portfolio = {
            "id": portfolio_id,
            "user_id": user_id,
            "name": portfolio_data.get("name"),
            "start_date": portfolio_data.get("start_date"),
            "initial_balance": portfolio_data.get("initial_balance"),
            "current_balance": portfolio_data.get("initial_balance"),
            "cash_balance": portfolio_data.get("initial_balance"),
            "current_date": portfolio_data.get(
                "start_date"
            ),  # Initially, current date is start date
            "holdings": [],
            "transactions": [],
            "performance_history": [
                {
                    "date": portfolio_data.get("start_date"),
                    "value": portfolio_data.get("initial_balance"),
                }
            ],
            "is_active": False,  # Simulation is not active by default
            "simulation_speed": portfolio_data.get("simulation_speed", 1),
            "created_at": datetime.now().isoformat(),
            "performance": 0,  # Initial performance is 0%
        }

        # Save portfolio to Firebase
        firebase_service.set_data(f"portfolios/{portfolio_id}", portfolio)

        # Add portfolio ID to user's portfolios list
        user_portfolios_path = f"users/{user_id}/portfolios"
        user_portfolios = firebase_service.get_data(user_portfolios_path) or {}
        user_portfolios[portfolio_id] = (
            True  # Use object with portfolio_id as key for faster lookups
        )
        firebase_service.set_data(user_portfolios_path, user_portfolios)

        return portfolio

    def get_user_portfolios(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all portfolios for a user"""
        # Get user's portfolio IDs
        user_portfolios_path = f"users/{user_id}/portfolios"
        user_portfolios = firebase_service.get_data(user_portfolios_path)

        if not user_portfolios:
            # No portfolios found, return empty list
            return []

        # Get portfolio details for each ID
        portfolios = []
        for portfolio_id in user_portfolios:
            portfolio_data = firebase_service.get_data(f"portfolios/{portfolio_id}")

            if portfolio_data:
                # Create summary object with only required fields
                portfolio_summary = {
                    "id": portfolio_data.get("id"),
                    "name": portfolio_data.get("name"),
                    "start_date": portfolio_data.get("start_date"),
                    "initial_balance": portfolio_data.get("initial_balance"),
                    "current_balance": portfolio_data.get("current_balance"),
                    "performance": portfolio_data.get("performance", 0),
                    "current_date": portfolio_data.get("current_date"),
                    "is_active": portfolio_data.get("is_active", False),
                }
                portfolios.append(portfolio_summary)

        return portfolios

    def get_portfolio(self, portfolio_id: str) -> Optional[Dict[str, Any]]:
        """Get a portfolio by ID"""
        return firebase_service.get_data(f"portfolios/{portfolio_id}")

    def update_portfolio(self, portfolio_id: str, data: Dict[str, Any]) -> None:
        """Update a portfolio"""
        firebase_service.update_data(f"portfolios/{portfolio_id}", data)

    def execute_trade(
        self, portfolio_id: str, trade_data: Dict[str, Any], trade_type: str
    ) -> Dict[str, Any]:
        """Execute a buy or sell trade

        Args:
            portfolio_id: ID of the portfolio
            trade_data: Dictionary with symbol, quantity, and optional price
            trade_type: 'buy' or 'sell'

        Returns:
            Transaction record
        """
        # Get portfolio data
        portfolio_data = self.get_portfolio(portfolio_id)
        if not portfolio_data:
            raise ValueError(f"Portfolio with ID {portfolio_id} not found")

        # Get basic trade info
        symbol = trade_data.get("symbol").upper()
        quantity = float(trade_data.get("quantity"))

        # Get current simulation date
        current_date = portfolio_data.get("current_date")

        # Get price - either from trade data or historical data
        price = float(trade_data.get("price", 0))
        if price <= 0:
            # If price not provided, get historical price for the current simulation date
            price = self.get_historical_price(symbol, current_date)
            if price <= 0:
                raise ValueError(f"Could not determine price for {symbol}")

        # Calculate total value
        total_value = round(quantity * price, 2)

        # Get stock info
        stock_info = self.get_stock_info(symbol)
        stock_name = stock_info.get("name", symbol)

        # Create transaction ID
        transaction_id = str(uuid.uuid4())

        # Create base transaction object
        transaction = {
            "id": transaction_id,
            "portfolio_id": portfolio_id,
            "symbol": symbol,
            "name": stock_name,
            "type": trade_type,
            "quantity": quantity,
            "price": price,
            "total": total_value,
            "trade_date": current_date,  # Record the simulation date of the trade
            "timestamp": datetime.now().isoformat(),
        }

        # Process trade based on type
        if trade_type == "buy":
            # Process buy order
            cash_balance = portfolio_data.get("cash_balance", 0)

            # Check if enough cash
            if cash_balance < total_value:
                raise ValueError(
                    f"Insufficient cash balance. Required: ${total_value}, Available: ${cash_balance}"
                )

            # Update cash balance
            new_balance = round(cash_balance - total_value, 2)
            portfolio_data["cash_balance"] = new_balance
            transaction["new_balance"] = new_balance

            # Update holdings
            holdings = portfolio_data.get("holdings", [])

            # Find existing holding for this symbol
            holding_index = None
            for i, holding in enumerate(holdings):
                if holding.get("symbol") == symbol:
                    holding_index = i
                    break

            if holding_index is not None:
                # Update existing holding
                existing_holding = holdings[holding_index]
                existing_quantity = existing_holding.get("quantity", 0)
                existing_avg_price = existing_holding.get("average_buy_price", 0)

                # Calculate new average buy price
                new_quantity = existing_quantity + quantity
                new_avg_price = round(
                    ((existing_quantity * existing_avg_price) + (quantity * price))
                    / new_quantity,
                    2,
                )

                # Update holding
                holdings[holding_index]["quantity"] = new_quantity
                holdings[holding_index]["average_buy_price"] = new_avg_price
                holdings[holding_index]["current_price"] = price
                holdings[holding_index]["value"] = round(new_quantity * price, 2)
            else:
                # Create new holding
                new_holding = {
                    "symbol": symbol,
                    "name": stock_name,
                    "quantity": quantity,
                    "average_buy_price": price,
                    "current_price": price,
                    "value": round(quantity * price, 2),
                    "gain_loss": 0,
                    "gain_loss_percent": 0,
                }
                holdings.append(new_holding)

            portfolio_data["holdings"] = holdings

        elif trade_type == "sell":
            # Process sell order
            holdings = portfolio_data.get("holdings", [])

            # Find existing holding for this symbol
            holding_index = None
            for i, holding in enumerate(holdings):
                if holding.get("symbol") == symbol:
                    holding_index = i
                    break

            if holding_index is None:
                raise ValueError(f"No holdings found for symbol {symbol}")

            existing_holding = holdings[holding_index]
            existing_quantity = existing_holding.get("quantity", 0)

            if existing_quantity < quantity:
                raise ValueError(
                    f"Insufficient holdings. Requested: {quantity}, Available: {existing_quantity}"
                )

            # Calculate gain/loss
            avg_buy_price = existing_holding.get("average_buy_price", 0)
            gain_loss = round((price - avg_buy_price) * quantity, 2)
            gain_loss_percent = (
                round(((price - avg_buy_price) / avg_buy_price) * 100, 2)
                if avg_buy_price > 0
                else 0
            )

            # Update transaction with gain/loss
            transaction["gain_loss"] = gain_loss
            transaction["gain_loss_percent"] = gain_loss_percent

            # Update cash balance
            cash_balance = portfolio_data.get("cash_balance", 0)
            new_balance = round(cash_balance + total_value, 2)
            portfolio_data["cash_balance"] = new_balance
            transaction["new_balance"] = new_balance

            # Update holdings
            new_quantity = existing_quantity - quantity

            if new_quantity > 0:
                # Update existing holding
                holdings[holding_index]["quantity"] = new_quantity
                holdings[holding_index]["current_price"] = price
                holdings[holding_index]["value"] = round(new_quantity * price, 2)
            else:
                # Remove holding if no shares left
                holdings.pop(holding_index)

            portfolio_data["holdings"] = holdings

        # Add transaction to history
        transactions = portfolio_data.get("transactions", [])
        transactions.append(transaction)
        portfolio_data["transactions"] = transactions

        # Recalculate current balance and performance
        self.update_portfolio_metrics(portfolio_data)

        # Save updated portfolio
        self.update_portfolio(portfolio_id, portfolio_data)

        return transaction

    def update_portfolio_metrics(self, portfolio_data: Dict[str, Any]) -> None:
        """Update portfolio metrics including current balance, performance and performance history"""
        # Calculate total holdings value
        holdings = portfolio_data.get("holdings", [])
        total_holdings_value = sum(holding.get("value", 0) for holding in holdings)

        # Update current balance
        cash_balance = portfolio_data.get("cash_balance", 0)
        current_balance = round(total_holdings_value + cash_balance, 2)
        portfolio_data["current_balance"] = current_balance

        # Update performance
        initial_balance = portfolio_data.get("initial_balance", 0)
        performance = self.calculate_performance(current_balance, initial_balance)
        portfolio_data["performance"] = performance

        # Update performance history
        performance_history = portfolio_data.get("performance_history", [])
        current_date = portfolio_data.get("current_date")

        # Check if we already have an entry for this date
        date_exists = False
        for entry in performance_history:
            if entry.get("date") == current_date:
                entry["value"] = current_balance
                date_exists = True
                break

        if not date_exists:
            performance_history.append({"date": current_date, "value": current_balance})

        portfolio_data["performance_history"] = performance_history

    def update_portfolio_prices(self, portfolio_data: Dict[str, Any]) -> None:
        """Update current prices for all holdings based on the current simulation date"""
        holdings = portfolio_data.get("holdings", [])
        current_date = portfolio_data.get("current_date")

        for holding in holdings:
            if holding.get("quantity", 0) > 0:
                symbol = holding.get("symbol")

                # Get historical price for current simulation date
                price = self.get_historical_price(symbol, current_date)

                # If no historical price found, keep the current price
                if price <= 0:
                    continue

                # Update current price
                holding["current_price"] = price

                # Calculate value
                quantity = holding.get("quantity", 0)
                holding["value"] = round(quantity * price, 2)

                # Calculate gain/loss
                avg_buy_price = holding.get("average_buy_price", 0)
                gain_loss = (price - avg_buy_price) * quantity
                holding["gain_loss"] = round(gain_loss, 2)

                # Calculate gain/loss percentage
                if avg_buy_price > 0:
                    gain_loss_percent = ((price - avg_buy_price) / avg_buy_price) * 100
                    holding["gain_loss_percent"] = round(gain_loss_percent, 2)
                else:
                    holding["gain_loss_percent"] = 0

        portfolio_data["holdings"] = holdings

        # Recalculate current balance and performance
        self.update_portfolio_metrics(portfolio_data)

    def control_simulation(
        self,
        portfolio_id: str,
        action: str,
        target_date: Optional[str] = None,
        simulation_speed: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Control the simulation (start, pause, reset, or set date)"""
        # Get portfolio data
        portfolio_data = self.get_portfolio(portfolio_id)
        if not portfolio_data:
            raise ValueError(f"Portfolio with ID {portfolio_id} not found")

        # Process action
        if action == "start":
            # Start the simulation
            portfolio_data["is_active"] = True

            # Update simulation speed if provided
            if simulation_speed is not None:
                portfolio_data["simulation_speed"] = simulation_speed

            response_message = "Simulation started"

        elif action == "pause":
            # Pause the simulation
            portfolio_data["is_active"] = False
            response_message = "Simulation paused"

        elif action == "reset":
            # Reset the simulation to the start date
            portfolio_data["current_date"] = portfolio_data.get("start_date")
            portfolio_data["is_active"] = False

            # Update prices based on reset date
            self.update_portfolio_prices(portfolio_data)

            response_message = "Simulation reset to start date"

        elif action == "set_date":
            # Set a specific date
            if not target_date:
                raise ValueError("Target date must be provided for 'set_date' action")

            # Validate date format
            if not self.validate_date_string(target_date):
                raise ValueError("Invalid date format. Please use YYYY-MM-DD format.")

            # Check if date is valid (not before start date)
            start_date = datetime.strptime(portfolio_data.get("start_date"), "%Y-%m-%d")
            target_date_obj = datetime.strptime(target_date, "%Y-%m-%d")

            if target_date_obj < start_date:
                raise ValueError(
                    f"Target date cannot be before the portfolio start date ({portfolio_data.get('start_date')})"
                )

            # Set the current date
            portfolio_data["current_date"] = target_date

            # Update prices based on new date
            self.update_portfolio_prices(portfolio_data)

            # Also pause the simulation when manually setting a date
            portfolio_data["is_active"] = False

            response_message = f"Simulation date set to {target_date}"

        else:
            raise ValueError(
                f"Invalid action: {action}. Must be one of: start, pause, reset, set_date"
            )

        # Save updated portfolio
        self.update_portfolio(portfolio_id, portfolio_data)

        # Return response
        return {
            "id": portfolio_id,
            "message": response_message,
            "is_active": portfolio_data.get("is_active"),
            "current_date": portfolio_data.get("current_date"),
            "simulation_speed": portfolio_data.get("simulation_speed"),
        }

    def get_portfolio_transactions(self, portfolio_id: str) -> List[Dict[str, Any]]:
        """Get transaction history for a portfolio"""
        portfolio_data = self.get_portfolio(portfolio_id)
        if not portfolio_data:
            raise ValueError(f"Portfolio with ID {portfolio_id} not found")

        # Get transactions
        transactions = portfolio_data.get("transactions", [])

        # Sort transactions by timestamp (newest first)
        transactions.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        return transactions

    def calculate_portfolio_metrics(
        self, portfolio_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate detailed performance metrics for a portfolio"""
        name = portfolio_data.get("name", "")
        initial_balance = portfolio_data.get("initial_balance", 0)
        current_balance = portfolio_data.get("current_balance", 0)
        performance = portfolio_data.get("performance", 0)
        performance_history = portfolio_data.get("performance_history", [])

        # Sort performance history by date
        performance_history.sort(key=lambda x: x.get("date", ""))

        # Get start and current date
        start_date_str = portfolio_data.get("start_date")
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        current_date_str = portfolio_data.get("current_date", start_date_str)
        current_date = datetime.strptime(current_date_str, "%Y-%m-%d")
        days_passed = max(1, (current_date - start_date).days)  # Ensure at least 1 day

        # Total return (already calculated as performance)
        total_return = performance

        # Annualized return
        # Formula: (1 + r)^(365/days) - 1
        annualized_return = (
            ((1 + (performance / 100)) ** (365 / days_passed)) - 1
        ) * 100

        # Calculate volatility and sharpe ratio
        # Volatility (standard deviation of daily returns)
        if len(performance_history) > 1:
            returns = []
            for i in range(1, len(performance_history)):
                prev_value = performance_history[i - 1].get("value", 0)
                curr_value = performance_history[i].get("value", 0)
                if prev_value > 0:
                    daily_return = (curr_value - prev_value) / prev_value
                    returns.append(daily_return)

            # Calculate standard deviation if we have returns
            if returns:
                mean_return = sum(returns) / len(returns)
                squared_diffs = [(r - mean_return) ** 2 for r in returns]
                variance = sum(squared_diffs) / len(squared_diffs)
                volatility = (variance**0.5) * 100  # Convert to percentage
            else:
                volatility = 0
        else:
            volatility = 0

        # Sharpe ratio (assuming risk-free rate of 0)
        # Formula: (Portfolio Return - Risk Free Rate) / Portfolio Standard Deviation
        sharpe_ratio = annualized_return / volatility if volatility > 0 else 0

        # Create metrics object
        metrics = {
            "total_return": round(total_return, 2),
            "annualized_return": round(annualized_return, 2),
            "volatility": round(volatility, 2),
            "sharpe_ratio": round(sharpe_ratio, 2),
        }

        # Create response
        return {
            "portfolio_id": portfolio_data.get("id"),
            "name": name,
            "initial_balance": initial_balance,
            "current_balance": current_balance,
            "performance": performance,
            "performance_history": performance_history,
            "metrics": metrics,
        }

    def advance_simulation_date(self, portfolio_id: str, days_to_advance: int = 1) -> Dict[str, Any]:
        """Advance the simulation date by a specified number of days

        Args:
            portfolio_id: ID of the portfolio
            days_to_advance: Number of days to advance (default: 1)

        Returns:
            Updated portfolio data
        """
        # Get portfolio data
        portfolio_data = self.get_portfolio(portfolio_id)
        if not portfolio_data:
            raise ValueError(f"Portfolio with ID {portfolio_id} not found")

        # Check if simulation is active
        if not portfolio_data.get("is_active", False):
            raise ValueError("Cannot advance date for inactive simulation")

        # Get current date
        current_date_str = portfolio_data.get("current_date")
        current_date = datetime.strptime(current_date_str, "%Y-%m-%d")

        # Calculate new date
        new_date = current_date + timedelta(days=days_to_advance)
        new_date_str = new_date.strftime("%Y-%m-%d")

        # Set the new date
        portfolio_data["current_date"] = new_date_str

        # Update prices based on new date
        self.update_portfolio_prices(portfolio_data)

        # Generate stock history for the graphs
        holdings = portfolio_data.get("holdings", [])
        for holding in holdings:
            symbol = holding.get("symbol")
            
            # Get price for this specific date
            price = self.get_historical_price(symbol, new_date_str)
            
            # Add to stock history in Firebase
            stock_history_path = f"portfolios/{portfolio_id}/stock_history/{symbol}"
            stock_history = firebase_service.get_data(stock_history_path) or {}
            stock_history[new_date_str] = price
            firebase_service.set_data(stock_history_path, stock_history)

        # Save updated portfolio
        self.update_portfolio(portfolio_id, portfolio_data)

        return portfolio_data

    def create_portfolio_stream(self, portfolio_id: str, callback: Callable[[Dict[str, Any]], None]) -> Any:
        """Create a stream to listen for changes to a portfolio

        Args:
            portfolio_id: ID of the portfolio
            callback: Function to call when portfolio data changes

        Returns:
            Stream object that can be used to stop listening
        """
        return firebase_service.stream_data(f"portfolios/{portfolio_id}", callback)

    def create_stock_history_stream(self, portfolio_id: str, symbol: str, callback: Callable[[Dict[str, Any]], None]) -> Any:
        """Create a stream to listen for changes to a stock's price history

        Args:
            portfolio_id: ID of the portfolio
            symbol: Stock symbol
            callback: Function to call when stock history changes

        Returns:
            Stream object that can be used to stop listening
        """
        return firebase_service.stream_data(f"portfolios/{portfolio_id}/stock_history/{symbol}", callback)

    def get_stock_history(self, portfolio_id: str, symbol: str) -> Dict[str, float]:
        """Get historical price data for a stock in a portfolio

        Args:
            portfolio_id: ID of the portfolio
            symbol: Stock symbol

        Returns:
            Dictionary with dates as keys and prices as values
        """
        stock_history_path = f"portfolios/{portfolio_id}/stock_history/{symbol}"
        return firebase_service.get_data(stock_history_path) or {}

    def schedule_simulation_updates(self, portfolio_id: str, interval_seconds: int = 5) -> None:
        """Schedule automatic updates for a portfolio simulation
        
        This would typically be implemented with a background task,
        but for this example, it's just a placeholder showing the concept.
        
        Args:
            portfolio_id: ID of the portfolio
            interval_seconds: Seconds between updates
        """
        # Note: This would be implemented with a background task framework
        # such as Celery, APScheduler, or FastAPI's BackgroundTasks
        # For now, this is just a placeholder showing the concept
        
        portfolio_data = self.get_portfolio(portfolio_id)
        if not portfolio_data:
            return
            
        if portfolio_data.get("is_active", False):
            # Add 'simulation_last_updated' timestamp to track when simulation was last updated
            portfolio_data["simulation_last_updated"] = datetime.now().isoformat()
            self.update_portfolio(portfolio_id, portfolio_data)
            
            # This would advance the simulation date based on simulation_speed
            # We would need to track the real-time elapsed since last update
            # and convert that to simulation days based on simulation_speed
            simulation_speed = portfolio_data.get("simulation_speed", 1)
            # For example, if simulation_speed is 7, we advance 1 day every day/7 real time
            
            # The actual implementation would be part of a background task system

    def delete_portfolio(self, portfolio_id: str, user_id: str) -> None:
        """Delete a portfolio and all its associated data
        
        Args:
            portfolio_id: ID of the portfolio to delete
            user_id: ID of the user who owns the portfolio
        
        Raises:
            ValueError: If the portfolio is not found or doesn't belong to the user
        """
        # Verify portfolio exists and belongs to user
        portfolio_data = self.get_portfolio(portfolio_id)
        
        if not portfolio_data:
            raise ValueError(f"Portfolio with ID {portfolio_id} not found")
        
        if portfolio_data.get("user_id") != user_id:
            raise ValueError("You do not have permission to delete this portfolio")
        
        # Delete portfolio stock history
        holdings = portfolio_data.get("holdings", [])
        for holding in holdings:
            symbol = holding.get("symbol")
            if symbol:
                stock_history_path = f"portfolios/{portfolio_id}/stock_history/{symbol}"
                firebase_service.delete_data(stock_history_path)
        
        # Delete all portfolio data
        firebase_service.delete_data(f"portfolios/{portfolio_id}")
        
        # Remove portfolio ID from user's portfolios list
        user_portfolios_path = f"users/{user_id}/portfolios"
        user_portfolios = firebase_service.get_data(user_portfolios_path) or {}
        
        if portfolio_id in user_portfolios:
            del user_portfolios[portfolio_id]
            firebase_service.set_data(user_portfolios_path, user_portfolios)
        
        logger.info(f"Portfolio {portfolio_id} deleted successfully")

    def validate_user_portfolio_access(self, portfolio_id: str, user_id: str) -> Dict[str, Any]:
        """Validate that a portfolio exists and belongs to the specified user
        
        Args:
            portfolio_id: ID of the portfolio
            user_id: ID of the user
            
        Returns:
            Portfolio data if validation passes
            
        Raises:
            ValueError: If portfolio doesn't exist or doesn't belong to user
        """
        portfolio_data = self.get_portfolio(portfolio_id)
        
        if not portfolio_data:
            raise ValueError(f"Portfolio with ID {portfolio_id} not found")
            
        if portfolio_data.get("user_id") != user_id:
            raise ValueError(f"User {user_id} does not have permission to access portfolio {portfolio_id}")
            
        return portfolio_data
