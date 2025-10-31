# Open SpeakEasy in Xcode - Quick Guide

## Open in Xcode (Right Now!)

```bash
open ios/SpeakEasy.xcworkspace
```

⚠️ **IMPORTANT**: Always open the `.xcworkspace` file, NOT the `.xcodeproj` file!

## Build & Run

1. In Xcode, select a simulator from the top bar (e.g., iPhone 15 Pro)
2. Click the ▶️ Play button or press `Cmd+R`
3. Wait for the build to complete
4. The app will launch in the simulator!

## Common Issues

### "Signing requires a development team"
1. Click on the project name in left sidebar
2. Select the "SpeakEasy" target
3. Go to "Signing & Capabilities"
4. Select your Apple ID team from the dropdown

### "No such module 'ExpoModulesCore'"
```bash
cd ios
pod install
cd ..
```
Then rebuild in Xcode.

### Build fails
```bash
# Clean and rebuild iOS
npx expo prebuild -p ios --clean
open ios/SpeakEasy.xcworkspace
```

## Firebase Setup (Optional)

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for complete Firebase integration steps.

Quick version:
1. Download `GoogleService-Info.plist` from Firebase Console
2. Copy to `ios/SpeakEasy/GoogleService-Info.plist`
3. Rebuild: `npx expo prebuild -p ios --clean`

## That's It!

You're ready to develop and test on iOS! 🎉
