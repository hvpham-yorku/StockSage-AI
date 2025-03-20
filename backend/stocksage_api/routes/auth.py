from fastapi import APIRouter, HTTPException, Depends, Security, Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from ..services.firebase_service import firebase_service
import time

# Create security scheme
security = HTTPBearer(
    scheme_name="Bearer Authentication",
    description="Enter your Firebase ID token",
    auto_error=True
)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Models
class UserPreferences(BaseModel):
    """User preferences model"""
    theme: Optional[str] = "light"
    notifications_enabled: Optional[bool] = True
    default_view: Optional[str] = "dashboard"
    # Additional user preferences can be added here

class UserProfileUpdate(BaseModel):
    """User profile update model"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    preferences: Optional[UserPreferences] = None

class UserRegistration(BaseModel):
    """User registration model"""
    email: EmailStr
    password: str
    name: Optional[str] = None
    preferences: Optional[UserPreferences] = None

class UserResponse(BaseModel):
    """User profile response model"""
    id: str
    email: str
    name: Optional[str] = None
    created_at: Optional[int] = None
    updated_at: Optional[int] = None
    preferences: Optional[UserPreferences] = None

class RegistrationResponse(BaseModel):
    """Response model for user registration"""
    message: str
    user_id: str
    profile: Dict[str, Any]

class TokenVerificationResponse(BaseModel):
    """Response model for token verification"""
    valid: bool
    user_id: str
    email: Optional[str] = None

# Helper functions
async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify the Firebase ID token and return the user"""
    try:
        # Get token from the credentials
        token = credentials.credentials
        
        # Verify the ID token
        decoded_token = firebase_service.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Invalid token: {str(e)}"
        )

# Routes
@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=RegistrationResponse,
            summary="Register new user",
            description="Register a new user with Firebase Authentication. This endpoint is primarily for testing/development as registration is typically handled on the frontend.")
async def register_user(user_data: UserRegistration):
    """Register a new user with Firebase Authentication
    
    Note: This endpoint is provided for testing/development purposes.
    In production, user registration is handled by Firebase Authentication on the frontend.
    """
    try:
        # Create the user in Firebase Auth
        new_user = firebase_service.create_user(
            email=user_data.email,
            password=user_data.password
        )
        
        # Create user profile in the database
        user_profile = {
            "id": new_user.uid,
            "email": user_data.email,
            "name": user_data.name or "",
            "created_at": int(time.time() * 1000),  # Current time in milliseconds
            "preferences": user_data.preferences.model_dump() if user_data.preferences else {
                "theme": "dark",
                "notifications_enabled": True,
                "default_view": "dashboard"
            }
        }
        
        # Save user profile
        firebase_service.create_user_profile(new_user.uid, user_profile)
        
        return RegistrationResponse(
            message="User registered successfully", 
            user_id=new_user.uid,
            profile=user_profile
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Failed to register user: {str(e)}"
        )

@router.get("/profile", response_model=UserResponse, summary="Get user profile", 
            description="Retrieves the authenticated user's profile. Requires a valid Firebase ID token.")
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get the profile of the authenticated user"""
    try:
        user_id = current_user.get("uid")
        # Get user profile from database
        user_profile = firebase_service.get_user_profile(user_id)
        
        if not user_profile:
            # Get user details from Firebase Auth
            auth_user = firebase_service.get_user(user_id)
            
            # Create a basic profile if none exists
            user_profile = {
                "id": user_id,
                "email": auth_user.email,
                "name": auth_user.display_name or "",
                "created_at": int(auth_user.user_metadata.creation_timestamp),
                "preferences": {
                    "theme": "dark",
                    "notifications_enabled": True,
                    "default_view": "dashboard"
                }
            }
            firebase_service.create_user_profile(user_id, user_profile)
        
        return user_profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to get user profile: {str(e)}"
        )

@router.put("/profile", response_model=UserResponse, summary="Update user profile",
           description="Updates the authenticated user's profile. Requires a valid Firebase ID token.")
async def update_profile(
    user_data: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update the authenticated user's profile"""
    try:
        user_id = current_user.get("uid")
        # Get existing profile
        existing_profile = firebase_service.get_user_profile(user_id) or {}
        
        # Ensure the profile has an id
        existing_profile["id"] = user_id
        
        # Update with new data
        update_data = user_data.model_dump(exclude_unset=True, exclude_none=True)
        
        # Merge the updates with existing data
        for key, value in update_data.items():
            if key == "preferences" and value is not None:
                # Merge preferences
                existing_preferences = existing_profile.get("preferences", {})
                if existing_preferences is None:
                    existing_preferences = {}
                    
                if isinstance(value, dict):
                    existing_preferences.update(value)
                else:
                    existing_preferences.update(value.dict(exclude_unset=True))
                    
                existing_profile["preferences"] = existing_preferences
            elif value is not None and key != "id":  # Skip id field from update data
                existing_profile[key] = value
        
        # Add updated_at timestamp
        existing_profile["updated_at"] = int(time.time() * 1000)  # Current time in milliseconds
        
        # Save updated profile
        firebase_service.update_user_profile(user_id, existing_profile)
        
        # If email was updated, update it in Firebase Auth as well
        if "email" in update_data and update_data["email"] is not None:
            firebase_service.update_user(user_id, email=update_data["email"])
            
        # If name was updated, update display_name in Firebase Auth as well
        if "name" in update_data and update_data["name"] is not None:
            firebase_service.update_user(user_id, display_name=update_data["name"])
        
        return existing_profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to update profile: {str(e)}"
        )

@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT, 
             summary="Delete user profile",
             description="Deletes the authenticated user's profile and optionally the Firebase Auth user. Requires a valid Firebase ID token.")
async def delete_profile(
    current_user: Dict[str, Any] = Depends(get_current_user), 
    delete_auth: bool = False
):
    """Delete the user profile (and optionally the Firebase Auth user)"""
    try:
        user_id = current_user.get("uid")
        
        if delete_auth:
            # Delete both profile and auth user
            firebase_service.delete_user_complete(user_id)
        else:
            # Delete only the user profile from the database
            firebase_service.delete_user_profile(user_id)
            
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to delete user profile: {str(e)}"
        )

@router.get("/verify", response_model=TokenVerificationResponse, 
           summary="Verify auth token",
           description="Verifies that the current Firebase ID token is valid. Use this endpoint to check authentication status.")
async def verify_token(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Verify that the current token is valid"""
    # If we get here, the token is valid (dependency would have failed otherwise)
    return TokenVerificationResponse(
        valid=True, 
        user_id=current_user.get("uid"),
        email=current_user.get("email")
    ) 