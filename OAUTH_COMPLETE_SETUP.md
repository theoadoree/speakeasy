# Complete OAuth Setup Guide - Google & Apple

## 🎯 Quick Overview

This guide covers setting up **both** Google OAuth and Apple Sign In for your SpeakEasy app.

---

## 📋 Google OAuth Setup

### Current Status:
- ✅ Client ID configured: `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com`
- ✅ Backend service implemented
- ✅ Web frontend integrated
- ⚠️ Need to verify OAuth consent screen and authorized origins

### Setup Steps:

#### 1. Configure OAuth 2.0 Client ID

**Go to**: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8

**Find your OAuth 2.0 Client ID**: `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo`

**Click to edit and add**:

**Authorized JavaScript origins**:
```
https://speakeasy-ai.app
https://speakeasy-web-823510409781.us-central1.run.app
http://localhost:3000
http://localhost:8081
```

**Authorized redirect URIs**:
```
https://speakeasy-ai.app
https://speakeasy-ai.app/auth/callback
https://speakeasy-web-823510409781.us-central1.run.app
https://speakeasy-web-823510409781.us-central1.run.app/auth/callback
http://localhost:3000/auth/callback
http://localhost:8081
```

#### 2. Configure OAuth Consent Screen

**Go to**: https://console.cloud.google.com/apis/credentials/consent?project=modular-analog-476221-h8

**Configure**:
- **User Type**: External (for public access) or Internal (for organization only)
- **App Name**: SpeakEasy
- **User support email**: Your email
- **App logo**: Upload [assets/icon.png](assets/icon.png)
- **Developer contact**: Your email
- **Scopes**: Select `email`, `profile`, `openid`
- **Test users** (if in development mode): Add your email

#### 3. Enable Google+ API

**Go to**: https://console.cloud.google.com/apis/library/plus.googleapis.com?project=modular-analog-476221-h8

**Click**: "Enable"

### Testing Google OAuth:

```bash
# Test on web
npm run web
# Click "Continue with Google"

# Test backend endpoint
curl -X POST https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "test_token"}'
```

---

## 🍎 Apple Sign In Setup

### Current Status:
- ✅ Bundle ID configured: `com.scott.speakeasy` (iOS), `com.speakeasy.app` (backend)
- ✅ Backend service implemented
- ✅ Web frontend integrated
- ❌ Need: Apple Team ID, Key ID, Private Key

### Setup Steps:

#### 1. Create App ID

**Go to**: https://developer.apple.com/account/resources/identifiers/list

1. Click "+" → App IDs → App
2. **Description**: SpeakEasy iOS
3. **Bundle ID**: `com.scott.speakeasy`
4. **Capabilities**: Check "Sign In with Apple"
5. Register

#### 2. Create Service ID (for Web)

1. Click "+" → Services IDs
2. **Description**: SpeakEasy Web
3. **Identifier**: `com.speakeasy.webapp`
4. **Enable**: Sign In with Apple
5. **Configure**:
   - **Primary App ID**: `com.scott.speakeasy`
   - **Domains**:
     - `speakeasy-ai.app`
     - `speakeasy-backend-823510409781.us-central1.run.app`
   - **Return URLs**:
     - `https://speakeasy-ai.app`
     - `https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/apple/callback`
6. Save → Register

#### 3. Create Private Key

**Go to**: https://developer.apple.com/account/resources/authkeys/list

1. Click "+" → Create Key
2. **Key Name**: SpeakEasy Sign In
3. **Enable**: Sign In with Apple
4. **Configure**: Select `com.speakeasy.webapp`
5. Continue → Register
6. **Download** the `.p8` file (⚠️ ONE-TIME DOWNLOAD!)
7. **Note the Key ID** (e.g., `ABC123DEF4`)

#### 4. Get Team ID

**Go to**: https://developer.apple.com/account

- Click **Membership**
- Note your **Team ID** (e.g., `E7B9UE64SF`)

#### 5. Update Backend Configuration

Edit [backend/env.yaml](backend/env.yaml):

```yaml
APPLE_BUNDLE_ID: com.speakeasy.app
APPLE_TEAM_ID: YOUR_TEAM_ID
APPLE_KEY_ID: YOUR_KEY_ID
APPLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----
PASTE_YOUR_P8_FILE_CONTENT_HERE
-----END PRIVATE KEY-----"
```

Then redeploy:
```bash
npm run backend:deploy
```

### Testing Apple Sign In:

```bash
# Test on web
npm run web
# Click "Continue with Apple"

# Test on iOS
npm run ios
# Tap "Continue with Apple"
```

---

## 📊 Configuration Checklist

### Google OAuth:
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added
- [ ] OAuth consent screen configured
- [ ] Google+ API enabled
- [ ] Tested on web browser
- [ ] Tested login flow

### Apple Sign In:
- [ ] App ID created (`com.scott.speakeasy`)
- [ ] Service ID created (`com.speakeasy.webapp`)
- [ ] Domains and return URLs configured
- [ ] Private key created and downloaded
- [ ] Team ID noted
- [ ] Key ID noted
- [ ] env.yaml updated with all credentials
- [ ] Backend redeployed
- [ ] Tested on web browser
- [ ] Tested on iOS device/simulator

---

## 🔧 Environment Variables Summary

| Variable | Value | Where to Find |
|----------|-------|---------------|
| **GOOGLE_CLIENT_ID** | `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com` | Already set ✅ |
| **APPLE_BUNDLE_ID** | `com.speakeasy.app` | Already set ✅ |
| **APPLE_TEAM_ID** | `YOUR_TEAM_ID` | Apple Developer → Membership |
| **APPLE_KEY_ID** | `YOUR_KEY_ID` | Shown when creating key |
| **APPLE_PRIVATE_KEY** | `-----BEGIN PRIVATE KEY-----\n...` | Downloaded .p8 file |

---

## 🧪 Complete Testing Procedure

### 1. Test Backend Health:
```bash
curl https://speakeasy-backend-823510409781.us-central1.run.app/health
```

### 2. Test Google OAuth (Web):
1. Visit: https://speakeasy-ai.app
2. Click "Continue with Google"
3. Select Google account
4. Grant permissions
5. Verify you're logged in

### 3. Test Apple Sign In (Web):
1. Visit: https://speakeasy-ai.app
2. Click "Continue with Apple"
3. Sign in with Apple ID
4. Grant permissions
5. Verify you're logged in

### 4. Test on Mobile:
```bash
# iOS
npm run ios

# Android (Google only)
npm run android
```

---

## 🐛 Common Issues & Solutions

### Google: "redirect_uri_mismatch"
**Cause**: URL not in authorized redirect URIs
**Fix**: Add exact URL to Google Cloud Console → OAuth 2.0 Client ID

### Google: "Access blocked: This app's request is invalid"
**Cause**: OAuth consent screen not configured
**Fix**: Complete OAuth consent screen setup in Google Cloud Console

### Apple: "invalid_client"
**Cause**: Service ID not configured correctly
**Fix**: Verify `com.speakeasy.webapp` exists with correct domains/return URLs

### Apple: "invalid_grant"
**Cause**: Incorrect Team ID, Key ID, or Private Key
**Fix**: Re-check all three values in env.yaml

### Apple Sign In button doesn't work on Android
**Expected**: Apple Sign In is **not supported** on Android (Apple limitation)
**Solution**: Use Google Sign In on Android

---

## 📱 Platform Support Matrix

| Platform | Google OAuth | Apple Sign In |
|----------|--------------|---------------|
| **iOS** | ✅ Supported | ✅ Supported (Primary) |
| **Android** | ✅ Supported (Primary) | ❌ Not Supported |
| **Web** | ✅ Supported | ✅ Supported |

---

## 🔗 Quick Access Links

### Google Cloud Console:
- **Credentials**: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
- **OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent?project=modular-analog-476221-h8
- **API Library**: https://console.cloud.google.com/apis/library?project=modular-analog-476221-h8

### Apple Developer:
- **Identifiers**: https://developer.apple.com/account/resources/identifiers/list
- **Keys**: https://developer.apple.com/account/resources/authkeys/list
- **Membership**: https://developer.apple.com/account

### Your App:
- **Backend**: https://speakeasy-backend-823510409781.us-central1.run.app
- **Web App**: https://speakeasy-ai.app
- **Firebase**: https://console.firebase.google.com/project/modular-analog-476221-h8

---

## 🎯 Priority Order

**If you only have time for one:**
1. **Setup Google OAuth** (15 minutes) - Works on iOS, Android, and Web
2. Then add Apple Sign In later

**For complete setup:**
1. Google OAuth (15 min) → Works everywhere except Apple-exclusive features
2. Apple Sign In (20 min) → Adds iOS native experience

---

## 💡 Next Steps

Once both are configured:
1. ✅ Users can sign in with Google (iOS, Android, Web)
2. ✅ Users can sign in with Apple (iOS, Web)
3. ✅ Same email = same account across providers
4. ✅ Secure JWT-based sessions
5. ✅ One-tap authentication experience

Ready to launch! 🚀

---

## 📚 Additional Resources

- [APPLE_SIGNIN_SETUP.md](APPLE_SIGNIN_SETUP.md) - Detailed Apple setup
- [OAUTH_SETUP.md](OAUTH_SETUP.md) - Original OAuth documentation
- [SOCIAL_AUTH_QUICK_START.md](SOCIAL_AUTH_QUICK_START.md) - Quick start guide
