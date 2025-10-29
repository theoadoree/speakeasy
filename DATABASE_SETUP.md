# Database Setup Guide

This guide explains the database structure and how to set up Firebase/Firestore for SpeakEasy.

## Overview

SpeakEasy uses **Google Cloud Firestore** as its primary database for storing:
- User accounts and profiles
- Learning progress (XP, streaks, lessons completed)
- Achievements and leagues
- Content library (stories, imported content)
- Leaderboards

## Why Firestore?

1. **Real-time synchronization** - Changes sync automatically across devices
2. **Offline support** - App works without internet, syncs when reconnected
3. **Scalability** - Handles millions of users without performance degradation
4. **Security** - Built-in security rules protect user data
5. **Cost-effective** - Free tier includes 1GB storage and 50K reads/day
6. **Firebase Auth integration** - Seamless authentication

## Database Structure

### Collections

#### 1. `users` Collection
Stores user account information and profiles.

```
users/{userId}
├── email: string
├── name: string
├── createdAt: timestamp
├── updatedAt: timestamp
├── profile: object
│   ├── targetLanguage: string
│   ├── nativeLanguage: string
│   ├── level: string (A1, A2, B1, B2, C1, C2)
│   └── interests: array<string>
└── progress: object
    ├── xp: number
    ├── streak: number
    ├── lessonsCompleted: number
    ├── wordsLearned: number
    └── timeSpent: number (in minutes)
```

#### 2. `users/{userId}/lessons` Subcollection
Stores completed lessons for each user.

```
users/{userId}/lessons/{lessonId}
├── lessonId: string
├── title: string
├── completedAt: timestamp
├── score: number
├── timeSpent: number
└── xpEarned: number
```

#### 3. `users/{userId}/achievements` Subcollection
Tracks unlocked achievements.

```
users/{userId}/achievements/{achievementId}
├── achievementId: string
├── unlockedAt: timestamp
└── progress: number (for progressive achievements)
```

#### 4. `content/{userId}/items` Subcollection
User's personal content library.

```
content/{userId}/items/{itemId}
├── id: string
├── type: string (story, article, custom)
├── title: string
├── content: string
├── language: string
├── difficulty: string
├── createdAt: timestamp
└── metadata: object
```

#### 5. `leaderboards/{leagueId}/users` Subcollection
Weekly leaderboards for each league.

```
leaderboards/{leagueId}/users/{userId}
├── userId: string
├── name: string
├── xp: number
├── rank: number (computed)
└── updatedAt: timestamp
```

**League IDs**: bronze, silver, gold, platinum, diamond, legendary

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `speakeasy-app` (or your preferred name)
4. Disable Google Analytics (optional for development)
5. Click "Create project"

### 2. Enable Firestore

1. In Firebase Console, click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in test mode" for development
4. Choose a location (e.g., `us-central1`)
5. Click "Enable"

### 3. Set Security Rules

1. In Firestore console, go to "Rules" tab
2. Replace the default rules with the contents of `firestore.rules`
3. Click "Publish"

### 4. Create Indexes

1. Go to "Indexes" tab in Firestore console
2. Firebase will automatically prompt you to create indexes when needed
3. Or manually create indexes from `firestore.indexes.json`

### 5. Enable Firebase Authentication

1. Click "Authentication" in left sidebar
2. Click "Get started"
3. Enable "Email/Password" provider
4. Click "Save"

### 6. Get Service Account Key (for backend)

1. Go to Project Settings (gear icon) > Service accounts
2. Click "Generate new private key"
3. Save the JSON file securely (DO NOT commit to git)
4. For local development:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
   ```
5. For Cloud Run: Upload as environment variable

### 7. Configure Environment Variables

**Frontend** (`/.env`):
```env
REACT_APP_API_URL=http://localhost:8080
```

**Backend** (`/backend/.env`):
```env
PORT=8080
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
FIREBASE_PROJECT_ID=your-project-id
```

## Data Migration

Current data is stored locally in AsyncStorage. To migrate to Firestore:

### Option 1: Manual Migration
Users will need to re-onboard and their local data will be uploaded to Firestore.

### Option 2: Batch Migration Script
Create a script to read AsyncStorage and upload to Firestore:

```javascript
// Example migration function
async function migrateUserData(userId) {
  const profile = await StorageService.getUserProfile();
  const progress = await StorageService.getUserProgress();
  const content = await StorageService.getContentLibrary();

  await db.collection('users').doc(userId).set({
    profile,
    progress,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Migrate content items
  for (const item of content) {
    await db.collection('content').doc(userId)
      .collection('items').doc(item.id).set(item);
  }
}
```

## Cost Estimation

Firebase Firestore free tier:
- **Storage**: 1 GB
- **Document reads**: 50,000/day
- **Document writes**: 20,000/day
- **Document deletes**: 20,000/day

For a typical user:
- **Onboarding**: ~3 writes
- **Lesson completion**: ~5 writes + 3 reads
- **Leaderboard view**: ~50 reads
- **Daily usage**: ~20 reads, ~10 writes

**Estimated cost for 1000 active users/day**: FREE (within limits)
**Estimated cost for 10,000 active users/day**: ~$5-10/month

## Production Deployment

### Deploy Backend to Google Cloud Run

```bash
cd backend
gcloud run deploy speakeasy-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=your-project-id \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

### Update Frontend API URL

Update `REACT_APP_API_URL` in frontend `.env`:
```env
REACT_APP_API_URL=https://speakeasy-backend-xxxxx.run.app
```

## Monitoring

1. **Firebase Console**: Monitor database usage and performance
2. **Cloud Logging**: View backend logs in Google Cloud Console
3. **Error Reporting**: Set up error tracking with Sentry or Firebase Crashlytics

## Security Best Practices

1. ✅ Use Firestore Security Rules to protect data
2. ✅ Validate auth tokens on backend before database operations
3. ✅ Never expose service account keys in client-side code
4. ✅ Use environment variables for sensitive configuration
5. ✅ Implement rate limiting on backend endpoints
6. ✅ Enable Firebase App Check to prevent abuse

## Backup & Recovery

1. Set up automated Firestore backups:
   ```bash
   gcloud firestore export gs://your-backup-bucket
   ```
2. Schedule daily backups with Cloud Scheduler
3. Test restore procedure regularly

## Alternative: Local Development Without Firebase

The backend includes mock mode for development without Firebase. To use:

1. Don't set `GOOGLE_APPLICATION_CREDENTIALS`
2. Backend will return mock data
3. Data stored locally in AsyncStorage
4. Great for testing UI/UX without Firebase setup

## Questions?

- Firebase Docs: https://firebase.google.com/docs/firestore
- Firestore Pricing: https://firebase.google.com/pricing
- Best Practices: https://firebase.google.com/docs/firestore/best-practices
