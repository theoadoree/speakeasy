#!/bin/bash

# Enable Google OAuth Provider in Firebase Authentication
# Uses Identity Platform API

set -e

PROJECT_ID="clicksclick-6e520"
GOOGLE_CLIENT_ID="151813176467-jqn1sjb8t4vq70qqbu1iibqacl1k2a9f.apps.googleusercontent.com"

echo "🔐 Enabling Google OAuth in Firebase Authentication"
echo "==================================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Client ID: $GOOGLE_CLIENT_ID"
echo ""

# Get access token
echo "🔑 Getting access token..."
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to get access token"
    echo "Run: gcloud auth application-default login"
    exit 1
fi

echo "✅ Access token obtained"
echo ""

# Get the Google OAuth client secret from Secret Manager
echo "🔒 Retrieving OAuth client secret from Secret Manager..."
CLIENT_SECRET=$(gcloud secrets versions access latest --secret="google-oauth-client-secret" --project="$PROJECT_ID" 2>/dev/null)

if [ -z "$CLIENT_SECRET" ]; then
    echo "⚠️  Google OAuth client secret not found in Secret Manager"
    echo ""
    echo "To add the secret, run:"
    echo "  echo -n 'YOUR_CLIENT_SECRET' | gcloud secrets create google-oauth-client-secret --data-file=- --project=$PROJECT_ID"
    echo ""
    echo "Or add it manually via Secret Manager:"
    echo "  https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
    echo ""
    exit 1
fi

echo "✅ Client secret retrieved"
echo ""

# Enable Google OAuth provider
echo "🔧 Enabling Google OAuth provider..."
echo ""

RESPONSE=$(curl -s -X PATCH \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/$PROJECT_ID/defaultSupportedIdpConfigs/google.com" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"projects/$PROJECT_ID/defaultSupportedIdpConfigs/google.com\",
    \"enabled\": true,
    \"clientId\": \"$GOOGLE_CLIENT_ID\",
    \"clientSecret\": \"$CLIENT_SECRET\"
  }")

# Check if successful
if echo "$RESPONSE" | grep -q '"enabled":true'; then
    echo "✅ Google OAuth provider enabled successfully!"
    echo ""
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "🎉 Configuration complete!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Test Google Sign-In in your app"
    echo "  2. Configure authorized domains for production"
    echo "  3. Set up OAuth consent screen branding"
    echo ""
    echo "🌐 Firebase Console:"
    echo "  https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
    echo ""
else
    echo "❌ Failed to enable Google OAuth provider"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "📝 Try manual configuration:"
    echo "  https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
    echo ""
    exit 1
fi
