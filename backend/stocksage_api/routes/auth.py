from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..services.firebase_service import firebase_service

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Models
class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

# Helper functions
async def get_current_user(authorization: str = Header(...)):
    """Verify the Firebase ID token and return the user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Verify the ID token
        decoded_token = firebase_service.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Routes
@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the profile of the authenticated user"""
    try:
        user_id = current_user.get("uid")
        # Get user profile from database
        user_profile = firebase_service.get_data(f"users/{user_id}")
        
        if not user_profile:
            # Create a basic profile if none exists
            user_profile = {
                "id": user_id,
                "email": current_user.get("email"),
                "name": current_user.get("name", ""),
                "created_at": firebase_service.admin_auth.get_user(user_id).user_metadata.creation_timestamp
            }
            firebase_service.set_data(f"users/{user_id}", user_profile)
        
        return user_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user profile: {str(e)}")

@router.put("/profile")
async def update_profile(
    user_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update the authenticated user's profile"""
    try:
        user_id = current_user.get("uid")
        # Get existing profile
        existing_profile = firebase_service.get_data(f"users/{user_id}") or {}
        
        # Update with new data
        update_data = user_data.model_dump(exclude_unset=True)
        
        # Merge the updates with existing data
        for key, value in update_data.items():
            if value is not None:
                existing_profile[key] = value
        
        # Add updated_at timestamp
        existing_profile["updated_at"] = firebase_service.admin_db.reference('/.info/serverTimeOffset').get()
        
        # Save updated profile
        firebase_service.set_data(f"users/{user_id}", existing_profile)
        
        return existing_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}") 