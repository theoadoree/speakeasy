#!/bin/bash
# Setup script for Google Cloud deployment
# Run this script to initialize your GCloud project for SpeakEasy deployment

set -e

echo "=== SpeakEasy Google Cloud Setup ==="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Prompt for project ID
read -p "Enter your Google Cloud Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "Error: Project ID cannot be empty"
    exit 1
fi

echo ""
echo "Setting up project: $PROJECT_ID"
echo ""

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required Google Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    compute.googleapis.com \
    secretmanager.googleapis.com

echo ""
echo "APIs enabled successfully!"
echo ""

# Create service account for GitHub Actions
SA_NAME="github-actions"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Creating service account for CI/CD..."
gcloud iam service-accounts create $SA_NAME \
    --display-name "GitHub Actions Deployment" \
    --description "Service account for automated deployments from GitHub Actions" \
    2>/dev/null || echo "Service account already exists"

# Grant necessary roles
echo "Granting IAM roles..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin" \
    --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin" \
    --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser" \
    --condition=None

# Create and download service account key
KEY_FILE="gcloud-sa-key.json"
echo "Creating service account key..."
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_EMAIL

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Add the following secrets to your GitHub repository:"
echo "   - GCP_PROJECT_ID: $PROJECT_ID"
echo "   - GCP_SA_KEY: (contents of $KEY_FILE)"
echo "   - OLLAMA_URL: Your Ollama server URL (e.g., http://your-ollama-server:11434)"
echo "   - EXPO_TOKEN: Your Expo access token (from expo.dev)"
echo ""
echo "2. Configure your custom domain in Google Cloud Console:"
echo "   - Go to Cloud Run > Domain Mappings"
echo "   - Add speakeasy-ai.app"
echo "   - Follow DNS configuration instructions"
echo ""
echo "3. Push to main branch to trigger deployment"
echo ""
echo "Service account key saved to: $KEY_FILE"
echo "⚠️  IMPORTANT: Keep this file secure and never commit it to git!"
echo ""
