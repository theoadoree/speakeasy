# OAuth Fix Guide - Google & Apple Sign-In Errors

## ✅ Fixes Implemented

### 1. Logo Added to Sign-In Screens
- ✅ [src/screens/LoginScreen.js](src/screens/LoginScreen.js#L144-L148) - Logo added
- ✅ [src/screens/SignUpScreen.js](src/screens/SignUpScreen.js#L138-L142) - Logo added
- Logo displays at 120x120 pixels with 24px bottom margin

### 2. OAuth Client ID Updated
- ✅ All files updated to use Firebase Client ID: `823510409781-7am96n366leset271qt9c8djo265u24n`
- ✅ Backend, web app, and mobile app all synchronized

---

## 🐛 Common OAuth Errors and How to Fix Them

### Google OAuth Errors

#### Error 1: "idpiframe_initialization_failed"
**What it means**: OAuth consent screen not properly configured

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=modular-analog-476221-h8
2. Click **Edit App**
3. Fill in required fields:
   - App name: **SpeakEasy**
   - User support email: Your email
   - App logo: Upload from `assets/icon.png`
   - Developer contact: Your email
4. Click **Save and Continue**
5. Add scopes: `email`, `profile`, `openid`
6. Click **Save and Continue**
7. Add test users (if in development mode)
8. Click **Save and Continue** → **Back to Dashboard**

#### Error 2: "redirect_uri_mismatch"
**What it means**: The redirect URI is not in the authorized list

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
2. Find Client ID: `823510409781-7am96n366leset271qt9c8djo265u24n`
3. Click to edit
4. Add to **Authorized redirect URIs**:
   ```
   https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler
   https://speakeasy-ai.app
   https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google/callback
   http://localhost:8081
   ```
5. Click **Save**

#### Error 3: "popup_closed_by_user"
**What it means**: User closed the OAuth popup

**Not an error**: This is expected when users cancel the login

#### Error 4: "Missing required fields"
**What it means**: Backend didn't receive the ID token

**Fix**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try signing in again
4. Look for the request to `/api/auth/google`
5. Check if `idToken` is present in the request body
6. If missing, check that Firebase Auth is properly initialized

---

### Apple Sign In Errors

#### Error 1: "Apple Sign In not available"
**What it means**: Apple Sign In is not configured for this platform

**Fix for Android**: Apple Sign In doesn't work on Android (Apple limitation) - this is expected

**Fix for Web**:
1. Enable Apple provider in Firebase Console
2. Go to: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers
3. Click **Apple**
4. Click **Enable**
5. Add Service ID: `com.speakeasy.webapp`
6. Add Team ID, Key ID, and Private Key (from Apple Developer)
7. Click **Save**

#### Error 2: "invalid_client"
**What it means**: Apple Service ID not properly configured

**Fix**:
1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Find Service ID: `com.speakeasy.webapp`
3. Click **Configure** next to Sign In with Apple
4. Add **Domains**:
   ```
   modular-analog-476221-h8.firebaseapp.com
   speakeasy-ai.app
   ```
5. Add **Return URLs**:
   ```
   https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler
   https://speakeasy-ai.app
   ```
6. Click **Save** → **Continue** → **Save**

#### Error 3: "invalid_grant"
**What it means**: Apple credentials (Team ID, Key ID, or Private Key) are incorrect

**Fix**:
1. Verify you have the correct:
   - Team ID (10 characters, e.g., `E7B9UE64SF`)
   - Key ID (10 characters, from Apple Developer when you created the key)
   - Private Key (contents of the .p8 file)
2. Update in Firebase Console:
   - Go to: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers
   - Click **Apple** → **Edit**
   - Re-enter all three values
   - Click **Save**

---

## 🔧 Required Configuration Steps

### Step 1: Google Cloud Console (15 minutes)

**Authorize JavaScript origins**:
1. Go to: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
2. Click on Client ID: `823510409781-7am96n366leset271qt9c8djo265u24n`
3. Add **Authorized JavaScript origins**:
   ```
   https://modular-analog-476221-h8.firebaseapp.com
   https://speakeasy-ai.app
   https://speakeasy-backend-823510409781.us-central1.run.app
   http://localhost:8081
   http://localhost:3000
   ```

**Authorize redirect URIs**:
4. Add **Authorized redirect URIs**:
   ```
   https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler
   https://speakeasy-ai.app
   https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google/callback
   http://localhost:8081
   ```
5. Click **Save**

**Configure OAuth consent screen**:
6. Go to: https://console.cloud.google.com/apis/credentials/consent?project=modular-analog-476221-h8
7. Click **Edit App**
8. Fill in all required fields (see Error 1 fix above)
9. Save

### Step 2: Firebase Console (5 minutes)

**Enable Google provider**:
1. Go to: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers
2. Click **Google**
3. Click **Enable**
4. Save

**Enable Apple provider** (optional, for Apple Sign In):
5. Click **Apple**
6. Click **Enable**
7. Add Service ID: `com.speakeasy.webapp`
8. Add Team ID, Key ID, Private Key (from Apple Developer)
9. Save

### Step 3: Apple Developer (25 minutes - optional)

**Only needed if you want Apple Sign In**

1. Create App ID with Sign In with Apple capability
2. Create Service ID: `com.speakeasy.webapp`
3. Configure domains and return URLs (see Error 2 fix above)
4. Create private key and download .p8 file
5. Note your Team ID
6. Add all credentials to Firebase Console (Step 2)

---

## 🧪 Testing

### Test Google OAuth:
```bash
# Run the app
npm run web

# Or on iOS/Android
npm run ios
npm run android

# Click "Continue with Google"
# Check browser console (F12) for errors
```

**Expected behavior**:
- Popup opens with Google sign-in
- User selects account
- Popup closes
- User is logged in
- Redirected to app

**If errors occur**:
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests
- Match error to fixes above

### Test Apple Sign In:
```bash
# Run the app
npm run web

# Or on iOS
npm run ios

# Click "Continue with Apple"
# Check browser console (F12) for errors
```

**Expected behavior**:
- Popup opens with Apple sign-in
- User enters Apple ID
- Two-factor authentication (if enabled)
- Popup closes
- User is logged in
- Redirected to app

---

## 📊 Configuration Checklist

- [ ] **Google Cloud Console**
  - [ ] Authorized JavaScript origins added
  - [ ] Authorized redirect URIs added
  - [ ] OAuth consent screen configured with app name, email, logo
  - [ ] Scopes added: email, profile, openid

- [ ] **Firebase Console**
  - [ ] Google provider enabled
  - [ ] Apple provider enabled (if using Apple Sign In)
  - [ ] Apple credentials added (Team ID, Key ID, Private Key)

- [ ] **Apple Developer** (optional)
  - [ ] App ID created with Sign In with Apple
  - [ ] Service ID created: `com.speakeasy.webapp`
  - [ ] Domains configured
  - [ ] Return URLs configured
  - [ ] Private key created and downloaded

- [ ] **Code Updates** (Already Done ✅)
  - [x] Logo added to LoginScreen
  - [x] Logo added to SignUpScreen
  - [x] OAuth Client ID updated to Firebase ID
  - [x] All files synchronized

- [ ] **Testing**
  - [ ] Google sign-in works on web
  - [ ] Google sign-in works on iOS
  - [ ] Google sign-in works on Android
  - [ ] Apple sign-in works on web (if configured)
  - [ ] Apple sign-in works on iOS (if configured)

---

## 🔍 Debugging Tools

### Browser DevTools:
```bash
# Open DevTools
# macOS: Cmd + Option + I
# Windows: F12

# Check Console tab for errors
# Check Network tab for failed requests
# Check Application tab → Storage for tokens
```

### Backend Logs:
```bash
# Check Cloud Run logs
gcloud run logs read speakeasy-backend \
  --region us-central1 \
  --limit 50 \
  --project modular-analog-476221-h8
```

### Test Backend Endpoints:
```bash
# Test Google auth
curl -X POST https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'

# Test Apple auth
curl -X POST https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/apple \
  -H "Content-Type: application/json" \
  -d '{"identityToken":"test"}'
```

---

## 🔗 Quick Links

- **Google Console**: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
- **OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent?project=modular-analog-476221-h8
- **Firebase Console**: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers
- **Apple Developer**: https://developer.apple.com/account/resources/identifiers/list

---

## 💡 Summary

**What's Done**:
- ✅ Logo added to login/signup screens
- ✅ OAuth Client ID synchronized across all files
- ✅ Firebase Auth integrated for web platform
- ✅ Native OAuth for iOS/Android

**What You Need to Do**:
1. Configure Google OAuth in Cloud Console (15 min)
2. Enable providers in Firebase Console (5 min)
3. (Optional) Setup Apple Sign In in Apple Developer (25 min)
4. Test on all platforms

**Total Time**: 20-45 minutes depending on whether you setup Apple Sign In

Once configured, both Google and Apple Sign In will work seamlessly across web, iOS, and Android! 🚀
