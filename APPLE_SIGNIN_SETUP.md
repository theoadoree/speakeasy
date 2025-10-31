# Apple Sign In Setup Guide for SpeakEasy

## 📋 Current Configuration Status

### ✅ Already Configured:
- **Bundle ID (iOS/Native)**: `com.scott.speakeasy` (in [app.json](app.json#L21))
- **Bundle ID (Backend)**: `com.speakeasy.app` (in [backend/env.yaml](backend/env.yaml#L7))
- **Backend Service**: Apple auth service implemented ([backend/services/apple-auth-service.js](backend/services/apple-auth-service.js))
- **Web Frontend**: Apple Sign In button implemented ([web/index.html:1177-1235](web/index.html#L1177-L1235))

### ⚠️ Missing (Required for Production):
- **Apple Team ID** - Your 10-character Apple Developer team identifier
- **Apple Key ID** - The ID of your Sign In with Apple key
- **Apple Private Key** - The .p8 file content from Apple Developer

---

## 🚀 Complete Setup Steps

### Step 1: Create App ID in Apple Developer Console (5 minutes)

1. **Go to**: https://developer.apple.com/account/resources/identifiers/list
2. **Click**: "+" to add a new identifier
3. **Select**: "App IDs" → Continue
4. **Choose**: "App" type → Continue
5. **Configure**:
   - **Description**: SpeakEasy iOS App
   - **Bundle ID**: `com.scott.speakeasy` (must match [app.json](app.json#L21))
   - **Capabilities**: Check "Sign In with Apple"
6. **Click**: Continue → Register

---

### Step 2: Create Service ID for Web (5 minutes)

1. **Go to**: https://developer.apple.com/account/resources/identifiers/list
2. **Click**: "+" to add a new identifier
3. **Select**: "Services IDs" → Continue
4. **Configure**:
   - **Description**: SpeakEasy Web App
   - **Identifier**: `com.speakeasy.webapp`
   - **Check**: "Sign In with Apple"
5. **Click**: "Configure" next to Sign In with Apple
6. **Add Domains and Return URLs**:

   **Primary App ID**: `com.scott.speakeasy`

   **Domains**:
   ```
   speakeasy-ai.app
   speakeasy-backend-823510409781.us-central1.run.app
   ```

   **Return URLs**:
   ```
   https://speakeasy-ai.app
   https://speakeasy-ai.app/auth/callback
   https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/apple/callback
   ```

7. **Click**: Save → Continue → Register

---

### Step 3: Create Sign In with Apple Key (5 minutes)

1. **Go to**: https://developer.apple.com/account/resources/authkeys/list
2. **Click**: "+" to create a new key
3. **Configure**:
   - **Key Name**: SpeakEasy Sign In Key
   - **Check**: "Sign In with Apple"
   - **Click**: "Configure" → Select `com.speakeasy.webapp` as Primary App ID
4. **Click**: Continue → Register
5. **Download**: Click "Download" (⚠️ **ONE-TIME DOWNLOAD - SAVE IT!**)
6. **Save**:
   - The downloaded file (e.g., `AuthKey_ABC123DEF4.p8`)
   - **Note the Key ID** (10-character string like `ABC123DEF4`)

---

### Step 4: Get Your Apple Team ID (1 minute)

1. **Go to**: https://developer.apple.com/account
2. **Look at top right**: Your team name
3. **Click**: Membership → Note your **Team ID** (10-character string like `E7B9UE64SF`)

---

### Step 5: Configure Backend Environment Variables

You have **TWO OPTIONS**:

#### **Option A: Update env.yaml (Recommended)**

Edit [backend/env.yaml](backend/env.yaml):

```yaml
NODE_ENV: production
JWT_SECRET: 7f8a9b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
GOOGLE_CLIENT_ID: 823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com
REVENUECAT_API_KEY: AQ.Ab8RN6I14KkuQj4KEkJD249PaWSjIZYTvFuNSXqO8gDwq-PI0A
FIREBASE_PROJECT_ID: modular-analog-476221-h8
FIREBASE_CLIENT_EMAIL: speakeasy-backend@modular-analog-476221-h8.iam.gserviceaccount.com
APPLE_BUNDLE_ID: com.speakeasy.app
APPLE_TEAM_ID: YOUR_TEAM_ID_HERE
APPLE_KEY_ID: YOUR_KEY_ID_HERE
CORS_ORIGIN: "*"
LOG_LEVEL: info

FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\n..."

APPLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----
YOUR_P8_FILE_CONTENT_HERE
-----END PRIVATE KEY-----"
```

**Then redeploy**:
```bash
npm run backend:deploy
```

#### **Option B: Use gcloud command**

```bash
# Read your .p8 file
APPLE_KEY_CONTENT=$(cat AuthKey_*.p8)

# Update Cloud Run
gcloud run services update speakeasy-backend \
  --region=us-central1 \
  --update-env-vars="APPLE_TEAM_ID=YOUR_TEAM_ID,APPLE_KEY_ID=YOUR_KEY_ID,APPLE_PRIVATE_KEY=$APPLE_KEY_CONTENT"
```

---

## 🧪 Testing Apple Sign In

### Test on Web:
1. Visit: https://speakeasy-ai.app
2. Click: "🍎 Continue with Apple"
3. Sign in with your Apple ID
4. Grant permissions
5. You should be logged in!

### Test on iOS:
1. Run: `npm run ios`
2. Tap: "Continue with Apple"
3. Use Face ID / Touch ID
4. You should be logged in!

### Test on Android:
- Apple Sign In is **not supported** on Android (Apple limitation)
- Users will see only Google Sign In option

---

## 📊 Verification Checklist

- [ ] App ID created with Bundle ID `com.scott.speakeasy`
- [ ] Service ID created with Identifier `com.speakeasy.webapp`
- [ ] Sign In with Apple key created and downloaded
- [ ] Team ID noted
- [ ] Key ID noted
- [ ] env.yaml updated with all three values
- [ ] Backend redeployed
- [ ] Tested on web browser
- [ ] Tested on iOS simulator/device

---

## 🔧 Environment Variables Summary

| Variable | Where to Find | Example |
|----------|---------------|---------|
| **APPLE_BUNDLE_ID** | Already set | `com.speakeasy.app` |
| **APPLE_TEAM_ID** | Apple Developer → Membership | `E7B9UE64SF` |
| **APPLE_KEY_ID** | Shown when creating key | `ABC123DEF4` |
| **APPLE_PRIVATE_KEY** | Downloaded .p8 file contents | `-----BEGIN PRIVATE KEY-----\n...` |

---

## 🐛 Troubleshooting

### "Invalid Client" Error
- **Cause**: Service ID not configured correctly
- **Fix**: Verify Service ID `com.speakeasy.webapp` exists and has correct domains/return URLs

### "Invalid Grant" Error
- **Cause**: Private key or Team ID incorrect
- **Fix**: Re-check APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY in env.yaml

### "Unauthorized Client" Error
- **Cause**: Bundle ID mismatch
- **Fix**: Ensure APPLE_BUNDLE_ID matches your App ID

### Apple Sign In button doesn't appear on iOS
- **Cause**: Missing entitlement in app.json
- **Fix**: Already configured in [app.json:23](app.json#L23) - should work

### Works on web but not iOS
- **Check**: Xcode project settings → Signing & Capabilities → Add "Sign In with Apple" capability

---

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **iOS Native** | ✅ Supported | Primary platform for Apple Sign In |
| **Web** | ✅ Supported | Uses Service ID authentication |
| **Android** | ❌ Not Supported | Apple limitation - use Google instead |

---

## 🔗 Quick Links

- **Apple Developer Console**: https://developer.apple.com/account/resources
- **App IDs**: https://developer.apple.com/account/resources/identifiers/list
- **Keys**: https://developer.apple.com/account/resources/authkeys/list
- **Documentation**: https://developer.apple.com/documentation/sign_in_with_apple

---

## 💡 Security Notes

1. **Never commit .p8 files to version control** ✅ (already in .gitignore)
2. **Never share your private key** - it authenticates your app to Apple
3. **Rotate keys annually** for best security practices
4. **Use Secret Manager** for production (optional enhancement)

---

## ✅ Once Complete

After completing these steps:
- ✅ Apple Sign In will work on iOS devices
- ✅ Apple Sign In will work on web browsers
- ✅ Users can sign in with one tap
- ✅ Email privacy is protected (Apple's private relay)
- ✅ Backend can verify Apple tokens securely

Ready to deploy! 🚀
