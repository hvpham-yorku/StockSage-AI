from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.openapi.utils import get_openapi
from datetime import datetime
import sys
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api.log")
    ]
)
logger = logging.getLogger(__name__)

# Import background tasks module for cleanup
from .services import background_tasks

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: place startup code here if needed
    logger.info("Starting StockSage API server with lifespan context")
    
    yield  # This line separates startup from shutdown code
    
    # Shutdown: clean up resources
    logger.info("Application shutting down. Cleaning up background tasks...")
    background_tasks.shutdown()
    logger.info("Cleanup complete")

# Try to import Firebase - if it fails, exit with error
try:
    from .routes import firebase_test
    from .routes import auth  # Import the auth routes
    from .routes import public_stocks  # Import the public stock routes
    from .routes import education  # Import the education routes
    from .routes.portfolios import router as portfolios_router  # Import the new portfolio routes structure
    from .services.firebase_service import firebase_service
except Exception as e:
    logger.error(f"Failed to initialize Firebase: {str(e)}")
    print(f"ERROR: Failed to initialize Firebase: {str(e)}")
    print("Please set up Firebase credentials correctly.")
    print("Run 'python -m scripts.check_firebase_setup' for diagnostic information.")
    sys.exit(1)

# Import yfinance for use across the application
try:
    import yfinance as yf
    logger.info("Successfully imported yfinance")
except ImportError:
    logger.error("Failed to import yfinance. Please install it with 'pip install yfinance'")
    print("ERROR: Failed to import yfinance. Please install it with 'pip install yfinance'")
    sys.exit(1)

app = FastAPI(
    title="StockSage API",
    description="""
Welcome to the StockSage-AI API documentation. This API provides access to stock market data, 
company information, and AI-powered stock recommendations for educational purposes.

## Key Features

- **Real-time Stock Data**: Get current prices, daily changes, and trading volumes
- **Historical Stock Data**: Retrieve price history for charting and analysis
- **Company Information**: Access detailed profiles of publicly traded companies
- **AI Recommendations**: Get buy, hold, or sell recommendations with confidence scores
- **User Authentication**: Secure Firebase-based authentication for user accounts
- **Portfolio Simulation**: Create and manage virtual trading portfolios with historical simulation

## API Sections

- **Stocks & Market Data**: Endpoints for accessing stock information
- **Authentication**: User registration, profile management, and token verification
- **Educational Content**: Stock terms glossary and trading tips
- **Portfolios**: Create and manage virtual portfolios with time simulation

## Authentication

Public endpoints (Stocks and Education) require no authentication.
Protected endpoints under /api/auth/ (except /register) and /api/portfolios/ require a valid Firebase ID token.
Use the Authorize button in the top-right corner with your Firebase token to access protected endpoints.
    """,
    version="0.1.0",
    docs_url=None,  # We'll customize the docs endpoint
    redoc_url=None,  # We'll customize the redoc endpoint
    openapi_url="/api/openapi.json",
    lifespan=lifespan  # Use the lifespan context manager for startup/shutdown
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],  # Allow all headers
    expose_headers=["Content-Disposition", "Content-Type", "Authorization"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Mock data for demonstration
mock_stocks = [
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 175.34, "change": 2.34},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 328.79, "change": -1.23},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 142.56, "change": 0.78},
    {"symbol": "AMZN", "name": "Amazon.com, Inc.", "price": 178.12, "change": 3.45},
    {"symbol": "TSLA", "name": "Tesla, Inc.", "price": 193.57, "change": -2.67},
]

# Verify Firebase connection at startup
try:
    # Test Firebase connections by writing and reading data
    timestamp = str(datetime.now())
    
    # Test Admin SDK
    admin_test_data = {"message": "API Startup Test (Admin SDK)", "timestamp": timestamp}
    firebase_service.admin_set_data("api_startup_test_admin", admin_test_data)
    admin_result = firebase_service.admin_get_data("api_startup_test_admin")
    
    # Test Pyrebase
    pyrebase_test_data = {"message": "API Startup Test (Pyrebase)", "timestamp": timestamp}
    firebase_service.set_data("api_startup_test_pyrebase", pyrebase_test_data)
    pyrebase_result = firebase_service.get_data("api_startup_test_pyrebase")
    
    if not admin_result or admin_result.get("message") != "API Startup Test (Admin SDK)":
        print("ERROR: Firebase Admin SDK connection test failed - unexpected response")
        print("Please check your Firebase credentials and configuration.")
        sys.exit(1)
        
    if not pyrebase_result or pyrebase_result.get("message") != "API Startup Test (Pyrebase)":
        print("ERROR: Pyrebase connection test failed - unexpected response")
        print("Please check your Firebase credentials and configuration.")
        sys.exit(1)
        
    print("✅ Firebase connections verified successfully (Admin SDK and Pyrebase)")
    logger.info("Firebase connections verified successfully")
except Exception as e:
    logger.error(f"Firebase connection test failed: {str(e)}")
    print(f"ERROR: Firebase connection test failed: {str(e)}")
    print("Please check your Firebase credentials and configuration.")
    sys.exit(1)

# Custom OpenAPI function to enhance documentation
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Initialize components if it doesn't exist
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    
    # Add security schemes for authentication
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your Firebase ID token (e.g. 'eyJhbGciOiJSUzI1...')"
        }
    }
    
    # Apply security only to authenticated endpoints
    # This is a more precise approach - we'll explicitly set security for each path
    # Only secure auth routes except registration
    for path in openapi_schema["paths"]:
        if path.startswith("/api/auth/") or path.startswith("/api/portfolios") or path == "/api/portfolios":
            for method in openapi_schema["paths"][path]:
                if method.lower() in ["get", "post", "put", "delete", "patch"]:
                    openapi_schema["paths"][path][method]["security"] = [{"bearerAuth": []}]



    # Add API tags with descriptions
    openapi_schema["tags"] = [
        {
            "name": "Stocks & Market Data",
            "description": "Endpoints for retrieving stock prices, history, and company information"
        },
        {
            "name": "authentication",
            "description": "User authentication and profile management endpoints"
        },
        {
            "name": "education",
            "description": "Stock market educational content and glossary"
        },
        {
            "name": "portfolios",
            "description": "Manage user portfolios and trades"
        }
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Custom Swagger UI with enhanced styling
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - API Documentation",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css",
        swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
        swagger_ui_parameters={
            "docExpansion": "none",
            "defaultModelsExpandDepth": 2,
            "defaultModelExpandDepth": 2,
            "deepLinking": True,
            "displayRequestDuration": True,
            "filter": True,
            "showExtensions": True,
            "syntaxHighlight.theme": "monokai",
            "oauth2RedirectUrl": app.swagger_ui_oauth2_redirect_url
        }
    )

# Add custom ReDoc endpoint
@app.get("/redoc", include_in_schema=False)
async def custom_redoc_html():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - ReDoc Documentation",
        redoc_js_url="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js",
        redoc_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
    )

# Include routers
app.include_router(auth.router)  # Add the auth router
app.include_router(public_stocks.router)  # Add the public stocks router
app.include_router(education.router)  # Add the education router
app.include_router(portfolios_router)  # Add the portfolios router with new structure
app.include_router(firebase_test.router)  # Add the firebase test router


# Root endpoint with improved documentation links
@app.get("/")
async def root():
    return {
        "message": "Welcome to StockSage API",
        "documentation": {
            "swagger_ui": "/docs",
            "openapi_schema": "/api/openapi.json"
        },
        "api_version": "0.1.0",
        "status": "healthy",
        "endpoints": {
            "stocks": "/api/stocks",
            "stock_search": "/api/stocks/search?query={query}",
            "auth": "/api/auth",
            "education": "/api/education",
            "portfolios": "/api/portfolios"
        }
    }

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "firebase": "up",
            "yfinance": "up"
        },
        "api_version": app.version
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting StockSage API server")
    uvicorn.run("stocksage_api.main:app", host="0.0.0.0", port=8000, reload=True)