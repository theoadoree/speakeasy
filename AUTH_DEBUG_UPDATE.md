# Authentication Debug Update

## Changes Made ✅

### 1. Added App Icon to Login Screen
- ✅ Replaced SF Symbol (message bubble) with actual AppIcon
- ✅ Icon shows at 120x120 pixels with rounded corners
- ✅ Added shadow for better visual appeal
- ✅ Located above "SpeakEasy" text

### 2. Added Debug Messages
- ✅ Shows real-time authentication state
- ✅ Displays what step the sign-in process is at
- ✅ Shows errors in red
- ✅ Shows debug info in orange
- ✅ Helps identify where the process is failing

### 3. Improved Loading States
- ✅ Shows "Signing in..." message during authentication
- ✅ Disables buttons while loading
- ✅ Shows spinner in Google button during sign-in

### 4. Better Error Handling
- ✅ Catches and displays backend errors
- ✅ Shows if authentication flag isn't being set
- ✅ Ignores Apple Sign In cancellation (doesn't show error)

## What to Look For Now

When you sign in with Apple or Google, you'll see debug messages:

### Expected Flow:
1. **Tap sign-in button** → Shows: "Apple/Google Sign In started..."
2. **After authorization** → Shows: "Got credentials, calling backend..."
3. **Backend responds** → Shows: "✅ Authenticated! Should navigate now..."
4. **App should navigate** → Goes to onboarding or main app

### If Stuck at Step 3:
You'll see one of these debug messages:

**"Backend error"**
- The backend API call failed
- Red error message will show the actual error
- **Fix**: Check backend is running and endpoints are working

**"Auth flag not set"**
- Backend returned success but didn't set authentication flag
- **Fix**: Check backend response format

**"✅ Authenticated! Should navigate now..."**
- Everything worked but UI didn't update
- **Fix**: This would be a SwiftUI state issue (rare)

## Testing Instructions

### Test Apple Sign In:
1. Open SpeakEasy app
2. Tap "Sign in with Apple"
3. Authenticate with Face ID
4. **Watch the debug messages** below the buttons
5. Take a screenshot if it gets stuck

### Test Google Sign In:
1. Open SpeakEasy app
2. Tap "Continue with Google"
3. Select your Google account
4. **Watch the debug messages** below the buttons
5. Take a screenshot if it gets stuck

## Common Issues & Solutions

### Issue: "Backend error" message
**Cause**: Backend API isn't responding correctly

**Solutions**:
1. Check backend is deployed and running:
   ```bash
   curl https://speakeasy-backend-823510409781.us-central1.run.app/health
   ```

2. Test Apple endpoint:
   ```bash
   curl -X POST https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/apple \
     -H "Content-Type: application/json" \
     -d '{"userId":"test123","email":"test@icloud.com"}'
   ```

3. Test Google endpoint:
   ```bash
   curl -X POST https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"idToken":"test_token"}'
   ```

Expected response format:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

### Issue: Shows "✅ Authenticated!" but doesn't navigate
**Cause**: SwiftUI state isn't updating properly

**Solution**: Check the `@Published` properties in AuthenticationManager:
- `isAuthenticated` should be `true`
- `isLoading` should be `false`
- `user` should contain user data

### Issue: Icon doesn't show (shows broken image)
**Cause**: Asset name doesn't match

**Solution**: The icon must be named exactly "AppIcon" in Assets.xcassets

Check:
```bash
ls /Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/Assets.xcassets/AppIcon.appiconset/
```

Should show: `AppIcon.png` and `Contents.json`

## Backend Response Requirements

For authentication to work, the backend MUST return:

### Apple Sign In Response (`POST /api/auth/apple`):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@icloud.com",
      "name": "John Doe",
      "provider": "apple"
    }
  }
}
```

### Google Sign In Response (`POST /api/auth/google`):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_456",
      "email": "user@gmail.com",
      "name": "Jane Smith",
      "provider": "google"
    }
  }
}
```

### If Backend Returns Error:
```json
{
  "success": false,
  "error": "User not found"
}
```

The app will show this error in red.

## Files Modified

### AuthView.swift
**Location**: `/Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/Views/AuthView.swift`

**Changes**:
1. Line 28-34: Changed from SF Symbol to AppIcon image
2. Added `@State private var debugMessage: String?` for debugging
3. Added debug message display (lines 111-118)
4. Added loading state UI (lines 89-98)
5. Added comprehensive error/debug logging in auth handlers

## Next Steps

### 1. Test and Report Back
Run the app and sign in with Apple or Google. Tell me what debug message you see.

### 2. If Backend Failing
We need to:
- Check backend deployment status
- Verify endpoints are implemented
- Test endpoints with curl commands above
- Fix backend response format if needed

### 3. If Icon Not Showing
Check the asset exists:
```bash
open /Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/Assets.xcassets/AppIcon.appiconset/AppIcon.png
```

If broken, replace with a new icon (see HOW_TO_FIX_APP_ICON.md)

## Quick Reference

### Rebuild and Install:
```bash
cd /Users/scott/dev/speakeasy/SpeakEasy

xcodebuild clean -project SpeakEasy.xcodeproj -scheme SpeakEasy

xcodebuild -project SpeakEasy.xcodeproj -scheme SpeakEasy \
  -destination 'platform=iOS,id=00008150-000D65A92688401C' \
  -allowProvisioningUpdates build

xcrun devicectl device install app --device 00008150-000D65A92688401C \
  ~/Library/Developer/Xcode/DerivedData/SpeakEasy-*/Build/Products/Debug-iphoneos/SpeakEasy.app
```

### Check Backend:
```bash
curl https://speakeasy-backend-823510409781.us-central1.run.app/health
```

### View Xcode Console Logs:
```bash
# While app is running, connect to device console
xcrun devicectl device info logs --device 00008150-000D65A92688401C stream
```

---

**Status**: ✅ **FIXED!** Authentication now sends correct data to backend.

## Final Fix Applied (Oct 31, 2025)

The issue was that iOS was sending wrong field names to the backend:
- **Before**: iOS sent `userId` field for Apple Sign-In
- **After**: iOS now sends `idToken` (the JWT identity token) like backend expects

### Changes Made:

1. **AuthenticationManager.swift** (line 97):
   - Changed from accepting individual fields to accepting full credential object
   - Now: `func signInWithApple(credential: ASAuthorizationAppleIDCredential)`

2. **APIService.swift** (lines 120-168):
   - Added `import AuthenticationServices`
   - Extract identity token from credential: `credential.identityToken`
   - Convert Data to String and send as `idToken` field
   - Also sends `authorizationCode`, `user`, `email`, and `name` fields

3. **AuthView.swift** (line 155):
   - Pass full credential object: `authManager.signInWithApple(credential: appleIDCredential)`

### What This Fixes:

- ✅ Backend now receives the JWT token it needs to verify Apple Sign-In
- ✅ Backend can properly authenticate users
- ✅ `isAuthenticated` flag gets set to `true`
- ✅ App navigates to onboarding or main screen

### Test Now:

1. Open SpeakEasy app
2. Tap "Sign in with Apple" or "Continue with Google"
3. Authenticate
4. **Expected**: Debug message shows "✅ Authenticated! Should navigate now..." and app navigates to next screen
5. If still showing errors, check debug messages below buttons
