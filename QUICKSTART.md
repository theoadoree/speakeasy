# SpeakEasy Quick Start Guide

Get SpeakEasy deployed to production in under 30 minutes.

## Prerequisites

- Google Cloud account with billing enabled
- GitHub account
- Expo account (for mobile builds)
- Domain registered (speakeasy-ai.app)

## 🚀 Fast Track Deployment

### Step 1: Google Cloud Setup (5 minutes)

```bash
# Clone the repository
git clone https://github.com/your-org/speakeasy.git
cd speakeasy

# Run automated setup
./scripts/setup-gcloud.sh
```

This will:
- Enable required Google Cloud APIs
- Create service accounts
- Generate credentials
- Configure IAM permissions

### Step 2: GitHub Secrets (2 minutes)

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

1. **GCP_PROJECT_ID**: Your Google Cloud project ID
2. **GCP_SA_KEY**: Contents of `gcloud-sa-key.json` (from Step 1)
3. **OLLAMA_URL**: Your Ollama server URL
4. **EXPO_TOKEN**: From https://expo.dev/accounts/[username]/settings/access-tokens

### Step 3: Deploy Backend (5 minutes)

```bash
# Push to GitHub - deployment happens automatically
git push origin main

# Or deploy manually
cd backend
gcloud run deploy speakeasy-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

Your backend will be live at: `https://speakeasy-backend-[hash].run.app`

### Step 4: Deploy Web App (5 minutes)

```bash
# Automatic via GitHub Actions on push
git push origin main

# Or manual deployment
npm run deploy:web
```

Your web app will be live at: `https://speakeasy-web-[hash].run.app`

### Step 5: Configure Custom Domain (5 minutes)

```bash
# Map domain to web app
gcloud run domain-mappings create \
  --service speakeasy-web \
  --domain speakeasy-ai.app \
  --region us-central1
```

Add DNS records at your registrar:
```
Type: A
Name: @
Value: 216.239.32.21, 216.239.34.21, 216.239.36.21, 216.239.38.21

Type: CNAME
Name: www
Value: ghs.googlehosted.com
```

Wait 15-30 minutes for SSL certificate provisioning.

### Step 6: Build Mobile Apps (5 minutes)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build both platforms
./scripts/build-apps.sh
# Select: 3 (Both)
# Select: 3 (Production)
```

Monitor builds at: https://expo.dev

### Step 7: Test Everything (3 minutes)

```bash
# Test backend
curl https://speakeasy-backend-[hash].run.app/health

# Test web app
open https://speakeasy-ai.app

# Test mobile app
# Install from Expo build and launch
```

## 🎉 You're Live!

Your SpeakEasy deployment is complete:

- ✅ Backend API running on Cloud Run
- ✅ Web app accessible at https://speakeasy-ai.app
- ✅ iOS and Android apps building
- ✅ CI/CD pipeline active
- ✅ SSL certificate enabled

## 📱 Next Steps

### Submit to App Stores

**iOS App Store:**
```bash
eas submit --platform ios
```

**Android Play Store:**
```bash
eas submit --platform android
```

### Monitor Your Deployment

```bash
# View backend logs
gcloud run services logs tail speakeasy-backend --region us-central1

# View web app logs
gcloud run services logs tail speakeasy-web --region us-central1

# Check service status
gcloud run services list
```

### Scale Your Services

```bash
# Increase backend capacity
gcloud run services update speakeasy-backend \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 50 \
  --region us-central1

# Enable always-on (no cold starts)
gcloud run services update speakeasy-backend \
  --min-instances 1 \
  --region us-central1
```

## 🔧 Local Development

```bash
# Start local environment with Docker
./scripts/deploy-local.sh

# Or start development server
npm start

# Services available at:
# - Ollama: http://localhost:11434
# - Backend: http://localhost:8080
# - Web: http://localhost:80
```

## 📚 Documentation

- **Full Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Backend API**: [backend/README.md](./backend/README.md)
- **Project Overview**: [CLAUDE.md](./CLAUDE.md)

## 🆘 Troubleshooting

### Backend won't deploy
```bash
# Check Cloud Build logs
gcloud builds list --limit 5
gcloud builds log [BUILD_ID]

# Verify IAM permissions
gcloud projects get-iam-policy [PROJECT_ID]
```

### Domain not working
```bash
# Check domain mapping status
gcloud run domain-mappings describe \
  --domain speakeasy-ai.app \
  --region us-central1

# Verify DNS propagation
dig speakeasy-ai.app
```

### Mobile build fails
```bash
# View build logs
eas build:list
eas build:view [BUILD_ID]

# Check credentials
eas credentials
```

## 💰 Cost Estimate

**Development** (scale-to-zero enabled):
- Backend: ~$5-15/month
- Web: ~$2-5/month
- Mobile builds: Free tier (limited builds)
- **Total**: ~$10-20/month

**Production** (low traffic):
- Backend: ~$35-65/month
- Web: ~$5-10/month
- Ollama (if using Cloud Run): ~$200-300/month
- **Total**: ~$240-375/month

Enable scale-to-zero to minimize costs during development.

## 🔒 Security Checklist

- [ ] Update OLLAMA_URL secret in GitHub
- [ ] Enable API authentication (see DEPLOYMENT.md)
- [ ] Set up rate limiting
- [ ] Configure monitoring and alerts
- [ ] Review IAM permissions
- [ ] Enable Cloud Armor (DDoS protection)
- [ ] Set up budget alerts

## 📞 Support

- GitHub Issues: https://github.com/your-org/speakeasy/issues
- Documentation: See DEPLOYMENT.md for detailed guides
- Logs: Use `gcloud run services logs` commands above

---

**Ready to deploy?** Run `./scripts/setup-gcloud.sh` to get started!
