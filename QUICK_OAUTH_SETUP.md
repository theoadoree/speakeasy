# Quick OAuth Setup for SpeakEasy

## 🚀 IMMEDIATE SOLUTION

**The OAuth authentication is failing because we need to create actual OAuth credentials.**

## 📋 Quick Setup (5 minutes):

### 1. Google OAuth Setup:
1. **Open:** https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
2. **Click:** "Create Credentials" > "OAuth 2.0 Client IDs"
3. **Choose:** "Web application"
4. **Name:** "SpeakEasy Web App"
5. **Authorized origins:**
   - `https://speakeasy-ai.app`
   - `https://speakeasy-web-823510409781.us-central1.run.app`
6. **Authorized redirect URIs:**
   - `https://speakeasy-ai.app`
   - `https://speakeasy-web-823510409781.us-central1.run.app`
7. **Copy the Client ID** (looks like: `123456789-abcdefghijk.apps.googleusercontent.com`)

### 2. Update Code:
Replace this line in `web/index.html`:
```javascript
const GOOGLE_CLIENT_ID = '823510409781-abc123def456.apps.googleusercontent.com'; // TEMPORARY
```
With your actual Client ID:
```javascript
const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com';
```

### 3. Deploy:
```bash
cd web && gcloud builds submit --config cloudbuild.yaml .
```

## 🍎 Apple Sign In (Optional):
1. **Open:** https://developer.apple.com/account/resources/identifiers/list
2. **Create App ID:** `com.speakeasy.app`
3. **Enable:** "Sign In with Apple"
4. **Create Service ID:** `com.speakeasy.web`
5. **Configure domains:** `speakeasy-ai.app`

## ✅ Test:
1. Visit: https://speakeasy-ai.app
2. Click "Continue with Google"
3. Should work with proper OAuth flow!

## 🔧 Current Status:
- ✅ **Backend:** Ready with OAuth token verification
- ✅ **Frontend:** Ready with OAuth flows
- ❌ **Credentials:** Need to be created in Google Cloud Console
- ❌ **Client ID:** Need to be updated in code

**The infrastructure is complete - just need the OAuth credentials!** 🎯
