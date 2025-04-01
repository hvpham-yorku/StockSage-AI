import firebase_admin
from firebase_admin import credentials, db, auth
import logging
import sys
from typing import Dict, Any, Optional, Callable, TypeVar, List
from ..config.firebase_config import firebase_config
from datetime import datetime

# Import pyrebase for real-time data operations
try:
    import pyrebase
except ImportError:
    print("Error: pyrebase4 is required. Install it using 'pip install pyrebase4'")
    sys.exit(1)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define type variables and custom types
T = TypeVar('T')
PathType = str
DataType = Dict[str, Any]
UserIdType = str
TokenType = str
DatabaseReference = Any  # Firebase database reference type
UserRecord = Any  # Firebase UserRecord type
PyrebaseResponse = Any  # Pyrebase response type
StreamType = Any  # Pyrebase stream type
CallbackType = Callable[[Dict[str, Any]], None]


class FirebaseService:
    def __init__(self):
        """Initialize Firebase Admin SDK and Pyrebase for different operations"""
        # Get the firebase configuration
        self.database_url: str = firebase_config.get('databaseURL')
        self.project_id: str = firebase_config.get('projectId')
        
        # Find service account file
        service_account_path: str = firebase_config.get('serviceAccount')
        
        if not service_account_path:
            logger.error("Firebase credentials not found in any standard location")
            raise ValueError("Firebase credentials not found. Please set up Firebase properly.")
        
        # Initialize Firebase Admin SDK for authentication and admin operations
        try:
            # Check if Firebase Admin SDK is already initialized
            try:
                self.admin_app = firebase_admin.get_app()
                logger.info("Using existing Firebase Admin app")
            except ValueError:
                # No app exists, initialize new one
                logger.info(f"Using service account from: {service_account_path}")
                cred = credentials.Certificate(service_account_path)
                
                # Initialize the app with credentials and database URL
                if self.database_url:
                    self.admin_app = firebase_admin.initialize_app(cred, {
                        'databaseURL': self.database_url
                    })
                else:
                    # Use default database URL based on project ID
                    self.admin_app = firebase_admin.initialize_app(cred, {
                        'databaseURL': f'https://{self.project_id}.firebaseio.com'
                    })
            
            # Get admin database reference
            self.admin_db = db
            self.admin_auth = auth
            logger.info("Firebase Admin SDK initialized successfully")
            
            # Initialize Pyrebase for real-time database operations
            pyrebase_config: Dict[str, str] = {
                "apiKey": firebase_config.get("apiKey"),
                "authDomain": firebase_config.get("authDomain"),
                "databaseURL": self.database_url,
                "storageBucket": firebase_config.get("storageBucket"),
                "serviceAccount": service_account_path
            }
            
            self.pyrebase_app = pyrebase.initialize_app(pyrebase_config)
            self.rtdb = self.pyrebase_app.database()
            self.pyrebase_auth = self.pyrebase_app.auth()
            logger.info("Pyrebase initialized successfully for real-time operations")
            
        except Exception as e:
            logger.error(f"Error initializing Firebase: {str(e)}")
            raise ValueError(f"Failed to initialize Firebase: {str(e)}")
    
    # Admin operations using Firebase Admin SDK
    def admin_get_data(self, path: PathType) -> Optional[Dict[str, Any]]:
        """Retrieve data from specified path using Admin SDK"""
        ref = self.admin_db.reference(path)
        return ref.get()
    
    def admin_set_data(self, path: PathType, data: DataType) -> None:
        """Set data at specified path using Admin SDK"""
        ref = self.admin_db.reference(path)
        return ref.set(data)
    
    def admin_update_data(self, path: PathType, data: DataType) -> None:
        """Update data at specified path using Admin SDK"""
        ref = self.admin_db.reference(path)
        return ref.update(data)
    
    def admin_delete_data(self, path: PathType) -> None:
        """Delete data at specified path using Admin SDK"""
        ref = self.admin_db.reference(path)
        return ref.delete()
    
    # Real-time operations using Pyrebase
    def get_data(self, path: PathType) -> Optional[Dict[str, Any]]:
        """Retrieve data from specified path using Pyrebase"""
        try:
            return self.rtdb.child(path).get().val()
        except Exception as e:
            logger.error(f"Network error while getting data from {path}: {str(e)}")
            # Consider whether to raise or return None based on your error handling strategy
            return None
    
    def set_data(self, path: PathType, data: DataType) -> PyrebaseResponse:
        """Set data at specified path using Pyrebase"""
        return self.rtdb.child(path).set(data)
    
    def push_data(self, path: PathType, data: DataType) -> PyrebaseResponse:
        """Push data to specified path using Pyrebase (generates unique key)"""
        return self.rtdb.child(path).push(data)
    
    def update_data(self, path: PathType, data: DataType) -> PyrebaseResponse:
        """Update data at specified path using Pyrebase"""
        return self.rtdb.child(path).update(data)
    
    def delete_data(self, path: PathType) -> PyrebaseResponse:
        """Delete data at specified path using Pyrebase"""
        return self.rtdb.child(path).remove()
    
    def stream_data(self, path: PathType, callback: CallbackType) -> StreamType:
        """Stream data updates from specified path using Pyrebase"""
        return self.rtdb.child(path).stream(callback)
    
    # User Authentication Methods
    def create_user(self, email: str, password: str) -> UserRecord:
        """Create a new user with Firebase Authentication"""
        return self.admin_auth.create_user(
            email=email,
            password=password
        )
    
    def get_user(self, user_id: UserIdType) -> UserRecord:
        """Get user data by user ID"""
        return self.admin_auth.get_user(user_id)
    
    def get_user_by_email(self, email: str) -> UserRecord:
        """Get user data by email"""
        return self.admin_auth.get_user_by_email(email)
    
    def update_user(self, user_id: UserIdType, **kwargs) -> UserRecord:
        """
        Update Firebase user properties
        
        Supported properties: 
        - email
        - password
        - display_name
        - photo_url
        - phone_number
        - disabled
        - email_verified
        """
        return self.admin_auth.update_user(user_id, **kwargs)
    
    def disable_user(self, user_id: UserIdType) -> UserRecord:
        """Disable a user account"""
        return self.admin_auth.update_user(user_id, disabled=True)
    
    def enable_user(self, user_id: UserIdType) -> UserRecord:
        """Enable a user account"""
        return self.admin_auth.update_user(user_id, disabled=False)
    
    def delete_user(self, user_id: UserIdType) -> None:
        """Delete a user account from Firebase Authentication"""
        return self.admin_auth.delete_user(user_id)
    
    def set_custom_user_claims(self, user_id: UserIdType, custom_claims: Dict[str, Any]) -> None:
        """Set custom claims on a user"""
        return self.admin_auth.set_custom_user_claims(user_id, custom_claims)
    
    def verify_id_token(self, id_token: TokenType) -> Dict[str, Any]:
        """Verify an ID token using Firebase Admin SDK"""
        try:
            return self.admin_auth.verify_id_token(id_token, clock_skew_seconds=30)
        except auth.ExpiredIdTokenError:
            logger.warning("Token expired - rejecting request")
            raise
        except auth.InvalidIdTokenError as e:
            if "Token used too early" in str(e):
                logger.warning("Token timing issue detected - check server clock sync")
            raise
        except Exception as e:
            error_message = str(e)
            if "quota exceeded" in error_message.lower() or "429" in error_message:
                logger.warning("Firebase rate limit exceeded")
                raise ValueError("Service temporarily unavailable due to high traffic. Please try again later.")
            raise
    
    def sign_in_with_email_password(self, email: str, password: str) -> Dict[str, Any]:
        """Sign in with email and password using Pyrebase"""
        return self.pyrebase_auth.sign_in_with_email_and_password(email, password)
    
    def get_account_info(self, id_token: TokenType) -> Dict[str, Any]:
        """Get account info using Pyrebase"""
        return self.pyrebase_auth.get_account_info(id_token)

    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh the user's token"""
        try:
            return self.pyrebase_auth.refresh(refresh_token)
        except Exception as e:
            logger.error(f"Failed to refresh token: {str(e)}")
            raise

    # User Profile Methods
    def get_user_profile(self, user_id: UserIdType) -> Optional[Dict[str, Any]]:
        """Get a user profile from the database"""
        return self.get_data(f"users/{user_id}")

    def update_user_profile(self, user_id: UserIdType, data: DataType) -> PyrebaseResponse:
        """Update a user profile in the database"""
        return self.update_data(f"users/{user_id}", data)

    def create_user_profile(self, user_id: UserIdType, data: DataType) -> PyrebaseResponse:
        """Create a new user profile in the database"""
        return self.set_data(f"users/{user_id}", data)
    
    def delete_user_profile(self, user_id: UserIdType) -> PyrebaseResponse:
        """Delete a user profile from the database"""
        return self.delete_data(f"users/{user_id}")
    
    def delete_user_complete(self, user_id: UserIdType) -> None:
        """Delete both the Firebase Auth user and user profile"""
        try:
            # Delete the user profile first
            self.delete_user_profile(user_id)
            # Then delete the Auth user
            self.delete_user(user_id)
            logger.info(f"User {user_id} completely deleted")
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {str(e)}")
            raise e


    # --- Portfolio Methods ---
    def get_portfolios(self, user_id: str) -> List[Dict[str, Any]]:
        portfolios = self.get_data(f"portfolios/{user_id}")
        if portfolios:
            return [{"id": pid, **pdata} for pid, pdata in portfolios.items()]
        return []

    def get_portfolio(self, user_id: str, portfolio_id: str) -> Optional[Dict[str, Any]]:
        return self.get_data(f"portfolios/{user_id}/{portfolio_id}")

    def create_portfolio(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        name = data.get("name")
        if not name:
            raise ValueError("Portfolio must have a name")
        portfolio_id = name.replace(" ", "_").lower()

        existing = self.get_data(f"portfolios/{user_id}/{portfolio_id}")
        if existing:
            raise ValueError(f"A portfolio with the name '{name}' already exists.")

        if isinstance(data.get("start_date"), datetime):
            data["start_date"] = data["start_date"].isoformat()

        data["id"] = portfolio_id

        self.set_data(f"portfolios/{user_id}/{portfolio_id}", data)
        return data


    def get_transactions(self, user_id: str, portfolio_id: str) -> List[Dict[str, Any]]:
        txns = self.get_data(f"transactions/{user_id}/{portfolio_id}")
        if txns:
            return list(txns.values())
        return []

    def add_transaction(self, user_id: str, portfolio_id: str, txn: Dict[str, Any]) -> str:
        res = self.push_data(f"transactions/{user_id}/{portfolio_id}", txn)
        return res["name"]  # Firebase returns generated key as 'name'

    def update_portfolio_balance(self, user_id: str, portfolio_id: str, balance: float):
        self.update_data(f"portfolios/{user_id}/{portfolio_id}", {"initial_balance": balance})

    def delete_portfolio(self, user_id: str, portfolio_id: str):
        self.delete_data(f"portfolios/{user_id}/{portfolio_id}")
        self.delete_data(f"transactions/{user_id}/{portfolio_id}")

    def buy_stock(self, user_id: str, portfolio_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
        # get portfolio
        portfolio = self.get_portfolio(user_id, portfolio_id)
        if not portfolio:
            raise ValueError("Portfolio not found")

        # check balance
        current_balance = portfolio.get("initial_balance", 0)
        total_cost = request["price"] * request["quantity"]

        if total_cost > current_balance:
            raise ValueError("Insufficient balance to complete purchase")

        # update balance
        new_balance = current_balance - total_cost
        self.update_portfolio_balance(user_id, portfolio_id, new_balance)

        # add transaction
        transaction = {
            "date": datetime.utcnow().isoformat(),
            "symbol": request["symbol"],
            "type": "buy",
            "quantity": request["quantity"],
            "price": request["price"]
        }
        self.add_transaction(user_id, portfolio_id, transaction)

        return {"message": "Stock purchased successfully", "new_balance": new_balance}

    def sell_stock(self, user_id: str, portfolio_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
        # get portfolio
        portfolio = self.get_portfolio(user_id, portfolio_id)
        if not portfolio:
            raise ValueError("Portfolio not found")

        # get current balance
        current_balance = portfolio.get("initial_balance", 0)

        # calculate revenue
        revenue = request["price"] * request["quantity"]
        new_balance = current_balance + revenue

        # update balance
        self.update_portfolio_balance(user_id, portfolio_id, new_balance)

        # add transaction
        transaction = {
            "date": datetime.utcnow().isoformat(),
            "symbol": request["symbol"],
            "type": "sell",
            "quantity": request["quantity"],
            "price": request["price"]
        }
        self.add_transaction(user_id, portfolio_id, transaction)

        return {"message": "Stock sold successfully", "new_balance": new_balance}


    def get_performance(self, user_id: str, portfolio_id: str) -> Dict[str, Any]:
        # simple calculation for "test"
        portfolio = self.get_portfolio(user_id, portfolio_id)
        if not portfolio:
            raise ValueError("Portfolio not found")

        initial_balance = portfolio.get("initial_balance", 0)
        transactions = self.get_transactions(user_id, portfolio_id)

        profit_loss = 0.0

        for txn in transactions:
            if txn["type"] == "buy":
                profit_loss -= txn["price"] * txn["quantity"]
            elif txn["type"] == "sell":
                profit_loss += txn["price"] * txn["quantity"]

        current_value = initial_balance + profit_loss
        return_percentage = (profit_loss / initial_balance * 100) if initial_balance else 0.0

        return {
            "portfolio_id": portfolio_id,
            "return_percentage": round(return_percentage, 2),
            "profit_loss": round(profit_loss, 2),
            "current_value": round(current_value, 2)
        }




# Create a singleton instance
firebase_service = FirebaseService()