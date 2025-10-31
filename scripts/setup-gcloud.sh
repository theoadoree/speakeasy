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
SA_NAME="gh-actions-cloudrun"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Creating service account for CI/CD..."
gcloud iam service-accounts create $SA_NAME \
    --display-name "GitHub Actions Cloud Run" \
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
    --role="roles/artifactregistry.admin" \
    --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/cloudbuild.builds.editor" \
    --condition=None

# Ensure Artifact Registry repository exists
AR_REPO="cloud-run"
echo ""
echo "Creating Artifact Registry repository (${AR_REPO}) if needed..."
gcloud artifacts repositories create $AR_REPO \
    --repository-format=DOCKER \
    --location=us-central1 \
    --description="Docker images for SpeakEasy Cloud Run services" \
    2>/dev/null || echo "Repository '${AR_REPO}' already exists"

# Configure Workload Identity Federation
POOL_ID="gh-oidc-pool"
PROVIDER_ID="gh-provider"

echo ""
echo "Configuring Workload Identity Federation..."

if ! gcloud iam workload-identity-pools describe $POOL_ID \
    --project=$PROJECT_ID \
    --location=global &>/dev/null; then
    gcloud iam workload-identity-pools create $POOL_ID \
        --project=$PROJECT_ID \
        --location=global \
        --display-name="GitHub OIDC Pool"
else
    echo "Workload Identity Pool '${POOL_ID}' already exists"
fi

if ! gcloud iam workload-identity-pools providers describe $PROVIDER_ID \
    --project=$PROJECT_ID \
    --location=global \
    --workload-identity-pool=$POOL_ID &>/dev/null; then
    gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID \
        --project=$PROJECT_ID \
        --location=global \
        --workload-identity-pool=$POOL_ID \
        --display-name="GitHub Provider" \
        --issuer-uri="https://token.actions.githubusercontent.com" \
        --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref"
else
    echo "OIDC provider '${PROVIDER_ID}' already exists"
fi

read -p "Enter your GitHub repository (owner/repo): " GITHUB_REPO

if [ -z "$GITHUB_REPO" ]; then
    echo "Error: GitHub repository cannot be empty"
    exit 1
fi

WIP_FULLNAME=$(gcloud iam workload-identity-pools describe $POOL_ID \
    --project=$PROJECT_ID \
    --location=global \
    --format='value(name)')

echo "Granting GitHub workload identity user permission..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
    --project=$PROJECT_ID \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${WIP_FULLNAME}/providers/${PROVIDER_ID}/attribute.repository:${GITHUB_REPO}" \
    2>/dev/null || echo "Workload identity binding already exists"

WI_PROVIDER_RESOURCE="${WIP_FULLNAME}/providers/${PROVIDER_ID}"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Add the following secrets to your GitHub repository:"
echo "   - GCP_PROJECT_ID: $PROJECT_ID"
echo "   - GCP_WORKLOAD_IDENTITY_PROVIDER: ${WI_PROVIDER_RESOURCE}"
echo "   - GCP_SERVICE_ACCOUNT_EMAIL: ${SA_EMAIL}"
echo "   - GCP_ARTIFACT_REPOSITORY: ${AR_REPO}"
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
echo "GitHub Actions can now authenticate with Workload Identity Federation (no JSON keys needed)."
