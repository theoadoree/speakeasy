# Firebase Setup Guide for SpeakEasy

This guide will help you complete the Firebase integration for iOS and Android.

## ✅ Already Completed

- ✅ Firebase credentials added to `.env` file
- ✅ Firebase React Native packages installed (`@react-native-firebase/app`, `@react-native-firebase/auth`)
- ✅ `app.json` configured with Firebase plugin
- ✅ Firebase config file created at `src/config/firebase.config.js`

## 📋 Steps to Complete iOS Setup

### 1. Download GoogleService-Info.plist

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **modular-analog-476221-h8**
3. Click the ⚙️ **Settings** icon → **Project settings**
4. Scroll to **Your apps** section
5. If you don't see an iOS app, click **Add app** → iOS:
   - **iOS bundle ID**: `com.scott.speakeasy`
   - **App nickname**: SpeakEasy iOS
   - **App Store ID**: (leave blank for now)
6. Download **GoogleService-Info.plist**

### 2. Add the file to your project

```bash
# Create the directory if needed
mkdir -p ios/SpeakEasy

# Copy the downloaded file
cp ~/Downloads/GoogleService-Info.plist ios/SpeakEasy/

# Verify it's there
ls -la ios/SpeakEasy/GoogleService-Info.plist
```

### 3. Rebuild iOS project

```bash
# Clean and rebuild with Firebase integration
npx expo prebuild -p ios --clean

# Open in Xcode
open ios/SpeakEasy.xcworkspace
```

### 4. Verify in Xcode

1. In Xcode, check the **Project Navigator** (left sidebar)
2. You should see `GoogleService-Info.plist` under the **SpeakEasy** folder
3. If not, drag and drop the file from Finder into Xcode:
   - Check ✅ **Copy items if needed**
   - Check ✅ **Add to targets: SpeakEasy**

## 🔒 Security Notes

**IMPORTANT**: The API key in your `.env` file should be rotated. You should:

1. **Restrict the API key** in Firebase Console
2. **Add API restrictions** for iOS/Android/Web platforms
3. **Never commit sensitive keys** to version control

## ✅ Quick Start

To open your project in Xcode:

```bash
open ios/SpeakEasy.xcworkspace
```

Then press ▶️ (Run) or Cmd+R to build and run on simulator!
