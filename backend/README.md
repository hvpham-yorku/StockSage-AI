# StockSage-AI Backend

This is the FastAPI backend for the StockSage-AI stock trading simulator.

## Setup Instructions

### Prerequisites
- Python 3.12+
- Poetry (for dependency management)

### Installation

1. Install Poetry if you haven't already by following the official installation guide:
   [Install Poetry](https://python-poetry.org/docs/#installation)

2. Install dependencies:
   ```
   poetry install
   ```

### Running the Server

Run the FastAPI server using:
```
python -m stocksage_api.main
```

The API will be available at http://localhost:8000

You can verify the server is running by visiting:
- http://localhost:8000/ - Should display a welcome message
- http://localhost:8000/api/health - Should display a health status
- http://localhost:8000/docs - Interactive API documentation

### Project Structure

- `stocksage_api/` - Main package directory
  - `main.py` - Entry point for the FastAPI application
  - `__init__.py` - Package initialization file

### Development

To run the server in development mode with auto-reload:
```
python -m stocksage_api.main
```

The server is already configured with auto-reload enabled.
