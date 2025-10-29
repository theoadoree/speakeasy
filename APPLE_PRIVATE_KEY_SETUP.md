# Apple Private Key Setup Guide

## 🔑 What is the Apple Private Key?

The Apple private key is a **cryptographic key file** (.p8 format) that:
- **Verifies Apple JWT tokens** on your backend
- **Authenticates your app** with Apple's servers
- **Enables server-to-server communication** with Apple

## 📋 Step-by-Step Setup:

### 1. Create Private Key in Apple Developer Console

1. **Go to:** https://developer.apple.com/account/resources/identifiers/list
2. **Click:** "Keys" in the left sidebar
3. **Click:** "+" to create a new key
4. **Fill out:**
   - **Key Name:** "SpeakEasy Sign In Key"
   - **Services:** Check "Sign In with Apple"
   - **Primary App ID:** Select `com.speakeasy.webapp`
5. **Click:** "Continue" → "Register"

### 2. Download and Get Key Information

1. **Click:** "Download" to get the `.p8` file
2. **Important:** This file can only be downloaded **once**
3. **Note the Key ID:** (10-character string like `ABC123DEF4`)
4. **Open the .p8 file** in a text editor

### 3. Extract Private Key Content

The `.p8` file contains something like:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----
```

**Copy the entire content** including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines.

### 4. Set Environment Variables

Set these in Cloud Run:
```bash
gcloud run services update speakeasy-backend \
  --region=us-central1 \
  --set-env-vars="APPLE_KEY_ID=YOUR_KEY_ID,APPLE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----'"
```

**Note:** The private key must be wrapped in single quotes and include the full content.

### 5. Alternative: Use Base64 Encoding

If the private key is too long for environment variables, you can base64 encode it:

```bash
# Encode the private key
base64 -i AuthKey_ABC123DEF4.p8

# Set as environment variable
gcloud run services update speakeasy-backend \
  --region=us-central1 \
  --set-env-vars="APPLE_PRIVATE_KEY_BASE64=YOUR_BASE64_ENCODED_KEY"
```

## 🔧 Current Configuration:

**✅ Google OAuth Client ID:** `104945732492517782503.apps.googleusercontent.com`
**✅ Apple Team ID:** `E7B9UE64SF`
**✅ Apple App ID:** `com.speakeasy.webapp`
**⚠️ Apple Key ID:** Need to get from Apple Developer Console
**⚠️ Apple Private Key:** Need to download and configure

## 🎯 What You Need to Provide:

1. **Apple Key ID:** (10-character string from Apple Developer Console)
2. **Apple Private Key:** (Contents of the .p8 file)

## 🚀 Once Configured:

- **Apple Sign In** will work with full JWT verification
- **Server-to-server notifications** will be properly authenticated
- **User sessions** will be securely managed

## 📞 Need Help?

The Apple private key is the final piece needed for full Apple Sign In functionality. Once you have it, the authentication will be production-ready!
