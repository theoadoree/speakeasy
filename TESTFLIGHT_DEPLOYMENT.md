# TestFlight Deployment Guide 🚀

Complete guide to deploy SpeakEasy to TestFlight for beta testing.

---

## Prerequisites

### Required Accounts
1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/programs/
   - Must be enrolled in Apple Developer Program

2. **Expo Account** (Free)
   - Sign up at: https://expo.dev/signup
   - Required for EAS Build service

### Required Software
- ✅ EAS CLI (already installed)
- ✅ Xcode (already installed)
- ✅ Node.js (already installed)

---

## Step-by-Step Deployment

### Step 1: Create App Store Connect App (15 min)

1. **Go to App Store Connect**
   - Visit: https://appstoreconnect.apple.com/
   - Sign in with your Apple Developer account

2. **Create New App**
   - Click **Apps** → **+** (Add App)
   - **Platform**: iOS
   - **Name**: SpeakEasy
   - **Primary Language**: English
   - **Bundle ID**: `com.speakeasy.app` (should already exist from your Developer account)
   - **SKU**: `speakeasy-1` (unique identifier)
   - **User Access**: Full Access

3. **Note Your App ID**
   - After creating, you'll see an **App ID** (numeric, like `1234567890`)
   - **Save this!** You'll need it for EAS configuration

---

### Step 2: Login to EAS (2 min)

```bash
# Login to your Expo account
eas login

# Or create account if you don't have one
eas register
```

Follow the prompts to authenticate.

---

### Step 3: Configure EAS Project (3 min)

```bash
# Initialize EAS in your project
eas build:configure
```

This will:
- Link your project to your Expo account
- Generate a project ID
- Update `app.json` with EAS config

**When prompted:**
- Generate new project? → **Yes**
- Project name → **SpeakEasy** (or leave default)

---

### Step 4: Update EAS Configuration (5 min)

Edit `eas.json` to add your Apple credentials:

```bash
nano eas.json
```

Update the `submit.production.ios` section:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

**To find your Apple Team ID:**
1. Go to: https://developer.apple.com/account
2. Click **Membership** in the sidebar
3. Copy your **Team ID** (10 characters, like `ABCD123456`)

---

### Step 5: Build for TestFlight (30-60 min)

This step uploads your code to Expo's build servers.

```bash
# Build production iOS app
eas build --platform ios --profile production
```

**What happens:**
1. Code is uploaded to EAS Build servers
2. EAS configures build environment
3. Installs dependencies and pods
4. Compiles iOS app with Xcode
5. Signs with your Apple Developer credentials
6. Creates `.ipa` file ready for App Store

**You'll be prompted:**
- **Generate new credentials?** → **Yes** (first time only)
- **Use Apple Developer account?** → **Yes**
- **Sign in with Apple ID** → Enter your Apple Developer credentials

**Build time:** ~30-60 minutes depending on queue

**Monitor progress:**
- Check status in terminal
- Or visit: https://expo.dev/accounts/[your-account]/projects/speakeasy/builds

---

### Step 6: Submit to TestFlight (5 min)

Once the build completes:

```bash
# Submit to App Store Connect / TestFlight
eas submit --platform ios --profile production
```

**Or submit manually:**
1. Download the `.ipa` file from EAS dashboard
2. Open **Transporter** app (macOS)
3. Drag and drop the `.ipa` file
4. Click **Deliver**

---

### Step 7: Configure TestFlight (10 min)

1. **Go to App Store Connect**
   - https://appstoreconnect.apple.com/
   - Select **SpeakEasy** app

2. **Go to TestFlight Tab**
   - You'll see your build processing (takes 5-15 minutes)
   - Once processed, status changes to "Ready to Submit"

3. **Complete Compliance**
   - Answer encryption questions:
     - "Does your app use encryption?" → **Yes** (HTTPS)
     - "Is encryption limited to standard protocols?" → **Yes**
   - Submit for review (auto-approval for TestFlight)

4. **Add Testers**
   - **Internal Testing** (up to 100 testers):
     - App Store Connect users with access
     - Can test immediately

   - **External Testing** (up to 10,000 testers):
     - Requires beta app review (1-2 days)
     - Add tester emails
     - They'll receive TestFlight invitation

---

## Quick Commands Reference

```bash
# Login to EAS
eas login

# Build for iOS production
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --profile production

# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Cancel a build
eas build:cancel

# Update app version
eas build:version:set --platform ios

# Create development build (for testing on device)
eas build --platform ios --profile development
```

---

## App Versions

When you're ready to release a new version:

### Update Version Number

Edit `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

**Version rules:**
- **version**: User-facing version (1.0.0, 1.0.1, 1.1.0)
- **buildNumber**: Internal build number (increment for each build)

### Or use EAS command:

```bash
# Auto-increment build number
eas build:version:set --platform ios
```

---

## Troubleshooting

### "Invalid Bundle Identifier"

**Issue:** Bundle ID doesn't match your App Store Connect app

**Solution:**
1. Check `app.json`: `"bundleIdentifier": "com.speakeasy.app"`
2. Check App Store Connect app settings
3. Make sure they match exactly

---

### "Missing Push Notification Entitlement"

**Issue:** App Store Connect requires push notification capability

**Solution:**
Already configured! Our app has notification entitlements in:
- `app.json` → `ios.infoPlist.UIBackgroundModes`
- `ios/SpeakEasy/Info.plist` → `UIBackgroundModes`

---

### "Build Failed - Pod Install"

**Issue:** CocoaPods dependencies failed to install

**Solution:**
```bash
# Clean and reinstall pods locally
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..

# Then retry EAS build
eas build --platform ios --profile production --clear-cache
```

---

### "Provisioning Profile Error"

**Issue:** Code signing credentials expired or invalid

**Solution:**
```bash
# Clear credentials and regenerate
eas credentials

# Select: iOS → Production → Remove all credentials
# Then rebuild - EAS will create new ones
eas build --platform ios --profile production
```

---

### "Build Stuck in Queue"

**Issue:** Many builds in queue, wait time is long

**Solutions:**
1. **Wait it out** - free tier can have longer queues
2. **Upgrade to paid plan** - faster builds, higher priority
3. **Check status**: https://status.expo.dev/

---

### "App Rejected from TestFlight"

**Common reasons:**
1. **Incomplete metadata** - Add screenshots and description
2. **Missing compliance info** - Answer encryption questions
3. **Crashes on launch** - Test locally first with: `eas build --profile development`

---

## Cost Breakdown

### Required Costs
- **Apple Developer Account**: $99/year (required for TestFlight)

### Optional Costs (Expo EAS)
- **Free Tier**:
  - 1 iOS build/month
  - 1 Android build/month
  - Slower build times

- **Production Plan** ($29/month):
  - Unlimited builds
  - Faster build servers
  - Priority queue
  - 30 day build artifact retention

**Recommendation:** Start with free tier, upgrade if you need more builds.

---

## Testing Your TestFlight Build

### Internal Testing (Immediate)

1. **Add yourself as internal tester**
   - App Store Connect → TestFlight → Internal Testing
   - Add your Apple ID email

2. **Install TestFlight app** on your iPhone
   - Download from App Store

3. **Accept invitation**
   - You'll receive email invitation
   - Click link and open in TestFlight

4. **Install SpeakEasy**
   - Open TestFlight app
   - Tap **Install** next to SpeakEasy

5. **Test thoroughly**
   - Test all features
   - Check notifications
   - Report crashes via TestFlight

---

## What Gets Tested

Before submitting to testers, verify:

### ✅ Critical Features
- [ ] App launches successfully
- [ ] Login/signup flow works
- [ ] Onboarding completes
- [ ] LLM connection works (if backend configured)
- [ ] Notifications can be enabled
- [ ] Test notification sends successfully
- [ ] All 5 tabs navigate correctly
- [ ] No crashes on common actions

### ✅ Notifications
- [ ] Permission request appears
- [ ] User can enable/disable in Settings
- [ ] Test notification sends
- [ ] Real notifications appear at scheduled times
- [ ] Tapping notification opens app
- [ ] Analytics tracking works

### ✅ Gamification
- [ ] XP awards properly
- [ ] Level progression works
- [ ] Leagues display correctly
- [ ] Achievements unlock

---

## After TestFlight Approval

### Monitor Feedback

1. **Check TestFlight Feedback**
   - App Store Connect → TestFlight → Feedback
   - Review crashes and screenshots

2. **Track Metrics**
   - Number of testers
   - Session count
   - Crash rate
   - Device types

3. **Iterate Quickly**
   - Fix bugs found by testers
   - Release new builds weekly
   - Communicate with testers

---

## Going to Production (App Store)

Once TestFlight testing is complete:

### 1. Prepare App Store Listing

In App Store Connect:
- **Screenshots** (5.5" and 6.5" required)
- **App Preview Video** (optional)
- **Description** (4000 char max)
- **Keywords** (100 char max)
- **Support URL**
- **Privacy Policy URL**
- **Age Rating** (complete questionnaire)

### 2. Submit for Review

```bash
# Build and submit for App Store
eas build --platform ios --profile production-store
eas submit --platform ios --profile production
```

### 3. App Review Process

- **Wait time**: 1-3 days typically
- **Review guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Common rejections**:
  - Incomplete functionality
  - Crashes
  - Privacy violations
  - UI/UX issues

---

## Automation (Advanced)

### GitHub Actions for Automatic Builds

Create `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build
on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx eas-cli build --platform ios --profile production --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Support Resources

- **Expo Documentation**: https://docs.expo.dev/eas/
- **App Store Connect**: https://appstoreconnect.apple.com/
- **Apple Developer**: https://developer.apple.com/
- **EAS Build Status**: https://status.expo.dev/
- **Expo Discord**: https://chat.expo.dev/

---

## Next Steps

1. ✅ **Install EAS CLI** - Already done!
2. ⏳ **Create App Store Connect app** - Do this next
3. ⏳ **Login to EAS** - `eas login`
4. ⏳ **Configure project** - `eas build:configure`
5. ⏳ **Build for TestFlight** - `eas build --platform ios`
6. ⏳ **Submit to TestFlight** - `eas submit --platform ios`

---

**Ready to deploy?** Start with Step 1: Create your App Store Connect app!

**Questions?** Check the troubleshooting section or Expo documentation.

**Estimated time to first TestFlight build:** ~2 hours (excluding build queue time)
