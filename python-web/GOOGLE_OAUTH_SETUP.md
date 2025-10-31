# Google OAuth Setup Guide

## Overview

This guide walks you through setting up Google Sign-In for the SpeakEasy AI app.

## Prerequisites

- Google Cloud Console access
- Project ID: `modular-analog-476221-h8`
- Deployed app URL: `https://speakeasy-python-web-823510409781.us-central1.run.app`

## Step-by-Step Setup

### 1. Access Google Cloud Console

Visit: https://console.cloud.google.com/

Select your project: `modular-analog-476221-h8`

### 2. Enable Google Identity Services API

1. Navigate to **APIs & Services** → **Library**
2. Search for **"Google Identity"**
3. Click **"Google Identity Toolkit API"**
4. Click **"Enable"** (if not already enabled)

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public users)
3. Click **Create**

**Fill in the required fields:**
- **App name:** `SpeakEasy AI`
- **User support email:** Your email
- **App logo:** (Optional) Upload logo from `python-web/static/assets/logo.png`
- **Application home page:** `https://speakeasy-python-web-823510409781.us-central1.run.app`
- **Authorized domains:** `us-central1.run.app`
- **Developer contact email:** Your email

4. Click **Save and Continue**

**Scopes page:**
- Click **Add or Remove Scopes**
- Select:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
  - `openid`
- Click **Update** → **Save and Continue**

**Test users page:**
- Add your email as a test user
- Click **Save and Continue**

5. Review and click **Back to Dashboard**

### 4. Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth 2.0 Client ID**

**Configure the client:**
- **Application type:** `Web application`
- **Name:** `SpeakEasy Web App`

**Authorized JavaScript origins:**
```
https://speakeasy-python-web-823510409781.us-central1.run.app
http://localhost:8080
```

**Authorized redirect URIs:**
```
https://speakeasy-python-web-823510409781.us-central1.run.app/static/auth-unified.html
http://localhost:8080/static/auth-unified.html
```

3. Click **Create**
4. **Copy the Client ID** (format: `XXXXXX-YYYYYYYY.apps.googleusercontent.com`)

### 5. Update Application Code

Edit `python-web/static/auth-unified.html` line 394:

**Before:**
```javascript
const GOOGLE_CLIENT_ID = '823510409781-YOUR_CLIENT_ID.apps.googleusercontent.com';
```

**After:**
```javascript
const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com';
```

Replace with the Client ID you copied in step 4.

### 6. Set Environment Variable (Optional)

For the backend JWT verification, set the environment variable:

```bash
gcloud run services update speakeasy-python-web \
  --region=us-central1 \
  --set-env-vars GOOGLE_CLIENT_ID="YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com"
```

This allows the backend to verify Google JWT tokens.

### 7. Deploy Updated Code

```bash
cd /Users/scott/dev/speakeasy/python-web

# Build and deploy
gcloud builds submit --tag us-central1-docker.pkg.dev/modular-analog-476221-h8/cloud-run-source-deploy/speakeasy-python-web

gcloud run deploy speakeasy-python-web \
  --image us-central1-docker.pkg.dev/modular-analog-476221-h8/cloud-run-source-deploy/speakeasy-python-web \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 8. Test Google Sign-In

1. Visit: https://speakeasy-python-web-823510409781.us-central1.run.app/static/auth-unified.html
2. Click **"Continue with Google"** button
3. Select your Google account in the popup
4. Grant permissions
5. You should be automatically logged in and redirected to the main app

## Troubleshooting

### "Google Sign-In is loading. Please wait..."

**Cause:** Google Identity Services script hasn't loaded yet.

**Solution:** Wait 2-3 seconds and try again.

### "Invalid Google token" error

**Cause:** Client ID mismatch or token verification failed.

**Solutions:**
1. Verify Client ID matches in both frontend and backend
2. Check authorized origins are correct
3. Ensure app is deployed and accessible

### "redirect_uri_mismatch" error

**Cause:** The redirect URI isn't in the authorized list.

**Solution:** Add the exact URL to Authorized redirect URIs in Google Cloud Console:
- `https://speakeasy-python-web-823510409781.us-central1.run.app/static/auth-unified.html`

### Google popup blocked

**Cause:** Browser is blocking popups.

**Solution:**
1. Allow popups for the site
2. Try clicking the button again

## Verification

To verify the setup is working:

1. **Frontend**: Click "Continue with Google" - should open Google account picker
2. **Backend**: Check logs for "Warning: google-auth not available" - should NOT appear
3. **Token**: After sign-in, check `localStorage.getItem('token')` in browser console - should have a token
4. **User data**: Check `localStorage.getItem('user')` - should have your Google email and username

## Security Notes

- Never commit Client ID or Client Secret to version control (Client ID is public, but best practice)
- Use environment variables for sensitive configuration
- JWT tokens expire after 7 days (configurable)
- Google OAuth tokens are verified server-side
- Passwords are never stored for OAuth users

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Overview](https://developers.google.com/identity/protocols/oauth2)

## Support

If you encounter issues:
1. Check Cloud Run logs: https://console.cloud.google.com/logs
2. Verify OAuth consent screen is configured
3. Ensure all authorized origins/redirect URIs are correct
4. Test with a test user first (added in OAuth consent screen)
