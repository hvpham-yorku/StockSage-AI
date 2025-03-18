import firebase_admin
from firebase_admin import credentials, db, auth
import logging
import sys
from ..config.firebase_config import firebase_config

# Import pyrebase for real-time data operations
try:
    import pyrebase
except ImportError:
    print("Error: pyrebase4 is required. Install it using 'pip install pyrebase4'")
    sys.exit(1)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FirebaseService:
    def __init__(self):
        """Initialize Firebase Admin SDK and Pyrebase for different operations"""
        # Get the firebase configuration
        self.database_url = firebase_config.get('databaseURL')
        self.project_id = firebase_config.get('projectId')
        
        # Find service account file
        service_account_path = firebase_config.get('serviceAccount')
        
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
            pyrebase_config = {
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
    def admin_get_data(self, path):
        """Retrieve data from specified path using Admin SDK"""
        ref = self.admin_db.reference(path)
        return ref.get()
    
    def admin_set_data(self, path, data):
        """Set data at specified path using Admin SDK"""
        ref = self.admin_db.reference(path)
        return ref.set(data)
    
    def admin_update_data(self, path, data):
        """Update data at specified path using Admin SDK"""
        ref = self.admin_db.reference(path)
        return ref.update(data)
    
    def admin_delete_data(self, path):
        """Delete data at specified path using Admin SDK"""
        ref = self.admin_db.reference(path)
        return ref.delete()
    
    # Real-time operations using Pyrebase
    def get_data(self, path):
        """Retrieve data from specified path using Pyrebase"""
        return self.rtdb.child(path).get().val()
    
    def set_data(self, path, data):
        """Set data at specified path using Pyrebase"""
        return self.rtdb.child(path).set(data)
    
    def push_data(self, path, data):
        """Push data to specified path using Pyrebase (generates unique key)"""
        return self.rtdb.child(path).push(data)
    
    def update_data(self, path, data):
        """Update data at specified path using Pyrebase"""
        return self.rtdb.child(path).update(data)
    
    def delete_data(self, path):
        """Delete data at specified path using Pyrebase"""
        return self.rtdb.child(path).remove()
    
    def stream_data(self, path, callback):
        """Stream data updates from specified path using Pyrebase"""
        return self.rtdb.child(path).stream(callback)
    
    # User Authentication Methods
    def create_user(self, email, password):
        """Create a new user with Firebase Authentication"""
        return self.admin_auth.create_user(
            email=email,
            password=password
        )
    
    def verify_id_token(self, id_token):
        """Verify an ID token using Firebase Admin SDK"""
        return self.admin_auth.verify_id_token(id_token)
    
    def sign_in_with_email_password(self, email, password):
        """Sign in with email and password using Pyrebase"""
        return self.pyrebase_auth.sign_in_with_email_and_password(email, password)
    
    def get_account_info(self, id_token):
        """Get account info using Pyrebase"""
        return self.pyrebase_auth.get_account_info(id_token)

    def get_user_profile(self, user_id):
        """Get a user profile from the database"""
        return self.get_data(f"users/{user_id}")

    def update_user_profile(self, user_id, data):
        """Update a user profile in the database"""
        return self.update_data(f"users/{user_id}", data)

    def create_user_profile(self, user_id, data):
        """Create a new user profile in the database"""
        return self.set_data(f"users/{user_id}", data)

# Create a singleton instance
firebase_service = FirebaseService()