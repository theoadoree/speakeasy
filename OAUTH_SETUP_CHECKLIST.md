# OAuth Setup Checklist

Quick checklist to track your OAuth configuration progress for SpeakEasy.

---

## 🔍 Google OAuth Setup

### Step 1: Verify OAuth Client Configuration
- [ ] Go to https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
- [ ] Find Client ID: `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo`
- [ ] Click to edit

### Step 2: Add Authorized JavaScript Origins
- [ ] `https://speakeasy-ai.app`
- [ ] `https://speakeasy-web-823510409781.us-central1.run.app`
- [ ] `http://localhost:3000` (for testing)
- [ ] `http://localhost:8081` (for Expo)

### Step 3: Add Authorized Redirect URIs
- [ ] `https://speakeasy-ai.app`
- [ ] `https://speakeasy-ai.app/auth/callback`
- [ ] `https://speakeasy-web-823510409781.us-central1.run.app`
- [ ] `https://speakeasy-web-823510409781.us-central1.run.app/auth/callback`
- [ ] `http://localhost:3000/auth/callback` (for testing)

### Step 4: Configure OAuth Consent Screen
- [ ] Go to https://console.cloud.google.com/apis/credentials/consent?project=modular-analog-476221-h8
- [ ] Set App Name: **SpeakEasy**
- [ ] Add User support email
- [ ] Upload app logo (optional)
- [ ] Add Developer contact email
- [ ] Add scopes: `email`, `profile`, `openid`
- [ ] Save

### Step 5: Test Google OAuth
- [ ] Visit https://speakeasy-ai.app
- [ ] Click "Continue with Google"
- [ ] Verify successful login

---

## 🍎 Apple Sign In Setup

### Step 1: Create App ID
- [ ] Go to https://developer.apple.com/account/resources/identifiers/list
- [ ] Click "+" → App IDs → App
- [ ] Description: **SpeakEasy iOS**
- [ ] Bundle ID: `com.scott.speakeasy`
- [ ] Enable: **Sign In with Apple**
- [ ] Register

### Step 2: Create Service ID (Web)
- [ ] Click "+" → Services IDs
- [ ] Description: **SpeakEasy Web**
- [ ] Identifier: `com.speakeasy.webapp`
- [ ] Enable: **Sign In with Apple**
- [ ] Configure:
  - [ ] Primary App ID: `com.scott.speakeasy`
  - [ ] Domain: `speakeasy-ai.app`
  - [ ] Domain: `speakeasy-backend-823510409781.us-central1.run.app`
  - [ ] Return URL: `https://speakeasy-ai.app`
  - [ ] Return URL: `https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/apple/callback`
- [ ] Save → Register

### Step 3: Create Sign In Key
- [ ] Go to https://developer.apple.com/account/resources/authkeys/list
- [ ] Click "+" → Create Key
- [ ] Key Name: **SpeakEasy Sign In**
- [ ] Enable: **Sign In with Apple**
- [ ] Configure: Select `com.speakeasy.webapp`
- [ ] Continue → Register
- [ ] **Download .p8 file** (⚠️ ONE-TIME DOWNLOAD!)
- [ ] Note Key ID: `________________`

### Step 4: Get Team ID
- [ ] Go to https://developer.apple.com/account
- [ ] Click Membership
- [ ] Note Team ID: `________________`

### Step 5: Update Backend Configuration
- [ ] Open `backend/env.yaml`
- [ ] Set `APPLE_TEAM_ID`: (from Step 4)
- [ ] Set `APPLE_KEY_ID`: (from Step 3)
- [ ] Set `APPLE_PRIVATE_KEY`: (paste .p8 file content)
- [ ] Save file

### Step 6: Redeploy Backend
- [ ] Run: `npm run backend:deploy`
- [ ] Wait for deployment to complete
- [ ] Verify health: `curl https://speakeasy-backend-823510409781.us-central1.run.app/health`

### Step 7: Test Apple Sign In
- [ ] Visit https://speakeasy-ai.app
- [ ] Click "Continue with Apple"
- [ ] Verify successful login
- [ ] Test on iOS: `npm run ios`

---

## ✅ Final Verification

### Backend
- [ ] Backend health check returns `"status": "healthy"`
- [ ] Environment variables are set correctly
- [ ] No errors in Cloud Run logs

### Google OAuth
- [ ] Login works on web
- [ ] User data is saved correctly
- [ ] No CORS errors in console

### Apple Sign In
- [ ] Login works on web
- [ ] Login works on iOS
- [ ] User data is saved correctly
- [ ] Tokens are verified correctly

---

## 📝 Notes

Write down your credentials here (keep this file secure):

**Google OAuth:**
- Client ID: `823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com` ✅

**Apple Sign In:**
- Team ID: `________________`
- Key ID: `________________`
- Private Key File: `AuthKey___________.p8`

---

## 🎯 Progress Tracker

- [ ] Google OAuth - Authorized origins configured
- [ ] Google OAuth - Redirect URIs configured
- [ ] Google OAuth - Consent screen configured
- [ ] Google OAuth - Tested and working
- [ ] Apple Sign In - App ID created
- [ ] Apple Sign In - Service ID created
- [ ] Apple Sign In - Key created and downloaded
- [ ] Apple Sign In - Backend configured
- [ ] Apple Sign In - Tested and working
- [ ] **ALL DONE** 🎉

---

## 🔗 Quick Links

- Google Credentials: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
- Apple Developer: https://developer.apple.com/account/resources
- Backend: https://speakeasy-backend-823510409781.us-central1.run.app
- Web App: https://speakeasy-ai.app

---

## ⏱️ Estimated Time

- **Google OAuth**: 15 minutes
- **Apple Sign In**: 25 minutes
- **Testing**: 10 minutes
- **Total**: ~50 minutes

You got this! 🚀
