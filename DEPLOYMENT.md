# SpeakEasy Deployment Guide

## 🎯 Current Deployment Status (October 30, 2025)

**Backend**: ✅ Deployed to Google Cloud Run
**URL**: https://speakeasy-backend-823510409781.us-central1.run.app
**Region**: us-central1
**Project**: modular-analog-476221-h8
**Revision**: speakeasy-backend-00039-qdr
**Status**: Healthy and operational

---

Complete guide for deploying SpeakEasy to Google Cloud Platform with automated CI/CD, iOS, Android, and web applications.

## 🏗️ Architecture Overview

SpeakEasy uses a **cloud-native architecture**:

```
Mobile/Web App → Express Backend API (Cloud Run) → OpenAI GPT-4o-mini
```

### Architecture Components

1. **Express Backend** (`/backend`) - **DEPLOYED ✅**
   - RESTful API with specialized endpoints for onboarding, practice, lessons, assessments
   - OpenAI GPT-4o-mini integration for AI-powered features
   - Google OAuth + Apple Sign In + Firebase authentication
   - Session-based progress tracking
   - Deployed to Google Cloud Run at: https://speakeasy-backend-823510409781.us-central1.run.app

2. **AI Provider** - OpenAI GPT-4o-mini
   - Fast, cost-effective language model
   - Response time: 1-3 seconds
   - TTS voice generation for practice conversations
   - Managed via Google Secret Manager

3. **Mobile App** (React Native + Expo)
   - iOS and Android builds
   - Automatically connects to production backend
   - No local setup required

4. **Web App** (React Native Web)
   - Can be deployed to Firebase Hosting
   - Same codebase as mobile

### Environment Modes

- **Development**: Optional local backend OR use production backend
- **Production**: Express backend on Cloud Run → OpenAI GPT-4o-mini API

## 📋 Prerequisites

### 1. Google Cloud Account
- Active GCP account with billing enabled
- Project created (or create new project)
- Sufficient quota for Cloud Run with large memory (64GB+)

### 2. Local Tools
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize gcloud
gcloud init

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Authenticate
gcloud auth login
```

### 3. Docker (for local testing)
```bash
# macOS (with Homebrew)
brew install docker docker-compose

# Or download Docker Desktop
# https://www.docker.com/products/docker-desktop
```

## 🚀 Deployment Guide

This guide walks through deploying all components in the correct order.

---

## Phase 1: Deploy Express Backend to Cloud Run

The Express backend is the API layer that mobile/web apps communicate with.

### Step 1: Enable Required Google Cloud APIs

```bash
# Enable Cloud Run, Cloud Build, and Container Registry
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  artifactregistry.googleapis.com
```

### Step 2: Deploy Backend to Cloud Run

```bash
# Navigate to backend directory
cd /Users/scott/dev/speakeasy/backend

# Deploy using Cloud Build (builds from Dockerfile)
gcloud run deploy speakeasy-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OLLAMA_URL=http://localhost:11434 \
  --platform managed \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --min-instances 0 \
  --max-instances 10

# Get the deployed service URL
BACKEND_URL=$(gcloud run services describe speakeasy-api \
  --region us-central1 \
  --format 'value(status.url)')

echo "Backend deployed to: $BACKEND_URL"
```

### Step 3: Test Backend Health Check

```bash
# Test the health endpoint
curl $BACKEND_URL/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-01-XX...",
#   "ollama": "checking..."
# }
```

**Note**: The backend is now deployed but won't work until we configure the Ollama connection in Phase 2.

---

## Phase 2: Deploy Ollama LLM Server

You have three options for running Ollama in production:

### Option A: Ollama on Cloud Run (Recommended for small-medium scale)

```bash
# Clone Ollama Cloud Run template
cd /Users/scott/dev
git clone https://github.com/ollama/ollama
cd ollama

# Create Dockerfile for Cloud Run
cat > Dockerfile.cloudrun <<EOF
FROM ollama/ollama:latest

# Pre-pull models (optional, increases image size)
# RUN ollama pull qwen2.5:72b
# RUN ollama pull llama3.1:8b

EXPOSE 11434
CMD ["ollama", "serve"]
EOF

# Deploy to Cloud Run with large memory
gcloud run deploy speakeasy-ollama \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 64Gi \
  --cpu 8 \
  --timeout 3600 \
  --min-instances 0 \
  --max-instances 1

# Get Ollama URL
OLLAMA_URL=$(gcloud run services describe speakeasy-ollama \
  --region us-central1 \
  --format 'value(status.url)')

echo "Ollama deployed to: $OLLAMA_URL"

# Pull models (first time setup)
curl $OLLAMA_URL/api/pull -d '{"name": "qwen2.5:72b"}'
curl $OLLAMA_URL/api/pull -d '{"name": "llama3.1:8b"}'
```

### Option B: Ollama on Compute Engine VM (Recommended for production scale)

```bash
# Create a high-memory VM instance
gcloud compute instances create speakeasy-ollama-vm \
  --zone=us-central1-a \
  --machine-type=n1-highmem-16 \
  --boot-disk-size=200GB \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

# SSH into the VM
gcloud compute ssh speakeasy-ollama-vm --zone=us-central1-a

# On the VM: Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
sudo systemctl start ollama
sudo systemctl enable ollama

# Pull models
ollama pull qwen2.5:72b
ollama pull llama3.1:8b

# Get VM external IP
OLLAMA_URL=$(gcloud compute instances describe speakeasy-ollama-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "Ollama running at: http://$OLLAMA_URL:11434"
```

### Option C: Local Ollama with ngrok (Development/Testing only)

```bash
# Install and run ngrok
brew install ngrok

# Expose local Ollama to the internet
ngrok http 11434

# Copy the ngrok URL (e.g., https://xxxx-xx-xx-xx-xx.ngrok.io)
# This will be your OLLAMA_URL
```

### Step 4: Update Backend with Ollama URL

```bash
# Update the Express backend with the Ollama URL
gcloud run services update speakeasy-api \
  --region us-central1 \
  --set-env-vars OLLAMA_URL=$OLLAMA_URL

# Verify the connection
curl $BACKEND_URL/health

# Should now show:
# {
#   "status": "healthy",
#   "ollama": "connected",
#   "models": ["qwen2.5:72b", "llama3.1:8b"]
# }
```

---

## Phase 3: Update Mobile App Configuration

Update the mobile app to point to your production backend.

```bash
cd /Users/scott/dev/speakeasy

# Edit the config file
nano src/config/llm.config.js
```

Update the production backend URL:

```javascript
production: {
  mode: 'backend',
  backendURL: 'YOUR_BACKEND_URL', // Replace with actual Cloud Run URL
  apiKey: process.env.CLOUD_LLM_API_KEY, // Optional
  qwen: {
    model: 'qwen2.5:72b',
    temperature: 0.7,
    maxTokens: 4096,
  },
  llama: {
    model: 'llama3.1:8b',
    temperature: 0.8,
    maxTokens: 2048,
  },
},
```

Test the app locally with production backend:

```bash
# Switch to production mode temporarily
# (You might want to add an environment switch in your app)

# Start the app
npx expo start
```

---

## Phase 4: Deploy Web App (Firebase Hosting)

```bash
cd /Users/scott/dev/speakeasy

# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init hosting

# Build the web app
npx expo export --platform web

# Deploy to Firebase
firebase deploy --only hosting

# Your web app is now live at:
# https://your-project.firebase.app
```

---

## Phase 5: Build and Deploy Mobile Apps (Expo EAS)

### iOS App

```bash
cd /Users/scott/dev/speakeasy

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS build
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android App

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

---

## 🧪 Local Development Setup

For local development, you'll run both the Express backend and Ollama on your Mac.

### Step 1: Start Ollama Locally

```bash
# Ollama should already be running from previous setup
# If not:
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags

# Should show your models:
# {"models":[
#   {"name":"qwen2.5:72b",...},
#   {"name":"llama3.1:8b",...}
# ]}
```

### Step 2: Start Express Backend Locally

```bash
# Navigate to backend directory
cd /Users/scott/dev/speakeasy/backend

# Install dependencies (if not already done)
npm install

# Start the backend server
npm start

# Server will start on http://localhost:8080
# It automatically connects to local Ollama at http://localhost:11434
```

### Step 3: Test Local Backend

```bash
# Open a new terminal

# Test health check
curl http://localhost:8080/health

# Test generic generation
curl -X POST http://localhost:8080/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Say hello in Spanish",
    "model": "llama"
  }'

# Test onboarding endpoint
curl -X POST http://localhost:8080/api/onboarding/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I want to learn Spanish",
    "conversationHistory": "",
    "userName": "Test User",
    "targetLanguage": "Spanish"
  }'
```

### Step 4: Run Mobile App with Local Backend

```bash
# In the main project directory
cd /Users/scott/dev/speakeasy

# Make sure config is set to development mode
# src/config/llm.config.js should have:
# let ENV = 'development';
# mode: 'backend'
# backendURL: 'http://localhost:8080'

# Start the Expo development server
npx expo start

# Press 'i' for iOS simulator or 'a' for Android emulator
# Or scan QR code with Expo Go app on your phone
```

**Note**: If testing on a physical device, replace `localhost` with your Mac's local IP address (e.g., `http://192.168.1.100:8080`)

---

## ⚙️ Configuration

### LLM Config Structure

The `src/config/llm.config.js` file controls how the app connects to the backend:

```javascript
let ENV = 'development'; // Change to 'production' for production builds

const LLM_CONFIG = {
  development: {
    mode: 'backend',  // 'direct' = call Ollama directly, 'backend' = use Express API
    backendURL: 'http://localhost:8080',
    qwen: {
      baseURL: 'http://localhost:11434',  // Only used if mode='direct'
      model: 'qwen2.5:72b',
      temperature: 0.7,
      maxTokens: 4096,
    },
    llama: {
      baseURL: 'http://localhost:11434',  // Only used if mode='direct'
      model: 'llama3.1:8b',
      temperature: 0.8,
      maxTokens: 2048,
    },
  },

  production: {
    mode: 'backend',  // Always use backend in production
    backendURL: process.env.BACKEND_URL || 'https://speakeasy-api-xxxxx-uc.a.run.app',
    apiKey: process.env.CLOUD_LLM_API_KEY,  // Optional authentication
    qwen: {
      model: 'qwen2.5:72b',
      temperature: 0.7,
      maxTokens: 4096,
    },
    llama: {
      model: 'llama3.1:8b',
      temperature: 0.8,
      maxTokens: 2048,
    },
  },
};
```

### Configuration Modes

1. **`mode: 'direct'`** - Mobile app calls Ollama API directly
   - Use for: Early prototyping, local-only testing
   - Requires: Ollama running and accessible from mobile device

2. **`mode: 'backend'`** - Mobile app calls Express backend API (recommended)
   - Use for: Production, most development scenarios
   - Benefits: Better error handling, request validation, centralized logging

### Environment Variables

Create `.env` file for local development:

```bash
# Backend API URL (optional, has defaults)
BACKEND_URL=http://localhost:8080

# API Key for authenticated requests (optional)
# CLOUD_LLM_API_KEY=your_api_key_here
```

For production deployment, set environment variables in:
- **Expo EAS**: `eas.json` or Expo dashboard
- **Firebase**: `firebase.json` or Firebase console
- **Environment variable files**: `.env.production` (git-ignored)

---

## 💰 Cost Estimation

### Express Backend (Google Cloud Run)

**Development (min-instances=0, scale-to-zero):**
- Idle: ~$0/month (no cost when not in use)
- Active: ~$0.05-0.10/hour during testing
- Monthly: ~$5-15 for light development usage

**Production (min-instances=0, autoscaling):**
- Base: ~$50-100/month (moderate traffic, 1000-5000 requests/day)
- Per-request: $0.0000024 per request
- CPU: $0.00002400/vCPU-second
- Memory: $0.00000250/GiB-second
- Network egress: ~$0.12/GB

**Example production costs (1000 users, 10 requests/user/day):**
- Requests: 300,000/month × $0.0000024 = $0.72
- Compute: ~$30-50/month (512Mi memory, 1 CPU)
- Network: ~$5-10/month
- **Total**: ~$35-65/month

### Ollama LLM Server Costs

**Option A: Cloud Run (64Gi memory, 8 CPU)**
- Development (min-instances=0): ~$0.80-1.50/hour when active
- Production (min-instances=1, always-on): ~$500-700/month
- Best for: Infrequent usage, development, testing

**Option B: Compute Engine VM (n1-highmem-16)**
- Instance: ~$450/month (preemptible: ~$135/month)
- Storage (200GB SSD): ~$34/month
- Network egress: ~$10-20/month
- **Total**: ~$500/month (preemptible: ~$180/month)
- Best for: Production with consistent traffic

**Option C: Local Mac M1 Max + ngrok**
- Mac hardware: Free (already owned)
- ngrok: Free tier or $8/month for custom domain
- Electricity: ~$10-20/month
- **Total**: ~$10-30/month
- Best for: Development, personal projects, low traffic

### Total Monthly Costs

| Configuration | Development | Production (Low) | Production (High) |
|--------------|-------------|------------------|-------------------|
| Express Backend | $5-15 | $35-65 | $100-150 |
| Ollama (Cloud Run) | Pay-per-use | $500-700 | $500-700 |
| Ollama (VM) | N/A | $180-200 | $500+ |
| Ollama (Local+ngrok) | $10-30 | $10-30 | Not recommended |
| **Total** | **$15-45** | **$200-300** | **$600-850** |

### Cost Optimization Tips

1. **Start with scale-to-zero** (`min-instances=0`) for both services
2. **Use preemptible VMs** for Ollama (save ~70%)
3. **Implement caching** for repeated queries
4. **Use smaller models** during development (Llama 3.1-8B only)
5. **Monitor usage** with Cloud Console billing alerts
6. **Consider local development** to minimize cloud costs
7. **Implement rate limiting** to prevent abuse

---

## 🔧 Advanced Configuration

### Backend API Customization

Adjust Express backend settings by modifying `backend/server.js`:

```javascript
// Increase request timeout for long-running LLM operations
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});

// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Add request logging
const morgan = require('morgan');
app.use(morgan('combined'));
```

### Custom Cloud Run Settings for Backend

```bash
# Deploy with custom resource allocation
gcloud run services update speakeasy-api \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 80 \
  --min-instances 0 \
  --max-instances 10
```

### Authentication for Backend API

Protect your backend API with authentication:

**Option 1: Cloud Run IAM Authentication**

```bash
# Deploy with authentication required
gcloud run services update speakeasy-api \
  --region us-central1 \
  --no-allow-unauthenticated

# Create service account for mobile/web app
gcloud iam service-accounts create speakeasy-app

# Grant invoker role
gcloud run services add-iam-policy-binding speakeasy-api \
  --region us-central1 \
  --member="serviceAccount:speakeasy-app@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

**Option 2: API Key Authentication**

Add to `backend/server.js`:

```javascript
// API key middleware
const API_KEY = process.env.API_KEY || 'your-secret-key';

const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Apply to all API routes
app.use('/api', authenticateApiKey);
```

Then update the Express backend deployment:

```bash
gcloud run services update speakeasy-api \
  --region us-central1 \
  --set-env-vars API_KEY=your-secure-api-key-here
```

And update `src/services/api.js` to include the API key:

```javascript
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': llmConfig.apiKey,
}
```

---

## 📊 Monitoring & Logging

### View Backend Logs

```bash
# View recent backend logs
gcloud run services logs read speakeasy-api \
  --region=us-central1 \
  --limit=50

# Follow logs in real-time
gcloud run services logs tail speakeasy-api \
  --region=us-central1

# Filter logs by severity
gcloud run services logs read speakeasy-api \
  --region=us-central1 \
  --log-filter='severity>=ERROR'
```

### View Ollama Logs

**If running on Cloud Run:**
```bash
gcloud run services logs read speakeasy-ollama \
  --region=us-central1 \
  --limit=50
```

**If running on Compute Engine VM:**
```bash
# SSH into the VM
gcloud compute ssh speakeasy-ollama-vm --zone=us-central1-a

# View Ollama logs
sudo journalctl -u ollama -f
```

### Monitoring Dashboard

View metrics in Google Cloud Console:

1. Navigate to **Cloud Run** > `speakeasy-api`
2. Click **"METRICS"** tab
3. Monitor:
   - Request count and rate
   - Request latency (p50, p95, p99)
   - Container CPU/memory utilization
   - Error rate and status codes
   - Container instance count

### Set Up Alerts

```bash
# Create alert for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="SpeakEasy Backend High Error Rate" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s

# Create alert for high latency
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="SpeakEasy Backend High Latency" \
  --condition-threshold-value=5000 \
  --condition-threshold-duration=60s
```

### Application Performance Monitoring

For more detailed monitoring, consider:

1. **Google Cloud Trace** - Request tracing
2. **Google Cloud Profiler** - Performance profiling
3. **Cloud Monitoring** - Custom metrics
4. **Third-party APM** - Datadog, New Relic, etc.

---

## 🔄 Updating the Deployment

### Update Backend Code

```bash
# After making changes to backend/server.js
cd /Users/scott/dev/speakeasy/backend

# Deploy new version to Cloud Run
gcloud run deploy speakeasy-api \
  --source . \
  --region us-central1

# Cloud Build will automatically rebuild and deploy
```

### Update Mobile App

```bash
# After making changes to the mobile app
cd /Users/scott/dev/speakeasy

# Test locally first
npx expo start

# Build and deploy with EAS
eas build --platform all --profile production

# Or for web
npx expo export --platform web
firebase deploy --only hosting
```

### Rollback to Previous Version

```bash
# List revisions
gcloud run revisions list \
  --service=speakeasy-api \
  --region=us-central1

# Rollback to specific revision
gcloud run services update-traffic speakeasy-api \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1

# Or revert to previous revision
gcloud run services update-traffic speakeasy-api \
  --to-latest=false \
  --region=us-central1
```

---

## 🧪 Testing the Deployment

### Test Backend Health

```bash
# Replace with your actual backend URL
BACKEND_URL="https://speakeasy-api-xxxxx-uc.a.run.app"

# Test health endpoint
curl $BACKEND_URL/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-01-XX...",
#   "ollama": "connected",
#   "models": ["qwen2.5:72b", "llama3.1:8b"]
# }
```

### Test LLM Generation

```bash
# Test with Llama (fast responses)
curl -X POST $BACKEND_URL/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Say hello in Spanish",
    "model": "llama",
    "temperature": 0.8
  }'

# Test with Qwen (complex reasoning)
curl -X POST $BACKEND_URL/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain the difference between ser and estar in Spanish",
    "model": "qwen",
    "temperature": 0.7
  }'
```

### Test Specialized Endpoints

```bash
# Test onboarding endpoint
curl -X POST $BACKEND_URL/api/onboarding/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to learn Spanish",
    "conversationHistory": "",
    "userName": "Alex",
    "targetLanguage": "Spanish"
  }'

# Test practice conversation endpoint
curl -X POST $BACKEND_URL/api/practice/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, ¿cómo estás?",
    "lesson": {
      "topic": "Greetings",
      "difficulty": "beginner"
    },
    "userProfile": {
      "targetLanguage": "Spanish",
      "level": "beginner"
    }
  }'

# Test lesson generation
curl -X POST $BACKEND_URL/api/lessons/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": {
      "level": "beginner",
      "targetLanguage": "Spanish",
      "interests": ["travel", "food"],
      "goals": ["conversational fluency"]
    },
    "count": 3
  }'
```

### Test from React Native App

```javascript
import { generateResponse, sendOnboardingMessage, checkHealth } from './services/api';

// Test health check
const testHealth = async () => {
  try {
    const health = await checkHealth();
    console.log('Backend Health:', health);
  } catch (error) {
    console.error('Health Check Failed:', error);
  }
};

// Test basic generation
const testGeneration = async () => {
  try {
    const response = await generateResponse(
      'Say hello in Spanish',
      { model: 'llama', temperature: 0.8 }
    );
    console.log('LLM Response:', response);
  } catch (error) {
    console.error('Generation Error:', error);
  }
};

// Test onboarding
const testOnboarding = async () => {
  try {
    const response = await sendOnboardingMessage(
      'I want to learn Spanish',
      {
        conversationHistory: '',
        userName: 'Alex',
        targetLanguage: 'Spanish'
      }
    );
    console.log('Onboarding Response:', response);
  } catch (error) {
    console.error('Onboarding Error:', error);
  }
};

// Run tests
testHealth();
testGeneration();
testOnboarding();
```

### Performance Testing

```bash
# Install Apache Bench (if not already installed)
brew install httpd

# Test backend performance (100 requests, 10 concurrent)
ab -n 100 -c 10 -p test-data.json -T application/json \
  $BACKEND_URL/api/generate

# Create test-data.json:
# {"prompt":"Hello","model":"llama"}
```

---

## 🐛 Troubleshooting

### Issue: Backend Health Check Fails

**Symptoms**: `/health` endpoint returns error or "ollama: disconnected"

**Possible causes**:
1. Ollama server is not running
2. OLLAMA_URL environment variable is incorrect
3. Network connectivity issue

**Solution**:
```bash
# Check Ollama is running (if on Cloud Run)
curl https://your-ollama-url.run.app/api/tags

# Update backend environment variable
gcloud run services update speakeasy-api \
  --region us-central1 \
  --set-env-vars OLLAMA_URL=https://correct-url.run.app

# Check backend logs
gcloud run services logs read speakeasy-api \
  --region us-central1 \
  --limit=50
```

### Issue: Backend Returns 500 Internal Server Error

**Symptoms**: API requests fail with 500 status code

**Solution**:
```bash
# Check backend logs for errors
gcloud run services logs read speakeasy-api \
  --region us-central1 \
  --log-filter='severity>=ERROR' \
  --limit=50

# Common causes:
# - Missing environment variables
# - Ollama connection timeout
# - Invalid request payload

# Test locally to debug
cd /Users/scott/dev/speakeasy/backend
npm start
# Then test with curl
```

### Issue: Request Timeout

**Symptoms**: Requests timeout after 60 seconds

**Solution**:
```bash
# Increase Cloud Run timeout
gcloud run services update speakeasy-api \
  --timeout=300 \
  --region=us-central1

# Also check Ollama timeout settings
# Large models may take 30-60 seconds for first response
```

### Issue: Ollama Models Not Found

**Symptoms**: Backend returns "model not found" error

**Solution**:
```bash
# Pull models on Ollama server
# If Ollama is on Cloud Run:
OLLAMA_URL="https://your-ollama-url.run.app"
curl $OLLAMA_URL/api/pull -d '{"name": "qwen2.5:72b"}'
curl $OLLAMA_URL/api/pull -d '{"name": "llama3.1:8b"}'

# If Ollama is on VM:
gcloud compute ssh speakeasy-ollama-vm --zone=us-central1-a
ollama pull qwen2.5:72b
ollama pull llama3.1:8b
```

### Issue: Out of Memory (Ollama)

**Symptoms**: Ollama crashes, OOMKilled in logs

**Solution**:
```bash
# Increase Ollama memory (if on Cloud Run)
gcloud run services update speakeasy-ollama \
  --memory=96Gi \
  --region=us-central1

# Or use a larger VM instance
gcloud compute instances stop speakeasy-ollama-vm --zone=us-central1-a
gcloud compute instances set-machine-type speakeasy-ollama-vm \
  --machine-type=n1-highmem-32 \
  --zone=us-central1-a
gcloud compute instances start speakeasy-ollama-vm --zone=us-central1-a
```

### Issue: High Cloud Costs

**Symptoms**: Unexpected billing

**Solution**:
```bash
# Scale backend to zero when not in use
gcloud run services update speakeasy-api \
  --min-instances=0 \
  --region=us-central1

# Scale Ollama to zero when not in use
gcloud run services update speakeasy-ollama \
  --min-instances=0 \
  --region=us-central1

# Or stop VM when not needed
gcloud compute instances stop speakeasy-ollama-vm --zone=us-central1-a

# Set budget alerts
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="SpeakEasy Budget Alert" \
  --budget-amount=100USD
```

### Issue: Mobile App Can't Connect to Backend

**Symptoms**: Network errors, connection refused

**Solution**:
1. Verify backend URL in `src/config/llm.config.js`
2. Check ENV is set correctly ('development' or 'production')
3. Ensure Cloud Run service allows unauthenticated requests
4. Test backend URL in browser or curl
5. Check for CORS issues in browser console (web app only)

```bash
# Verify service is accessible
curl https://your-backend-url.run.app/health

# Check Cloud Run IAM policy
gcloud run services get-iam-policy speakeasy-api \
  --region=us-central1
```

### Issue: CORS Errors (Web App)

**Symptoms**: Browser console shows CORS policy errors

**Solution**: The backend already has CORS enabled in `server.js`:
```javascript
app.use(cors());
```

If you need more specific CORS configuration:
```javascript
app.use(cors({
  origin: ['https://your-firebase-app.web.app', 'http://localhost:19006'],
  methods: ['GET', 'POST'],
  credentials: true
}));
```

---

## 🔒 Security Best Practices

### 1. API Authentication

Implement authentication to protect your backend API:

```bash
# Option 1: Cloud Run IAM (most secure)
gcloud run services update speakeasy-api \
  --no-allow-unauthenticated \
  --region=us-central1

# Option 2: API Key (simpler)
# Add middleware in backend/server.js (see Advanced Configuration section)
```

### 2. Secrets Management

Use Google Secret Manager for sensitive data:

```bash
# Create secret
gcloud secrets create speakeasy-api-key \
  --data-file=./api-key.txt \
  --replication-policy=automatic

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding speakeasy-api-key \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Use in Cloud Run deployment
gcloud run services update speakeasy-api \
  --region=us-central1 \
  --set-secrets=API_KEY=speakeasy-api-key:latest
```

### 3. Network Security

- **VPC Connector**: Restrict Ollama to private network
- **Cloud Armor**: Add DDoS protection and WAF rules
- **HTTPS Only**: Cloud Run enforces HTTPS by default

### 4. Rate Limiting

Prevent abuse with rate limiting:

```javascript
// In backend/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### 5. Input Validation

Validate all user inputs to prevent injection attacks:

```javascript
// Example validation middleware
const validateRequest = (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  if (prompt.length > 5000) {
    return res.status(400).json({ error: 'Prompt too long' });
  }

  next();
};
```

### 6. Monitoring and Alerting

Set up monitoring for security events:

```bash
# Alert on high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="SpeakEasy Security Alert" \
  --condition-threshold-value=10 \
  --condition-threshold-duration=60s
```

---

## 📚 Additional Resources

### Documentation

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Express.js Documentation](https://expressjs.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)

### Model Documentation

- [Qwen 2.5 Model Card](https://huggingface.co/Qwen/Qwen2.5-72B)
- [Llama 3.1 Documentation](https://ai.meta.com/llama/)

### Tools and Services

- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Expo Application Services](https://expo.dev/eas)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 🆘 Getting Help

### Debugging Checklist

1. **Check backend logs**:
   ```bash
   gcloud run services logs read speakeasy-api --region=us-central1 --limit=50
   ```

2. **Test backend health**:
   ```bash
   curl https://your-backend-url.run.app/health
   ```

3. **Verify Ollama connection**:
   ```bash
   curl $OLLAMA_URL/api/tags
   ```

4. **Check Cloud Build logs**:
   ```bash
   gcloud builds list --limit=5
   gcloud builds log BUILD_ID
   ```

5. **Verify billing and quotas**:
   - Check billing is enabled in Google Cloud Console
   - Verify you have sufficient quota for Cloud Run

### Common Issues

- Backend fails to connect to Ollama → Check OLLAMA_URL environment variable
- Out of memory → Increase memory allocation
- Request timeout → Increase timeout setting
- High costs → Set min-instances=0 for scale-to-zero

### Support

For issues or questions:
- **Backend API**: Check logs and health endpoint
- **Ollama**: Review Ollama server logs
- **Mobile App**: Test with Expo dev tools
- **Deployment**: Review Cloud Build and Cloud Run logs

---

## 📝 Quick Reference

### Useful Commands

```bash
# Deploy backend
cd /Users/scott/dev/speakeasy/backend
gcloud run deploy speakeasy-api --source . --region us-central1

# View logs
gcloud run services logs tail speakeasy-api --region=us-central1

# Update environment variables
gcloud run services update speakeasy-api \
  --set-env-vars OLLAMA_URL=https://new-url.com \
  --region=us-central1

# Test locally
cd /Users/scott/dev/speakeasy
npx expo start

# Build for production
eas build --platform all --profile production
```

### Architecture Summary

```
Mobile/Web App
    ↓
    ↓ HTTPS
    ↓
Express Backend (Cloud Run)
    ↓
    ↓ HTTP
    ↓
Ollama LLM Server (Cloud Run / VM / Local)
    ↓
    ↓ In-memory
    ↓
Qwen 2.5 72B + Llama 3.1 8B
```

---

**Built with ❤️ for SpeakEasy - Your AI-Powered Language Learning Companion**

**Ready to deploy?** Start with [Phase 1: Deploy Express Backend](#phase-1-deploy-express-backend-to-cloud-run)
