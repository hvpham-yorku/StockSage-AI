from fastapi import APIRouter, HTTPException
from ..services.firebase_service import firebase_service
from datetime import datetime

router = APIRouter(prefix="/firebase", tags=["firebase"])

@router.get("/test")
async def test_firebase_connection():
    try:
        # Test write operation
        test_data = {"message": "Hello from StockSage-AI!", "timestamp": str(datetime.now())}
        firebase_service.set_data("test", test_data)
        
        # Test read operation
        result = firebase_service.get_data("test")
        
        return {
            "status": "success",
            "message": "Firebase connection successful",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase connection failed: {str(e)}")