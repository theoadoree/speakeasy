# Google OAuth Setup for SpeakEasy

## Problem
Getting "400. That's an error. The server cannot process the request because it is malformed" when attempting Google Sign In.

## Root Cause
The Google Cloud Console OAuth 2.0 credentials need to have the correct **Authorized redirect URIs** configured for Expo Auth Session to work.

## Solution

### 1. Get Your Expo Redirect URI

For development, Expo generates a redirect URI based on your project. Run this command to get your redirect URI:

```bash
npx expo start
# Look for output like: exp://192.168.x.x:8081
# Your redirect URI will be: exp://YOUR_IP:8081/--/
```

Or use the Expo development build URI format:
```
speakeasy://
```

### 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `modular-analog-476221-h8`
3. Navigate to **APIs & Services > Credentials**
4. Find your OAuth 2.0 Client IDs:
   - Web client ID: `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo`
   - iOS client ID: `768424738821-gb3i7pl82qm5r70q73nh6gg33i1f3tv0`

5. **For the Web Client ID**, add these Authorized redirect URIs:
   ```
   https://auth.expo.io/@your-expo-username/speakeasy
   speakeasy://
   http://localhost:8081
   https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google/callback
   ```

6. **For the iOS Client ID**, add these Authorized redirect URIs:
   ```
   com.scott.speakeasy:/oauth2redirect
   speakeasy://
   ```

### 3. Alternative: Use Expo's Managed OAuth

If you continue to have issues, consider using Expo's managed OAuth which handles the redirect URIs automatically:

```bash
# Install Expo's Google Auth
npm install @react-native-google-signin/google-signin

# Configure in app.json
```

Add to app.json:
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### 4. Test the Configuration

After updating Google Cloud Console:
1. Wait 5-10 minutes for changes to propagate
2. Restart your Expo development server
3. Try Google Sign In again

## Current Configuration

**Frontend (src/contexts/AuthContext.js):**
- Web Client ID: `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com`
- iOS Client ID: `768424738821-gb3i7pl82qm5r70q73nh6gg33i1f3tv0.apps.googleusercontent.com`
- Redirect URI: Managed by `expo-auth-session`

**Backend (backend/server-openai.js):**
- Expects: `{ idToken, name, email, imageUrl }`
- Endpoint: `/api/auth/google`
- Verifies token with Google OAuth2Client

## Debugging

To debug Google OAuth issues:

1. **Check the full error URL** in your app - it may contain more details
2. **Check Google Cloud Console Logs:**
   - Go to **APIs & Services > OAuth consent screen**
   - Check if app is in "Testing" mode and your email is added as a test user
3. **Verify Client IDs match** between frontend and Google Console
4. **Check redirect URIs** are exactly correct (no trailing slashes unless required)

## Common Issues

1. **"redirect_uri_mismatch"** - Redirect URI not registered in Google Console
2. **"400 malformed request"** - Client ID doesn't exist or is wrong
3. **"access_denied"** - User not added as test user in OAuth consent screen
4. **"invalid_client"** - Client ID/Secret mismatch

## Quick Fix: Skip Token Verification

For development/testing, the backend has a fallback mode that skips token verification. This is already implemented in `server-openai.js` lines 230-240.

The backend will accept any request with:
```json
{
  "idToken": "any_string",
  "name": "Your Name",
  "email": "your@email.com",
  "imageUrl": ""
}
```

And create a user without verification if token verification fails.
