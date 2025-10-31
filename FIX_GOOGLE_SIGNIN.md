# Fix Google Sign-In "Authorization Error" Issue

## Problem
Getting error: **"Access blocked: Authorization Error - Custom scheme URLs are not allowed for 'WEB' client type."**

## Root Cause
The iOS app is configured with a **Web Client ID**, but Google OAuth requires an **iOS Client ID** for native iOS apps.

## Solution: Create iOS OAuth Client in Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com
2. Select project: **modular-analog-476221-h8**
3. Navigate to: **APIs & Services → Credentials**

### Step 2: Create New iOS OAuth Client

1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"OAuth client ID"**
3. For "Application type", select: **iOS**
4. Fill in the following:
   - **Name**: `SpeakEasy iOS`
   - **Bundle ID**: `com.speakeasy.ios.SpeakEasy`
   - **App Store ID**: Leave blank (for development)
   - **Team ID**: `E7B9UE64SF` (your Apple Developer Team ID)

5. Click **"CREATE"**

### Step 3: Get the iOS Client ID

After creation, you'll see your new **iOS Client ID**. It will look like:
```
XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

**Copy this Client ID** - you'll need it in the next step.

### Step 4: Update the iOS App Configuration

Replace the Client ID in the iOS app:

**File**: `SpeakEasy/ViewModels/AuthenticationManager.swift`
**Line**: 131

Change FROM:
```swift
let config = GIDConfiguration(clientID: "823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com")
```

Change TO:
```swift
let config = GIDConfiguration(clientID: "YOUR_NEW_IOS_CLIENT_ID.apps.googleusercontent.com")
```

### Step 5: Update URL Scheme (Already Done ✅)

The URL scheme is already configured correctly in `Info.plist`:
- **Identifier**: `com.googleusercontent.apps.YOUR_CLIENT_ID`
- **URL Scheme**: `com.googleusercontent.apps.YOUR_CLIENT_ID`

You'll need to update this with your **new iOS Client ID** after creating it.

### Step 6: Rebuild and Test

1. Clean and rebuild the app:
   ```bash
   cd /Users/scott/dev/speakeasy/SpeakEasy
   xcodebuild clean -project SpeakEasy.xcodeproj -scheme SpeakEasy
   xcodebuild -project SpeakEasy.xcodeproj -scheme SpeakEasy \
     -destination 'platform=iOS,id=00008150-000D65A92688401C' \
     -allowProvisioningUpdates build
   ```

2. Install on iPhone:
   ```bash
   xcrun devicectl device install app --device 00008150-000D65A92688401C \
     ~/Library/Developer/Xcode/DerivedData/SpeakEasy-*/Build/Products/Debug-iphoneos/SpeakEasy.app
   ```

3. Test Google Sign-In - it should work now!

## Quick Command Line Fix (After Getting iOS Client ID)

Once you have your iOS Client ID from Google Cloud Console, run:

```bash
# Replace YOUR_NEW_IOS_CLIENT_ID with the actual ID
NEW_CLIENT_ID="YOUR_NEW_IOS_CLIENT_ID"

# Update Swift code
sed -i '' "s/823510409781-7am96n366leset271qt9c8djo265u24n/$NEW_CLIENT_ID/g" \
  /Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/ViewModels/AuthenticationManager.swift

# Update Info.plist URL scheme
sed -i '' "s/com.googleusercontent.apps.823510409781-7am96n366leset271qt9c8djo265u24n/com.googleusercontent.apps.$NEW_CLIENT_ID/g" \
  /Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/Info.plist

# Rebuild
cd /Users/scott/dev/speakeasy/SpeakEasy && \
xcodebuild clean -project SpeakEasy.xcodeproj -scheme SpeakEasy && \
xcodebuild -project SpeakEasy.xcodeproj -scheme SpeakEasy \
  -destination 'platform=iOS,id=00008150-000D65A92688401C' \
  -allowProvisioningUpdates build

# Install
xcrun devicectl device install app --device 00008150-000D65A92688401C \
  ~/Library/Developer/Xcode/DerivedData/SpeakEasy-*/Build/Products/Debug-iphoneos/SpeakEasy.app
```

## Why This Error Happened

Google OAuth has different client types:
- **Web**: For web applications, uses redirect URLs (https://)
- **iOS**: For native iOS apps, uses custom URL schemes (com.googleusercontent.apps.*)
- **Android**: For native Android apps, uses package names

The error occurred because:
1. The iOS app was configured with a **Web Client ID**
2. iOS uses custom URL schemes (`com.googleusercontent.apps.*`)
3. Google rejected the request because Web clients can't use custom URL schemes

## Alternative: Use Firebase Google Sign-In

If you prefer, you can also use Firebase Authentication which handles this automatically:

1. Enable Google Sign-In in Firebase Console
2. Download updated `GoogleService-Info.plist`
3. Use Firebase Auth SDK instead of GoogleSignIn SDK

But the iOS OAuth client approach above is simpler and what we've already set up.

## Verification

After fixing, you should see:
1. ✅ Google Sign-In button opens Google login page
2. ✅ Can select Google account
3. ✅ Returns to SpeakEasy app after authentication
4. ✅ User is logged in successfully

## Current Client IDs

- **Web Client ID** (backend, web apps): `823510409781-7am96n366leset271qt9c8djo265u24n`
- **iOS Client ID** (to be created): `TBD - create in Step 2 above`

---

**Next**: Go to Google Cloud Console and create the iOS OAuth client!
