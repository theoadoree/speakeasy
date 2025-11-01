# iOS Authentication Checklist

## Problem
iOS Google Sign In not working - shows "Auth: false, Loading: false"

## Previous Fixes Today

### Fix #1 (commit af86ccb): Backend Token Verification
Added Google ID token verification to `backend/auth-routes.js`:
- ✅ Verifies Google ID tokens
- ✅ Extracts user info from verified token
- ✅ Supports iOS client ID

### Fix #2 (commit bd1561e): Deploy Backend
- ✅ Deployed full backend with all endpoints
- ✅ Backend running at `https://speakeasy-backend-823510409781.us-central1.run.app`
- ✅ Current revision: `speakeasy-backend-00056-xs7`

## Current Status

### ✅ Backend Configuration
- Backend has token verification code
- iOS OAuth client ID included in valid audiences:
  ```
  '823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com'
  ```

### ✅ iOS App Configuration
- Client ID configured in `AuthenticationManager.swift`: ✅
  ```swift
  let config = GIDConfiguration(clientID: "823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com")
  ```
- Backend URL correct: ✅
  ```swift
  private let baseURL = "https://speakeasy-backend-823510409781.us-central1.run.app"
  ```
- URL Scheme in Info.plist: ✅
  ```
  com.googleusercontent.apps.823510409781-aqd90aoj080374pnfjultufdkk027qsp
  ```

### ❓ Google Cloud Console Configuration
**THIS IS LIKELY THE ISSUE!**

The iOS OAuth 2.0 Client ID must be configured with the correct Bundle ID.

**Current Bundle ID**: `org.name.SpeakEasy`

**Required Setup**:
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8)
2. Find OAuth 2.0 Client ID: `823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com`
3. Verify it's configured as an **iOS** client (not Web!)
4. Bundle ID must be: `org.name.SpeakEasy`
5. Save changes

## Debug Steps

### Step 1: Check Google OAuth Configuration
```bash
# Check what type of client this is
gcloud auth application-default print-access-token
```

Then go to Google Cloud Console and verify the OAuth client configuration.

### Step 2: Test Backend Directly
```bash
# This should fail with token verification error (expected)
curl -X POST https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'

# Expected response: "Failed to verify Google token and no fallback user info provided"
```

### Step 3: Check iOS App Logs
When you tap "Continue with Google" in the iOS app, check Xcode console for:
- Google Sign In SDK errors
- Network errors
- Token errors

## Common Issues

### Issue 1: Wrong OAuth Client Type
**Problem**: OAuth client ID is configured as "Web" instead of "iOS"
**Solution**: Recreate as iOS OAuth client with Bundle ID

### Issue 2: Wrong Bundle ID
**Problem**: Bundle ID in Google Console doesn't match Xcode project
**Solution**: Update Google Console to use `org.name.SpeakEasy`

### Issue 3: Google Sign In SDK Not Initialized
**Problem**: GoogleSignIn package not properly installed
**Solution**:
```bash
cd /Users/scott/dev/speakeasy
rm -rf ios/Pods ios/Podfile.lock
cd ios && pod install
```

### Issue 4: App Not Signed
**Problem**: iOS app not properly code signed
**Solution**: Open Xcode, select your development team in Signing & Capabilities

## Quick Fix Commands

### Rebuild iOS App
```bash
cd /Users/scott/dev/speakeasy

# Clean build
rm -rf ios/build
xcodebuild clean -project ios/SpeakEasy.xcodeproj -scheme SpeakEasy

# Rebuild
xcodebuild -project ios/SpeakEasy.xcodeproj -scheme SpeakEasy -configuration Debug -destination 'platform=iOS,id=00008150-000D65A92688401C'
```

### Redeploy Backend (if needed)
```bash
cd /Users/scott/dev/speakeasy
gcloud builds submit --tag gcr.io/modular-analog-476221-h8/speakeasy-backend:latest --project modular-analog-476221-h8 backend/
gcloud run deploy speakeasy-backend --image gcr.io/modular-analog-476221-h8/speakeasy-backend:latest --platform managed --region us-central1 --allow-unauthenticated --project modular-analog-476221-h8
```

## What to Tell Me

When reporting the issue, please provide:
1. **What happens when you tap "Continue with Google"?**
   - Does Google Sign In popup appear?
   - What error message shows?
   - Does it crash?

2. **Xcode Console Output**
   - Open Xcode
   - Run the app with ⌘R
   - Tap "Continue with Google"
   - Copy any error messages from console

3. **Google Cloud Console Screenshot**
   - Screenshot of the OAuth client configuration
   - Verify it shows "iOS" as the application type
   - Verify Bundle ID is `org.name.SpeakEasy`

## Expected Behavior

**When working correctly:**
1. Tap "Continue with Google"
2. Google Sign In popup appears
3. Select your Google account
4. App receives ID token
5. Backend verifies token
6. Backend creates/updates user
7. App navigates to home screen

**The "Auth: false, Loading: false" message is NORMAL** - it just shows you're not logged in yet!
