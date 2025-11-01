# FIX: iOS OAuth Configuration

## The Error
```
org.name.SpeakEasy is not configured
```

## What This Means
The iOS OAuth 2.0 Client ID in Google Cloud Console does not have your app's Bundle ID (`org.name.SpeakEasy`) configured.

## How to Fix (5 minutes)

### Step 1: Open Google Cloud Console
Go to: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8

### Step 2: Find the iOS OAuth Client
Look for the OAuth 2.0 Client ID:
```
823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com
```

**If it exists:**
1. Click on the client ID name
2. Under "Application type", verify it says **"iOS"**
3. Under "Bundle ID", add or update to: `org.name.SpeakEasy`
4. Click **"SAVE"**

**If it doesn't exist or is the wrong type:**
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Application type: Select **"iOS"**
3. Name: `SpeakEasy iOS`
4. Bundle ID: `org.name.SpeakEasy`
5. Click **"CREATE"**
6. Copy the new Client ID
7. Update `AuthenticationManager.swift` line 127 with the new Client ID

### Step 3: Verify Configuration

After saving, your OAuth client should show:
- **Type**: iOS
- **Bundle ID**: `org.name.SpeakEasy`
- **Client ID**: `823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com`

### Step 4: Update Backend (if Client ID changed)

If you created a NEW OAuth client, update the backend to include the new Client ID:

Edit `backend/auth-routes.js` line 461-465:
```javascript
const validAudiences = [
  '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com', // Web client
  '823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com', // iOS client (REPLACE IF NEW)
  '823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com' // Fallback
];
```

Then redeploy:
```bash
cd /Users/scott/dev/speakeasy
gcloud builds submit --tag gcr.io/modular-analog-476221-h8/speakeasy-backend:latest --project modular-analog-476221-h8 backend/
gcloud run deploy speakeasy-backend --image gcr.io/modular-analog-476221-h8/speakeasy-backend:latest --platform managed --region us-central1 --allow-unauthenticated --project modular-analog-476221-h8
```

### Step 5: Test on iOS

1. Force quit the SpeakEasy app on your iPhone
2. Relaunch the app
3. Tap "Continue with Google"
4. Select your Google account
5. **Should now work!** ✅

## Why This Happened

Google Sign In for iOS requires:
1. The OAuth client to be type **"iOS"** (not Web)
2. The Bundle ID to match your Xcode project exactly
3. The URL Scheme in Info.plist (already configured ✅)

The error "org.name.SpeakEasy is not configured" means Google couldn't find this Bundle ID in the OAuth client configuration.

## Quick Check

To verify the fix worked, you should see in backend logs:
```
✅ Google token verified: [user-id]
```

And the iOS app should navigate to the home screen after selecting your Google account.

## If It Still Doesn't Work

1. **Clear Google Sign In cache on iPhone**:
   - Settings → Safari → Clear History and Website Data
   - Settings → General → iPhone Storage → SpeakEasy → Delete App
   - Reinstall from Xcode

2. **Check Xcode console for errors** while tapping "Continue with Google"

3. **Verify URL Scheme** in Info.plist matches the Client ID:
   ```
   com.googleusercontent.apps.823510409781-aqd90aoj080374pnfjultufdkk027qsp
   ```

## Expected Result After Fix

✅ Tap "Continue with Google"
✅ Google account picker appears
✅ Select account
✅ App navigates to home screen
✅ "Auth: true" shown in debug message (if still visible)
