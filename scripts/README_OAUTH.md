# Firebase OAuth Configuration Scripts

This directory contains scripts to help configure Google and Apple OAuth authentication for your Firebase project.

## Quick Start (Recommended)

The easiest way to configure OAuth is using the interactive quick-start script:

```bash
./scripts/oauth-quickstart.sh
```

This script will:
- Open Firebase Console in your browser
- Guide you through enabling Google OAuth
- Optionally help you set up Apple OAuth
- Provide step-by-step instructions

## Available Scripts

### 1. `oauth-quickstart.sh` (Recommended)
Interactive script that opens Firebase Console and guides you through OAuth setup.

**Usage:**
```bash
cd /Users/scott/dev/speakeasy
./scripts/oauth-quickstart.sh
```

**What it does:**
- Opens Firebase Authentication Providers page
- Displays your Google OAuth Client ID
- Guides you through enabling Google OAuth
- Optionally helps with Apple OAuth setup
- Opens Apple Developer Portal if needed

### 2. `configure-oauth.sh`
Shell script that checks gcloud CLI setup and provides configuration commands.

**Usage:**
```bash
./scripts/configure-oauth.sh
```

**What it does:**
- Checks gcloud CLI installation
- Verifies authentication
- Enables required Google Cloud APIs
- Opens Firebase Console for manual configuration
- Displays OAuth setup instructions

### 3. `configure-oauth-providers.js`
Advanced Node.js script for programmatic OAuth configuration using Google Cloud APIs.

**Usage:**
```bash
node scripts/configure-oauth-providers.js
```

**What it does:**
- Authenticates with gcloud
- Enables Identity Platform and Firebase APIs
- Retrieves OAuth secrets from Secret Manager
- Provides API commands to configure providers
- Checks current authentication configuration

**Requirements:**
- gcloud CLI authenticated
- Proper IAM permissions (Firebase Admin or Owner)
- OAuth secrets stored in Secret Manager

## Configuration Methods

### Method 1: Firebase Console (Easiest)

Use the `oauth-quickstart.sh` script or manually:

1. Go to [Firebase Console](https://console.firebase.google.com/project/clicksclick-6e520/authentication/providers)
2. Enable Google OAuth provider
3. Optionally enable Apple OAuth provider

**Advantages:**
- No CLI setup required
- Visual interface
- Immediate feedback
- No permission issues

### Method 2: gcloud CLI (Advanced)

Use the `configure-oauth.sh` or `configure-oauth-providers.js` scripts.

**Advantages:**
- Scriptable and automatable
- Can be integrated into CI/CD
- Programmatic control

**Requirements:**
- gcloud CLI installed and configured
- Proper IAM permissions
- OAuth credentials in Secret Manager

## Google OAuth Setup

### You Already Have:
- **Client ID:** `151813176467-jqn1sjb8t4vq70qqbu1iibqacl1k2a9f.apps.googleusercontent.com`
- **Client Secret:** Stored in Secret Manager as `google-oauth-client-secret`

### To Enable in Firebase:
1. Run `./scripts/oauth-quickstart.sh`
2. Or manually go to Firebase Console
3. Enable Google provider
4. Add support email
5. Save

## Apple OAuth Setup

### Prerequisites:
1. **Apple Developer Account** (paid membership)
2. **Services ID** (e.g., `com.fluentai.speakeasy`)
3. **Private Key** (.p8 file for Sign in with Apple)
4. **Team ID** (from Apple Developer Portal)
5. **Key ID** (from Apple Developer Portal)

### Setup Steps:

#### 1. Apple Developer Portal:
```bash
# Open Apple Developer Portal
open "https://developer.apple.com/account/resources/identifiers/list"
```

1. Create a Services ID
2. Enable "Sign in with Apple"
3. Configure:
   - Domains: `clicksclick-6e520.firebaseapp.com`
   - Return URLs: `https://clicksclick-6e520.firebaseapp.com/__/auth/handler`
4. Create a Key for Sign in with Apple
5. Download the private key (.p8 file)

#### 2. Firebase Console:
```bash
# Open Firebase Console
open "https://console.firebase.google.com/project/clicksclick-6e520/authentication/providers"
```

1. Enable Apple provider
2. Enter Services ID, Team ID, Key ID
3. Upload private key (.p8 file)
4. Save

## Testing OAuth Configuration

After configuration, test your OAuth setup:

```bash
# Check OAuth configuration via API
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/clicksclick-6e520/config"
```

Or test in your app:
- See [SOCIAL_AUTH_QUICK_START.md](../SOCIAL_AUTH_QUICK_START.md) for implementation examples
- Test Google Sign-In button
- Test Apple Sign-In button

## Troubleshooting

### "Permission denied" errors
**Solution:** You need Owner or Editor role on the Firebase project. Use Firebase Console method instead.

### "API not enabled" errors
**Solution:** Run:
```bash
gcloud services enable identitytoolkit.googleapis.com --project=clicksclick-6e520
gcloud services enable firebase.googleapis.com --project=clicksclick-6e520
```

### "Invalid OAuth client" errors
**Solution:**
- Verify Client ID in Google Cloud Console
- Check authorized redirect URIs
- Ensure OAuth consent screen is configured

### Firebase CLI authentication issues
**Solution:**
```bash
firebase logout
firebase login
```

## Documentation

- **[OAUTH_CLI_SETUP.md](../OAUTH_CLI_SETUP.md)** - Comprehensive OAuth setup guide
- **[SOCIAL_AUTH_QUICK_START.md](../SOCIAL_AUTH_QUICK_START.md)** - App integration guide
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Docs](https://developer.apple.com/sign-in-with-apple/)

## Quick Command Reference

```bash
# Interactive OAuth setup (recommended)
./scripts/oauth-quickstart.sh

# Check gcloud authentication
gcloud auth list

# Set Firebase project
gcloud config set project clicksclick-6e520

# Enable APIs
gcloud services enable identitytoolkit.googleapis.com
gcloud services enable firebase.googleapis.com

# Open Firebase Console
open "https://console.firebase.google.com/project/clicksclick-6e520/authentication/providers"

# Open Google Cloud Console (OAuth credentials)
open "https://console.cloud.google.com/apis/credentials?project=clicksclick-6e520"

# Check enabled APIs
gcloud services list --enabled --project=clicksclick-6e520

# Get access token for API calls
gcloud auth print-access-token
```

## Summary

**Recommended approach:**
1. Run `./scripts/oauth-quickstart.sh`
2. Follow the interactive prompts
3. Enable Google OAuth in Firebase Console
4. Optionally configure Apple OAuth
5. Test in your app

**Alternative approach:**
1. Use `configure-oauth-providers.js` for programmatic setup
2. Requires proper IAM permissions
3. More advanced, for automation

Choose the method that works best for your needs!
