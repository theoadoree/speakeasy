# "Duplicate origin URIs" Error - It's Already Configured!

## What This Error Means

The error "Duplicate origin URIs are not allowed" means the domain is **already in the list**. This is actually GOOD news!

## What to Do Now

### Option 1: Check if Google OAuth is Already Working

If the domain is already configured, Google OAuth might already work!

**Test it now:**

1. Go to: https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
2. Click "Continue with Google"
3. Does it work?

If YES → **You're done! No changes needed.**

If NO → Continue to Option 2

### Option 2: Check What's Currently Configured

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth Client: `823510409781-7am96n366leset271qt9c8djo265u24n`
3. Click on it to open the details
4. Look at **"Authorized JavaScript origins"**

You should see something like:

```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

OR possibly:

```
https://speakeasy-python-web-823510409781.us-central1.run.app
```

### If You See the OLD URL (not the current one)

The old URL was: `https://speakeasy-python-web-823510409781.us-central1.run.app`

The NEW URL is: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app`

**To fix:**

1. **Remove** the old URL from "Authorized JavaScript origins"
2. **Add** the new URL: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app`
3. Click SAVE

### If You See Multiple OAuth Clients

You might have multiple OAuth clients in the list. Make sure you're editing the correct one:

**Client ID:** `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`

Look for this exact client ID.

## Common Scenarios

### Scenario A: Domain Already Added (Most Likely)

```
✓ https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

**Solution:** Just test! It should already work.

### Scenario B: Old Domain Listed

```
✓ https://speakeasy-python-web-823510409781.us-central1.run.app (OLD)
✗ https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app (NEED THIS)
```

**Solution:** Remove old, add new.

### Scenario C: Trailing Slash Issue

```
✓ https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/
```

**Solution:** Remove the one with trailing slash, add without:
```
✓ https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

### Scenario D: Wrong Protocol

```
✓ http://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

**Solution:** Remove http://, add https:// (no trailing slash)

## Still Getting Errors?

### Error: "You do not have permission to access the requested resource"

This means:
- Domain is NOT in the authorized list yet
- OR you're looking at the wrong OAuth client

### Error: "redirect_uri_mismatch"

This means:
- The redirect URI is not in "Authorized redirect URIs" list
- Add: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html`

## Quick Verification Steps

1. Open Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Find client: `823510409781-7am96n366leset271qt9c8djo265u24n`
3. Click to open
4. Scroll to "Authorized JavaScript origins"
5. Take a screenshot and check what URLs are listed
6. Verify it matches your current Cloud Run URL exactly

## Your Current Cloud Run URL

Your app is currently deployed at:
```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

This is the URL that needs to be in "Authorized JavaScript origins".

## If It's Already Configured

If the domain is already there and you're still getting errors:

1. Clear your browser cache completely
2. Wait 5-10 minutes (Google propagation time)
3. Try in an incognito/private window
4. Check browser console for specific error messages

## Need to See What's Configured?

Open the OAuth client in Google Cloud Console and you'll see exactly what domains are authorized. The "duplicate" error means one of those domains is the same as what you're trying to add.
