# OAuth Client IDs - Saved Successfully ✅

## What Was Saved

### Local Files
1. **`.env.example`** - Template with all OAuth configuration
   - Location: `/Users/scott/dev/speakeasy/backend/.env.example`
   - Purpose: Documentation and local development reference

2. **`OAUTH_CLIENT_IDS.md`** - Complete reference documentation
   - Location: `/Users/scott/dev/speakeasy/OAUTH_CLIENT_IDS.md`
   - Purpose: Explains why different client IDs exist and how they're used

### Google Secret Manager

Created two new secrets:

1. **`google-web-client-id`**
   ```
   823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com
   ```
   - Purpose: Web application OAuth client ID
   - Used by: Browser-based web app

2. **`google-ios-client-id`**
   ```
   823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com
   ```
   - Purpose: iOS application OAuth client ID
   - Used by: Native iOS app

### Existing Secrets (Already in Secret Manager)

- `GOOGLE_WEB_CLIENT_ID` (uppercase)
- `GOOGLE_IOS_CLIENT_ID` (uppercase)
- `GOOGLE_ANDROID_CLIENT_ID` (uppercase)
- `google-client-id` (old/legacy)

## Backend Updated

**File**: `backend/server-openai.js` line 223-227

The backend now accepts tokens from BOTH platforms:
```javascript
const validAudiences = [
  '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com', // Web
  '823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com'  // iOS
];
```

This means:
- ✅ iOS app tokens will verify correctly
- ✅ Web app tokens will verify correctly
- ✅ Both platforms can authenticate with the same backend

## How Backend Loads These

The backend can load from Secret Manager:
```javascript
// server-openai.js will use validAudiences array
// Can optionally load from secrets if needed:
const webClientId = await getSecret('google-web-client-id');
const iosClientId = await getSecret('google-ios-client-id');
```

## Why Different Client IDs?

This is **by design** and **required by Google**:

1. **Web Client** (`...7am96n366leset271qt9c8djo265u24n`)
   - Uses JavaScript origins (URLs)
   - Browser-based authentication flow
   - Requires CORS configuration

2. **iOS Client** (`...aqd90aoj080374pnfjultufdkk027qsp`)
   - Uses URL schemes (custom app URLs)
   - Native SDK authentication flow
   - Requires bundle ID configuration

## Security Note

**OAuth Client IDs are NOT secret!** They're designed to be embedded in client applications (web pages, mobile apps). What needs to be kept secret is:
- OAuth Client SECRET (for server-side applications)
- API keys (already in Secret Manager)
- User tokens/session data

## Current Status

✅ **iOS App** - Using correct iOS client ID, working!
✅ **Web App** - Using correct web client ID, code fixed!
✅ **Backend** - Now accepts both client IDs for verification!
✅ **Secrets** - Saved to Google Secret Manager!
✅ **Documentation** - Created reference files!

## Next Steps

When you deploy the production backend (with token verification enabled), both platforms will work because:
1. Backend accepts tokens from both client IDs
2. Each app uses its correct platform-specific client ID
3. Google's token verification will succeed for both

No further configuration needed! 🎉
