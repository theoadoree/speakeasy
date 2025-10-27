# OAuth Setup Guide for SpeakEasy

## Google OAuth Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized origins:
   - `https://speakeasy-ai.app`
   - `https://speakeasy-web-823510409781.us-central1.run.app`
5. Add authorized redirect URIs:
   - `https://speakeasy-ai.app`
   - `https://speakeasy-web-823510409781.us-central1.run.app`

### 3. Update Configuration
Replace the placeholder client ID in `web/index.html`:
```javascript
const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
```

Set environment variable in Cloud Run:
```bash
gcloud run services update speakeasy-backend \
  --region=us-central1 \
  --set-env-vars="GOOGLE_CLIENT_ID=YOUR_ACTUAL_GOOGLE_CLIENT_ID"
```

## Apple Sign In Setup

### 1. Apple Developer Account
1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Sign in with Apple Developer account
3. Go to "Certificates, Identifiers & Profiles"

### 2. Create App ID
1. Go to "Identifiers" > "App IDs"
2. Click "+" to create new App ID
3. Choose "App" type
4. Enter Bundle ID: `com.speakeasy.app`
5. Enable "Sign In with Apple" capability

### 3. Create Service ID
1. Go to "Identifiers" > "Services IDs"
2. Click "+" to create new Service ID
3. Enter identifier: `com.speakeasy.web`
4. Enable "Sign In with Apple"
5. Configure domains:
   - Primary App ID: `com.speakeasy.app`
   - Domains: `speakeasy-ai.app`
   - Return URLs: `https://speakeasy-ai.app`

### 4. Create Private Key
1. Go to "Keys" > "Sign In with Apple"
2. Click "+" to create new key
3. Enable "Sign In with Apple"
4. Download the key file (.p8)
5. Note the Key ID and Team ID

### 5. Update Configuration
Replace the placeholder client ID in `web/index.html`:
```javascript
AppleID.auth.init({
    clientId: 'com.speakeasy.web', // Service ID
    scope: 'name email',
    redirectURI: 'https://speakeasy-ai.app',
    state: 'state',
    usePopup: true
});
```

## Environment Variables

Set these in Cloud Run:
```bash
gcloud run services update speakeasy-backend \
  --region=us-central1 \
  --set-env-vars="GOOGLE_CLIENT_ID=your_google_client_id,APPLE_TEAM_ID=your_team_id,APPLE_KEY_ID=your_key_id,APPLE_PRIVATE_KEY=your_private_key"
```

## Testing

### Google Sign In
1. Visit https://speakeasy-ai.app
2. Click "Continue with Google"
3. Complete OAuth flow
4. Verify user data is saved

### Apple Sign In
1. Visit https://speakeasy-ai.app
2. Click "Continue with Apple"
3. Complete Sign In with Apple flow
4. Verify user data is saved

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for all sensitive data
- Implement proper JWT token verification for Apple Sign In
- Add rate limiting to prevent abuse
- Use HTTPS for all OAuth redirects
- Validate all OAuth responses on the backend

## Troubleshooting

### Common Issues:
1. **CORS errors**: Ensure authorized origins include your domain
2. **Invalid redirect URI**: Check that redirect URIs match exactly
3. **Token verification fails**: Verify client IDs match between frontend and backend
4. **Apple Sign In not working**: Ensure Service ID is properly configured

### Debug Steps:
1. Check browser console for JavaScript errors
2. Verify network requests in browser dev tools
3. Check Cloud Run logs for backend errors
4. Test with different browsers/devices
