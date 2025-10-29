#!/bin/bash
# Build mobile apps using Expo EAS
# Requires Expo account and EAS CLI

set -e

echo "=== SpeakEasy Mobile App Builder ==="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

# Check if logged in to Expo
if ! eas whoami &> /dev/null; then
    echo "Please log in to your Expo account:"
    eas login
fi

# Select platform
echo "Select platform to build:"
echo "1) iOS"
echo "2) Android"
echo "3) Both"
read -p "Enter choice (1-3): " choice

# Select build profile
echo ""
echo "Select build profile:"
echo "1) Development"
echo "2) Preview"
echo "3) Production"
echo "4) Production (Store)"
read -p "Enter choice (1-4): " profile_choice

case $profile_choice in
    1) PROFILE="development" ;;
    2) PROFILE="preview" ;;
    3) PROFILE="production" ;;
    4) PROFILE="production-store" ;;
    *) echo "Invalid choice"; exit 1 ;;
esac

echo ""
echo "Building with profile: $PROFILE"
echo ""

case $choice in
    1)
        echo "Building iOS app..."
        eas build --platform ios --profile $PROFILE
        ;;
    2)
        echo "Building Android app..."
        eas build --platform android --profile $PROFILE
        ;;
    3)
        echo "Building both iOS and Android apps..."
        eas build --platform all --profile $PROFILE
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=== Build Started! ==="
echo ""
echo "Monitor build progress at: https://expo.dev/accounts/[your-account]/projects/speakeasy/builds"
echo ""
