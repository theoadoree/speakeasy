# Firebase OAuth CLI Configuration Guide

This guide provides step-by-step instructions for configuring Google and Apple OAuth authentication for your Firebase project using CLI tools.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Method 1: Automated Script (Recommended)](#method-1-automated-script-recommended)
- [Method 2: Manual gcloud CLI](#method-2-manual-gcloud-cli)
- [Method 3: Firebase Console (Fallback)](#method-3-firebase-console-fallback)
- [Google OAuth Setup](#google-oauth-setup)
- [Apple OAuth Setup](#apple-oauth-setup)
- [Testing OAuth Flows](#testing-oauth-flows)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Google Cloud CLI (gcloud)** - [Installation Guide](https://cloud.google.com/sdk/docs/install)
   ```bash
   # Verify installation
   gcloud --version
   ```

2. **Firebase CLI** - Already installed in this project
   ```bash
   # Verify installation
   firebase --version
   ```

3. **Authentication**
   ```bash
   # Login to Google Cloud
   gcloud auth login

   # Set your project
   gcloud config set project clicksclick-6e520
   ```

4. **Required Permissions**
   - Firebase Admin or Editor role
   - Identity Platform Admin role
   - Secret Manager Admin (for storing OAuth secrets)

## Quick Start

Run the automated configuration script:

```bash
cd /Users/scott/dev/speakeasy
./scripts/configure-oauth-providers.js
```

Or use the bash script:

```bash
./scripts/configure-oauth.sh
```

## Method 1: Automated Script (Recommended)

The automated Node.js script handles most of the configuration:

```bash
# Make the script executable (already done)
chmod +x scripts/configure-oauth-providers.js

# Run the configuration script
node scripts/configure-oauth-providers.js
```

### What the script does:

1. ✅ Enables required Google Cloud APIs
2. ✅ Retrieves OAuth credentials from Secret Manager
3. ✅ Provides configuration commands for OAuth providers
4. ⚠️  Opens Firebase Console for manual steps (when needed)

### Script Output:

The script will provide you with:
- Current authentication status
- API enablement confirmation
- OAuth provider configuration commands
- Links to Firebase Console for manual steps

## Method 2: Manual gcloud CLI

### Step 1: Enable Required APIs

```bash
# Enable Identity Toolkit API
gcloud services enable identitytoolkit.googleapis.com --project=clicksclick-6e520

# Enable Firebase API
gcloud services enable firebase.googleapis.com --project=clicksclick-6e520

# Enable Secret Manager (for storing OAuth secrets)
gcloud services enable secretmanager.googleapis.com --project=clicksclick-6e520
```

### Step 2: Store OAuth Secrets

```bash
# Create a secret for Google OAuth client secret
gcloud secrets create google-oauth-client-secret \
  --project=clicksclick-6e520 \
  --replication-policy="automatic"

# Add the secret value (replace YOUR_CLIENT_SECRET with actual value)
echo -n "YOUR_CLIENT_SECRET" | gcloud secrets versions add google-oauth-client-secret \
  --data-file=- \
  --project=clicksclick-6e520

# Verify the secret was created
gcloud secrets list --project=clicksclick-6e520
```

### Step 3: Configure Google OAuth Provider

```bash
# Get an access token
ACCESS_TOKEN=$(gcloud auth print-access-token)

# Get the client secret
CLIENT_SECRET=$(gcloud secrets versions access latest \
  --secret="google-oauth-client-secret" \
  --project="clicksclick-6e520")

# Configure Google provider via API
curl -X PATCH \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "151813176467-jqn1sjb8t4vq70qqbu1iibqacl1k2a9f.apps.googleusercontent.com",
    "clientSecret": "'${CLIENT_SECRET}'",
    "enabled": true
  }' \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/clicksclick-6e520/defaultSupportedIdpConfigs/google.com"
```

### Step 4: Configure Apple OAuth Provider

Apple OAuth requires additional setup in the Apple Developer Portal. After obtaining the required credentials:

```bash
# Store Apple credentials in Secret Manager
echo -n "YOUR_APPLE_TEAM_ID" | gcloud secrets create apple-team-id --data-file=- --project=clicksclick-6e520
echo -n "YOUR_APPLE_KEY_ID" | gcloud secrets create apple-key-id --data-file=- --project=clicksclick-6e520
cat your-apple-key.p8 | gcloud secrets create apple-private-key --data-file=- --project=clicksclick-6e520

# Configure Apple provider via API
curl -X PATCH \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "com.fluentai.speakeasy",
    "enabled": true
  }' \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/clicksclick-6e520/defaultSupportedIdpConfigs/apple.com"
```

## Method 3: Firebase Console (Fallback)

If CLI methods don't work, use the Firebase Console:

1. **Navigate to Firebase Console**
   ```
   https://console.firebase.google.com/project/clicksclick-6e520/authentication/providers
   ```

2. **Enable Google OAuth**
   - Click "Add new provider" or select "Google"
   - Toggle "Enable"
   - Add your support email
   - (Optional) Web SDK configuration will be auto-populated
   - Click "Save"

3. **Enable Apple OAuth**
   - Click "Add new provider" or select "Apple"
   - Toggle "Enable"
   - Enter Services ID: `com.fluentai.speakeasy`
   - Upload your Apple credentials:
     - Team ID
     - Key ID
     - Private Key (.p8 file)
   - Click "Save"

## Google OAuth Setup

### Getting Google OAuth Credentials

Your project already has a Google OAuth Client ID:
```
Client ID: 151813176467-jqn1sjb8t4vq70qqbu1iibqacl1k2a9f.apps.googleusercontent.com
```

If you need to create a new one or get the client secret:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=clicksclick-6e520)

2. Click "Create Credentials" > "OAuth 2.0 Client ID"

3. Configure OAuth consent screen (if not done)
   - User type: External
   - App name: SpeakEasy
   - Support email: your@email.com
   - Scopes: email, profile, openid

4. Create OAuth Client ID
   - Application type: Web application
   - Name: SpeakEasy Web Client
   - Authorized redirect URIs:
     ```
     https://clicksclick-6e520.firebaseapp.com/__/auth/handler
     https://clicksclick-6e520.web.app/__/auth/handler
     ```

5. Copy the Client ID and Client Secret

6. Store the client secret:
   ```bash
   echo -n "YOUR_CLIENT_SECRET" | gcloud secrets versions add google-oauth-client-secret \
     --data-file=- \
     --project=clicksclick-6e520
   ```

### Testing Google OAuth

```bash
# Verify the configuration
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/clicksclick-6e520/defaultSupportedIdpConfigs/google.com"
```

## Apple OAuth Setup

### Prerequisites from Apple Developer Portal

1. **Apple Developer Account** (paid membership required)
   - Enroll at: https://developer.apple.com/programs/

2. **Create an App ID**
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Click "+" to create new identifier
   - Select "App IDs" > "App"
   - Description: SpeakEasy
   - Bundle ID: `com.fluentai.speakeasy` (Explicit)
   - Capabilities: Enable "Sign in with Apple"
   - Register

3. **Create a Services ID**
   - Click "+" to create new identifier
   - Select "Services IDs"
   - Description: SpeakEasy Web
   - Identifier: `com.fluentai.speakeasy.web`
   - Enable "Sign in with Apple"
   - Configure:
     - Primary App ID: Select your app ID from step 2
     - Domains: `clicksclick-6e520.firebaseapp.com`, `clicksclick-6e520.web.app`
     - Return URLs:
       ```
       https://clicksclick-6e520.firebaseapp.com/__/auth/handler
       https://clicksclick-6e520.web.app/__/auth/handler
       ```
   - Save and Continue

4. **Create a Private Key**
   - Go to: https://developer.apple.com/account/resources/authkeys/list
   - Click "+" to create new key
   - Key Name: SpeakEasy Sign in with Apple Key
   - Enable "Sign in with Apple"
   - Configure: Select your Primary App ID
   - Register
   - Download the key file (.p8) - **SAVE IT SECURELY**
   - Note the Key ID (e.g., `ABC123DEF4`)

5. **Get Your Team ID**
   - Found in the top right of Apple Developer portal
   - Or at: https://developer.apple.com/account
   - Format: 10 characters (e.g., `A1B2C3D4E5`)

### Store Apple Credentials

```bash
# Store Team ID
echo -n "YOUR_TEAM_ID" | gcloud secrets create apple-team-id \
  --data-file=- \
  --project=clicksclick-6e520

# Store Key ID
echo -n "YOUR_KEY_ID" | gcloud secrets create apple-key-id \
  --data-file=- \
  --project=clicksclick-6e520

# Store Private Key (.p8 file)
cat /path/to/AuthKey_ABC123DEF4.p8 | gcloud secrets create apple-private-key \
  --data-file=- \
  --project=clicksclick-6e520
```

### Configure Apple OAuth in Firebase

Since Apple OAuth requires complex configuration, use Firebase Console:

```bash
# Open Firebase Console
open "https://console.firebase.google.com/project/clicksclick-6e520/authentication/providers"
```

Then:
1. Select "Apple" provider
2. Enable it
3. Enter Services ID: `com.fluentai.speakeasy.web`
4. Enter Team ID, Key ID, and upload Private Key
5. Save

## Testing OAuth Flows

### Test Google OAuth

```javascript
// In your React Native app (LoginScreen.js or SignUpScreen.js)
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebaseConfig';

const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Google Sign-In Success:', result.user);
  } catch (error) {
    console.error('Google Sign-In Error:', error);
  }
};
```

### Test Apple OAuth

```javascript
// In your React Native app
import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from './firebaseConfig';

const handleAppleSignIn = async () => {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');

  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Apple Sign-In Success:', result.user);
  } catch (error) {
    console.error('Apple Sign-In Error:', error);
  }
};
```

### Test via CLI

```bash
# Check provider configuration
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/clicksclick-6e520/config"
```

## Troubleshooting

### Issue: "Invalid OAuth client"

**Solution:**
- Verify client ID and secret in Secret Manager
- Check authorized redirect URIs in Google Cloud Console
- Ensure the OAuth consent screen is configured

### Issue: "Apple Sign In unavailable"

**Solution:**
- Verify Services ID configuration in Apple Developer Portal
- Check that domains and return URLs are correctly configured
- Ensure private key is valid and not expired
- Verify Team ID and Key ID are correct

### Issue: "API not enabled"

**Solution:**
```bash
# Enable required APIs
gcloud services enable identitytoolkit.googleapis.com --project=clicksclick-6e520
gcloud services enable firebase.googleapis.com --project=clicksclick-6e520
gcloud services enable secretmanager.googleapis.com --project=clicksclick-6e520
```

### Issue: "Permission denied"

**Solution:**
```bash
# Check your IAM roles
gcloud projects get-iam-policy clicksclick-6e520

# Request necessary roles from project owner:
# - Firebase Admin
# - Identity Platform Admin
# - Secret Manager Admin
```

### Issue: Firebase CLI authentication expired

**Solution:**
```bash
# For interactive login (on your local machine)
firebase login

# For CI/CD or non-interactive environments
firebase login:ci
# Then use the token: firebase --token "YOUR_TOKEN" <command>
```

### Debugging OAuth Flows

Enable debug logging:

```javascript
// In your app
import { getAuth, connectAuthEmulator } from 'firebase/auth';

if (__DEV__) {
  const auth = getAuth();
  // Use Firebase Auth Emulator for testing
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

Check Firebase Console logs:
```
https://console.firebase.google.com/project/clicksclick-6e520/authentication/users
```

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Sign in with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Identity Platform API Reference](https://cloud.google.com/identity-platform/docs/reference/rest)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## Configuration Summary

After completing this guide, you should have:

- ✅ Google Cloud APIs enabled (Identity Toolkit, Firebase, Secret Manager)
- ✅ Google OAuth provider configured with client ID and secret
- ✅ Apple OAuth provider configured (if you have Apple Developer account)
- ✅ OAuth credentials stored securely in Secret Manager
- ✅ Authorized domains and redirect URIs configured
- ✅ OAuth flows tested in your app

## Quick Reference Commands

```bash
# View current project
gcloud config get-value project

# List all secrets
gcloud secrets list --project=clicksclick-6e520

# Get OAuth configuration
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/clicksclick-6e520/config"

# Open Firebase Console
open "https://console.firebase.google.com/project/clicksclick-6e520/authentication/providers"

# Open Google Cloud Console (OAuth credentials)
open "https://console.cloud.google.com/apis/credentials?project=clicksclick-6e520"

# Run automated configuration script
node scripts/configure-oauth-providers.js
```

## Next Steps

1. ✅ Complete OAuth provider setup
2. Update your app's authentication flow to use OAuth
3. Test OAuth sign-in on iOS and Android
4. Configure authorized domains for production
5. Set up OAuth consent screen branding
6. Implement OAuth token refresh logic
7. Add error handling for OAuth failures
8. Test OAuth flows in production environment
