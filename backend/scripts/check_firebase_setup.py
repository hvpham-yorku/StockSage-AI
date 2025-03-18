import os
import sys

# Add the project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from stocksage_api.services.firebase_service import firebase_service
    from dotenv import load_dotenv

    def check_setup():
        """Check if Firebase is properly set up"""
        print("Checking Firebase configuration...")

        # Check for .env file
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
        if not os.path.exists(env_path):
            print(
                "❌ .env file not found! Please create one with GOOGLE_APPLICATION_CREDENTIALS set."
            )
            return False

        print("✅ .env file found")

        # Check if GOOGLE_APPLICATION_CREDENTIALS is set
        load_dotenv(env_path)
        creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

        if not creds_path:
            print("❌ GOOGLE_APPLICATION_CREDENTIALS not set in .env file")
            print("   Please add it to your .env file:")
            print('   GOOGLE_APPLICATION_CREDENTIALS="path/to/your/credentials.json"')
            return False

        if not os.path.exists(creds_path):
            print(f"❌ Credentials file not found at: {creds_path}")
            print("   Please check the path is correct")
            return False

        print(f"✅ Credentials file found at: {creds_path}")

        # Test Firebase connections
        try:
            timestamp = "test_setup"
            
            # Test Admin SDK
            print("Testing Firebase Admin SDK connection...")
            test_data_admin = {"message": "Firebase setup check (Admin SDK)", "timestamp": timestamp}
            firebase_service.admin_set_data("test_setup_admin", test_data_admin)
            result_admin = firebase_service.admin_get_data("test_setup_admin")
            
            if result_admin and result_admin.get("message") == "Firebase setup check (Admin SDK)":
                print("✅ Firebase Admin SDK connection successful")
            else:
                print("❌ Firebase Admin SDK connection test failed")
                return False
                
            # Test Pyrebase
            print("Testing Pyrebase connection...")
            test_data_pyrebase = {"message": "Firebase setup check (Pyrebase)", "timestamp": timestamp}
            firebase_service.set_data("test_setup_pyrebase", test_data_pyrebase)
            result_pyrebase = firebase_service.get_data("test_setup_pyrebase")
            
            if result_pyrebase and result_pyrebase.get("message") == "Firebase setup check (Pyrebase)":
                print("✅ Pyrebase connection successful")
            else:
                print("❌ Pyrebase connection test failed")
                return False
            
            print("\n🎉 Firebase setup complete - all connections verified!")
            return True
            
        except Exception as e:
            print(f"❌ Firebase connection error: {str(e)}")
            return False

    if __name__ == "__main__":
        try:
            success = check_setup()
            if not success:
                sys.exit(1)
        except Exception as e:
            print(f"❌ Firebase setup check failed: {str(e)}")
            sys.exit(1)

except ImportError as e:
    print(f"❌ Error importing modules: {str(e)}")
    print("  Make sure you've installed the required dependencies:")
    print("  pip install firebase-admin pyrebase4 python-dotenv")
    sys.exit(1)
