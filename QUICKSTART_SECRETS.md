# Quick Start: Secret Manager Setup

## 🚀 30-Second Setup

```bash
# 1. Authenticate
gcloud auth login

# 2. Run setup script
./scripts/setup-secrets.sh

# 3. Deploy
./scripts/deploy-backend.sh
```

Done! ✅

## 📋 What Secrets Do I Need?

| Secret | Where to Get | Example |
|--------|--------------|---------|
| **Google Client ID (Web SDK)** | Google Cloud Console → APIs & Services → Credentials | `768424738821-gb3i7pl82qm5r70q73nh6gg33i1f3tv0.apps.googleusercontent.com` |
| **OpenAI API Key** | https://platform.openai.com/api-keys | `sk-proj-...` |
| **Apple Private Key** | Apple Developer → Keys → Download .p8 | Base64 of .p8 file |
| **Stripe Secret Key** | https://dashboard.stripe.com/apikeys | `sk_live_...` or `sk_test_...` |
| **JWT Secret** | Generate: `openssl rand -base64 32` | Random 32-char string |

## 🔨 Setup Commands

### First Time Setup
```bash
# Run interactive setup
./scripts/setup-secrets.sh
```

### Update a Secret
```bash
# Update OpenAI key
echo -n 'sk-proj-NEW_KEY' | gcloud secrets versions add openai-api-key --data-file=-

# Update Google client ID
echo -n 'your-client-id.apps.googleusercontent.com' | gcloud secrets versions add google-client-id --data-file=-

# Update Apple key (convert .p8 first)
base64 -i AuthKey_XXX.p8 | tr -d '\n' | gcloud secrets versions add apple-private-key --data-file=-

# Update Stripe key
echo -n 'sk_live_NEW_KEY' | gcloud secrets versions add stripe-secret-key --data-file=-

# Update JWT secret
openssl rand -base64 32 | tr -d '\n' | gcloud secrets versions add jwt-secret --data-file=-
```

### View Secrets
```bash
# List all secrets
gcloud secrets list

# View a secret value (requires permission)
gcloud secrets versions access latest --secret=openai-api-key
```

## 🏠 Local Development

### Method 1: Environment Variables
```bash
# Create .env file
cat > backend/.env << EOF
OPENAI_API_KEY=sk-proj-YOUR_DEV_KEY
APPLE_PRIVATE_KEY_BASE64=YOUR_DEV_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_DEV_KEY
JWT_SECRET=your-dev-secret-min-32-chars
EOF

# Run
cd backend && npm start
```

### Method 2: Use Secret Manager
```bash
# Authenticate
gcloud auth application-default login

# Set project
export GCP_PROJECT_ID="modular-analog-476221-h8"

# Run (fetches from Secret Manager)
cd backend && npm start
```

## 🐛 Troubleshooting

### "Permission denied"
```bash
# Grant access
./scripts/setup-secrets.sh
```

### "Secret not found"
```bash
# Create it
./scripts/setup-secrets.sh
```

### "Backend won't start"
```bash
# Check logs
gcloud run services logs read speakeasy-backend --limit=20

# Verify secrets exist
gcloud secrets list
```

## 📖 Full Documentation

See [SECRET_MANAGER_GUIDE.md](SECRET_MANAGER_GUIDE.md) for complete details.

## 🔑 Quick Commands Cheat Sheet

```bash
# Setup
./scripts/setup-secrets.sh

# Deploy
gcloud builds submit --config=backend/cloudbuild-deploy.yaml

# Update secret
echo -n 'value' | gcloud secrets versions add SECRET_NAME --data-file=-

# View secret
gcloud secrets versions access latest --secret=SECRET_NAME

# List secrets
gcloud secrets list

# View logs
gcloud run services logs read speakeasy-backend
```

---

**Questions?** Check [SECRET_MANAGER_GUIDE.md](SECRET_MANAGER_GUIDE.md) for detailed docs.
