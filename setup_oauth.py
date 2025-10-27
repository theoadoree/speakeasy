#!/usr/bin/env python3
"""
Script to create Google OAuth 2.0 credentials for SpeakEasy
"""
import requests
import json
import os

# Google Cloud project details
PROJECT_ID = "modular-analog-476221-h8"
DOMAIN = "speakeasy-ai.app"
CLOUD_RUN_URL = "https://speakeasy-web-823510409781.us-central1.run.app"

def create_oauth_credentials():
    """Create OAuth 2.0 credentials for web application"""
    
    print("🔐 Setting up Google OAuth 2.0 credentials...")
    print(f"Project: {PROJECT_ID}")
    print(f"Domain: {DOMAIN}")
    print(f"Cloud Run URL: {CLOUD_RUN_URL}")
    
    print("\n📋 Manual Setup Instructions:")
    print("1. Go to: https://console.cloud.google.com/apis/credentials")
    print(f"2. Select project: {PROJECT_ID}")
    print("3. Click 'Create Credentials' > 'OAuth 2.0 Client IDs'")
    print("4. Choose 'Web application'")
    print("5. Add authorized origins:")
    print(f"   - {DOMAIN}")
    print(f"   - {CLOUD_RUN_URL}")
    print("6. Add authorized redirect URIs:")
    print(f"   - {DOMAIN}")
    print(f"   - {CLOUD_RUN_URL}")
    print("7. Copy the Client ID and update the code")
    
    print("\n🍎 Apple Sign In Setup:")
    print("1. Go to: https://developer.apple.com/account/resources/identifiers/list")
    print("2. Create new App ID: com.speakeasy.app")
    print("3. Enable 'Sign In with Apple'")
    print("4. Create Service ID: com.speakeasy.web")
    print("5. Configure domains and return URLs")
    print("6. Create private key for Sign In with Apple")
    
    print("\n⚙️ Environment Variables to Set:")
    print("gcloud run services update speakeasy-backend \\")
    print("  --region=us-central1 \\")
    print("  --set-env-vars=\"GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID\"")
    
    return True

if __name__ == "__main__":
    create_oauth_credentials()
