try:
    # First try to import pyrebase4
    import pyrebase4 as pyrebase
except ImportError:
    try:
        # Fall back to regular pyrebase
        import pyrebase
    except ImportError:
        # If both fail, provide a clear error message
        raise ImportError("Firebase dependencies not installed correctly. Run 'poetry add setuptools pyrebase4'")

from ..config.firebase_config import firebase_config

class FirebaseService:
    def __init__(self):
        self.firebase = pyrebase.initialize_app(firebase_config)
        self.db = self.firebase.database()
        self.auth = self.firebase.auth()
    
    # Basic database operations
    def get_data(self, path):
        """Retrieve data from specified path"""
        return self.db.child(path).get().val()
    
    def set_data(self, path, data):
        """Set data at specified path"""
        return self.db.child(path).set(data)
    
    def push_data(self, path, data):
        """Push data to specified path (generates unique key)"""
        return self.db.child(path).push(data)
    
    def update_data(self, path, data):
        """Update data at specified path"""
        return self.db.child(path).update(data)
    
    def delete_data(self, path):
        """Delete data at specified path"""
        return self.db.child(path).remove()

# Create a singleton instance
firebase_service = FirebaseService()