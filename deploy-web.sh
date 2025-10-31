#!/bin/bash

# SpeakEasy Web App Deployment Script
# Deploys the static web app to Google Cloud Run

set -e

echo "🚀 Deploying SpeakEasy Web App..."
echo ""

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo "❌ Not authenticated with gcloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set project
echo "📦 Setting project to modular-analog-476221-h8..."
gcloud config set project modular-analog-476221-h8

# Navigate to web directory
cd "$(dirname "$0")/web"

echo "🔨 Building and deploying web app..."
echo ""

# Deploy using Cloud Run
gcloud run deploy speakeasy-web \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 80 \
  --clear-base-image \
  --project modular-analog-476221-h8

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📱 Your web app is available at:"
echo "   https://speakeasy-web-823510409781.us-central1.run.app"
echo ""
echo "🌐 Custom domain (if configured):"
echo "   https://speakeasy-ai.app"
echo ""
