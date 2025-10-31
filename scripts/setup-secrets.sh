#!/bin/bash
#
# Google Cloud Secret Manager Setup Script
#
# This script creates and manages secrets in Google Cloud Secret Manager
# Run this ONCE to set up your secrets before deploying to Cloud Run
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-modular-analog-476221-h8}"
REGION="${GCP_REGION:-us-central1}"

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Google Cloud Secret Manager Setup      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Project ID:${NC} $PROJECT_ID"
echo -e "${YELLOW}Region:${NC} $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${RED}❌ Error: Not authenticated with gcloud${NC}"
    echo "Run: gcloud auth login"
    exit 1
fi

# Set project
echo -e "${BLUE}📋 Setting project...${NC}"
gcloud config set project "$PROJECT_ID"

# Enable Secret Manager API
echo -e "${BLUE}🔧 Enabling Secret Manager API...${NC}"
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID" || true

# Function to create or update a secret
create_or_update_secret() {
    local SECRET_NAME=$1
    local SECRET_DESCRIPTION=$2
    local PROMPT_TEXT=$3

    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Setting up: ${SECRET_NAME}${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "Description: $SECRET_DESCRIPTION"
    echo ""

    # Check if secret exists
    if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Secret '$SECRET_NAME' already exists${NC}"
        read -p "Do you want to update it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}⏭️  Skipping $SECRET_NAME${NC}"
            return
        fi
    else
        # Create the secret
        echo -e "${BLUE}📝 Creating secret...${NC}"
        gcloud secrets create "$SECRET_NAME" \
            --replication-policy="automatic" \
            --project="$PROJECT_ID" \
            --labels="app=speakeasy,managed-by=script"
    fi

    # Prompt for secret value
    echo "$PROMPT_TEXT"
    read -sp "Enter value (hidden): " SECRET_VALUE
    echo ""

    if [ -z "$SECRET_VALUE" ]; then
        echo -e "${RED}❌ Empty value provided, skipping...${NC}"
        return
    fi

    # Add secret version
    echo -e "${BLUE}💾 Storing secret value...${NC}"
    echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" \
        --data-file=- \
        --project="$PROJECT_ID"

    echo -e "${GREEN}✅ Secret '$SECRET_NAME' configured successfully${NC}"
}

# Main setup

echo ""
echo -e "${BLUE}🔐 Setting up secrets...${NC}"
echo ""
echo "This script will help you set up the following secrets:"
echo "  1. Google OAuth Client ID (Web SDK)"
echo "  2. OpenAI API Key"
echo "  3. Apple Private Key (Base64)"
echo "  4. Stripe Secret Key"
echo "  5. JWT Secret"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# 1. Google OAuth Client ID (Web SDK)
create_or_update_secret \
    "google-client-id" \
    "Google OAuth client ID used by the web SDK" \
    "Get this from Google Cloud Console → APIs & Services → Credentials"

# 2. OpenAI API Key
create_or_update_secret \
    "openai-api-key" \
    "OpenAI API key for AI language features" \
    "Get this from: https://platform.openai.com/api-keys"

# 3. Apple Private Key
create_or_update_secret \
    "apple-private-key" \
    "Apple Sign In private key (Base64 encoded)" \
    "Convert your .p8 file: base64 -i AuthKey_XXX.p8 | tr -d '\n'"

# 4. Stripe Secret Key
create_or_update_secret \
    "stripe-secret-key" \
    "Stripe secret key for subscription payments" \
    "Get this from: https://dashboard.stripe.com/apikeys"

# 5. JWT Secret
create_or_update_secret \
    "jwt-secret" \
    "Secret key for JWT token signing" \
    "Generate a random secret: openssl rand -base64 32"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Secret setup complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Grant Cloud Run service account access to secrets
echo -e "${BLUE}🔑 Granting Cloud Run access to secrets...${NC}"

SERVICE_ACCOUNT="${PROJECT_ID}-compute@developer.gserviceaccount.com"

for SECRET_NAME in "google-client-id" "openai-api-key" "apple-private-key" "stripe-secret-key" "jwt-secret"; do
    echo "  - Granting access to $SECRET_NAME..."
    gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --project="$PROJECT_ID" &> /dev/null || true
done

echo -e "${GREEN}✅ Permissions configured${NC}"
echo ""

# List all secrets
echo -e "${BLUE}📋 Current secrets:${NC}"
gcloud secrets list --project="$PROJECT_ID" --format="table(name,createTime,labels)"
echo ""

echo -e "${GREEN}🎉 All done!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Deploy your backend: ./scripts/deploy-backend.sh"
echo "  2. Verify secrets are loaded: curl https://your-backend-url/health"
echo ""
echo -e "${YELLOW}To update a secret later:${NC}"
echo "  echo -n 'new-value' | gcloud secrets versions add SECRET_NAME --data-file=-"
echo ""
echo -e "${YELLOW}To view a secret (requires permission):${NC}"
echo "  gcloud secrets versions access latest --secret=SECRET_NAME"
echo ""
