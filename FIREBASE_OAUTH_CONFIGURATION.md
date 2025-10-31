# Firebase OAuth Configuration - Updated ✅

**Date**: 2025-10-31
**Status**: All code updated to use Firebase OAuth credentials

---

## ✅ What Was Updated

I've successfully updated your entire codebase to use the Firebase OAuth configuration:

### Google OAuth Client ID Changed:
- **Old**: `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com`
- **New**: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com` ✅

### Firebase Auth Handler URL:
- **URL**: `https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler`

---

## 📝 Files Updated

### 1. Backend Configuration
- ✅ **[backend/env.yaml:3](backend/env.yaml#L3)** - Google Client ID updated
- ✅ **[backend/services/google-auth-service.js:7](backend/services/google-auth-service.js#L7)** - OAuth2Client constructor
- ✅ **[backend/services/google-auth-service.js:20](backend/services/google-auth-service.js#L20)** - Token verification audience

### 2. Frontend Configuration
- ✅ **[web/index.html:1098](web/index.html#L1098)** - Web app Google Client ID
- ✅ **[src/services/auth.js:14](src/services/auth.js#L14)** - Mobile app webClientId

---

## 🔧 Required Google Cloud Console Configuration

Now you need to configure the **new Client ID** in Google Cloud Console:

### 1. Go to Google Cloud Console
**URL**: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8

### 2. Find Your OAuth 2.0 Client ID
Look for: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`

### 3. Add Authorized JavaScript Origins

Click **Edit** and add these origins:

```
https://modular-analog-476221-h8.firebaseapp.com
https://speakeasy-ai.app
https://speakeasy-backend-823510409781.us-central1.run.app
https://speakeasy-web-823510409781.us-central1.run.app
http://localhost:3000
http://localhost:8081
```

### 4. Add Authorized Redirect URIs

Add these redirect URIs:

```
https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler
https://speakeasy-ai.app
https://speakeasy-ai.app/auth/callback
https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google/callback
http://localhost:3000/auth/callback
http://localhost:8081
```

### 5. Save Changes

Click **Save** at the bottom of the page.

---

## 🍎 Apple Sign In Configuration

For Apple Sign In, configure these in **Apple Developer Console**:

### Service ID: `com.speakeasy.webapp`

**Go to**: https://developer.apple.com/account/resources/identifiers/list

**Add these domains**:
```
modular-analog-476221-h8.firebaseapp.com
speakeasy-ai.app
speakeasy-backend-823510409781.us-central1.run.app
```

**Add these Return URLs**:
```
https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler
https://speakeasy-ai.app
https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/apple/callback
```

---

## 🚀 Deploy Backend

After updating Google Cloud Console, deploy the backend with the new configuration:

```bash
npm run backend:deploy
```

This will deploy the updated `backend/env.yaml` with the new Google Client ID.

---

## 🧪 Testing

### Test Google OAuth:

**Web**:
```bash
# Visit your web app
open https://speakeasy-ai.app

# Click "Continue with Google"
# Verify successful login
```

**Mobile**:
```bash
# iOS
npm run ios

# Android
npm run android

# Tap "Continue with Google"
# Verify successful login
```

### Test Apple Sign In:

**Web**:
```bash
open https://speakeasy-ai.app
# Click "Continue with Apple"
```

**iOS**:
```bash
npm run ios
# Tap "Continue with Apple"
```

---

## 📊 Configuration Summary

| Item | Value | Status |
|------|-------|--------|
| **Google Client ID** | `823510409781-7am96n366leset271qt9c8djo265u24n` | ✅ Updated |
| **Firebase Auth Handler** | `/__/auth/handler` | ✅ Configured |
| **Apple Service ID** | `com.speakeasy.webapp` | ⚠️ Needs Apple setup |
| **Backend Deployed** | Cloud Run | ⏳ Needs redeployment |

---

## ✅ Next Steps Checklist

- [ ] Configure Google OAuth Client ID in Google Cloud Console
  - [ ] Add Authorized JavaScript origins
  - [ ] Add Authorized redirect URIs
  - [ ] Save changes
- [ ] Configure OAuth Consent Screen
  - [ ] App name: SpeakEasy
  - [ ] Add scopes: email, profile, openid
- [ ] Setup Apple Sign In (optional)
  - [ ] Create App ID: `com.scott.speakeasy`
  - [ ] Create Service ID: `com.speakeasy.webapp`
  - [ ] Add domains and return URLs
  - [ ] Create private key
  - [ ] Update env.yaml with Team ID, Key ID, Private Key
- [ ] Deploy backend: `npm run backend:deploy`
- [ ] Test Google login on web
- [ ] Test Google login on mobile
- [ ] Test Apple login (if configured)

---

## 🔗 Quick Links

### Google Cloud Console:
- **Credentials**: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
- **OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent?project=modular-analog-476221-h8

### Firebase:
- **Console**: https://console.firebase.google.com/project/modular-analog-476221-h8
- **Authentication**: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers

### Apple Developer:
- **Identifiers**: https://developer.apple.com/account/resources/identifiers/list
- **Keys**: https://developer.apple.com/account/resources/authkeys/list

### Your Apps:
- **Backend**: https://speakeasy-backend-823510409781.us-central1.run.app
- **Web App**: https://speakeasy-ai.app

---

## 📋 What's Left

1. **Google Cloud Console** (15 minutes)
   - Add authorized origins and redirect URIs
   - Configure OAuth consent screen

2. **Apple Developer** (25 minutes - optional)
   - Setup App ID, Service ID, and Key
   - Get Team ID, Key ID, and Private Key
   - Update backend/env.yaml

3. **Deploy** (5 minutes)
   - Run: `npm run backend:deploy`
   - Wait for deployment
   - Test login flows

**Total Estimated Time**: 20-45 minutes depending on whether you setup Apple

---

## ✨ All Code Updated!

Your entire codebase now uses the Firebase OAuth configuration. Once you complete the Google Cloud Console setup and redeploy, Google OAuth will work across all platforms! 🎉

For detailed guides, see:
- [OAUTH_COMPLETE_SETUP.md](OAUTH_COMPLETE_SETUP.md)
- [APPLE_SIGNIN_SETUP.md](APPLE_SIGNIN_SETUP.md)
- [OAUTH_SETUP_CHECKLIST.md](OAUTH_SETUP_CHECKLIST.md)
