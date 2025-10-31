#!/bin/bash

# Firebase OAuth Configuration Script
# This script configures Google and Apple OAuth providers for Firebase Authentication

set -e

PROJECT_ID="clicksclick-6e520"
REGION="us-central1"

echo "🔧 Firebase OAuth Configuration Script"
echo "========================================"
echo ""
echo "Project ID: $PROJECT_ID"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI found"
echo ""

# Check authentication
echo "🔐 Checking gcloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud"
    echo "Run: gcloud auth login"
    exit 1
fi

ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
echo "✅ Authenticated as: $ACCOUNT"
echo ""

# Set project
echo "📦 Setting active project..."
gcloud config set project $PROJECT_ID
echo ""

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable identitytoolkit.googleapis.com --project=$PROJECT_ID
gcloud services enable firebase.googleapis.com --project=$PROJECT_ID
echo "✅ APIs enabled"
echo ""

echo "📝 OAuth Provider Configuration"
echo "================================"
echo ""
echo "Firebase Authentication OAuth providers must be configured via:"
echo "1. Firebase Console (Web UI) - Recommended"
echo "2. Firebase Admin SDK (programmatic)"
echo "3. REST API (advanced)"
echo ""
echo "🌐 Opening Firebase Console..."
echo ""
echo "Configure OAuth providers at:"
echo "https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
echo ""

# Check if we can open the browser
if command -v open &> /dev/null; then
    read -p "Open Firebase Console in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
    fi
fi

echo ""
echo "📋 Configuration Steps:"
echo ""
echo "GOOGLE OAUTH:"
echo "-------------"
echo "1. In Firebase Console, go to Authentication > Sign-in method"
echo "2. Click 'Add new provider' or find 'Google' in the list"
echo "3. Enable the Google provider"
echo "4. Add your support email"
echo "5. (Optional) Add authorized domains"
echo "6. Save"
echo ""
echo "Your Google OAuth Client ID from Cloud Console:"
echo "151813176467-jqn1sjb8t4vq70qqbu1iibqacl1k2a9f.apps.googleusercontent.com"
echo ""

echo "APPLE OAUTH:"
echo "------------"
echo "1. In Firebase Console, go to Authentication > Sign-in method"
echo "2. Click 'Add new provider' or find 'Apple' in the list"
echo "3. Enable the Apple provider"
echo "4. Configure your Apple Developer credentials:"
echo "   - Services ID: com.fluentai.speakeasy"
echo "   - Team ID: (from your Apple Developer account)"
echo "   - Key ID: (from your Apple Developer account)"
echo "   - Private Key: (from your Apple Developer account)"
echo "5. Save"
echo ""

echo "📱 For Apple OAuth, you also need to:"
echo "1. Go to https://developer.apple.com/account/resources/identifiers/list"
echo "2. Create a Services ID (if not already created)"
echo "3. Configure Sign in with Apple capability"
echo "4. Add authorized domains and redirect URLs"
echo "5. Create a Key for Sign in with Apple"
echo "6. Download the private key (.p8 file)"
echo ""

echo "✅ Configuration script complete!"
echo ""
echo "Next steps:"
echo "1. Complete OAuth provider setup in Firebase Console"
echo "2. Update your app configuration with OAuth client IDs"
echo "3. Test authentication flows"
