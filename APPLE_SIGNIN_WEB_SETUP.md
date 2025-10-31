# Apple Sign In for Web - Setup Guide

## Current Error

```
Error Domain=com.apple.AuthenticationServices.AuthorizationError Code=1000
Failed to initialize client context
```

This means Apple Sign In for Web is not properly configured in your Apple Developer account.

## Required Setup Steps

### 1. Apple Developer Account Configuration

Go to https://developer.apple.com/account/resources/identifiers/list/serviceId

#### Create a Service ID (if not already created)

1. Click the "+" button to register a new identifier
2. Select "Services IDs" and click Continue
3. Fill in:
   - **Description**: SpeakEasy AI Web App
   - **Identifier**: `com.speakeasy.webapp` (this is your Service ID/Client ID)
4. Click Continue and Register

#### Configure the Service ID

1. Find your Service ID (`com.speakeasy.webapp`) and click on it
2. Check "Sign In with Apple"
3. Click "Configure" next to "Sign In with Apple"
4. Configure domains and URLs:
   - **Primary App ID**: Select your main app ID (e.g., `com.speakeasy.app`)
   - **Domains and Subdomains**: Add your production domain
     ```
     speakeasy-python-web-vlxo5frhwq-uc.a.run.app
     ```
   - **Return URLs**: Add your callback URL
     ```
     https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
     ```
5. Click Next, Done, Continue, and Save

### 2. Verify Domain Ownership (if required)

If Apple requires domain verification:

1. Apple will provide a verification file (e.g., `apple-developer-domain-association.txt`)
2. Upload this file to: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/.well-known/apple-developer-domain-association.txt`
3. The file must be accessible at that exact URL

### 3. Current Configuration

**Service ID (Client ID)**: `com.speakeasy.webapp`

**Redirect URI**: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html`

**Team ID**: `E7B9UE64SF`

**Key ID**: `FD22H4T9UU`

### 4. Testing After Setup

1. Wait 5-10 minutes after making changes (Apple propagation time)
2. Clear browser cache and cookies
3. Test Apple Sign In on: https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
4. Check browser console for any errors

## Common Issues

### Issue: "process may not map database"
**Solution**: This is a macOS-specific error when running in certain environments. For web apps, this shouldn't appear - the error suggests the client ID isn't properly configured.

### Issue: Error Code 1000
**Solution**: Service ID not properly configured or domain not verified.

### Issue: Popup blocked
**Solution**: Browser is blocking the Apple Sign In popup. Check browser popup settings.

## Alternative: Disable Apple Sign In Temporarily

If you want to disable Apple Sign In while configuring:

1. The auth page will hide the Apple button
2. Users can still sign in with Google
3. Re-enable once Apple configuration is complete

## Support Resources

- [Apple Sign In for Web Documentation](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js)
- [Configure Apple Sign In](https://developer.apple.com/help/account/configure-app-capabilities/configure-sign-in-with-apple-for-the-web)
- [Domain Verification](https://developer.apple.com/help/account/configure-app-capabilities/configure-domains-for-sign-in-with-apple)
