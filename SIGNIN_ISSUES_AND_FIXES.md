# Sign-In Issues and Fixes

## 🐛 Current Issues

### 1. **Missing Logo on Login Screen**
**Problem**: The LoginScreen ([src/screens/LoginScreen.js](src/screens/LoginScreen.js)) doesn't display the logo
**Solution**: Add logo image to the header section

### 2. **Google OAuth Errors**
**Likely Issues**:
- Firebase client ID mismatch in web implementation
- OAuth consent screen not configured
- Authorized origins not added in Google Cloud Console

### 3. **Apple Sign In Errors**
**Likely Issues**:
- Apple Service ID not properly configured
- Missing Team ID, Key ID, or Private Key in backend
- Return URLs not configured in Apple Developer Console

---

## 🔧 Fixes to Implement

### Fix 1: Add Logo to Login Screen

Update **[src/screens/LoginScreen.js:143-146](src/screens/LoginScreen.js#L143-L146)**:

```javascript
<View style={styles.header}>
  <Image
    source={require('../../assets/logo.png')}
    style={styles.logo}
    resizeMode="contain"
  />
  <Text style={styles.title}>Welcome Back! 👋</Text>
  <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
</View>
```

Add to styles:
```javascript
logo: {
  width: 120,
  height: 120,
  marginBottom: 24,
},
```

### Fix 2: Google OAuth Configuration Issues

The mobile app uses **Firebase Auth** on web, which requires:

**In Google Cloud Console** (https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8):

Find Client ID: `823510409781-7am96n366leset271qt9c8djo265u24n`

**Add Authorized JavaScript Origins**:
```
https://modular-analog-476221-h8.firebaseapp.com
https://speakeasy-ai.app
https://speakeasy-backend-823510409781.us-central1.run.app
http://localhost:8081
http://localhost:3000
```

**Add Authorized Redirect URIs**:
```
https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler
https://speakeasy-ai.app
https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google/callback
http://localhost:8081
```

**Configure OAuth Consent Screen**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=modular-analog-476221-h8
2. App name: **SpeakEasy**
3. Add scopes: `email`, `profile`, `openid`
4. Save

### Fix 3: Apple Sign In Configuration

The mobile app uses **Firebase Auth** on web for Apple, which requires:

**In Firebase Console** (https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers):

1. Click **Apple**
2. Enable Apple provider
3. Add Service ID: `com.speakeasy.webapp`
4. Add Apple Team ID, Key ID, and Private Key (from Apple Developer)

**In Apple Developer Console** (https://developer.apple.com/account/resources/identifiers/list):

1. Find Service ID: `com.speakeasy.webapp`
2. Add domains:
   ```
   modular-analog-476221-h8.firebaseapp.com
   speakeasy-ai.app
   ```
3. Add Return URLs:
   ```
   https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler
   https://speakeasy-ai.app
   ```

---

## 📱 Two Different Sign-In Implementations

Your app has **TWO** different OAuth implementations:

### 1. Web App ([web/index.html](web/index.html))
- Uses **Google Identity Services** directly
- Uses **AppleID.auth** directly
- Client ID: `823510409781-7am96n366leset271qt9c8djo265u24n`

### 2. Mobile App ([src/services/auth.js](src/services/auth.js))
- Uses **Firebase Auth** for web platform
- Uses **native SDKs** for iOS/Android
- Firebase config in [src/services/auth.js:406-410](src/services/auth.js#L406-L410)

---

## 🔍 Debugging Steps

### Step 1: Check Console Errors

**Mobile Web (Expo)**:
```bash
npm run web
# Open browser console (F12) and check for errors
```

**Look for**:
- `idpiframe_initialization_failed` → OAuth consent screen issue
- `redirect_uri_mismatch` → Missing redirect URI in console
- `popup_closed_by_user` → User cancelled (not an error)

### Step 2: Test Backend Endpoints

```bash
# Test Google auth endpoint
curl -X POST https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'

# Test Apple auth endpoint
curl -X POST https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/apple \
  -H "Content-Type: application/json" \
  -d '{"identityToken":"test"}'
```

### Step 3: Check Firebase Console

1. Go to: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers
2. Verify Google provider is **enabled**
3. Verify Apple provider is **enabled** (if using Apple Sign In)

---

## ✅ Quick Fix Checklist

### Google OAuth:
- [ ] Add authorized origins to Google Cloud Console
- [ ] Add redirect URIs to Google Cloud Console
- [ ] Configure OAuth consent screen
- [ ] Enable Google provider in Firebase Console
- [ ] Test on web: `npm run web`

### Apple Sign In:
- [ ] Create App ID in Apple Developer
- [ ] Create Service ID: `com.speakeasy.webapp`
- [ ] Configure domains and return URLs
- [ ] Create Private Key and download .p8 file
- [ ] Enable Apple provider in Firebase Console
- [ ] Add credentials to Firebase
- [ ] Test on web: `npm run web`

### Login Screen Logo:
- [ ] Update LoginScreen.js with logo
- [ ] Update SignUpScreen.js with logo
- [ ] Test on all platforms

---

## 🎨 New Login Screen Design

Here's what the login screen should look like:

```
┌─────────────────────────┐
│                         │
│    [SpeakEasy Logo]     │
│                         │
│   Welcome Back! 👋      │
│ Sign in to continue...  │
│                         │
│  ┌─────────────────┐    │
│  │ Email           │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ Password        │    │
│  └─────────────────┘    │
│                         │
│  [  Sign In Button ]    │
│                         │
│  ────── OR ──────       │
│                         │
│  [ 🍎 Apple Sign In ]   │
│  [  G  Google Sign In ] │
│                         │
│  Don't have account?    │
│       Sign Up           │
└─────────────────────────┘
```

---

## 🚀 Implementation Priority

**High Priority** (15 minutes):
1. Add logo to LoginScreen and SignUpScreen
2. Configure Google OAuth in Cloud Console
3. Test Google login

**Medium Priority** (25 minutes):
4. Setup Apple Sign In in Apple Developer
5. Configure Apple in Firebase Console
6. Test Apple login

---

## 📝 Expected Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `idpiframe_initialization_failed` | OAuth consent screen not configured | Configure in Google Cloud Console |
| `redirect_uri_mismatch` | Missing redirect URI | Add to authorized redirect URIs |
| `popup_closed_by_user` | User cancelled login | Not an error - expected behavior |
| `Apple Sign In not available` | Missing Apple configuration | Setup in Apple Developer + Firebase |
| `Invalid client` | Service ID not configured | Configure Service ID in Apple Developer |
| `Missing required fields` | Backend not receiving token | Check network request in browser console |

---

## 🔗 Quick Links

- **Google Console**: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
- **Firebase Console**: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers
- **Apple Developer**: https://developer.apple.com/account/resources/identifiers/list

---

## 💡 Next Steps

1. I'll create an updated LoginScreen with the logo
2. I'll create a fix for the OAuth configuration
3. You'll need to configure Google Cloud Console and Firebase Console

Would you like me to implement the logo fix now?
