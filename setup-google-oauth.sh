#!/bin/bash

# Google OAuth Setup Script for SpeakEasy
# This script helps set up Google OAuth credentials for the SpeakEasy app

echo "🔧 Setting up Google OAuth for SpeakEasy..."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Please log in to Google Cloud first:"
    echo "   gcloud auth login"
    exit 1
fi

echo "✅ Google Cloud CLI is ready"
echo ""

# Get current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project selected. Please set a project:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Current project: $PROJECT_ID"
echo ""

# Enable required APIs
echo "🔌 Enabling required Google APIs..."
gcloud services enable oauth2.googleapis.com
gcloud services enable plus.googleapis.com
echo "✅ APIs enabled"
echo ""

# Create OAuth consent screen
echo "🛡️  Setting up OAuth consent screen..."
echo "Please visit: https://console.cloud.google.com/apis/credentials/consent"
echo "1. Choose 'External' user type"
echo "2. Fill in the required fields:"
echo "   - App name: SpeakEasy"
echo "   - User support email: your-email@example.com"
echo "   - Developer contact: your-email@example.com"
echo "3. Add scopes: profile, email"
echo "4. Add test users if needed"
echo ""

# Create OAuth 2.0 credentials
echo "🔑 Creating OAuth 2.0 credentials..."
echo "Please visit: https://console.cloud.google.com/apis/credentials"
echo "1. Click 'Create Credentials' > 'OAuth 2.0 Client IDs'"
echo "2. Choose 'Web application'"
echo "3. Name: SpeakEasy Web App"
echo "4. Authorized origins:"
echo "   - https://speakeasy-ai.app"
echo "   - https://speakeasy-web-823510409781.us-central1.run.app"
echo "   - http://localhost:3000 (for local development)"
echo "5. Authorized redirect URIs:"
echo "   - https://speakeasy-ai.app"
echo "   - https://speakeasy-web-823510409781.us-central1.run.app"
echo "   - http://localhost:3000 (for local development)"
echo ""

# Get the client ID
echo "📝 After creating the OAuth client, copy the Client ID and run:"
echo ""
echo "export GOOGLE_CLIENT_ID='YOUR_CLIENT_ID.apps.googleusercontent.com'"
echo ""
echo "Then update the following files:"
echo "1. web/index.html - Replace YOUR_GOOGLE_CLIENT_ID with your actual Client ID"
echo "2. backend/server-openai.js - Replace YOUR_GOOGLE_CLIENT_ID with your actual Client ID"
echo "3. Deploy the updated backend:"
echo "   cd backend && gcloud builds submit --config cloudbuild.yaml ."
echo ""

echo "🎯 Quick setup commands:"
echo ""
echo "# 1. Set your Google Client ID"
echo "export GOOGLE_CLIENT_ID='YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com'"
echo ""
echo "# 2. Update web frontend"
echo "sed -i 's/YOUR_GOOGLE_CLIENT_ID/YOUR_ACTUAL_CLIENT_ID/g' web/index.html"
echo ""
echo "# 3. Update backend"
echo "sed -i 's/YOUR_GOOGLE_CLIENT_ID/YOUR_ACTUAL_CLIENT_ID/g' backend/server-openai.js"
echo ""
echo "# 4. Deploy backend"
echo "cd backend && gcloud builds submit --config cloudbuild.yaml ."
echo ""
echo "# 5. Deploy web frontend"
echo "cd web && gcloud builds submit --config cloudbuild.yaml ."
echo ""

echo "✅ Setup complete! Follow the steps above to configure Google OAuth."