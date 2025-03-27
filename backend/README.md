# StockSage-AI Backend

This is the FastAPI backend for the StockSage-AI stock trading simulator.

## Setup Instructions

### Prerequisites
- Python 3.12+
- Firebase project with Realtime Database

### Installation with Poetry (Recommended)

1. Install Poetry if you haven't already by following the official installation guide:
   [Install Poetry](https://python-poetry.org/docs/#installation)

2. Install dependencies:
   ```
   poetry install
   ```

3. Run the FastAPI server:
   ```
   poetry run python -m uvicorn stocksage_api.main:app --reload
   ```

### Alternative Installation with virtualenv

If you prefer not to use Poetry, you can use virtualenv:

1. Create a virtual environment:
   ```
   python -m venv .venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```
     .\.venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source .venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```
   python -m uvicorn stocksage_api.main:app --reload
   ```

### Environment Setup

Copy the `.env.example` file to create a new `.env` file in the backend directory:

  ```
  copy .env.example .env
  ```

Then open the `.env` file and replace the placeholder values with your actual Firebase configuration:


### API Documentation

The API will be available at http://localhost:8000

You can verify the server is running by visiting:
- http://localhost:8000/ - Should display a welcome message
- http://localhost:8000/api/health - Should display a health status
- http://localhost:8000/firebase/test - Should test Firebase connection
- http://localhost:8000/docs - Interactive API documentation

### Project Structure

- `stocksage_api/` - Main package directory
  - `config/` - Configuration files for the application
  - `services/` - Service layer for business logic
  - `routes/` - API route definitions

### Firebase Integration

The backend integrates with Firebase for data storage and authentication using two libraries:

1. **Firebase Admin SDK**
   - Authentication and user management
   - Administrative database operations
   - Security rules management
   - Server-side validation

2. **Pyrebase4**
   - Real-time database operations
   - Real-time data streaming
   - Client-side authentication
   - Support for real-time updates

This dual-library approach leverages the strengths of each library:
- Firebase Admin SDK provides secure server-side authentication and admin capabilities
- Pyrebase provides easier real-time database access and streaming

To verify your Firebase connection is working:
1. Visit http://localhost:8000/firebase/test
2. The test will verify both Firebase Admin SDK and Pyrebase connections
3. Check your Firebase console to see the test data in the "test_admin" and "test_pyrebase" nodes

### Troubleshooting

If you encounter issues with pyrebase4 or other dependencies:

1. Make sure setuptools is installed:
   ```
   pip install setuptools
   ```

2. If you get a "No module named 'pkg_resources'" error:
   ```
   pip install --upgrade setuptools
   ```


## Firebase Setup

StockSage uses Firebase for backend storage. This application requires proper Firebase credentials to function.

### Firebase Setup Steps:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Realtime Database in your project

2. **Get Firebase Credentials**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file to a secure location on your computer
   - Note the full path to this file - you'll need it in the next step

3. **Set Up Environment Variables**
   - Copy `.env.example` to `.env` in the backend directory
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` variable to the full path of your credentials file:
     ```
     GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your-firebase-credentials.json
     ```
   - Fill in the required Firebase configuration:
     ```
     FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
     FIREBASE_PROJECT_ID=your-project-id
     ```
   - These values can be found in the Firebase Console under Project Settings

4. **Verify Setup**
   - Run the setup check script:
     ```
     poetry run python -m scripts.check_firebase_setup
     ```
   - The script will verify your Firebase credentials and connection

5. **Troubleshooting**
   - Make sure the path in `GOOGLE_APPLICATION_CREDENTIALS` is correct and accessible
   - On Windows, use either double backslashes or forward slashes in the path
   - Ensure your Firebase Realtime Database is enabled in the Firebase Console
   - Check that your service account has the correct permissions