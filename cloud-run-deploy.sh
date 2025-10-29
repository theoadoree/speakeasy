#!/bin/bash

# SpeakEasy LLM Server - Cloud Run Deployment Script
# Deploys Ollama server with Qwen2.5-72B + Llama 4-8B to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 SpeakEasy LLM Server - Cloud Run Deployment${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: No GCP project configured${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${YELLOW}📋 Project ID: ${PROJECT_ID}${NC}"
echo ""

# Configuration
REGION=${REGION:-us-central1}
SERVICE_NAME=${SERVICE_NAME:-speakeasy-llm}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${YELLOW}⚙️  Configuration:${NC}"
echo "  Region: ${REGION}"
echo "  Service: ${SERVICE_NAME}"
echo "  Image: ${IMAGE_NAME}"
echo ""

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required Google Cloud APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    --project=${PROJECT_ID}

echo -e "${GREEN}✅ APIs enabled${NC}"
echo ""

# Build the container
echo -e "${YELLOW}🏗️  Building container image...${NC}"
gcloud builds submit \
    --config cloudbuild.yaml \
    --project=${PROJECT_ID} \
    --substitutions=_REGION=${REGION}

echo -e "${GREEN}✅ Container built and deployed${NC}"
echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --region=${REGION} \
    --format='value(status.url)' \
    --project=${PROJECT_ID} 2>/dev/null || echo "")

if [ -n "$SERVICE_URL" ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "  1. Wait 10-15 minutes for models to download (first deployment only)"
    echo "  2. Test the API: curl ${SERVICE_URL}/api/tags"
    echo "  3. Update src/config/llm.config.js with production URL:"
    echo "     production: { qwen: { baseURL: '${SERVICE_URL}', ... } }"
    echo ""
    echo -e "${YELLOW}💰 Cost Estimate:${NC}"
    echo "  - Cloud Run (64GB RAM, 8 CPU): ~\$0.50-2.00/hour (depending on usage)"
    echo "  - Storage (models): ~\$0.20/month"
    echo "  - Network egress: Variable"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "  - First model pull can take 30+ minutes for Qwen2.5-72B"
    echo "  - Set min-instances=0 in production to save costs when idle"
    echo "  - Monitor costs in Google Cloud Console"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check Cloud Build logs: https://console.cloud.google.com/cloud-build/builds"
    exit 1
fi
