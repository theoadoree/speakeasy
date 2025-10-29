#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🗣️  SpeakEasy - Quick Start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Choose what you want to do:"
echo ""
echo "1) 🧪 Test backend (quick check)"
echo "2) 📱 Start app on iOS"
echo "3) 🤖 Start app on Android"
echo "4) 🌐 Start app on Web"
echo "5) 🚀 Deploy backend to Cloud Run"
echo "6) 📊 View backend logs"
echo "7) 🔧 Start local backend server"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
  1)
    echo ""
    echo "🧪 Testing backend..."
    npm run test
    ;;
  2)
    echo ""
    echo "📱 Starting iOS app..."
    npm run ios
    ;;
  3)
    echo ""
    echo "🤖 Starting Android app..."
    npm run android
    ;;
  4)
    echo ""
    echo "🌐 Starting web app..."
    npm run web
    ;;
  5)
    echo ""
    echo "🚀 Deploying backend to Cloud Run..."
    npm run backend:deploy
    ;;
  6)
    echo ""
    echo "📊 Fetching backend logs..."
    gcloud run services logs read speakeasy-backend \
      --region us-central1 \
      --project modular-analog-476221-h8 \
      --limit 50
    ;;
  7)
    echo ""
    echo "🔧 Starting local backend..."
    npm run backend:local
    ;;
  *)
    echo ""
    echo "❌ Invalid choice"
    exit 1
    ;;
esac
