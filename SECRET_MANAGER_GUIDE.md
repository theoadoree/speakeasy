# Google Cloud Secret Manager Implementation Guide

## Overview

This guide explains how secrets are managed in the SpeakEasy project using **Google Cloud Secret Manager** for secure, centralized secret storage.

## Why Secret Manager?

✅ **Secure** - Encrypted at rest and in transit
✅ **Centralized** - One source of truth for all secrets
✅ **Versioned** - Track changes and rollback if needed
✅ **Audited** - Know who accessed what and when
✅ **No git commits** - Never commit secrets to code
✅ **Easy rotation** - Update secrets without redeploying

## Architecture

```
┌─────────────────────────────────────────┐
│     Cloud Run Service                   │
│  ┌────────────────────────────────┐     │
│  │   Backend App (server.js)     │     │
│  │                                │     │
│  │  1. Starts up                  │     │
│  │  2. Loads secrets              │◄────┼────┐
│  │  3. Stores in global.secrets   │     │    │
│  │  4. Ready to serve requests    │     │    │
│  └────────────────────────────────┘     │    │
└─────────────────────────────────────────┘    │
                                                │
                    ┌───────────────────────────┘
                    │
         ┌──────────▼────────────┐
         │  Secret Manager API   │
         │  ────────────────────  │
         │  openai-api-key       │
         │  apple-private-key    │
         │  stripe-secret-key    │
         │  jwt-secret           │
         └───────────────────────┘
```

## Secrets Managed

| Secret Name | Purpose | Where to Get |
|-------------|---------|--------------|
| `openai-api-key` | OpenAI API access for AI features | https://platform.openai.com/api-keys |
| `apple-private-key` | Apple Sign In authentication | Apple Developer Console (.p8 file) |
| `stripe-secret-key` | Payment processing | https://dashboard.stripe.com/apikeys |
| `jwt-secret` | JWT token signing | Generate with `openssl rand -base64 32` |

## Setup Instructions

### Step 1: Install Dependencies

```bash
# Backend already includes @google-cloud/secret-manager
cd backend
npm install
```

### Step 2: Run Setup Script

```bash
# Make sure you're authenticated with gcloud
gcloud auth login

# Set your project
export GCP_PROJECT_ID="your-project-id"

# Run the setup script
./scripts/setup-secrets.sh
```

The script will:
1. Enable Secret Manager API
2. Create secrets if they don't exist
3. Prompt you to enter secret values (hidden input)
4. Grant Cloud Run service account access
5. Display confirmation

### Step 3: Enter Secret Values

When prompted, enter your actual secret values:

**Google Client ID (Web SDK):**
```bash
# Get from: Google Cloud Console → APIs & Services → Credentials
Enter value: 768424738821-gb3i7pl82qm5r70q73nh6gg33i1f3tv0.apps.googleusercontent.com
```

**OpenAI API Key:**
```bash
# Get from: https://platform.openai.com/api-keys
Enter value: sk-proj-YOUR_ACTUAL_KEY_HERE
```

**Apple Private Key:**
```bash
# Convert your .p8 file first:
base64 -i AuthKey_YOUR_KEY_ID.p8 | tr -d '\n'

# Then enter the base64 output
Enter value: LS0tLS1CRUdJTi...
```

**Stripe Secret Key:**
```bash
# Get from: https://dashboard.stripe.com/apikeys
Enter value: sk_live_YOUR_STRIPE_KEY
```

**JWT Secret:**
```bash
# Generate a random secret
openssl rand -base64 32

# Enter the generated value
Enter value: YOUR_GENERATED_SECRET
```

## Backend Implementation

### How Secrets are Loaded

The backend automatically loads secrets on startup:

```javascript
// backend/server.js
const { loadSecrets } = require('./secret-manager');

async function startServer() {
  // Load secrets from Secret Manager
  global.secrets = await loadSecrets();

  // Now secrets are available throughout the app
  app.listen(PORT, () => {
    console.log('Server running with secrets loaded');
  });
}
```

### How to Use Secrets in Code

```javascript
// Access loaded secrets from anywhere in your backend
const openaiKey = global.secrets.OPENAI_API_KEY;
const stripeKey = global.secrets.STRIPE_SECRET_KEY;
const appleKey = global.secrets.APPLE_PRIVATE_KEY_BASE64;
const jwtSecret = global.secrets.JWT_SECRET;

// Example: Using OpenAI API
const openai = new OpenAI({
  apiKey: global.secrets.OPENAI_API_KEY
});

// Example: JWT signing
jwt.sign(payload, global.secrets.JWT_SECRET, { expiresIn: '7d' });
```

### Caching & Performance

The Secret Manager service includes caching:

```javascript
// Secrets are cached for 5 minutes
// First request: Fetches from Secret Manager (~100-200ms)
// Subsequent requests: Returns from cache (< 1ms)
```

### Fallback to Environment Variables

If Secret Manager is unavailable (local development), secrets fall back to environment variables:

```javascript
// Priority:
// 1. Secret Manager (production)
// 2. Environment variables (local dev)
// 3. Error (if not found)
```

## Deployment

### Cloud Build Configuration

The deployment automatically mounts secrets:

```yaml
# backend/cloudbuild-deploy.yaml
- '--update-secrets'
- 'OPENAI_API_KEY=openai-api-key:latest,
   APPLE_PRIVATE_KEY_BASE64=apple-private-key:latest,
   STRIPE_SECRET_KEY=stripe-secret-key:latest,
   JWT_SECRET=jwt-secret:latest'
```

### Deploy to Cloud Run

```bash
# Deploy with Cloud Build
gcloud builds submit --config=backend/cloudbuild-deploy.yaml

# Or use the script
./scripts/deploy-backend.sh
```

## Managing Secrets

### View Existing Secrets

```bash
# List all secrets
gcloud secrets list

# View secret metadata
gcloud secrets describe openai-api-key

# View secret versions
gcloud secrets versions list openai-api-key
```

### Update a Secret

```bash
# Method 1: Using the setup script
./scripts/setup-secrets.sh

# Method 2: Direct gcloud command
echo -n 'new-secret-value' | gcloud secrets versions add SECRET_NAME --data-file=-

# Example: Update OpenAI API key
echo -n 'sk-proj-NEW_KEY' | gcloud secrets versions add openai-api-key --data-file=-
```

### View Secret Value (Requires Permission)

```bash
# View latest version
gcloud secrets versions access latest --secret=openai-api-key

# View specific version
gcloud secrets versions access 2 --secret=openai-api-key
```

### Delete a Secret

```bash
# Delete a secret (can't be undone after 30 days)
gcloud secrets delete SECRET_NAME

# Example
gcloud secrets delete old-unused-secret
```

### Rotate Secrets

```bash
# 1. Add new version
echo -n 'new-value' | gcloud secrets versions add SECRET_NAME --data-file=-

# 2. Test deployment still works

# 3. Disable old version (optional)
gcloud secrets versions disable VERSION_NUMBER --secret=SECRET_NAME

# 4. Eventually destroy old version
gcloud secrets versions destroy VERSION_NUMBER --secret=SECRET_NAME
```

## Permissions

### Service Account Permissions

Cloud Run needs access to secrets:

```bash
# Grant access (already done by setup script)
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

### Developer Access

Give developers read access:

```bash
# Grant yourself access
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="user:your-email@example.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Local Development

### Option 1: Use Environment Variables

```bash
# Create .env file (never commit this!)
cat > backend/.env << EOF
OPENAI_API_KEY=sk-proj-YOUR_KEY
APPLE_PRIVATE_KEY_BASE64=YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
JWT_SECRET=your-dev-secret
EOF

# Run backend
cd backend
npm start
```

### Option 2: Use Secret Manager Locally

```bash
# Authenticate with gcloud
gcloud auth application-default login

# Set project
export GCP_PROJECT_ID="your-project-id"

# Run backend (will fetch from Secret Manager)
cd backend
npm start
```

## Troubleshooting

### Problem: "Permission denied" accessing secrets

**Solution:**
```bash
# Grant your service account access
./scripts/setup-secrets.sh

# Or manually:
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:YOUR_SA@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Problem: "Secret not found"

**Solution:**
```bash
# Check if secret exists
gcloud secrets list

# Create it if missing
./scripts/setup-secrets.sh
```

### Problem: Backend fails to start

**Solution:**
```bash
# Check logs
gcloud run services logs read speakeasy-backend --limit=50

# Verify secrets are mounted
gcloud run services describe speakeasy-backend --format=yaml | grep -A 10 secrets
```

### Problem: "GCP_PROJECT_ID not set"

**Solution:**
```bash
# Set in deployment
gcloud run services update speakeasy-backend \
  --set-env-vars GCP_PROJECT_ID=your-project-id
```

### Problem: Secrets not updating

**Solution:**
```bash
# Secret Manager updates are immediate, but you need to:

# 1. Verify new version was created
gcloud secrets versions list SECRET_NAME

# 2. Redeploy Cloud Run to pick up changes
gcloud run services update speakeasy-backend \
  --region=us-central1
```

## Security Best Practices

### ✅ Do:
- Use Secret Manager for all sensitive values
- Rotate secrets regularly (quarterly)
- Use separate secrets for dev/staging/prod
- Monitor secret access with Cloud Logging
- Use least privilege IAM permissions
- Enable secret version auditing

### ❌ Don't:
- Commit secrets to git
- Share secrets via email/Slack
- Use production secrets in development
- Grant broad IAM permissions
- Disable audit logging
- Use default/weak secrets

## Cost

Secret Manager pricing:
- **$0.06 per secret per month**
- **$0.03 per 10,000 access operations**

**Example:**
- 5 secrets × $0.06 = $0.30/month
- 100,000 API calls × $0.03/10k = $0.30/month
- **Total: ~$0.60/month** 💰

Free tier: 6 secrets, 1 million access operations/month

## Monitoring

### View Access Logs

```bash
# View who accessed secrets
gcloud logging read "resource.type=secretmanager.googleapis.com/Secret" \
  --limit=50 \
  --format=json
```

### Set Up Alerts

```bash
# Alert on secret access
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Secret Manager Access Alert" \
  --condition-display-name="Unusual secret access" \
  --condition-threshold-value=100 \
  --condition-threshold-duration=60s
```

## Additional Resources

- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)
- [Pricing](https://cloud.google.com/secret-manager/pricing)
- [IAM Roles](https://cloud.google.com/secret-manager/docs/access-control)

## Quick Reference

```bash
# Create secret
gcloud secrets create SECRET_NAME --data-file=-

# Add version
echo -n 'value' | gcloud secrets versions add SECRET_NAME --data-file=-

# View value
gcloud secrets versions access latest --secret=SECRET_NAME

# List secrets
gcloud secrets list

# Grant access
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# Delete secret
gcloud secrets delete SECRET_NAME
```

---

✅ **Secret Manager is now set up and integrated!**
🔐 **All secrets are securely managed in Google Cloud**
🚀 **Deploy without committing any credentials**
