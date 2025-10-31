# How to Find and Configure Web OAuth Client

## What You're Looking At

Your screenshot shows an **API Key** - these don't have origin restrictions like OAuth clients do.

## Find the Correct Web OAuth Client

1. **In Google Cloud Console, go to:**
   - [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)

2. **Look for "OAuth 2.0 Client IDs" section** (not API Keys)

3. **Find the Web client with ID:**
   ```
   823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com
   ```

   It might be named:
   - "Web client (auto created by Google Service)"
   - Or a custom name you created

4. **Click on that OAuth client name** (not the API key)

5. **You should see:**
   - Application type: Web application
   - **Authorized JavaScript origins** (this is what you need!)
   - Authorized redirect URIs

## Add the Origin

In the "Authorized JavaScript origins" section, click **+ ADD URI** and add:

```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

Then click **SAVE** at the bottom.

## Screenshot Guide

Your current view shows:
- ❌ API Key (no origins field)
- ❌ "Application restrictions" and "API restrictions"

You need to find:
- ✅ OAuth 2.0 Client ID
- ✅ "Authorized JavaScript origins"
- ✅ "Authorized redirect URIs"

## Can't Find It?

If you don't see a Web OAuth client with that ID, you may need to:

1. Check if you're in the correct Google Cloud project
2. Or create a new Web OAuth client:
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - Application type: **Web application**
   - Add the origin URL
   - Copy the new client ID and update your web app code

## Alternative: Check What Client IDs You Have

In the web app code at `/Users/scott/dev/speakeasy/python-web/static/auth-unified.html`, line 242 shows:

```javascript
const GOOGLE_CLIENT_ID = '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com';
```

Make sure this client ID actually exists in your Google Cloud Console OAuth clients list.
