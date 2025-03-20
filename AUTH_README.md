# Authentication & API Usage Guide for StockSage-AI

This guide helps you set up authentication for the StockSage-AI application and explains how to properly use the API client to communicate between the Next.js frontend and FastAPI backend.

## Prerequisites

1. A Firebase project with Authentication enabled
2. The FastAPI backend running
3. Node.js and npm installed

## Firebase Authentication Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Email/Password authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
4. Create a web app:
   - Go to Project settings > Your apps
   - Click "Add app" and select web
   - Register your app with a nickname
   - Copy the Firebase config object

## Environment Configuration

Create or update the `.env.local` file in the root of the frontend project with your Firebase configuration:

```
# Firebase configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# API configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Backend Configuration

1. Generate a Firebase Admin SDK private key:
   - Go to Project settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file

2. Place the private key file in the backend's config directory:
   ```
   StockSage-AI/backend/stocksage_api/config/firebase-credentials.json
   ```

3. Make sure the backend's Firebase configuration points to this credentials file.

## Using the API Client (`api.ts`)

The `api.ts` file provides a TypeScript client for interacting with the backend API. It handles authentication tokens, request/response formatting, and error handling.

### Key Features

- Automatic token management for authenticated requests
- Type-safe request and response models
- Error handling and reporting
- Consistent interface for all API endpoints

### How to Use the API Client

1. Import the API client in your component:

```typescript
import { api } from '@/lib/api';
```

2. Call API methods directly:

```typescript
// Example: Get current user profile
const userProfile = await api.auth.getProfile();

// Example: Update user profile
await api.auth.updateProfile({
  name: 'John Doe',
  preferences: {
    theme: 'dark',
    notifications_enabled: true
  }
});

// Example: Get stock data
const stocks = await api.stocks.getAll();
```

### Authentication Flow

The API client automatically:
1. Gets the current user from Firebase Auth
2. Retrieves a fresh ID token
3. Includes the token in the Authorization header
4. Handles token refresh as needed

### Adding New API Endpoints

To add a new endpoint to the API client:

1. Add appropriate interface(s) for request/response models:

```typescript
export interface NewDataType {
  property1: string;
  property2: number;
}
```

2. Add the new endpoint function to the appropriate section:

```typescript
// Example: Adding to stocks section
stocks: {
  // Existing methods...
  
  // New method
  getNewData: (param: string) => 
    fetchFromAPI<NewDataType>(`/api/stocks/${param}/new-data`),
}
```

## Backend API Documentation

The FastAPI backend provides interactive documentation available at http://localhost:8000/docs when the server is running.

### Accessing API Documentation

1. Start the backend server:
```bash
cd StockSage-AI/backend
uvicorn stocksage_api.main:app --reload
```

2. Open http://localhost:8000/docs in your browser to access the Swagger UI documentation.

3. The documentation shows:
   - All available endpoints
   - Required request parameters and body
   - Response models and status codes
   - Authentication requirements

### Using the Authorize Button in Swagger UI

The API documentation includes an "Authorize" button that allows you to authenticate all requests in the Swagger UI:

1. Obtain a valid Firebase ID token from your frontend application:
   ```javascript
   // In browser console or component
   const token = await firebase.auth().currentUser.getIdToken(true);
   console.log(token); // Copy this token
   ```

2. In the Swagger UI (http://localhost:8000/docs), locate and click the green "Authorize" button in the top right corner:
   
   ```
   ┌─────────────────────────────────────────────────┐
   │ 🔒 Authorize                                    │
   └─────────────────────────────────────────────────┘
   ```

3. In the authorization dialog that appears, enter your token with the Bearer prefix:
   ```
   Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Y0MzU3YWIiLCJ0eXAiOiJKV1QifQ...
   ```
   (Make sure to include the word "Bearer" followed by a space, then your token)

4. Click "Authorize" to save the token.

5. Click "Close" to return to the documentation.

Now all your API requests in the Swagger UI will include the authentication token automatically. You'll see a small padlock icon (🔒) next to authenticated endpoints, indicating they will use your provided token.

You can test authenticated endpoints directly by:
1. Clicking on an endpoint to expand it
2. Clicking the "Try it out" button
3. Filling in any required parameters
4. Clicking "Execute" to make the authenticated request

If you need to use a different token, simply click "Authorize" again and enter the new token.

## Request and Response Models

The backend uses Pydantic models for request validation and response formatting. In the frontend, matching TypeScript interfaces ensure type safety.

### Key Models

#### UserProfile
```typescript
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  created_at?: number;
  updated_at?: number;
  preferences?: {
    theme: string;
    notifications_enabled: boolean;
    default_view: string;
  };
}
```

#### UserProfileUpdate
```typescript
export interface UserProfileUpdate {
  id?: string;
  name?: string;
  email?: string;
  preferences?: {
    theme?: string;
    notifications_enabled?: boolean;
    default_view?: string;
  };
}
```

## Authentication Token Handling

Every authenticated request requires a Firebase ID token in the Authorization header.

### How Tokens Are Used

1. When a user signs in with Firebase Authentication, a token is generated
2. This token must be included in API requests to authenticate the user
3. The token is verified by the backend using Firebase Admin SDK
4. If the token is valid, the request proceeds; otherwise, it is rejected with a 401 status

### Token Refresh

Firebase tokens expire after 1 hour. The API client in `api.ts` handles token refresh automatically by:

1. Checking token expiration
2. Refreshing the token when needed (`getIdToken(true)`)
3. Including the fresh token in the request

### Common Token Issues

1. **Token Expiration**: If you see 401 errors with "Token expired", make sure the token is being refreshed.
2. **Invalid Token Format**: Ensure tokens are sent with the `Bearer` prefix.
3. **CORS Issues**: Make sure CORS is configured properly in the backend.

## Troubleshooting

### Authentication Not Working

1. Check browser console for errors
2. Verify Firebase configuration in .env.local
3. Make sure the backend is running and accessible
4. Verify that the Firebase service account credentials are correct
5. Check that CORS is properly configured on the backend

### API Endpoints Not Working

1. Verify token is being sent correctly
2. Check server logs for authentication errors
3. Ensure response models match expected format

### CORS Issues

If you encounter CORS errors:

1. Make sure `allow_origins` in the backend includes your frontend URL
2. Check that the request includes the correct headers
3. For preflight requests, ensure `OPTIONS` is in the allowed methods

## Advanced Configuration

### Custom Firebase Claims

Add custom claims to tokens for role-based access control:

```python
# In backend code
firebase_service.set_custom_user_claims(user_id, {"admin": True})
```

Then check these claims in your API endpoints:

```python
@router.get("/admin-only")
async def admin_only(current_user: Dict[str, Any] = Depends(get_current_user)):
    if not current_user.get("admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    # ... endpoint implementation
```

### Performance Considerations

1. **Token Caching**: The API client caches tokens to reduce authentication overhead.
2. **Request Batching**: Consider batching multiple related API calls when possible.
3. **Error Handling**: Add proper error handling in your components when using the API.

## Creating Secure API Endpoints

When adding new endpoints to the backend, follow these guidelines to ensure they work properly with the authentication system:

### Backend (FastAPI)

1. **Use Authentication Dependency**:
   
   Always use the `get_current_user` dependency for protected endpoints:

   ```python
   @router.get("/my-new-endpoint", response_model=MyResponseModel)
   async def my_new_endpoint(current_user: Dict[str, Any] = Depends(get_current_user)):
       # Access user ID with current_user.get("uid")
       user_id = current_user.get("uid")
       # Implement endpoint logic here
   ```

2. **Add OpenAPI Documentation**:

   Include summary and description for better Swagger UI documentation:

   ```python
   @router.get("/my-new-endpoint", 
              response_model=MyResponseModel,
              summary="My endpoint description",
              description="Detailed description of what this endpoint does. Requires authentication.")
   async def my_new_endpoint(current_user: Dict[str, Any] = Depends(get_current_user)):
       # Endpoint implementation
   ```

3. **Define Response Models**:

   Create Pydantic models for request validation and response formatting:

   ```python
   class MyResponseModel(BaseModel):
       id: str
       name: str
       created_at: int
   ```

### Frontend (TypeScript)

1. **Add TypeScript Interface**:

   Create matching TypeScript interfaces in `api.ts`:

   ```typescript
   export interface MyResponseType {
     id: string;
     name: string;
     created_at: number;
   }
   ```

2. **Add API Method**:

   Add a new method to the appropriate section in the `api` object:

   ```typescript
   // Add to an existing section or create a new one
   mySection: {
     getMyData: () => fetchFromAPI<MyResponseType>('/api/my-new-endpoint'),
     
     createMyData: (data: MyRequestType) => 
       fetchFromAPI<MyResponseType>('/api/my-new-endpoint', {
         method: 'POST',
         body: JSON.stringify(data)
       }),
   }
   ```

3. **Using the New Endpoint**:

   Use the new API method in your components:

   ```typescript
   import { api } from '@/lib/api';

   // In a component
   const fetchData = async () => {
     try {
       const result = await api.mySection.getMyData();
       // Use the result
     } catch (error) {
       console.error("Error fetching data:", error);
     }
   };
   ```

By following these patterns, your new endpoints will automatically benefit from:
- JWT authentication with Firebase tokens
- Proper error handling and type safety
- Integration with the Swagger UI documentation
- Consistent patterns that other developers can easily understand 