# Firebase Configuration Files in SpeakEasy Repository

## Overview

Yes, there **are** Firebase configuration files in the SpeakEasy repository! This document provides a comprehensive inventory of all Firebase-related configuration files and their purposes.

## 📁 Configuration Files Inventory

### 1. **firebase.json** (Root)
**Location:** `/firebase.json`  
**Purpose:** Main Firebase project configuration file  
**Contains:**
- Hosting configuration for web deployment
- Firestore rules and indexes references
- Public directory configuration (`web/`)
- Routing rewrites for single-page application

```json
{
  "hosting": {
    "public": "web",
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### 2. **.firebaserc** (Root)
**Location:** `/.firebaserc`  
**Purpose:** Links local project to Firebase project  
**Contains:**
- Default Firebase project ID: `clicksclick-6e520`
- Project aliases configuration

```json
{
  "projects": {
    "default": "clicksclick-6e520"
  }
}
```

### 3. **firestore.rules** (Root)
**Location:** `/firestore.rules`  
**Purpose:** Firestore database security rules  
**Contains:**
- User authentication checks
- Read/write permissions for collections:
  - `/users/{userId}` - User data (owner-only access)
  - `/users/{userId}/progress` - Learning progress
  - `/users/{userId}/lessons` - User lessons
  - `/users/{userId}/achievements` - User achievements
  - `/leaderboards` - Public read, authenticated write
  - `/content/{userId}` - User content library

### 4. **firestore.indexes.json** (Root)
**Location:** `/firestore.indexes.json`  
**Purpose:** Firestore database indexes for query optimization  
**Contains:**
- Composite index for leaderboards (league + xp)
- Composite index for progress (userId + timestamp)

### 5. **src/config/firebase.config.js**
**Location:** `/src/config/firebase.config.js`  
**Purpose:** Firebase client SDK configuration for React Native app  
**Platform-Specific:**
- **Web:** Uses environment variables from `.env`
  - API Key: `AIzaSyAQKDl8VGUodzYe0Cq9sC3wzot6Hb4YVEI`
  - Project ID: `modular-analog-476221-h8`
  - Auth Domain: `modular-analog-476221-h8.firebaseapp.com`
- **iOS/Android:** Configuration loaded from native files
  - iOS: `GoogleService-Info.plist` (not in repo - needs to be downloaded)
  - Android: `google-services.json` (not in repo - needs to be downloaded)

### 6. **backend/firebase-config.js**
**Location:** `/backend/firebase-config.js`  
**Purpose:** Backend Firebase Admin SDK configuration  
**Contains:**
- Proxy to `init-secrets.js` for Firebase services
- Maintains backwards compatibility
- Exports Firebase Admin services (db, auth, admin)

### 7. **backend/init-secrets.js**
**Location:** `/backend/init-secrets.js`  
**Purpose:** Initialize Firebase Admin SDK with credentials  
**Behavior:**
- **Production (Cloud Run):** Loads service account from Google Cloud Secret Manager
- **Development:** Uses local credentials or environment variables
- Initializes Firebase Admin with:
  - Firestore database access
  - Firebase Authentication
  - Admin privileges for backend operations

## 🔐 Environment Variables

Firebase credentials are configured in `.env` file (see `.env.example` for template):

```bash
# Web App Firebase Config
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 📱 Mobile App Configuration Files

### ⚠️ NOT in Repository (Need to be Downloaded)

These files are **NOT** included in the repository and must be downloaded from Firebase Console:

1. **GoogleService-Info.plist** (iOS)
   - **Should be placed at:** `ios/SpeakEasy/GoogleService-Info.plist`
   - **Download from:** Firebase Console → Project Settings → iOS App
   - **Bundle ID:** `com.scott.speakeasy`

2. **google-services.json** (Android)
   - **Should be placed at:** `android/app/google-services.json`
   - **Download from:** Firebase Console → Project Settings → Android App
   - **Package Name:** (needs to be configured)

### Why These Files Are Missing

These files contain platform-specific credentials and are typically:
- **Not committed to version control** for security reasons
- **Downloaded individually** by each developer
- **Different for each environment** (development, staging, production)

## 🔧 Firebase Projects

The repository is configured to use **two different Firebase projects**:

1. **Default Project:** `clicksclick-6e520` (in `.firebaserc`)
2. **Web App Project:** `modular-analog-476221-h8` (in `firebase.config.js`)

**Note:** This may indicate a migration or separate projects for different platforms.

## 📚 Related Documentation

- **FIREBASE_SETUP.md** - Setup instructions for iOS/Android
- **FIREBASE_OAUTH_CONFIGURATION.md** - OAuth configuration guide
- **.env.example** - Environment variables template

## ✅ Setup Status

| Component | Status | Notes |
|-----------|--------|-------|
| Web Firebase Config | ✅ Complete | Configured in `firebase.config.js` |
| Firestore Rules | ✅ Complete | Security rules defined |
| Firestore Indexes | ✅ Complete | Query indexes configured |
| Backend Admin SDK | ✅ Complete | Using Secret Manager |
| iOS Config File | ❌ Missing | Needs `GoogleService-Info.plist` |
| Android Config File | ❌ Missing | Needs `google-services.json` |

## 🚀 Next Steps for Developers

To fully set up Firebase for mobile development:

1. Visit [Firebase Console](https://console.firebase.google.com)
2. Navigate to Project Settings
3. Download platform-specific config files:
   - For iOS: Download `GoogleService-Info.plist` → place in `ios/SpeakEasy/`
   - For Android: Download `google-services.json` → place in `android/app/`
4. Rebuild the project: `npx expo prebuild --clean`

See **FIREBASE_SETUP.md** for detailed instructions.

## 🔒 Security Notes

- API keys are present in the repository (in `firebase.config.js`)
- These keys should be **restricted** in Firebase Console
- Service account credentials are stored in Google Cloud Secret Manager (not in repo)
- Mobile config files should **NOT** be committed to public repositories

---

**Last Updated:** 2025-11-02  
**Firebase Projects:**
- `clicksclick-6e520` (default)
- `modular-analog-476221-h8` (web app)
