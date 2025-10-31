# Google OAuth iOS Client Setup - Step by Step

## Current Status

✅ **Apple Sign In**: Configured with credentials
- Team ID: `E7B9UE64SF`
- Key ID: `FD22H4T9UU`
- Service ID: `com.speakeasy.webapp`

❌ **Google Sign In**: Using Web Client ID (causing error)
- Current Client ID: `823510409781-7am96n366leset271qt9c8djo265u24n` (Web type)
- **Error**: "Custom scheme URLs are not allowed for 'WEB' client type"

## Why This Happens

Google OAuth has different client types:
- **Web clients**: Use https:// redirect URLs
- **iOS clients**: Use custom URL schemes like `com.googleusercontent.apps.*`

The iOS app needs an **iOS OAuth client**, not a Web client.

## Step-by-Step Fix

### Step 1: Open Google Cloud Console

1. Go to: https://console.cloud.google.com
2. Log in with your Google account
3. Select project: **modular-analog-476221-h8**

### Step 2: Navigate to Credentials

1. In the left sidebar, click **APIs & Services**
2. Click **Credentials**
3. You'll see your existing credentials

### Step 3: Create iOS OAuth Client

1. Click the blue **"+ CREATE CREDENTIALS"** button at the top
2. Select **"OAuth client ID"**
3. For "Application type", select: **iOS**

### Step 4: Fill in iOS Client Details

Enter the following information:

| Field | Value |
|-------|-------|
| **Name** | `SpeakEasy iOS` |
| **Bundle ID** | `com.speakeasy.ios.SpeakEasy` |
| **App Store ID** | Leave blank (not published yet) |
| **Team ID** | `E7B9UE64SF` |

Click **"CREATE"**

### Step 5: Copy the iOS Client ID

After creation, you'll see a dialog with your new OAuth client details:

```
Client ID: XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

**Important**: Copy this entire Client ID - you'll need it in the next steps.

Example format: `123456789-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`

### Step 6: Update the iOS App Code

#### 6a. Update AuthenticationManager.swift

Open: `/Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/ViewModels/AuthenticationManager.swift`

Find line 131:
```swift
let config = GIDConfiguration(clientID: "823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com")
```

Replace with your **new iOS Client ID**:
```swift
let config = GIDConfiguration(clientID: "YOUR_NEW_IOS_CLIENT_ID.apps.googleusercontent.com")
```

#### 6b. Update Info.plist URL Scheme

Open: `/Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/Info.plist`

Find the `CFBundleURLTypes` section and update:

**Current** (using reversed Web Client ID):
```xml
<string>com.googleusercontent.apps.823510409781-7am96n366leset271qt9c8djo265u24n</string>
```

**New** (using reversed iOS Client ID):
```xml
<string>com.googleusercontent.apps.YOUR_NEW_IOS_CLIENT_ID</string>
```

**Example**: If your iOS Client ID is `123456789-abc123.apps.googleusercontent.com`, the URL scheme becomes:
```xml
<string>com.googleusercontent.apps.123456789-abc123</string>
```

## Automated Update Script

Once you have your iOS Client ID, run this to update everything:

```bash
#!/bin/bash

# Replace this with your actual iOS Client ID (numbers and dashes only, no .apps.googleusercontent.com)
NEW_CLIENT_ID="PASTE_YOUR_CLIENT_ID_HERE"

echo "Updating Google OAuth configuration..."

# Update AuthenticationManager.swift
sed -i '' "s/823510409781-7am96n366leset271qt9c8djo265u24n/$NEW_CLIENT_ID/g" \
  /Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/ViewModels/AuthenticationManager.swift

# Update Info.plist URL scheme
sed -i '' "s/com.googleusercontent.apps.823510409781-7am96n366leset271qt9c8djo265u24n/com.googleusercontent.apps.$NEW_CLIENT_ID/g" \
  /Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/Info.plist

echo "✅ Files updated!"
echo ""
echo "Now rebuilding the app..."

# Clean and rebuild
cd /Users/scott/dev/speakeasy/SpeakEasy
xcodebuild clean -project SpeakEasy.xcodeproj -scheme SpeakEasy

xcodebuild -project SpeakEasy.xcodeproj -scheme SpeakEasy \
  -destination 'platform=iOS,id=00008150-000D65A92688401C' \
  -allowProvisioningUpdates build

echo "✅ Build complete!"
echo ""
echo "Installing on iPhone..."

# Install on device
xcrun devicectl device install app --device 00008150-000D65A92688401C \
  ~/Library/Developer/Xcode/DerivedData/SpeakEasy-*/Build/Products/Debug-iphoneos/SpeakEasy.app

echo "✅ App installed!"
echo ""
echo "Google Sign-In should now work! Try signing in with Google."
```

## Manual Update Steps

If you prefer to do it manually:

### 1. Update AuthenticationManager.swift

```bash
# Open in Xcode or any text editor
open -a Xcode /Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/ViewModels/AuthenticationManager.swift
```

Find line 131 and replace the client ID.

### 2. Update Info.plist

```bash
# Open in Xcode
open -a Xcode /Users/scott/dev/speakeasy/SpeakEasy/SpeakEasy/Info.plist
```

Or edit as XML and update the URL scheme value.

### 3. Rebuild and Install

```bash
cd /Users/scott/dev/speakeasy/SpeakEasy

# Clean
xcodebuild clean -project SpeakEasy.xcodeproj -scheme SpeakEasy

# Build
xcodebuild -project SpeakEasy.xcodeproj -scheme SpeakEasy \
  -destination 'platform=iOS,id=00008150-000D65A92688401C' \
  -allowProvisioningUpdates build

# Install
xcrun devicectl device install app --device 00008150-000D65A92688401C \
  ~/Library/Developer/Xcode/DerivedData/SpeakEasy-*/Build/Products/Debug-iphoneos/SpeakEasy.app
```

## Verification Checklist

After completing the update:

- [ ] Created iOS OAuth client in Google Cloud Console
- [ ] Copied the new iOS Client ID
- [ ] Updated `AuthenticationManager.swift` with new client ID
- [ ] Updated `Info.plist` URL scheme with reversed client ID
- [ ] Rebuilt the app successfully
- [ ] Installed app on iPhone
- [ ] Tested Google Sign-In (should open Google login page)
- [ ] Successfully authenticated with Google account
- [ ] App redirects back after authentication

## Expected Behavior After Fix

1. ✅ Tap "Continue with Google" button
2. ✅ Safari/Google login page opens
3. ✅ Select your Google account
4. ✅ Authorize SpeakEasy app
5. ✅ Redirects back to SpeakEasy app
6. ✅ User is logged in successfully

## Troubleshooting

### Still getting "Authorization Error"?

**Wait 5-10 minutes** - Google OAuth changes can take time to propagate.

### "Invalid Client" error?

- Double-check the Client ID is copied exactly
- Ensure you're using the iOS client ID, not Web
- Verify the URL scheme matches the reversed client ID

### "redirect_uri_mismatch" error?

- This shouldn't happen with iOS clients, but if it does:
- Make sure Bundle ID in Google Console matches: `com.speakeasy.ios.SpeakEasy`
- Verify Team ID is correct: `E7B9UE64SF`

### Google login opens but app doesn't respond?

- Check the URL scheme in Info.plist
- Ensure the scheme matches: `com.googleusercontent.apps.YOUR_CLIENT_ID`
- Rebuild the app after making changes

## Current Configuration Summary

**Before (Web Client):**
- Client ID: `823510409781-7am96n366leset271qt9c8djo265u24n`
- Type: Web
- Issue: Can't use custom URL schemes ❌

**After (iOS Client):**
- Client ID: `YOUR_NEW_IOS_CLIENT_ID`
- Type: iOS
- Bundle ID: `com.speakeasy.ios.SpeakEasy`
- Team ID: `E7B9UE64SF`
- Works with custom URL schemes ✅

## Apple Sign-In Configuration (Already Done)

For reference, your Apple Sign-In is configured with:

```
Team ID: E7B9UE64SF
Key ID: FD22H4T9UU
Service ID: com.speakeasy.webapp
Capability: Sign In with Apple (enabled in Xcode)
```

This should work once the backend `/api/auth/apple` endpoint is properly configured with these credentials.

---

**Next Steps:**
1. Create the iOS OAuth client in Google Cloud Console
2. Copy the new Client ID
3. Run the automated update script (or update manually)
4. Test Google Sign-In on your iPhone

**Estimated Time:** 5-10 minutes

Let me know once you have the iOS Client ID and I can help update the code!
