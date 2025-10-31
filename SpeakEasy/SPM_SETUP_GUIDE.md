# Swift Package Manager Setup Guide

## Why We Switched to SPM

We removed CocoaPods due to Xcode sandbox security issues and switched to **Swift Package Manager (SPM)**, Apple's official dependency manager.

### Benefits of SPM:
- ✅ Native to Xcode (no external tools)
- ✅ No sandbox/permission issues
- ✅ Faster builds
- ✅ No workspace or Podfile needed
- ✅ Apple's officially supported solution

## Step-by-Step Setup Instructions

### 1. Open Project in Xcode

```bash
cd /Users/scott/dev/speakeasy/SpeakEasy
open SpeakEasy.xcodeproj
```

**Important:** Use `.xcodeproj` (NOT `.xcworkspace` - we deleted that)

### 2. Add GoogleSignIn via Swift Package Manager

1. In Xcode, go to **File → Add Package Dependencies...**

2. In the search bar, paste:
   ```
   https://github.com/google/GoogleSignIn-iOS
   ```

3. Click **Add Package**

4. Select **GoogleSignIn** library (should be pre-selected)

5. Click **Add Package** again

6. Verify it appears in:
   - Project Navigator → Under "Package Dependencies"
   - Target → General → "Frameworks, Libraries, and Embedded Content"

### 3. Add Sign in with Apple Capability

1. Select **SpeakEasy** target in project navigator

2. Go to **Signing & Capabilities** tab

3. Click **+ Capability** button (top left)

4. Search for **"Sign in with Apple"**

5. Double-click to add it

6. Verify the capability appears in the list

### 4. Configure Google Sign-In URL Scheme

1. Select **SpeakEasy** target

2. Go to **Info** tab

3. Expand **URL Types** section (if not visible, right-click and add)

4. Click **+** to add a URL Type

5. Fill in:
   - **Identifier**: `com.googleusercontent.apps.823510409781-7am96n366leset271qt9c8djo265u24n`
   - **URL Schemes**: `com.googleusercontent.apps.823510409781-7am96n366leset271qt9c8djo265u24n`

   (This is the reversed Google Client ID)

### 5. Uncomment Google Sign-In Code

Open `SpeakEasy/ViewModels/AuthenticationManager.swift` and:

1. **Line 11**: Uncomment the import
   ```swift
   import GoogleSignIn  // Remove the comment slashes
   ```

2. **Lines 121-156**: Uncomment the Google Sign-In implementation
   - Remove the `/*` at line 121
   - Remove the `*/` at line 156
   - Delete the placeholder error message (lines 118-120)

### 6. Build and Run

1. Select your iPhone device from the device dropdown

2. Press **⌘ + B** to build (or Product → Build)

3. If build succeeds, press **⌘ + R** to run (or Product → Run)

4. The app should launch on your iPhone!

## Verification Checklist

After setup, verify:

- [ ] GoogleSignIn package appears in Package Dependencies
- [ ] Sign in with Apple capability is enabled
- [ ] URL Scheme is configured (check Info tab)
- [ ] `import GoogleSignIn` is uncommented
- [ ] Google Sign-In function is uncommented
- [ ] Build succeeds without errors
- [ ] App launches on device

## Troubleshooting

### "Cannot find 'GIDSignIn' in scope"

**Solution:** Make sure GoogleSignIn package is added via SPM (Step 2)

### "No such module 'GoogleSignIn'"

**Solution:**
1. Clean build folder: **Shift + ⌘ + K**
2. Rebuild: **⌘ + B**

### Build fails with "Sandbox" errors

**Solution:** You still have CocoaPods linker settings.
1. Select **SpeakEasy** target
2. Go to **Build Settings**
3. Search for: "Framework Search Paths"
4. Remove any paths containing "Pods" or "CocoaPods"
5. Do the same for "Header Search Paths"

### Sign in with Apple button doesn't work

**Solution:** Make sure:
1. Capability is added (Step 3)
2. Device is signed in with Apple ID (Settings → Sign in to iPhone)
3. App is running on real device (not simulator for production)

## What's Already Done

✅ CocoaPods completely removed
✅ GoogleSignIn import line prepared (commented out)
✅ Google Sign-In implementation ready (commented out)
✅ Apple Sign-In fully implemented
✅ Unified auth UI complete
✅ Backend API endpoints defined

## Next Steps After Setup

Once SPM setup is complete and app builds:

1. **Test Authentication:**
   - Email/password auth
   - Apple Sign In
   - Google Sign In

2. **Deploy to iPhone:**
   ```bash
   # Build via CLI (after Xcode setup)
   xcodebuild -scheme SpeakEasy -configuration Debug \
     -destination 'platform=iOS,id=00008150-000D65A92688401C' \
     -allowProvisioningUpdates build

   # Install
   xcrun devicectl device install app --device 00008150-000D65A92688401C \
     ~/Library/Developer/Xcode/DerivedData/*/Build/Products/Debug-iphoneos/SpeakEasy.app
   ```

3. **Implement Backend Endpoints:**
   - See `IMPLEMENTATION_STATUS.md` for full backend TODO list
   - Add endpoints to `backend/server-openai.js`

4. **Start Building New Features:**
   - Comprehensible Input Engine (Priority 1)
   - Conversation Scenarios (Priority 2)
   - Enhanced SRS (Priority 3)

## Additional Resources

- [SPM Documentation](https://developer.apple.com/documentation/xcode/adding-package-dependencies-to-your-app)
- [GoogleSignIn iOS Setup](https://developers.google.com/identity/sign-in/ios/start)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)

---

**Estimated Time:** 5-10 minutes
**Difficulty:** Easy (just clicking buttons in Xcode)

After completing this setup, you'll have a fully working iOS app with:
- Email authentication
- Apple Sign In
- Google Sign In
- All the data models and API infrastructure ready for feature development!
