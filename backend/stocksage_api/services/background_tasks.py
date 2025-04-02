import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import threading
import time

from .portfolios import portfolio_service
from .firebase_service import firebase_service

logger = logging.getLogger(__name__)

# Keep track of active simulation tasks
active_simulations = {}
active_streams = {}


class SimulationTask:
    """Background task for automatic simulation advancement"""

    def __init__(self, portfolio_id: str, interval_seconds: int = 5):
        """Initialize the simulation task

        Args:
            portfolio_id: ID of the portfolio
            interval_seconds: Seconds between updates
        """
        self.portfolio_id = portfolio_id
        self.interval_seconds = interval_seconds
        self.stop_event = threading.Event()
        self.thread = None

    def start(self):
        """Start the simulation task"""
        if self.thread and self.thread.is_alive():
            logger.warning(
                f"Simulation task for portfolio {self.portfolio_id} already running"
            )
            return

        self.stop_event.clear()
        self.thread = threading.Thread(target=self._run)
        self.thread.daemon = True
        self.thread.start()
        logger.info(f"Started simulation task for portfolio {self.portfolio_id}")

    def stop(self):
        """Stop the simulation task"""
        if not self.thread or not self.thread.is_alive():
            logger.warning(
                f"No simulation task running for portfolio {self.portfolio_id}"
            )
            return

        self.stop_event.set()
        self.thread.join(timeout=5)
        logger.info(f"Stopped simulation task for portfolio {self.portfolio_id}")

    def _run(self):
        """Run the simulation task"""
        logger.info(f"Simulation task for portfolio {self.portfolio_id} started")

        while not self.stop_event.is_set():
            try:
                # Get portfolio data
                portfolio_data = portfolio_service.get_portfolio(self.portfolio_id)

                if not portfolio_data:
                    logger.warning(
                        f"Portfolio {self.portfolio_id} not found, stopping simulation task"
                    )
                    break

                # Check if simulation is active
                if not portfolio_data.get("is_active", False):
                    logger.info(
                        f"Simulation for portfolio {self.portfolio_id} is not active, pausing updates"
                    )
                    time.sleep(self.interval_seconds)
                    continue

                # Get simulation speed
                simulation_speed = portfolio_data.get("simulation_speed", 1)

                # Get last update time
                last_updated = portfolio_data.get("simulation_last_updated")

                if last_updated:
                    # Calculate elapsed time since last update
                    last_update_time = datetime.fromisoformat(last_updated)
                    elapsed_seconds = (
                        datetime.now() - last_update_time
                    ).total_seconds()

                    # Calculate days to advance based on simulation speed
                    # For example, if simulation_speed is 7, we advance 1 day every day/7 real time
                    days_to_advance = int(
                        elapsed_seconds * simulation_speed / (24 * 60 * 60)
                    )

                    if days_to_advance > 0:
                        # Advance simulation date
                        portfolio_service.advance_simulation_date(
                            portfolio_id=self.portfolio_id,
                            days_to_advance=days_to_advance,
                        )
                        logger.info(
                            f"Advanced simulation for portfolio {self.portfolio_id} by {days_to_advance} days"
                        )
                else:
                    # First update, just set the timestamp
                    portfolio_data["simulation_last_updated"] = (
                        datetime.now().isoformat()
                    )
                    portfolio_service.update_portfolio(
                        self.portfolio_id, portfolio_data
                    )

                # Wait for next update
                time.sleep(self.interval_seconds)

            except Exception as e:
                logger.error(
                    f"Error in simulation task for portfolio {self.portfolio_id}: {str(e)}"
                )
                time.sleep(self.interval_seconds)


def stream_callback(message: Dict[str, Any]) -> None:
    """Process Firebase stream events and trigger updates
    
    This function is called whenever there's a change in Firebase data
    that we're streaming. It enables real-time updates by passing the
    changes to any registered frontend clients through Firebase.
    
    Args:
        message: Firebase stream message containing event type, path and data
    """
    event_type = message.get("event")
    path = message.get("path")
    data = message.get("data")
    
    # Log the event at debug level - useful for debugging stream issues
    logger.debug(f"Firebase stream event: {event_type} at {path} with data size: {len(str(data)) if data else 0} bytes")
    
    # Process different event types
    if event_type == "put":
        # Data was updated or added
        if path and path.startswith("/portfolios/"):
            # Extract portfolio ID from path
            parts = path.strip("/").split("/")
            if len(parts) >= 2:
                portfolio_id = parts[1]
                
                # If this is a portfolio update and the is_active status changed, 
                # we might need to start/stop simulation
                if len(parts) == 2 and data and isinstance(data, dict):
                    if "is_active" in data:
                        is_active = data.get("is_active")
                        
                        if is_active and portfolio_id not in active_simulations:
                            # Portfolio became active, start simulation
                            start_portfolio_simulation(portfolio_id)
                            logger.info(f"Auto-started simulation for portfolio {portfolio_id} based on stream event")
                        elif not is_active and portfolio_id in active_simulations:
                            # Portfolio became inactive, stop simulation
                            stop_portfolio_simulation(portfolio_id)
                            logger.info(f"Auto-stopped simulation for portfolio {portfolio_id} based on stream event")
                
    elif event_type == "patch":
        # Partial update to existing data
        logger.debug(f"Partial update: {path} -> {data}")
        
    elif event_type == "keep-alive":
        # Firebase sends keep-alive signals to maintain the connection
        logger.debug("Firebase stream keep-alive signal received")
    
    elif event_type == "cancel":
        # Stream was canceled, try to reconnect if needed
        logger.warning(f"Firebase stream canceled: {path}")
        
        # Extract portfolio ID from path if possible
        if path and path.startswith("/portfolios/"):
            parts = path.strip("/").split("/")
            if len(parts) >= 2:
                portfolio_id = parts[1]
                
                # Attempt to restore the stream if it's still needed
                if portfolio_id in active_simulations:
                    logger.info(f"Attempting to restore stream for portfolio {portfolio_id}")
                    setup_portfolio_streams(portfolio_id)


def setup_portfolio_streams(portfolio_id: str) -> Dict[str, Any]:
    """Set up Firebase streams for a portfolio
    
    This creates real-time data streams that enable the frontend to
    receive updates instantly whenever portfolio data changes.

    Args:
        portfolio_id: ID of the portfolio

    Returns:
        Dictionary of active streams
    """
    streams = {}

    # Portfolio main data stream
    portfolio_stream = firebase_service.stream_data(
        f"portfolios/{portfolio_id}", stream_callback
    )
    streams["portfolio"] = portfolio_stream

    # Get portfolio data to set up streams for holdings
    portfolio_data = portfolio_service.get_portfolio(portfolio_id)
    if portfolio_data:
        # Set up streams for each holding's price history
        for holding in portfolio_data.get("holdings", []):
            symbol = holding.get("symbol")
            if symbol:
                history_stream = firebase_service.stream_data(
                    f"portfolios/{portfolio_id}/stock_history/{symbol}", stream_callback
                )
                streams[f"history_{symbol}"] = history_stream
        
        # Set up stream for performance history
        performance_stream = firebase_service.stream_data(
            f"portfolios/{portfolio_id}/performance_history", stream_callback
        )
        streams["performance"] = performance_stream
        
        # Set up stream for transactions
        transactions_stream = firebase_service.stream_data(
            f"portfolios/{portfolio_id}/transactions", stream_callback
        )
        streams["transactions"] = transactions_stream

    # Store streams for later cleanup
    active_streams[portfolio_id] = streams
    
    logger.info(f"Set up {len(streams)} Firebase streams for portfolio {portfolio_id}")

    return streams


def start_portfolio_simulation(portfolio_id: str) -> None:
    """Start automatic simulation advancement for a portfolio
    
    This function configures both the time advancement simulation and 
    sets up Firebase real-time streams that enable the frontend to 
    receive updates instantly.

    Args:
        portfolio_id: ID of the portfolio
    """
    logger.info(f"Setting up portfolio simulation for {portfolio_id}")
    
    # Stop existing simulation if any
    if portfolio_id in active_simulations:
        active_simulations[portfolio_id].stop()
        logger.info(f"Stopped existing simulation task for portfolio {portfolio_id}")

    # Get portfolio data
    portfolio_data = portfolio_service.get_portfolio(portfolio_id)
    if not portfolio_data:
        logger.error(f"Portfolio {portfolio_id} not found, cannot start simulation")
        return
        
    # Ensure the portfolio is marked as active in Firebase
    if not portfolio_data.get("is_active", False):
        portfolio_data["is_active"] = True
        portfolio_data["simulation_last_updated"] = datetime.now().isoformat()
        portfolio_service.update_portfolio(portfolio_id, portfolio_data)
        logger.info(f"Activated portfolio {portfolio_id} for simulation")

    # Create and start new simulation task
    simulation_task = SimulationTask(portfolio_id)
    simulation_task.start()

    # Store task for later reference
    active_simulations[portfolio_id] = simulation_task

    # Also set up streams for the portfolio
    if portfolio_id not in active_streams:
        setup_portfolio_streams(portfolio_id)
    else:
        logger.info(f"Streams already active for portfolio {portfolio_id}")
        
    # Update stock prices initially
    try:
        portfolio_service.update_portfolio_prices(portfolio_data)
        portfolio_service.update_portfolio(portfolio_id, portfolio_data)
        logger.info(f"Updated initial prices for portfolio {portfolio_id}")
    except Exception as e:
        logger.error(f"Error updating prices for portfolio {portfolio_id}: {str(e)}")
        
    logger.info(f"Portfolio simulation fully configured for {portfolio_id}")


def stop_portfolio_simulation(portfolio_id: str) -> None:
    """Stop automatic simulation advancement for a portfolio
    
    This function stops both the time advancement simulation task and 
    cleans up all Firebase real-time streams. All resources allocated
    to this portfolio's simulation are released.
    
    Args:
        portfolio_id: ID of the portfolio
    """
    logger.info(f"Stopping portfolio simulation for {portfolio_id}")
    
    cleanup_errors = []
    
    # Stop simulation task if any
    if portfolio_id in active_simulations:
        try:
            active_simulations[portfolio_id].stop()
            logger.info(f"Stopped simulation task for portfolio {portfolio_id}")
        except Exception as e:
            error_msg = f"Error stopping simulation task for portfolio {portfolio_id}: {str(e)}"
            logger.error(error_msg)
            cleanup_errors.append(error_msg)
        finally:
            # Always remove from active simulations even if stopping fails
            del active_simulations[portfolio_id]
            logger.info(f"Removed portfolio {portfolio_id} from active simulations")
    
    # Close streams if any
    if portfolio_id in active_streams:
        try:
            for stream_key, stream in active_streams[portfolio_id].items():
                if stream:
                    try:
                        stream.close()
                        logger.debug(f"Closed {stream_key} stream for portfolio {portfolio_id}")
                    except Exception as se:
                        error_msg = f"Error closing {stream_key} stream for portfolio {portfolio_id}: {str(se)}"
                        logger.warning(error_msg)
                        cleanup_errors.append(error_msg)
        except Exception as e:
            error_msg = f"Error closing streams for portfolio {portfolio_id}: {str(e)}"
            logger.error(error_msg)
            cleanup_errors.append(error_msg)
        finally:
            # Always remove from active streams even if closing fails
            del active_streams[portfolio_id]
            logger.info(f"Removed portfolio {portfolio_id} from active streams")
    
    # Update the portfolio's active status in Firebase if it exists
    try:
        portfolio_data = portfolio_service.get_portfolio(portfolio_id)
        if portfolio_data and portfolio_data.get("is_active", False):
            portfolio_data["is_active"] = False
            portfolio_service.update_portfolio(portfolio_id, portfolio_data)
            logger.info(f"Marked portfolio {portfolio_id} as inactive in database")
    except Exception as e:
        error_msg = f"Error updating portfolio status for {portfolio_id}: {str(e)}"
        logger.error(error_msg)
        cleanup_errors.append(error_msg)
    
    if cleanup_errors:
        logger.warning(f"Portfolio {portfolio_id} simulation stopped with {len(cleanup_errors)} errors")
    else:
        logger.info(f"Portfolio {portfolio_id} simulation and streams stopped successfully")


def shutdown() -> None:
    """Clean up all background tasks on shutdown"""
    logger.info("Shutting down background tasks...")
    
    # Track any errors during shutdown
    errors = []
    
    # Stop all simulation tasks
    for portfolio_id in list(active_simulations.keys()):
        try:
            stop_portfolio_simulation(portfolio_id)
        except Exception as e:
            error_msg = f"Error stopping simulation for portfolio {portfolio_id}: {str(e)}"
            logger.error(error_msg)
            errors.append(error_msg)
    
    # Double-check that all streams are closed
    for portfolio_id in list(active_streams.keys()):
        try:
            for stream_key, stream in active_streams[portfolio_id].items():
                if stream:
                    try:
                        stream.close()
                    except Exception:
                        pass  # Already logged in stop_portfolio_simulation
            del active_streams[portfolio_id]
        except Exception as e:
            error_msg = f"Error closing streams for portfolio {portfolio_id} during shutdown: {str(e)}"
            logger.error(error_msg)
            errors.append(error_msg)
    
    # Clear all remaining data structures
    active_simulations.clear()
    active_streams.clear()
    
    if errors:
        logger.warning(f"Background tasks shutdown completed with {len(errors)} errors")
    else:
        logger.info("All background tasks have been stopped successfully")
