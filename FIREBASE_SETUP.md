# Firebase Authentication Setup Guide

This guide explains how to configure Firebase Authentication for Apple and Google Sign-In in the SpeakEasy app.

## Prerequisites

- Firebase project: `modular-analog-476221-h8`
- Firebase Console access: https://console.firebase.google.com/

## Step 1: Enable Authentication Providers

### 1.1 Open Firebase Console

1. Go to https://console.firebase.google.com/
2. Select project: `modular-analog-476221-h8`
3. Navigate to **Authentication** → **Sign-in method**

### 1.2 Enable Google Sign-In

1. Click on **Google** in the Sign-in providers list
2. Click **Enable** toggle
3. **Project support email**: Select your email from dropdown
4. **Project public-facing name**: `SpeakEasy`
5. Click **Save**

**Configuration Details:**
- Web client ID: `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com` (already configured)
- iOS client ID: `768424738821-gb3i7pl82qm5r70q73nh6gg33i1f3tv0.apps.googleusercontent.com` (already configured)

### 1.3 Enable Apple Sign-In

1. Click on **Apple** in the Sign-in providers list
2. Click **Enable** toggle
3. Fill in the required fields:
   - **Service ID**: `com.speakeasy.webapp` (for web)
   - **Apple Team ID**: `E7B9UE64SF` (from Apple Developer account)
   - **Key ID**: `864SJW3HGZ` (from Apple Developer account)
   - **Private Key**: Upload the `.p8` file from Apple Developer account
4. Click **Save**

## Step 2: Configure Apple Developer Account

### 2.1 Create App ID

1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Click **+** to create new identifier
3. Select **App IDs** → **Continue**
4. Select **App** → **Continue**
5. Fill in:
   - **Description**: `SpeakEasy`
   - **Bundle ID**: `com.scott.speakeasy` (Explicit)
6. Under **Capabilities**, check **Sign In with Apple**
7. Click **Continue** → **Register**

### 2.2 Create Service ID (for Web)

1. Click **+** to create new identifier
2. Select **Services IDs** → **Continue**
3. Fill in:
   - **Description**: `SpeakEasy Web`
   - **Identifier**: `com.speakeasy.webapp`
4. Check **Sign In with Apple**
5. Click **Configure** next to Sign In with Apple
6. **Primary App ID**: Select `com.scott.speakeasy`
7. **Website URLs**:
   - **Domains**: `speakeasy-app.firebaseapp.com`
   - **Return URLs**: `https://speakeasy-app.firebaseapp.com/__/auth/handler`
8. Click **Save** → **Continue** → **Register**

### 2.3 Create Key for Apple Sign In

1. Go to https://developer.apple.com/account/resources/authkeys/list
2. Click **+** to create new key
3. Fill in:
   - **Key Name**: `SpeakEasy Sign In Key`
4. Check **Sign In with Apple**
5. Click **Configure** next to Sign In with Apple
6. **Primary App ID**: Select `com.scott.speakeasy`
7. Click **Save** → **Continue** → **Register**
8. **Download the .p8 file** - You can only download this once!
9. Note the **Key ID** (shown after download)

## Step 3: Configure Firebase Console

### 3.1 Add iOS App

1. In Firebase Console, go to **Project Overview**
2. Click **Add app** → **iOS**
3. Fill in:
   - **iOS bundle ID**: `com.scott.speakeasy`
   - **App nickname**: `SpeakEasy iOS`
4. Download `GoogleService-Info.plist`
5. Add to iOS project: `ios/GoogleService-Info.plist`
6. Follow remaining setup steps in Firebase console
7. Click **Continue to console**

### 3.2 Add Web App

1. Click **Add app** → **Web**
2. Fill in:
   - **App nickname**: `SpeakEasy Web`
   - **Also set up Firebase Hosting**: ✓ (optional)
3. Copy the config object - this is already in `app.json`:
   ```json
   {
     "apiKey": "AIzaSyDOlqd0tEWZ5X5YpN7oLHQMQhQg7rQ7qJo",
     "authDomain": "speakeasy-app.firebaseapp.com",
     "projectId": "modular-analog-476221-h8"
   }
   ```

### 3.3 Add Android App (Optional)

1. Click **Add app** → **Android**
2. Fill in:
   - **Android package name**: `com.speakeasy.app`
   - **App nickname**: `SpeakEasy Android`
3. Download `google-services.json`
4. Add to Android project: `android/app/google-services.json`

## Step 4: Update Backend Secrets

The backend needs the Apple Sign In credentials stored in Google Cloud Secret Manager:

```bash
# Store Apple Team ID
echo -n "E7B9UE64SF" | gcloud secrets create APPLE_TEAM_ID --data-file=- --project=modular-analog-476221-h8

# Store Apple Key ID
echo -n "864SJW3HGZ" | gcloud secrets create APPLE_KEY_ID --data-file=- --project=modular-analog-476221-h8

# Store Apple Client ID
echo -n "com.speakeasy.webapp" | gcloud secrets create APPLE_CLIENT_ID --data-file=- --project=modular-analog-476221-h8

# Store Apple Private Key (base64 encoded)
cat AuthKey_864SJW3HGZ.p8 | base64 | gcloud secrets create APPLE_PRIVATE_KEY_BASE64 --data-file=- --project=modular-analog-476221-h8
```

## Step 5: Testing

### 5.1 Test Backend Endpoints

Run the test script:
```bash
node scripts/test-social-auth.js
```

Expected output: All endpoints should return success ✅

### 5.2 Test iOS App

1. Build the iOS app: `npm run ios`
2. Tap "Continue with Apple"
3. Complete Apple authentication flow
4. Verify user is created and logged in

### 5.3 Test Web App

1. Start web app: `npm run web`
2. Click "Continue with Apple" or "Continue with Google"
3. Complete authentication flow in popup
4. Verify user is created and logged in

## Troubleshooting

### Apple Sign In Issues

**Error: "Invalid client"**
- Verify Service ID matches: `com.speakeasy.webapp`
- Check return URL in Apple Developer Console
- Ensure domain is verified in Apple Developer Console

**Error: "Private key invalid"**
- Re-download the `.p8` file from Apple Developer
- Ensure the Key ID matches in both Firebase and backend
- Verify the private key is base64 encoded correctly

### Google Sign In Issues

**Error: "Invalid client ID"**
- Verify client IDs match in `src/services/auth.js`
- Check OAuth consent screen is configured
- Ensure redirect URIs are authorized

**Error: "popup_closed_by_user"**
- This is normal - user cancelled the flow
- No action needed

### Firebase Issues

**Error: "Firebase project not found"**
- Verify project ID: `modular-analog-476221-h8`
- Check Firebase config in `app.json`

**Error: "Authentication disabled"**
- Go to Firebase Console → Authentication
- Verify sign-in providers are enabled

## Current Status

✅ Backend deployed: https://speakeasy-backend-823510409781.us-central1.run.app
✅ Auth endpoints working
✅ Apple Sign In configured (needs Apple Developer setup)
✅ Google Sign In configured
✅ Frontend updated with social auth buttons
✅ Web support enabled

## Next Steps

1. **Complete Apple Developer setup** (if not done):
   - Create App ID, Service ID, and Key as outlined above
   - Upload credentials to Google Secret Manager

2. **Enable Firebase providers**:
   - Enable Google Sign-In in Firebase Console
   - Enable Apple Sign-In in Firebase Console

3. **Test on all platforms**:
   - iOS: Native Apple Sign-In
   - Android: Google Sign-In
   - Web: Both Apple and Google via Firebase popup

4. **Monitor and debug**:
   - Check Cloud Run logs: `gcloud run logs read speakeasy-backend --project=modular-analog-476221-h8`
   - Check Firebase Authentication logs in console
   - Use test script for quick verification

## Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Apple Sign In for Web](https://firebase.google.com/docs/auth/web/apple)
- [Google Sign In for Web](https://firebase.google.com/docs/auth/web/google-signin)
- [Apple Developer Portal](https://developer.apple.com/account/resources)
- [Google Cloud Console](https://console.cloud.google.com/)
