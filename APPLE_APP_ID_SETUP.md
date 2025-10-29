# Apple Sign In Setup - Correct App ID Names

## 🍎 Apple App ID Naming Requirements

Apple App IDs must follow these rules:
- **Only alphanumeric characters** (a-z, A-Z, 0-9)
- **No special characters** except dots (.)
- **No spaces**
- **Must be unique** across all Apple Developer accounts

## ✅ Valid App ID Examples:

**For iOS App:**
```
com.speakeasy.app
com.speakeasy.ios
com.speakeasy.mobile
speakeasy.app
speakeasy.ios
```

**For Web Service:**
```
com.speakeasy.web
com.speakeasy.service
com.speakeasy.api
speakeasy.web
speakeasy.service
```

## ❌ Invalid App ID Examples:
```
com.speakeasy.app (if it contains spaces or special chars)
com.speakeasy-app
com.speakeasy_app
com.speakeasy app
speakeasy@app
```

## 🔧 Apple Developer Console Setup:

### 1. Create App ID (iOS):
1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click "+" → "App IDs"
3. Choose "App" type
4. **Bundle ID:** `com.speakeasy.app` (or your preferred valid name)
5. **Description:** "SpeakEasy iOS App"
6. Enable "Sign In with Apple" capability

### 2. Create Service ID (Web):
1. Click "+" → "Services IDs"
2. **Identifier:** `com.speakeasy.web` (or your preferred valid name)
3. **Description:** "SpeakEasy Web Service"
4. Enable "Sign In with Apple"
5. **Primary App ID:** Select the App ID from step 1
6. **Domains:** `speakeasy-ai.app`
7. **Return URLs:** `https://speakeasy-ai.app`

### 3. Create Private Key:
1. Go to "Keys" → "Sign In with Apple"
2. Click "+" to create new key
3. **Key Name:** "SpeakEasy Sign In Key"
4. Enable "Sign In with Apple"
5. **Primary App ID:** Select the App ID from step 1
6. Download the `.p8` key file
7. Note the **Key ID** and **Team ID**

### 4. Configure Server-to-Server Notifications:
1. In your Service ID configuration
2. **Server-to-Server Notification Endpoint:** 
   ```
   https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/apple/notification
   ```

## ⚙️ Environment Variables:

Set these in Cloud Run:
```bash
gcloud run services update speakeasy-backend \
  --region=us-central1 \
  --set-env-vars="APPLE_TEAM_ID=YOUR_TEAM_ID,APPLE_KEY_ID=YOUR_KEY_ID,APPLE_CLIENT_ID=com.speakeasy.web,APPLE_PRIVATE_KEY=YOUR_PRIVATE_KEY"
```

## 🎯 Current Configuration:

The backend is already configured with:
- **Service ID:** `com.speakeasy.web` ✅ (valid format)
- **Notification Endpoint:** Ready to receive Apple notifications
- **JWT Verification:** Implemented with fallback for demo

## 📝 Next Steps:

1. **Choose your App ID names** (must be unique)
2. **Create them in Apple Developer Console**
3. **Update environment variables** in Cloud Run
4. **Test Apple Sign In** on https://speakeasy-ai.app

**The backend is ready - just need the Apple Developer Console setup!** 🚀
