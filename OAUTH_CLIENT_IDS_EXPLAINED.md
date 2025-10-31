# OAuth Client IDs - Different for Web vs iOS

## Current Configuration

### Web App (Browser)
**Client ID**: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`
- **Type**: Web application
- **Used for**: Browser-based authentication
- **File**: `python-web/static/auth-unified.html` line 255
- **Requires**: Authorized JavaScript origins

### iOS App (Native)
**Client ID**: `823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com`
- **Type**: iOS application
- **Used for**: Native iOS app authentication
- **File**: `SpeakEasy/SpeakEasy/ViewModels/AuthenticationManager.swift` line 127
- **Requires**: Bundle ID configuration

## Why Different Client IDs?

This is **correct and by design**! Google requires separate OAuth clients for different platforms:

### 1. Security Isolation
- Web clients use JavaScript origins (URLs)
- iOS clients use bundle IDs and URL schemes
- Different authentication flows for security

### 2. Platform-Specific Configuration
- **Web Client** needs:
  - Authorized JavaScript origins (e.g., `https://speakeasy-python-web...`)
  - Authorized redirect URIs
  - Works in browsers

- **iOS Client** needs:
  - iOS URL scheme (e.g., `com.googleusercontent.apps.823510409781-aqd90aoj080374pnfjultufdkk027qsp`)
  - Bundle ID configuration
  - Works in native app

### 3. Google's Best Practice
From Google's documentation:
> "You must create separate OAuth 2.0 credentials for each platform where your app runs (web, iOS, Android)."

## What This Means

✅ **This is correct!** Both apps should use different client IDs.

❌ **DO NOT change** the iOS app to use the web client ID!

❌ **DO NOT change** the web app to use the iOS client ID!

## Backend Configuration

The backend currently expects the **iOS client ID** for verification:

**File**: `backend/server-openai.js` line 226
```javascript
audience: secrets?.googleClientId || '823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com'
```

Wait - this is a **third** client ID! Let me check what this is...

### Issue Found! 🚨

The backend is configured with yet another client ID: `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo`

This doesn't match either:
- Web app client: `...7am96n366leset271qt9c8djo265u24n`
- iOS app client: `...aqd90aoj080374pnfjultufdkk027qsp`

## Solution

The backend needs to verify tokens from BOTH clients. We have two options:

### Option 1: Accept Multiple Client IDs (Recommended)
Update backend to verify tokens from both web and iOS clients:

```javascript
const VALID_AUDIENCES = [
  '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com', // Web
  '823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com'  // iOS
];

// In verification:
const ticket = await googleClient.verifyIdToken({
  idToken: idToken,
  audience: VALID_AUDIENCES  // Accepts array!
});
```

### Option 2: Use Same Client for Both (Not Recommended)
This would require creating a new OAuth client and updating both apps, which is more work and less secure.

## Current Status

✅ **Web App**: Using web client ID (correct!)
✅ **iOS App**: Using iOS client ID (correct!)
❌ **Backend**: Using old/wrong client ID (needs fix!)

## Why iOS App Works Now

The iOS app works because we're using the **simple debug backend** that doesn't verify tokens. Once we switch back to the production backend with verification, it will fail unless we fix the audience configuration.

## Next Steps

Update the backend to accept both client IDs in the audience array.
