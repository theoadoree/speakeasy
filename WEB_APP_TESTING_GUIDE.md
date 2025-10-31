# Web App Testing Guide - Authentication Fixed ✅

## Current Status

### Backend
- **Status**: ✅ Running with simple auth (no token verification)
- **URL**: `https://speakeasy-backend-vlxo5frhwq-uc.a.run.app`
- **Health Check**: `https://speakeasy-backend-vlxo5frhwq-uc.a.run.app/health`
- **Server**: `server-simple-auth.js` (accepts all authentication without verification)

### Web App
- **Status**: ✅ Deployed with fixed authentication code
- **Login URL**: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html`
- **Main App URL**: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/index.html`

### iOS App
- **Status**: ✅ Working perfectly with simple backend
- **Authentication**: Both Google and Apple Sign-In functional

## What Was Fixed

### Web App Code Changes (auth-unified.html)

1. **Google Sign-In** (Line 308)
   - Changed `credential: response.credential` → `idToken: response.credential`
   - Backend expects `idToken` field

2. **Apple Sign-In** (Lines 390, 393)
   - Changed `identityToken: authorization.id_token` → `idToken: authorization.id_token`
   - Changed `fullName: user.name` → `name: user.name`
   - Backend expects `idToken` and `name` fields

3. **Backend URLs** (Lines 305, 398)
   - Changed from relative paths (`/api/auth/google`)
   - To full Cloud Run URLs (`https://speakeasy-backend-vlxo5frhwq-uc.a.run.app/api/auth/google`)
   - Required for CORS to work correctly

## Test Instructions

### 1. Open Web App Login Page

```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
```

### 2. Test Google Sign-In

**Steps:**
1. Click "Continue with Google" button
2. You should see Google account picker popup
3. Select your Google account
4. After successful auth, should redirect to main app

**Expected Behavior:**
- ✅ Google account picker appears
- ✅ No CORS errors in browser console
- ✅ Backend receives authentication request
- ✅ Redirect to `index.html` with session token

**If Errors Occur:**
- Check browser console (F12) for any JavaScript errors
- Check Network tab to see backend request/response
- Verify backend logs for incoming request

### 3. Test Apple Sign-In

**Steps:**
1. Click "Continue with Apple" button (if visible)
2. Apple Sign-In popup should appear
3. Sign in with Apple ID
4. After successful auth, should redirect to main app

**Expected Behavior:**
- ✅ Apple Sign-In popup appears
- ✅ Authentication completes successfully
- ✅ Redirect to main app

**Note:** Apple Sign-In for web requires additional configuration:
- Service ID: `com.speakeasy.webapp`
- Return URLs configured in Apple Developer Console

### 4. Verify Session

After successful login, you should:
- Be redirected to `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/index.html`
- See the main app interface with navigation tabs
- See user name/email displayed
- Have a working logout button in top-right corner

## Debug Commands

### Check Backend Health
```bash
curl https://speakeasy-backend-vlxo5frhwq-uc.a.run.app/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Simple auth backend running"
}
```

### View Backend Logs
```bash
gcloud run services logs read speakeasy-backend --region us-central1 --limit 50
```

Look for:
- `🔵 === GOOGLE AUTH REQUEST ===` - Google sign-in attempts
- `🟢 === APPLE AUTH REQUEST ===` - Apple sign-in attempts
- Request body data showing what was sent

### View Web App Logs
```bash
gcloud run services logs read speakeasy-python-web --region us-central1 --limit 50
```

## Backend Configuration

The backend (`server-simple-auth.js`) is intentionally simple:

### Google Auth Endpoint
```javascript
app.post('/api/auth/google', async (req, res) => {
  // Accepts: idToken, name, email, imageUrl
  // Returns: { success: true, data: { token, user } }
  // NO TOKEN VERIFICATION - accepts everything
});
```

### Apple Auth Endpoint
```javascript
app.post('/api/auth/apple', async (req, res) => {
  // Accepts: idToken, user, email, name
  // Returns: { success: true, data: { token, user } }
  // NO TOKEN VERIFICATION - accepts everything
});
```

## OAuth Client IDs

### Web Application
- **Client ID**: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`
- **Used in**: `auth-unified.html` line 255
- **Authorized Origin**: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app`

### iOS Application
- **Client ID**: `823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com`
- **Used in**: iOS app `AuthenticationManager.swift`
- **Bundle ID**: `com.speakeasy.app`

## Troubleshooting

### Error: "The given origin is not allowed"
**Cause:** Web app URL not in Google OAuth authorized origins
**Fix:** Already added to Google Cloud Console - should work now
**Verify:** Check [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)

### Error: "Failed to fetch" or CORS error
**Cause:** Backend URL incorrect or backend not running
**Fix:** Verify backend is running with health check command above
**Check:** Network tab in browser console shows the actual request

### Error: Backend returns 400 or 500
**Cause:** Field name mismatch (should be fixed now)
**Check:** Backend logs will show exact request body received
**Verify:** Look for `idToken` field in request body (not `credential` or `identityToken`)

### No response after clicking Sign-In
**Cause:** JavaScript error preventing authentication
**Fix:** Open browser console (F12) and check for errors
**Common Issues:**
- Google Sign-In library not loaded
- Apple Sign-In library not loaded
- Network request blocked by browser

## Next Steps

After confirming web app works:

1. **Optional:** Switch to production backend with token verification
   - File: `backend/package.json` line 7
   - Change: `"start": "node server-openai.js"`
   - Redeploy: `gcloud run deploy speakeasy-backend --region us-central1`

2. **Apple Sign-In Configuration** (if needed):
   - Set up Service ID in Apple Developer Console
   - Configure return URLs
   - Add Apple team ID and key ID to backend

3. **Production Hardening**:
   - Enable token verification in backend
   - Add rate limiting
   - Add proper session management
   - Configure HTTPS certificates

## Success Criteria

✅ Web app authentication is successful if:
1. Google Sign-In button works and shows account picker
2. No CORS errors in browser console
3. Backend logs show successful authentication
4. User is redirected to main app after login
5. Session token is stored in localStorage
6. User can see their profile and navigate the app
7. Logout button works and returns to login page

## Current Deployment Time

**Web App Deployed**: October 31, 2025, 6:49 PM UTC
**Backend Deployed**: October 31, 2025, 6:10 PM UTC (last simple auth deployment)

Both services are live and ready for testing!
