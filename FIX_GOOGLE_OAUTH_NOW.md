# Fix Google OAuth - Simple Steps

## The Problem

Your Google OAuth Client ID `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com` is not configured to work with your Cloud Run domain.

## The Solution (5 Minutes)

### Step 1: Go to Google Cloud Console

Open this link:
https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8

### Step 2: Find Your OAuth Client

Look for: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`

Click on it to edit.

### Step 3: Add Your Domain

Under **"Authorized JavaScript origins"**, click **"+ ADD URI"** and add:

```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

**Important:**
- Use `https://` (not `http://`)
- NO trailing slash
- Must match your Cloud Run URL exactly

### Step 4: Add Redirect URI (optional but recommended)

Under **"Authorized redirect URIs"**, click **"+ ADD URI"** and add:

```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
```

### Step 5: Save

Click **"SAVE"** at the bottom of the page.

### Step 6: Wait & Test

1. Wait 5 minutes for Google to propagate changes
2. Clear your browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Go to: https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
4. Click "Continue with Google"
5. It should work!

## Why This Happens

Google OAuth clients need to know which domains are allowed to use them. This is a security feature to prevent other websites from stealing your OAuth credentials.

## Do I Need Separate Login/Signup?

**NO!** OAuth handles both automatically:

- **New user**: Google sends their email → Backend creates account → They're logged in
- **Existing user**: Google sends their email → Backend finds account → They're logged in

The OAuth flow is:
1. User clicks "Sign in with Google"
2. Google popup appears
3. User selects/logs into their Google account
4. Google sends user info to your app
5. Your backend checks: Does this email exist?
   - **Yes**: Log them in (LOGIN)
   - **No**: Create account and log them in (SIGNUP)

It's automatically unified! No need for separate buttons or flows.

## Current Setup

Your app already has this unified approach:
- One button: "Continue with Google"
- One button: "Continue with Apple"
- One button: "Continue with Demo Access" (temporary)

Each OAuth provider handles both login and signup seamlessly.

## After Fixing Google OAuth

Once you add the domain to the OAuth client:
- Google Sign In will work immediately
- Demo Access can be removed (or kept for testing)
- Apple Sign In will work once you configure it in Apple Developer Console

## Need Help?

The error you're seeing means Google is blocking the request because the domain isn't authorized. Adding it to "Authorized JavaScript origins" will fix it immediately.
