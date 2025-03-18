from fastapi import APIRouter, HTTPException
from ..services.firebase_service import firebase_service
from datetime import datetime

router = APIRouter(prefix="/firebase", tags=["firebase"])

@router.get("/test")
async def test_firebase_connection():
    try:
        timestamp = str(datetime.now())
        
        # Test Pyrebase real-time DB write operation
        pyrebase_test_data = {
            "message": "Hello from StockSage-AI! (Pyrebase)",
            "timestamp": timestamp
        }
        firebase_service.set_data("test_pyrebase", pyrebase_test_data)
        
        # Test Admin SDK write operation
        admin_test_data = {
            "message": "Hello from StockSage-AI! (Admin SDK)",
            "timestamp": timestamp
        }
        firebase_service.admin_set_data("test_admin", admin_test_data)
        
        # Test read operations
        pyrebase_result = firebase_service.get_data("test_pyrebase")
        admin_result = firebase_service.admin_get_data("test_admin")
        
        return {
            "status": "success",
            "message": "Firebase connection successful using both Firebase Admin SDK and Pyrebase",
            "pyrebase_data": pyrebase_result,
            "admin_data": admin_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase connection failed: {str(e)}")