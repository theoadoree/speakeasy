# Google OAuth Domain Authorization Setup

## Current Error

```
Failed to load resource: You do not have permission to access the requested resource.
Failed to load resource: the server responded with a status of 500 () (google, line 0)
```

This means your domain is not authorized in the Google OAuth client configuration.

## Required Setup Steps

### 1. Google Cloud Console Configuration

Go to: https://console.cloud.google.com/apis/credentials

#### Find Your OAuth 2.0 Client

1. Click on your OAuth 2.0 Client ID: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`
2. This should show "Web application" type

#### Add Authorized JavaScript Origins

Under **Authorized JavaScript origins**, add:

```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

**Important Notes:**
- Do NOT include trailing slash
- Must use HTTPS (not HTTP)
- Must match exactly the domain where your app is hosted

#### Add Authorized Redirect URIs

Under **Authorized redirect URIs**, add:

```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
```

#### Save Changes

Click **Save** at the bottom of the page.

### 2. Current Configuration

**Client ID**: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`

**Production Domain**: `speakeasy-python-web-vlxo5frhwq-uc.a.run.app`

**Auth Page**: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html`

### 3. Testing After Setup

1. Wait 5 minutes after making changes (Google propagation time)
2. Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Open browser console (F12) to check for errors
4. Test: https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html

### 4. Alternative: Use Test Environment

If you need immediate testing while configuring production:

Add `localhost` for local testing:
```
http://localhost:8080
http://127.0.0.1:8080
```

## Verification Checklist

- [ ] OAuth client type is "Web application"
- [ ] Authorized JavaScript origins includes your Cloud Run domain (no trailing slash)
- [ ] Authorized redirect URIs includes your auth page URL
- [ ] No typos in domain name (check carefully!)
- [ ] Using HTTPS (not HTTP)
- [ ] Waited 5+ minutes after saving changes
- [ ] Cleared browser cache

## Common Issues

### Issue: 500 Error from Google SDK
**Cause**: Domain not in Authorized JavaScript origins
**Solution**: Add domain to authorized origins in Google Cloud Console

### Issue: redirect_uri_mismatch
**Cause**: Redirect URI not in authorized list
**Solution**: Add exact redirect URI to Google Cloud Console

### Issue: "You do not have permission"
**Cause**: OAuth client not properly configured or domain mismatch
**Solution**: Double-check domain spelling and HTTPS protocol

## Support Resources

- [Google OAuth Documentation](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [OAuth 2.0 Setup Guide](https://support.google.com/cloud/answer/6158849)
