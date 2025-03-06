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

Create a `.env` file in the backend directory with the following Firebase configuration:

  ```
   # Firebase Configuration
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### API Documentation

The API will be available at http://localhost:8000

You can verify the server is running by visiting:
- http://localhost:8000/ - Should display a welcome message
- http://localhost:8000/api/health - Should display a health status
- http://localhost:8000/firebase/test - Should test Firebase connection
- http://localhost:8000/docs - Interactive API documentation

### Project Structure

- `stocksage_api/` - Main package directory
  - `main.py` - Entry point for the FastAPI application
  - `config/` - Configuration files
    - `firebase_config.py` - Firebase configuration
  - `services/` - Service layer
    - `firebase_service.py` - Firebase service for database operations
  - `routes/` - API routes
    - `firebase_test.py` - Firebase test endpoints
  - `__init__.py` - Package initialization file

### Firebase Integration

The backend integrates with Firebase Realtime Database for data storage. The integration provides:

- Basic CRUD operations (Create, Read, Update, Delete)
- Connection testing via the `/firebase/test` endpoint
- Error handling for database operations

To verify your Firebase connection is working:
1. Visit http://localhost:8000/firebase/test
2. Check your Firebase console to see the test data at the "test" node

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

3. If you still have issues with pyrebase4, try installing it directly:
   ```
   pip install pyrebase4==4.8.0
   ```