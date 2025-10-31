#!/bin/bash

# Firebase OAuth Quick Start Script
# Opens Firebase Console and displays OAuth setup instructions

set -e

PROJECT_ID="clicksclick-6e520"
GOOGLE_CLIENT_ID="151813176467-jqn1sjb8t4vq70qqbu1iibqacl1k2a9f.apps.googleusercontent.com"

echo ""
echo "🚀 Firebase OAuth Quick Start"
echo "=============================="
echo ""
echo "Project: $PROJECT_ID"
echo ""

# Function to open URL in default browser
open_url() {
    local url=$1
    if command -v open &> /dev/null; then
        open "$url"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$url"
    elif command -v start &> /dev/null; then
        start "$url"
    else
        echo "Please open this URL in your browser:"
        echo "$url"
    fi
}

echo "📋 GOOGLE OAUTH SETUP"
echo "====================="
echo ""
echo "Your Google OAuth Client ID:"
echo "  $GOOGLE_CLIENT_ID"
echo ""
echo "Steps:"
echo "  1. Opening Firebase Console..."
echo "  2. Click 'Add new provider' or select 'Google'"
echo "  3. Toggle 'Enable' to ON"
echo "  4. Add your support email"
echo "  5. Click 'Save'"
echo ""

read -p "Press Enter to open Firebase Authentication Providers page..." -r
open_url "https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"

echo ""
echo "⏳ Waiting for you to enable Google OAuth..."
read -p "Press Enter when you've enabled Google OAuth..." -r

echo ""
echo "✅ Google OAuth should now be enabled!"
echo ""

echo "📋 APPLE OAUTH SETUP (Optional)"
echo "================================"
echo ""
echo "Prerequisites:"
echo "  - Apple Developer Account (paid)"
echo "  - Services ID created in Apple Developer Portal"
echo "  - Private Key (.p8 file) for Sign in with Apple"
echo ""

read -p "Do you want to set up Apple OAuth now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Steps:"
    echo "  1. Opening Firebase Console..."
    echo "  2. Click 'Add new provider' or select 'Apple'"
    echo "  3. Toggle 'Enable' to ON"
    echo "  4. Enter your Services ID (e.g., com.fluentai.speakeasy)"
    echo "  5. Configure OAuth code flow (Recommended)"
    echo "  6. Add Team ID, Key ID, and upload Private Key"
    echo "  7. Click 'Save'"
    echo ""

    read -p "Press Enter to open Firebase Console..." -r
    open_url "https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"

    echo ""
    echo "Need help with Apple Developer setup?"
    read -p "Open Apple Developer Portal? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open_url "https://developer.apple.com/account/resources/identifiers/list"
        echo ""
        echo "In Apple Developer Portal:"
        echo "  1. Create/configure a Services ID"
        echo "  2. Enable 'Sign in with Apple'"
        echo "  3. Configure domains and return URLs"
        echo "  4. Create a Key for Sign in with Apple"
        echo "  5. Download the .p8 private key file"
    fi

    echo ""
    read -p "Press Enter when you've configured Apple OAuth..." -r
    echo ""
    echo "✅ Apple OAuth should now be configured!"
else
    echo ""
    echo "⏭️  Skipping Apple OAuth setup"
fi

echo ""
echo "🎉 OAuth Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "  1. Test Google OAuth in your app"
echo "  2. Test Apple OAuth in your app (if configured)"
echo "  3. Configure authorized domains for production"
echo "  4. Update your app's OAuth implementation"
echo ""
echo "📚 Documentation:"
echo "  - Full guide: ./OAUTH_CLI_SETUP.md"
echo "  - Firebase docs: https://firebase.google.com/docs/auth"
echo ""
echo "✅ Done!"
