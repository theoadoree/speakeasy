# SpeakEasy - Production Deployment Guide

Complete guide for deploying SpeakEasy's LLM backend to Google Cloud Run.

## 🎯 Overview

SpeakEasy uses a **hybrid deployment architecture**:
- **Development**: Local Ollama server on Mac M1 Max (64GB RAM)
- **Production**: Google Cloud Run with Ollama + Qwen2.5-72B + Llama 4-8B

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

## 🚀 Quick Deployment

### Option A: Automated Deployment (Recommended)

```bash
# 1. Navigate to project directory
cd /Users/scott/dev/speakeasy

# 2. Run deployment script
./cloud-run-deploy.sh

# 3. Wait for deployment (10-15 minutes for first deployment)
# Models will download automatically after deployment

# 4. Test the deployment
SERVICE_URL=$(gcloud run services describe speakeasy-llm \
  --region=us-central1 \
  --format='value(status.url)')

curl $SERVICE_URL/api/tags
```

### Option B: Manual Deployment

```bash
# 1. Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com

# 2. Build and deploy with Cloud Build
gcloud builds submit --config cloudbuild.yaml

# 3. Get service URL
gcloud run services describe speakeasy-llm \
  --region=us-central1 \
  --format='value(status.url)'
```

## 🧪 Local Development Setup

### Using Docker Compose (Recommended)

```bash
# Start Ollama server locally
docker-compose up -d

# Wait for models to download (first run only)
docker-compose logs -f ollama

# Test the server
curl http://localhost:11434/api/tags

# Stop the server
docker-compose down
```

### Using Native Ollama (Mac M1 Max)

```bash
# Install Ollama
brew install ollama

# Start Ollama service
ollama serve

# In a new terminal, pull models
ollama pull qwen2.5:72b    # ~40GB download
ollama pull llama3.3:8b    # ~4.7GB download

# Test
curl http://localhost:11434/api/tags
```

## ⚙️ Configuration

### Update LLM Config for Production

Edit `src/config/llm.config.js`:

```javascript
const LLM_CONFIG = {
  development: {
    qwen: {
      baseURL: 'http://localhost:11434',
      model: 'qwen2.5:72b',
    },
    llama: {
      baseURL: 'http://localhost:11434',
      model: 'llama3.3:8b',
    },
  },
  production: {
    qwen: {
      baseURL: 'https://speakeasy-llm-xxxxx-uc.a.run.app',  // Your Cloud Run URL
      model: 'qwen2.5:72b',
      temperature: 0.7,
      maxTokens: 4096,
    },
    llama: {
      baseURL: 'https://speakeasy-llm-xxxxx-uc.a.run.app',  // Your Cloud Run URL
      model: 'llama3.3:8b',
      temperature: 0.8,
      maxTokens: 2048,
    },
  },
};
```

### Environment Variables

Create `.env.production` (for React Native):

```bash
# LLM API URL
LLM_API_URL=https://speakeasy-llm-xxxxx-uc.a.run.app

# API Keys (if you add authentication later)
# LLM_API_KEY=your_api_key_here
```

## 💰 Cost Estimation

### Google Cloud Run Pricing

**Development (min-instances=0, pay-per-use):**
- Idle: ~$0/month (scales to zero)
- Active: ~$0.50-1.00/hour during usage

**Production (min-instances=1, always-on):**
- Base cost: ~$350-700/month (64GB RAM, 8 CPU, always-on)
- Per-request: Additional $0.0000024 per request
- Storage: ~$0.20/month for models
- Network egress: ~$0.12/GB

**Cost Optimization Tips:**
1. Set `min-instances=0` for development
2. Use `max-instances=1` for predictable costs
3. Enable autoscaling during off-peak hours
4. Consider using Preemptible/Spot instances for non-critical workloads

### Alternative: Cloud Run on GKE (Lower Cost)

For heavy usage, consider deploying to GKE (Google Kubernetes Engine):
- More cost-effective for always-on services
- Better GPU support
- More control over resources

## 🔧 Advanced Configuration

### Custom Cloud Run Settings

Edit `cloudbuild.yaml` to adjust resources:

```yaml
# Deploy to Cloud Run with custom settings
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'speakeasy-llm'
    - '--memory'
    - '64Gi'              # Adjust memory (minimum 64Gi for Qwen2.5-72B)
    - '--cpu'
    - '8'                 # Adjust CPU count
    - '--timeout'
    - '3600'              # Max request timeout (1 hour)
    - '--concurrency'
    - '10'                # Max concurrent requests per instance
    - '--min-instances'
    - '0'                 # Set to 1 for always-on, 0 for scale-to-zero
    - '--max-instances'
    - '3'                 # Maximum number of instances
```

### GPU Support (Optional, Recommended for Production)

Cloud Run with GPU support (currently in preview):

```bash
gcloud run deploy speakeasy-llm \
  --image gcr.io/YOUR_PROJECT/speakeasy-llm \
  --gpu 1 \
  --gpu-type nvidia-l4 \
  --memory 32Gi \
  --region us-central1
```

**Note**: GPU support may significantly improve performance and reduce costs for inference.

### Authentication (Optional)

Add authentication to protect your LLM endpoint:

```bash
# Deploy with authentication required
gcloud run deploy speakeasy-llm \
  --no-allow-unauthenticated

# Create service account for app
gcloud iam service-accounts create speakeasy-app

# Grant invoker role
gcloud run services add-iam-policy-binding speakeasy-llm \
  --member="serviceAccount:speakeasy-app@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

## 📊 Monitoring & Logging

### View Logs

```bash
# View recent logs
gcloud run services logs read speakeasy-llm \
  --region=us-central1 \
  --limit=50

# Follow logs in real-time
gcloud run services logs tail speakeasy-llm \
  --region=us-central1
```

### Monitoring Dashboard

View metrics in Google Cloud Console:
1. Navigate to Cloud Run > speakeasy-llm
2. Click "METRICS" tab
3. Monitor:
   - Request count
   - Request latency
   - Container CPU/memory utilization
   - Error rate

### Set Up Alerts

```bash
# Create alert for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="SpeakEasy High Error Rate" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

## 🔄 Updating the Deployment

### Deploy New Version

```bash
# Deploy updated version
./cloud-run-deploy.sh

# Or manually
gcloud builds submit --config cloudbuild.yaml
```

### Rollback to Previous Version

```bash
# List revisions
gcloud run revisions list \
  --service=speakeasy-llm \
  --region=us-central1

# Rollback to specific revision
gcloud run services update-traffic speakeasy-llm \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

## 🧪 Testing the Deployment

### Test Model Availability

```bash
SERVICE_URL="https://speakeasy-llm-xxxxx-uc.a.run.app"

# Check available models
curl $SERVICE_URL/api/tags

# Test Qwen2.5-72B
curl $SERVICE_URL/api/generate -d '{
  "model": "qwen2.5:72b",
  "prompt": "What is the capital of France?",
  "stream": false
}'

# Test Llama 4-8B
curl $SERVICE_URL/api/generate -d '{
  "model": "llama3.3:8b",
  "prompt": "Say hello in Spanish",
  "stream": false
}'
```

### Test from React Native App

```javascript
import IntelligentLLMService from './services/intelligentLLM';

// Test connection
const testLLM = async () => {
  try {
    const response = await IntelligentLLMService.executeTask(
      'quick_chat',
      'Hello, how are you?'
    );
    console.log('LLM Response:', response);
  } catch (error) {
    console.error('LLM Error:', error);
  }
};
```

## 🐛 Troubleshooting

### Issue: Models Not Loading

**Symptoms**: Service returns 404 or "model not found"

**Solution**:
```bash
# Check container logs
gcloud run services logs read speakeasy-llm --limit=100

# Models might still be downloading. Wait 10-15 minutes, then test again
curl $SERVICE_URL/api/tags
```

### Issue: Service Timeout

**Symptoms**: Requests timeout after 60 seconds

**Solution**:
```bash
# Increase timeout
gcloud run services update speakeasy-llm \
  --timeout=3600 \
  --region=us-central1
```

### Issue: Out of Memory

**Symptoms**: Container crashes, OOMKilled in logs

**Solution**:
```bash
# Increase memory allocation
gcloud run services update speakeasy-llm \
  --memory=96Gi \
  --region=us-central1
```

### Issue: High Costs

**Symptoms**: Unexpected billing

**Solution**:
```bash
# Scale to zero when not in use
gcloud run services update speakeasy-llm \
  --min-instances=0 \
  --region=us-central1

# Set maximum instances
gcloud run services update speakeasy-llm \
  --max-instances=1 \
  --region=us-central1
```

## 🔒 Security Best Practices

1. **Enable VPC Connector** (optional):
   - Restrict access to private network
   - Use Cloud SQL Auth Proxy for database connections

2. **Add API Authentication**:
   - Use Cloud Run IAM authentication
   - Or implement API key validation in app

3. **Secrets Management**:
   ```bash
   # Store secrets in Secret Manager
   gcloud secrets create llm-api-key --data-file=./api-key.txt

   # Grant Cloud Run access
   gcloud secrets add-iam-policy-binding llm-api-key \
     --member=serviceAccount:YOUR_SERVICE_ACCOUNT \
     --role=roles/secretmanager.secretAccessor
   ```

4. **HTTPS Only**: Cloud Run enforces HTTPS by default

## 📚 Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Ollama Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Qwen2.5 Model Card](https://huggingface.co/Qwen/Qwen2.5-72B)
- [Llama 3.3 Documentation](https://ai.meta.com/llama/)

## 🆘 Support

For issues or questions:
1. Check Cloud Build logs: `gcloud builds list --limit=5`
2. Review Cloud Run logs: `gcloud run services logs read speakeasy-llm`
3. Verify billing is enabled and quota is sufficient
4. Open issue on GitHub repository

---

**Built with ❤️ for SpeakEasy - Your AI-Powered Language Learning Companion**
