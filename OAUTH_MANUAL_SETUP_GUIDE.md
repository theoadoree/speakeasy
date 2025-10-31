# Firebase OAuth Manual Setup Guide

## 🎯 Complete These Steps to Enable OAuth

I've opened the necessary consoles for you. Follow these steps to complete the OAuth setup.

---

## Step 1: Get Google OAuth Client Secret

### Option A: Create New OAuth Client (Recommended)

**Console Opened:** [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials?project=clicksclick-6e520)

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. If prompted, configure the OAuth consent screen first:
   - User Type: **External**
   - App name: **SpeakEasy**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all steps
3. Back at Create OAuth client ID:
   - Application type: **Web application**
   - Name: **SpeakEasy Web Client**
   - Authorized JavaScript origins:
     ```
     https://clicksclick-6e520.firebaseapp.com
     https://clicksclick-6e520.web.app
     ```
   - Authorized redirect URIs:
     ```
     https://clicksclick-6e520.firebaseapp.com/__/auth/handler
     https://clicksclick-6e520.web.app/__/auth/handler
     ```
4. Click **CREATE**
5. **COPY the Client ID and Client Secret** - you'll need both!

### Option B: Use Existing OAuth Client

If you see an existing OAuth 2.0 Client ID (`151813176467-jqn1sjb8t4vq70qqbu1iibqacl1k2a9f`):

1. Click on the OAuth client name to view details
2. Find and **copy the Client Secret**
3. Verify the authorized redirect URIs include:
   ```
   https://clicksclick-6e520.firebaseapp.com/__/auth/handler
   https://clicksclick-6e520.web.app/__/auth/handler
   ```

---

## Step 2: Enable Google OAuth in Firebase

**Console Opened:** [Firebase Authentication Providers](https://console.firebase.google.com/project/clicksclick-6e520/authentication/providers)

1. Find **Google** in the Sign-in providers list
2. Click **Google** to expand
3. Toggle **Enable** to ON
4. Enter the OAuth credentials:
   - **Web SDK configuration:**
     - Web Client ID: `[Your Client ID from Step 1]`
     - Web Client Secret: `[Your Client Secret from Step 1]`
   - **Support email:** Your email address
5. Click **Save**

---

## Step 3: Store Client Secret (Optional but Recommended)

For backend use, store the client secret in Secret Manager:

```bash
# Store in the Firebase project
echo -n "YOUR_CLIENT_SECRET" | gcloud secrets create google-oauth-client-secret \
  --data-file=- \
  --project=clicksclick-6e520

# Or store in the backend project
echo -n "YOUR_CLIENT_SECRET" | gcloud secrets create google-oauth-client-secret \
  --data-file=- \
  --project=modular-analog-476221-h8
```

---

## Step 4: Verify Configuration

### Test via Firebase Console

1. Go to [Firebase Authentication Users](https://console.firebase.google.com/project/clicksclick-6e520/authentication/users)
2. You should see Google as an enabled sign-in method

### Test via Your App

Run your app and try Google Sign-In:

```bash
# Start your app
npm start
```

Then test the Google Sign-In button in:
- LoginScreen
- SignUpScreen

---

## Step 5: Configure Apple OAuth (Optional)

### Prerequisites

- Apple Developer Account ($99/year)
- Services ID created
- Private key (.p8 file) for Sign in with Apple

### Steps

1. **In Firebase Console** (already open):
   - Find **Apple** in the Sign-in providers list
   - Click **Apple** to expand
   - Toggle **Enable** to ON

2. **Configure Apple Settings:**
   - Services ID: `com.fluentai.speakeasy` (or your Services ID)
   - Apple Team ID: [From Apple Developer Portal]
   - Key ID: [From Apple Developer Portal]
   - Private Key: [Upload your .p8 file]

3. Click **Save**

### Get Apple Credentials

```bash
# Open Apple Developer Portal
open "https://developer.apple.com/account/resources/identifiers/list"
```

Follow the instructions in [OAUTH_CLI_SETUP.md](OAUTH_CLI_SETUP.md) for detailed Apple OAuth setup.

---

## ✅ Verification Checklist

After completing the steps above:

- [ ] Google OAuth credentials created/retrieved
- [ ] Client Secret copied and saved securely
- [ ] Google provider enabled in Firebase Console
- [ ] Support email configured
- [ ] Authorized redirect URIs verified
- [ ] Google Sign-In tested in app
- [ ] (Optional) Apple OAuth configured
- [ ] (Optional) Apple Sign-In tested in app

---

## 🧪 Test OAuth Flow

### Test Google Sign-In

1. Open your app
2. Navigate to Login screen
3. Click "Sign in with Google" button
4. Select your Google account
5. Grant permissions
6. Verify you're signed in

### Expected Behavior

- User is authenticated
- User data is saved to Firestore
- JWT token is stored locally
- User is redirected to home screen

---

## 🔍 Troubleshooting

### "Invalid OAuth client" Error

**Solution:**
1. Verify redirect URIs in Google Cloud Console
2. Ensure they match exactly:
   ```
   https://clicksclick-6e520.firebaseapp.com/__/auth/handler
   https://clicksclick-6e520.web.app/__/auth/handler
   ```

### "OAuth consent screen not configured" Error

**Solution:**
1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent?project=clicksclick-6e520)
2. Configure the consent screen with app name and email
3. Add test users if app is in testing mode

### "Unauthorized domain" Error

**Solution:**
1. In Firebase Console, go to [Authentication Settings](https://console.firebase.google.com/project/clicksclick-6e520/authentication/settings)
2. Add authorized domains:
   - `clicksclick-6e520.firebaseapp.com`
   - `clicksclick-6e520.web.app`
   - `localhost` (for development)

### Backend Returns 401 Error

**Solution:**
1. Verify the client secret is correct
2. Check that the OAuth client is enabled
3. Ensure the backend has access to the secret

---

## 📊 Current Configuration

### Project Details

- **Firebase Project:** `clicksclick-6e520`
- **Backend Project:** `modular-analog-476221-h8`
- **Backend URL:** `https://speakeasy-backend-823510409781.us-central1.run.app`

### Google OAuth

- **Client ID:** `151813176467-jqn1sjb8t4vq70qqbu1iibqacl1k2a9f.apps.googleusercontent.com`
- **Client Secret:** ⚠️ **Needs to be retrieved/created** (Step 1)
- **Redirect URIs:**
  - `https://clicksclick-6e520.firebaseapp.com/__/auth/handler`
  - `https://clicksclick-6e520.web.app/__/auth/handler`

### Available Secrets (Backend Project)

- `GOOGLE_WEB_CLIENT_ID`
- `GOOGLE_ANDROID_CLIENT_ID`
- `GOOGLE_IOS_CLIENT_ID`
- `firebase-service-account`
- `openai-api-key`
- `apple-private-key`

---

## 📝 Quick Commands

```bash
# Open Google Cloud Credentials
open "https://console.cloud.google.com/apis/credentials?project=clicksclick-6e520"

# Open Firebase Authentication Providers
open "https://console.firebase.google.com/project/clicksclick-6e520/authentication/providers"

# Open OAuth Consent Screen
open "https://console.cloud.google.com/apis/credentials/consent?project=clicksclick-6e520"

# Store client secret in Secret Manager
echo -n "YOUR_CLIENT_SECRET" | gcloud secrets create google-oauth-client-secret \
  --data-file=- --project=clicksclick-6e520

# Test backend health
curl https://speakeasy-backend-823510409781.us-central1.run.app/health

# Start your app
npm start
```

---

## 🎉 Success!

Once you've completed these steps:

1. ✅ Google OAuth will be enabled
2. ✅ Users can sign in with Google
3. ✅ Backend can authenticate OAuth tokens
4. ✅ Your app will have secure authentication

---

## 📚 Additional Resources

- **[OAUTH_CLI_SETUP.md](OAUTH_CLI_SETUP.md)** - Comprehensive CLI setup guide
- **[SOCIAL_AUTH_QUICK_START.md](SOCIAL_AUTH_QUICK_START.md)** - App integration guide
- **[DEPLOYMENT_SUCCESS.md](DEPLOYMENT_SUCCESS.md)** - Backend deployment details
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)

---

**Status:** 🟡 Awaiting manual configuration
**Last Updated:** October 30, 2025

Complete the steps above to finish the OAuth setup!
