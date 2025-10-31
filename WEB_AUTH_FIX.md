# Web App Authentication Fix

## Issue

You have **two different apps**:

1. **iOS Native App** (Swift) - Uses native Google/Apple Sign-In SDKs ✅ **WORKING**
2. **Python Web App** (Flask/HTML) - Uses web-based OAuth ❌ **NEEDS FIX**

The errors you're seeing are from the **web app**, not the iOS app.

## Error: Google Sign-In 403 - "Origin not allowed"

**Problem:** The web app's URL is not authorized in your Google OAuth client settings.

**Web App Client ID:** `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`

### How to Fix:

1. **Find your web app URL:**
   - The HTML file shows: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app`
   - But you need to check what URL you're actually accessing the page from

2. **Add Authorized JavaScript Origins:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Find the Web client ID: `823510409781-7am96n366leset271qt9c8djo265u24n`
   - Click "Edit"
   - Under "Authorized JavaScript origins", add:
     ```
     https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
     ```
   - If testing locally, also add:
     ```
     http://localhost:5000
     http://localhost:8080
     http://127.0.0.1:5000
     ```
   - Click "Save"

3. **Wait 5 minutes** for changes to propagate

4. **Test again** - Refresh the page and try Google Sign-In

## Error: Apple Sign-In - "popup_closed_by_user"

This is **NOT an error** - it just means you closed the popup. This is expected behavior when you cancel.

## Apple Sign-In Web Configuration

The web app uses:
- **Service ID:** `com.speakeasy.webapp`
- **Redirect URI:** `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html`

Make sure this is configured in your Apple Developer account:
1. Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Find or create Service ID: `com.speakeasy.webapp`
3. Enable "Sign In with Apple"
4. Configure domains and redirect URLs:
   - **Domain:** `speakeasy-python-web-vlxo5frhwq-uc.a.run.app`
   - **Return URL:** `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html`

## Quick Test

**To verify which app you're using:**

- **If you see native iOS buttons** and Swift UI → iOS App (should work now!)
- **If you see a web browser** with HTML/CSS UI → Web App (needs Google origin fix)

## Summary

- ✅ **iOS Native App** - Authentication is FIXED (sends correct tokens now)
- ⚠️ **Python Web App** - Needs Google authorized origin added

The iOS app is ready to test. The web app needs you to add the authorized origin in Google Cloud Console.
