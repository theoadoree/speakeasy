# Authentication Flow - SpeakEasy

## Overview
A complete authentication system has been implemented for SpeakEasy (FluentAI) with JWT-based token management, secure storage, and a smooth user experience.

## Features Implemented

### 1. **Authentication Service** (`src/services/auth.js`)
- JWT token-based authentication
- Secure token storage using AsyncStorage
- Automatic token injection in API requests via Axios interceptors
- Token expiration handling (auto-logout on 401)
- Mock implementation ready to connect to your backend

**API Methods:**
- `register(email, password, name)` - User registration
- `login(email, password)` - User login
- `logout()` - User logout with cleanup
- `getCurrentUser()` - Get cached user data
- `isAuthenticated()` - Check auth status
- `validateToken()` - Validate token with backend
- `requestPasswordReset(email)` - Password reset flow

### 2. **Authentication Context** (`src/contexts/AuthContext.js`)
Global authentication state management using React Context API.

**State:**
- `user` - Current authenticated user object
- `isAuthenticated` - Boolean auth status
- `isLoading` - Loading state for auth operations
- `authError` - Error messages from auth operations

**Methods:**
- `login(email, password)` - Login user
- `register(email, password, name)` - Register new user
- `logout()` - Logout user
- `requestPasswordReset(email)` - Initiate password reset
- `clearError()` - Clear error messages
- `updateUser(userData)` - Update user data
- `refreshAuth()` - Refresh auth state

### 3. **Storage Service Updates** (`src/utils/storage.js`)
Extended AsyncStorage wrapper with authentication methods:
- `saveAuthToken(token)` / `getAuthToken()`
- `saveUserData(userData)` / `getUserData()`
- `removeAuthToken()` / `removeUserData()`
- `clearAuthData()` - Clear all auth data

### 4. **Login Screen** (`src/screens/LoginScreen.js`)
Beautiful, production-ready login interface with:
- Email and password validation
- Real-time form validation
- Loading states
- Error handling and display
- "Forgot Password" functionality
- Navigation to Sign Up screen

### 5. **Sign Up Screen** (`src/screens/SignUpScreen.js`)
Complete registration flow with:
- Full name, email, and password fields
- Password confirmation
- Comprehensive validation
- Terms of Service acknowledgment
- Navigation to Login screen

### 6. **App Navigation Updates** (`App.js`)
Three-tier authentication flow:

```
┌─────────────────────────────────────┐
│       App Launch (Loading)          │
└─────────────┬───────────────────────┘
              │
              ▼
      ┌───────────────┐
      │ Authenticated? │
      └───┬───────┬───┘
          │       │
    NO    │       │    YES
          │       │
          ▼       ▼
    ┌─────────┐ ┌──────────────┐
    │  Auth   │ │  Onboarding  │
    │ Screens │ │   Complete?  │
    └─────────┘ └───┬──────┬───┘
                    │      │
              NO    │      │    YES
                    │      │
                    ▼      ▼
              ┌─────────┐ ┌──────────┐
              │Onboard  │ │ Main App │
              │Screen   │ │          │
              └─────────┘ └──────────┘
```

### 7. **Settings Screen Updates** (`src/screens/SettingsScreen.js`)
- Display authenticated user's account information
- Logout button with confirmation dialog
- Separate "Account" and "Learning Profile" sections
- Secure logout with cleanup

## Authentication Flow

### First Time User
1. User opens app → sees Login screen
2. Taps "Sign Up" → enters details
3. Registers successfully → authenticated
4. Redirected to Onboarding → completes setup
5. Access main app

### Returning User
1. User opens app → loading screen
2. Token validated automatically
3. If valid → direct to main app
4. If invalid → redirected to Login

### Logout
1. User taps "Logout" in Settings
2. Confirmation dialog appears
3. Confirms logout → clears all auth data
4. Redirected to Login screen

## Backend Integration

### Current Status
The authentication service uses **mock implementations** that simulate API calls with 1-second delays. This allows the app to function fully without a backend.

### To Connect Real Backend

1. **Update API Base URL** in `src/services/auth.js`:
```javascript
const API_BASE_URL = 'https://your-api.com'; // Replace this
```

2. **Replace Mock Implementations** with real API calls:
```javascript
// Example for login
async login(email, password) {
  try {
    const response = await this.apiClient.post('/auth/login', {
      email,
      password,
    });

    await StorageService.saveAuthToken(response.data.token);
    await StorageService.saveUserData(response.data.user);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    };
  }
}
```

3. **Expected Backend Endpoints**:
   - `POST /auth/register` - User registration
   - `POST /auth/login` - User login
   - `POST /auth/logout` - User logout (optional)
   - `GET /auth/validate` - Token validation
   - `POST /auth/reset-password` - Password reset

4. **Expected Response Format**:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

## Security Features

✅ **JWT Token Management** - Secure token storage and automatic injection
✅ **Auto-logout on 401** - Handles expired tokens gracefully
✅ **Password Validation** - Minimum 6 characters
✅ **Email Validation** - RFC-compliant email regex
✅ **Form Validation** - Real-time feedback
✅ **Secure Storage** - AsyncStorage with encrypted keys
✅ **Error Handling** - User-friendly error messages
✅ **Loading States** - Prevents double submissions

## Testing the Flow

### Test Credentials (Mock Mode)
- **Any email** except `test@test.com`
- **Any password** with 6+ characters
- The mock implementation will create a user automatically

### Special Test Cases
- Email `test@test.com` → returns "Email already registered" error
- Password < 6 characters → returns validation error

## File Structure

```
src/
├── contexts/
│   ├── AuthContext.js          # Auth state management
│   └── AppContext.js            # App state management
├── services/
│   ├── auth.js                  # Auth API service
│   └── llm.js                   # LLM service
├── screens/
│   ├── LoginScreen.js           # Login UI
│   ├── SignUpScreen.js          # Registration UI
│   ├── OnboardingScreen.js      # Onboarding flow
│   ├── SettingsScreen.js        # Settings with logout
│   ├── HomeScreen.js            # Main screens...
│   ├── PracticeScreen.js
│   └── ReaderScreen.js
├── utils/
│   └── storage.js               # AsyncStorage wrapper
└── App.js                       # Root navigation
```

## Next Steps

1. **Connect to Backend API**
   - Replace mock implementations in `auth.js`
   - Update API_BASE_URL
   - Test with real endpoints

2. **Add Social Login** (Optional)
   - Google Sign-In
   - Apple Sign-In
   - Facebook Login

3. **Enhanced Security** (Optional)
   - Biometric authentication (Face ID/Touch ID)
   - Two-factor authentication
   - Password strength meter
   - Remember me functionality

4. **Profile Management**
   - Edit profile screen
   - Change password
   - Delete account

5. **Email Verification**
   - Send verification email on signup
   - Verify email flow

## Notes

- All authentication data is stored locally in AsyncStorage
- Token is automatically included in all API requests
- AuthContext wraps the entire app for global access
- Logout clears all stored authentication data
- The app automatically checks auth status on launch

## Support

For issues or questions about the authentication implementation, refer to:
- React Navigation docs: https://reactnavigation.org/
- AsyncStorage docs: https://react-native-async-storage.github.io/
- Axios interceptors: https://axios-http.com/docs/interceptors
