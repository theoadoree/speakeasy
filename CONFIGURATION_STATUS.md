# SpeakEasy Configuration Status

## ✅ FULLY CONFIGURED

### 1. Firebase Credentials
**Status**: ✅ Complete

```
Project ID: modular-analog-476221-h8
Client Email: speakeasy-backend@modular-analog-476221-h8.iam.gserviceaccount.com
Service Account File: /Users/scott/dev/speakeasy/backend/secrets/serviceAccountKey.json
```

**Location**: [backend/.env](backend/.env)

### 2. Google OAuth
**Status**: ✅ Complete

```
Client ID: 823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com
```

**Configured in**:
- Mobile app: [src/services/auth.js:12](src/services/auth.js#L12)
- Backend API: [backend/.env](backend/.env)

### 3. RevenueCat
**Status**: ✅ Complete

```
API Key: AQ.Ab8RN6I14KkuQj4KEkJD249PaWSjIZYTvFuNSXqO8gDwq-PI0A
```

**Configured in**:
- [src/contexts/SubscriptionContext.js:89](src/contexts/SubscriptionContext.js#L89)
- [backend/.env](backend/.env)

### 4. JWT Secret
**Status**: ✅ Complete (Auto-generated)

```
JWT_SECRET: 7f8a9b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
JWT_EXPIRY: 30d
```

**Location**: [backend/.env](backend/.env)

### 5. iOS Configuration
**Status**: ✅ Complete

```
Bundle Identifier: com.speakeasy.app
Apple Sign In Enabled: Yes
```

**Location**: [app.json:23](app.json#L23)

## ⚠️ NEEDS CONFIGURATION

### Apple Sign In Keys

To enable Apple Sign In, you need to get these from Apple Developer Portal:

**Required Values**:
```
APPLE_TEAM_ID=YOUR_APPLE_TEAM_ID
APPLE_KEY_ID=YOUR_APPLE_KEY_ID
APPLE_PRIVATE_KEY=YOUR_APPLE_PRIVATE_KEY_P8_FILE_CONTENT
```

**Location to update**: [backend/.env](backend/.env)

### How to Get Apple Sign In Keys

#### Step 1: Sign in to Apple Developer Portal
1. Go to https://developer.apple.com/account
2. Sign in with your Apple Developer account

#### Step 2: Enable Sign in with Apple for Your App ID
1. Go to **Certificates, Identifiers & Profiles**
2. Click on **Identifiers**
3. Find your App ID: `com.speakeasy.app`
4. If it doesn't exist, create a new App ID:
   - Click the **+** button
   - Select **App IDs**
   - Description: "SpeakEasy"
   - Bundle ID: `com.speakeasy.app`
   - Capabilities: Check **Sign in with Apple**
   - Click **Continue** and **Register**
5. If it exists, edit it:
   - Click on your App ID
   - Check **Sign in with Apple** under Capabilities
   - Click **Save**

#### Step 3: Create a Sign in with Apple Key
1. Still in **Certificates, Identifiers & Profiles**, click on **Keys**
2. Click the **+** button to create a new key
3. Key Name: "SpeakEasy Sign in with Apple"
4. Check **Sign in with Apple**
5. Click **Configure** next to Sign in with Apple
6. Select your App ID: `com.speakeasy.app`
7. Click **Save**
8. Click **Continue**
9. Click **Register**
10. **Download the .p8 file** - You can only download this once!
11. Note the **Key ID** shown on the screen

#### Step 4: Find Your Team ID
1. In Apple Developer Portal, click on **Membership** in the left sidebar
2. Your **Team ID** is shown there (it's a 10-character alphanumeric string)

#### Step 5: Update backend/.env
1. Open [backend/.env](backend/.env)
2. Replace the placeholder values:

```env
APPLE_TEAM_ID=ABC123DEFG          # Your Team ID from Step 4
APPLE_KEY_ID=XYZ789                # Key ID from Step 3
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
[paste entire contents of .p8 file here]
-----END PRIVATE KEY-----
```

**Important**: The private key should include the full content including the BEGIN and END lines.

### RevenueCat Webhook Configuration

**Status**: ⚠️ Needs URL after backend deployment

Once you deploy the backend API, you need to:

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Navigate to your project → **Integrations** → **Webhooks**
3. Click **+ Add Webhook**
4. Enter webhook URL: `https://your-deployed-api.com/webhooks/revenuecat`
5. Select **all event types**
6. Click **Save**

### App Store/Play Console Products

**Status**: ⚠️ Needs creation

You need to create these subscription products:

**iOS (App Store Connect)**:
1. Go to https://appstoreconnect.apple.com/
2. Select your app
3. Go to **Subscriptions** (or **In-App Purchases**)
4. Create subscription group: "SpeakEasy Plans"
5. Create products:
   - `essential_monthly` - $17/month
   - `essential_annual` - $100/year
   - `power_monthly` - $33/month
   - `power_annual` - $200/year
6. Set 3-day free trial for all products

**Android (Google Play Console)**:
1. Go to https://play.google.com/console
2. Select your app
3. Go to **Monetize** → **Products** → **Subscriptions**
4. Create subscription group: "SpeakEasy Plans"
5. Create same products as iOS
6. Set 3-day free trial

**Then in RevenueCat**:
1. Go to RevenueCat Dashboard → **Products**
2. Create offerings:
   - "Essential" offering with monthly and annual products
   - "Power" offering with monthly and annual products
3. Link to App Store/Play Store product IDs

## 📋 Quick Reference

### Environment Files

**Backend API**: [backend/.env](backend/.env)
- ✅ Firebase credentials
- ✅ Google OAuth
- ✅ RevenueCat API key
- ✅ JWT secret
- ⚠️ Apple Sign In keys (needs configuration)

**Mobile App**: Configuration is in code
- ✅ Google OAuth: [src/services/auth.js:12](src/services/auth.js#L12)
- ✅ RevenueCat: [src/contexts/SubscriptionContext.js:89](src/contexts/SubscriptionContext.js#L89)
- ✅ Apple Sign In enabled: [app.json:23](app.json#L23)

### Testing Readiness

Can test now:
- ✅ Google Sign In
- ✅ Backend API endpoints
- ✅ JWT authentication
- ✅ Firebase Firestore integration
- ✅ RevenueCat local subscription (trial mode)

Cannot test until configured:
- ⚠️ Apple Sign In (needs Apple keys)
- ⚠️ RevenueCat webhooks (needs deployed backend URL)
- ⚠️ Real subscription purchases (needs App Store/Play Console products)

## 🚀 Next Steps

### Immediate (Can do now)
1. ✅ Start backend server: `cd backend && npm run dev`
2. ✅ Test Google Sign In on mobile app
3. ✅ Test JWT authentication endpoints
4. ✅ Test Firebase user creation

### Short-term (Need Apple Developer account)
1. Get Apple Sign In keys (follow instructions above)
2. Update [backend/.env](backend/.env) with Apple keys
3. Test Apple Sign In on iOS device

### Before Launch
1. Deploy backend API (Google Cloud Run recommended)
2. Configure RevenueCat webhooks with deployed URL
3. Create subscription products in App Store Connect
4. Create subscription products in Google Play Console
5. Configure products in RevenueCat dashboard
6. Test complete purchase flow with sandbox accounts

## 📞 Support Links

- **Apple Developer Portal**: https://developer.apple.com/account
- **Apple Sign In Documentation**: https://developer.apple.com/sign-in-with-apple/
- **RevenueCat Dashboard**: https://app.revenuecat.com/
- **Firebase Console**: https://console.firebase.google.com/
- **Google Cloud Console**: https://console.cloud.google.com/

## ✨ Summary

**What's Working**:
- ✅ Google Sign In fully configured
- ✅ Firebase database ready
- ✅ RevenueCat SDK integrated
- ✅ JWT authentication system ready
- ✅ Token tracking system implemented
- ✅ Subscription UI complete

**What's Needed**:
- ⚠️ Apple Sign In keys (15-20 minutes to get)
- ⚠️ Backend deployment (optional for testing)
- ⚠️ RevenueCat webhook configuration (after deployment)
- ⚠️ App Store/Play Console products (before production)

**You can start testing Google Sign In and the full flow right now!**
