#!/bin/bash

# SpeakEasy TestFlight Build Script
# This script builds and submits the app to TestFlight

set -e

echo "🚀 SpeakEasy TestFlight Build & Submit"
echo "========================================"
echo ""

# Check if EAS CLI is logged in
if ! eas whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to EAS"
    echo "Please run: eas login"
    exit 1
fi

echo "✅ Logged in to EAS as: $(eas whoami)"
echo ""

# Ask for confirmation
echo "This will:"
echo "  1. Build production iOS app (~30-60 min)"
echo "  2. Submit to TestFlight"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Build for iOS
echo ""
echo "📦 Building iOS app..."
echo "This will take 30-60 minutes depending on queue"
echo ""

eas build --platform ios --profile testflight

# Check if build succeeded
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed"
    echo "Check logs above for errors"
    exit 1
fi

echo ""
echo "✅ Build completed!"
echo ""

# Ask if user wants to submit now
read -p "Submit to TestFlight now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Submitting to TestFlight..."
    echo ""
    
    eas submit --platform ios --profile production --latest
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Success!"
        echo ""
        echo "Next steps:"
        echo "  1. Go to App Store Connect"
        echo "  2. Wait for build to process (~5-15 min)"
        echo "  3. Complete compliance questions"
        echo "  4. Add internal testers"
        echo "  5. Install TestFlight app and test!"
        echo ""
    else
        echo ""
        echo "❌ Submit failed"
        echo "You can submit manually with: eas submit --platform ios --latest"
    fi
else
    echo ""
    echo "Skipped submission"
    echo "To submit later, run: eas submit --platform ios --profile production --latest"
fi

echo ""
echo "Done! 🎉"
