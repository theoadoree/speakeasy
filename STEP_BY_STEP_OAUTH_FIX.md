# Step-by-Step: Fix Google Sign-In for Web App

## Step 1: Open the OAuth Client

1. You should already have this page open: [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8)

2. Look for the section labeled **"OAuth 2.0 Client IDs"**

3. Find the row that says **"Web client (auto created by Google Service)"**
   - Type: Web application
   - Client ID: 823510409781-7am9...

4. **Click on** the blue link text "Web client (auto created by Google Service)"
   - This will open a new page/panel with the client configuration

## Step 2: Add Authorized JavaScript Origin

1. On the OAuth client details page, scroll down to find:
   - **"Authorized JavaScript origins"**
   - You should see a list (might be empty)

2. Click the button that says **"+ ADD URI"**

3. A text input field will appear

4. Type or paste this URL exactly:
   ```
   https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
   ```

5. Press Enter or click outside the text field

## Step 3: Add Localhost for Testing (Optional)

If you want to test locally, repeat the "+ ADD URI" process for:
```
http://localhost:5000
```

## Step 4: Save Changes

1. Scroll to the bottom of the page

2. Click the blue **"SAVE"** button

3. You should see a success message

## Step 5: Wait for Propagation

1. Wait **5 minutes** for Google's servers to update

2. During this time, you can grab coffee ☕

## Step 6: Test the Web App

1. Open your web app URL in a browser:
   ```
   https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
   ```

2. Click **"Continue with Google"**

3. You should see the Google account picker (no more 403 error!)

4. Sign in with your Google account

5. You should be redirected to the main app

## What You'll See

**Before fix:**
```
[Error] Failed to load resource: the server responded with a status of 403
[Error] The given origin is not allowed for the given client ID.
```

**After fix:**
```
✅ Google account picker appears
✅ Sign in completes successfully
✅ Redirects to main app
```

## Troubleshooting

**If you still see the 403 error:**
- Wait the full 5 minutes (Google needs time to propagate)
- Clear your browser cache (Cmd+Shift+R on Mac)
- Try in an incognito/private window
- Double-check the URL matches exactly (no trailing slash)

**Can't find the "Authorized JavaScript origins" section?**
- Make sure you clicked on the **OAuth 2.0 Client ID**, not the API Key
- The API Key doesn't have this section
- Only OAuth clients have "Authorized JavaScript origins"

## Summary

You're adding this URL:
```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

To this client:
```
Web client (auto created by Google Service)
Type: Web application
```

In this section:
```
Authorized JavaScript origins
```

That's it! 🎉
