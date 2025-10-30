# iOS Setup Guide for SpeakEasy

This guide will help you complete the iOS setup and run SpeakEasy on your iPhone or iOS Simulator.

## Prerequisites

- ✅ macOS with Xcode 16+ installed
- ✅ CocoaPods installed (`pod --version`)
- ✅ Expo CLI installed (`npm install -g expo-cli`)
- ✅ iOS device or iOS Simulator

## Current Setup Status

✅ **Completed:**
- iOS project structure created
- CocoaPods dependencies installed (105 pods)
- Notification permissions configured in app.json
- UIBackgroundModes added to Info.plist
- React Native 0.81.5 with New Architecture enabled
- Expo Autolinking configured for 8 native modules

⚠️ **Requires Manual Setup:**
- iOS Simulator runtime installation (via Xcode GUI)

---

## Option 1: Run on iOS Simulator (Recommended for Development)

### Step 1: Install iOS Simulator Runtime

The iOS simulator requires a runtime to be installed via Xcode's GUI:

```bash
# 1. Open Xcode
open -a Xcode
```

**In Xcode:**
1. Go to **Xcode → Settings** (or press `Cmd + ,`)
2. Click the **Platforms** tab (or **Components** in older Xcode versions)
3. Find **iOS 18.x Simulator** in the list
4. Click the **Download** button (⬇️ icon)
5. Wait for the download to complete (can take 10-30 minutes depending on connection)
6. Once installed, you'll see "Installed" status

### Step 2: Launch the Simulator

```bash
# Open Simulator app
open -a Simulator
```

Wait for the simulator to boot completely (you'll see the iOS home screen).

### Step 3: Build and Run the App

```bash
# Navigate to project directory
cd /Users/scott/dev/speakeasy

# Build and run on iOS simulator
npx expo run:ios
```

This will:
- Build the native iOS app
- Install it on the simulator
- Launch the app automatically
- Start the Metro bundler for hot reloading

### Step 4: Test Notifications

Once the app is running:

1. Navigate to **More** tab (bottom right)
2. Tap **Settings**
3. Scroll to **Notifications 🔔** section
4. Toggle **Daily Reminders** ON
5. Tap **Send Test Notification**
6. You should receive a notification immediately

---

## Option 2: Run on Physical iPhone (Best for Testing Notifications)

Physical devices provide the most accurate testing environment for notifications.

### Step 1: Connect Your iPhone

```bash
# Connect iPhone via USB cable
# Unlock your iPhone
# Trust this computer when prompted
```

### Step 2: Build and Install

```bash
# Build and run on connected device
npx expo run:ios --device
```

Xcode will:
- Detect your connected iPhone
- Build the app with your development certificate
- Install and launch the app on your device

### Step 3: Enable Developer Mode (iOS 16+)

If you see an error about Developer Mode:

1. On your iPhone: **Settings → Privacy & Security → Developer Mode**
2. Toggle **Developer Mode** ON
3. Restart your iPhone
4. Reconnect and run `npx expo run:ios --device` again

### Step 4: Test Real Notifications

Physical devices receive actual push notifications:

1. Enable notifications in Settings (More → Settings → Notifications)
2. Close the app completely
3. Wait for scheduled notifications at 12:00 PM or 6:00 PM
4. Or send a test notification and lock your device to see it

---

## Option 3: Use Expo Go App (Quick Testing)

For rapid testing without building native code:

### Step 1: Install Expo Go

Download **Expo Go** from the App Store on your iPhone.

### Step 2: Start Development Server

```bash
# Start Expo server
npx expo start
```

### Step 3: Scan QR Code

1. A QR code will appear in your terminal
2. Open **Camera** app on your iPhone
3. Point at the QR code
4. Tap the notification to open in Expo Go

**Note:** Some native features (like notifications) may have limited functionality in Expo Go.

---

## Troubleshooting

### "No iOS devices available in Simulator.app"

**Solution:** Install iOS Simulator runtime via Xcode Settings → Platforms (see Option 1, Step 1)

### "Unable to boot device in current state: Booted"

```bash
# Shutdown all simulators
xcrun simctl shutdown all

# Boot a specific simulator
xcrun simctl boot "iPhone 15 Pro"

# Or just open Simulator app
open -a Simulator
```

### "Code signing is required"

**Solution:** Open `ios/SpeakEasy.xcworkspace` in Xcode:
1. Select SpeakEasy target
2. Go to **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Select your Apple ID team

### Port 8081 already in use

```bash
# Kill existing Metro bundler
lsof -ti:8081 | xargs kill -9

# Or use a different port
npx expo start --port 8082
```

### Pod install fails

```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### Build fails with "Command PhaseScriptExecution failed"

```bash
# Clean build folder
cd ios
xcodebuild clean -workspace SpeakEasy.xcworkspace -scheme SpeakEasy
cd ..

# Rebuild
npx expo run:ios --no-build-cache
```

---

## Testing Checklist

Once the app is running, verify these features:

### Navigation
- [ ] **Learn** tab shows Stories, Curriculum, Custom sub-tabs
- [ ] **Practice** tab shows AI Chat, Accent Tutor sub-tabs
- [ ] **Music** tab opens and allows searching
- [ ] **Leagues** tab displays gamification stats
- [ ] **More** tab shows Review and Settings options

### Notifications
- [ ] More → Settings → Notifications section is visible
- [ ] Can toggle Daily Reminders ON/OFF
- [ ] Test notification button works
- [ ] Notification appears in Notification Center
- [ ] Tapping notification opens the app
- [ ] Analytics section shows engagement stats (after receiving notifications)

### Settings Screen
- [ ] LLM configuration section visible
- [ ] Theme switcher works (Light/Dark/System)
- [ ] Account information displays correctly
- [ ] Logout button functions

### XP System
- [ ] Completing lessons awards XP
- [ ] XP reward animation appears
- [ ] Level progress updates in Leagues tab
- [ ] Achievements unlock

---

## App Architecture

### Tab Structure (5 Tabs)
```
Learn (book icon)
├── Stories (HomeScreen)
├── Curriculum (CurriculumScreen)
└── Custom (LessonsScreen)

Practice (chat icon)
├── AI Chat (PracticeScreen)
└── Accent Tutor (AccentTutorScreen)

Music (music icon)
└── MusicScreen

Leagues (trophy icon)
└── LeaguesScreen

More (ellipsis icon)
├── Review (ReviewScreen) - Stack navigation
└── Settings (SettingsScreen) - Stack navigation
```

### Notification System
- **Service:** `src/services/notifications.js`
- **Analytics:** `src/services/analytics.js`
- **Storage:** `src/utils/storage.js`
- **14 unique reminder messages** to minimize repetition
- **Scheduled times:** 12:00 PM and 6:00 PM daily
- **Smart scheduling:** Only sends if user hasn't logged in that day

---

## Useful Commands

```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on connected iPhone
npx expo run:ios --device

# Clear cache and rebuild
npx expo start --clear

# List available simulators
xcrun simctl list devices

# Check CocoaPods version
pod --version

# Update pods
cd ios && pod update && cd ..

# View app logs
npx expo start --ios

# Clean everything and start fresh
rm -rf node_modules ios/Pods ios/Podfile.lock
npm install
cd ios && pod install && cd ..
```

---

## Next Steps

1. **Install iOS Simulator Runtime** (if not done)
   - Open Xcode → Settings → Platforms
   - Download iOS 18.x Simulator

2. **Run the App**
   ```bash
   npx expo run:ios
   ```

3. **Test Notifications**
   - Enable in Settings
   - Send test notification
   - Verify analytics tracking

4. **Deploy to TestFlight** (Optional)
   - Set up Apple Developer account
   - Configure app signing
   - Use EAS Build: `eas build --platform ios`

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [iOS Simulator Guide](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)

---

## Support

For issues specific to this project:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review notification implementation in `NOTIFICATIONS.md`
3. Check authentication flow in `AUTHENTICATION.md`

For Expo issues:
- [Expo Forums](https://forums.expo.dev/)
- [Expo Discord](https://chat.expo.dev/)
