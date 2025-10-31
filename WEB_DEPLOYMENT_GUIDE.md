# Web App Deployment Guide

## 🚨 Authentication Issue

The deployment requires Google Cloud authentication. Here's how to fix it:

---

## 🔧 Quick Fix

### Option 1: Authenticate with gcloud (Recommended)

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set the project
gcloud config set project modular-analog-476221-h8

# 3. Deploy the web app
./deploy-web.sh
```

### Option 2: Manual Deployment

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Navigate to web directory
cd web

# 3. Deploy
gcloud run deploy speakeasy-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --project=modular-analog-476221-h8
```

---

## 📋 Step-by-Step Instructions

### Step 1: Authenticate

```bash
gcloud auth login
```

This will:
1. Open a browser window
2. Ask you to select your Google account
3. Grant permissions to gcloud

### Step 2: Verify Authentication

```bash
gcloud auth list
```

You should see your account marked as `ACTIVE`

### Step 3: Deploy

Run the deployment script:

```bash
./deploy-web.sh
```

Or manually:

```bash
cd web
gcloud run deploy speakeasy-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --project=modular-analog-476221-h8
```

---

## 🎯 What Gets Deployed

The deployment will:
1. Build a Docker image from `web/Dockerfile`
2. Push the image to Google Container Registry
3. Deploy to Cloud Run as `speakeasy-web`
4. Make it publicly accessible

### Files Deployed:
- ✅ `web/index.html` - Updated with Firebase OAuth Client ID
- ✅ `web/nginx.conf` - Web server configuration
- ✅ `web/Dockerfile` - Container configuration

---

## 📱 Deployment URLs

Once deployed, your web app will be available at:

**Primary URL**:
```
https://speakeasy-web-823510409781.us-central1.run.app
```

**Custom Domain** (if configured):
```
https://speakeasy-ai.app
```

---

## 🧪 Testing After Deployment

### 1. Check Health

```bash
curl https://speakeasy-web-823510409781.us-central1.run.app
```

### 2. Test Google OAuth

1. Visit: https://speakeasy-web-823510409781.us-central1.run.app
2. Click "Continue with Google"
3. Verify login works

### 3. Test Apple Sign In

1. Visit: https://speakeasy-web-823510409781.us-central1.run.app
2. Click "Continue with Apple"
3. Verify login works (after Apple Developer setup)

---

## 🔍 Verify Deployment

```bash
# Check Cloud Run service
gcloud run services describe speakeasy-web \
  --region us-central1 \
  --project modular-analog-476221-h8

# Get the URL
gcloud run services describe speakeasy-web \
  --region us-central1 \
  --project modular-analog-476221-h8 \
  --format='value(status.url)'
```

---

## 📊 Deployment Status

| Item | Status |
|------|--------|
| **index.html** | ✅ Updated with Firebase Client ID |
| **OAuth Config** | ✅ Firebase Auth Handler configured |
| **Docker Image** | ⏳ Ready to build |
| **Cloud Run** | ⏳ Needs authentication & deployment |

---

## 🐛 Troubleshooting

### "Not authenticated with gcloud"

**Fix**:
```bash
gcloud auth login
```

### "Permission denied"

**Fix**:
```bash
# Make sure you're using the correct Google account
gcloud auth list

# Switch account if needed
gcloud config set account YOUR_EMAIL@gmail.com
```

### "Project not found"

**Fix**:
```bash
gcloud config set project modular-analog-476221-h8
```

### "Build failed"

**Check logs**:
```bash
gcloud run services logs read speakeasy-web \
  --region us-central1 \
  --project modular-analog-476221-h8
```

---

## ⚡ Quick Commands

```bash
# Deploy web app
./deploy-web.sh

# Check logs
gcloud run services logs read speakeasy-web --region us-central1

# Get service URL
gcloud run services describe speakeasy-web --region us-central1 --format='value(status.url)'

# Delete service (if needed)
gcloud run services delete speakeasy-web --region us-central1
```

---

## 📝 What's Updated in This Deployment

✅ **Google OAuth Client ID**: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`

✅ **Firebase Auth Handler**: `https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler`

✅ **Backend API**: `https://speakeasy-backend-823510409781.us-central1.run.app`

---

## ✅ After Deployment

Once deployed, you need to:

1. **Update Google OAuth Console** with the new URL:
   - Add: `https://speakeasy-web-823510409781.us-central1.run.app` to authorized origins

2. **Update Apple Developer** (if using Apple Sign In):
   - Add: `speakeasy-web-823510409781.us-central1.run.app` to domains
   - Add: `https://speakeasy-web-823510409781.us-central1.run.app` to return URLs

3. **Test the app**:
   - Visit the deployed URL
   - Try Google login
   - Try Apple login

---

## 🚀 Ready to Deploy!

Run this command:

```bash
gcloud auth login && ./deploy-web.sh
```

That's it! 🎉
