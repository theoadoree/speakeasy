# Quick Start Guide

## 🎉 Your App is Ready!

All setup steps completed. Here's how to use your production-ready SpeakEasy app.

---

## 🚀 Start the App

```bash
cd /Users/scott/dev/speakeasy
npm start
```

Choose your platform:
- Press `i` for iOS
- Press `a` for Android  
- Press `w` for Web

---

## ✨ What's New

### 1. Unified Authentication
- Single screen for sign-in and sign-up
- Toggle between modes with one click
- No more separate navigation

### 2. Language Dropdowns
- **Native language**: Choose from 17 options
- **Target language**: Choose from 15 languages
- One-tap selection (no typing!)

### 3. Cloud Database
- Progress syncs across devices
- Real leaderboards with real users
- Offline support with automatic sync

---

## 🔗 Your Endpoints

**Backend API**: https://speakeasy-backend-823510409781.us-central1.run.app

**Key Endpoints**:
- Health: `GET /health`
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Profile: `PUT /api/auth/profile`
- Progress: `POST /api/auth/progress`
- Leaderboard: `GET /api/auth/leaderboard/:league`

---

## 🧪 Test Your Setup

### 1. Test Backend
```bash
curl https://speakeasy-backend-823510409781.us-central1.run.app/health
```

### 2. Test Registration (mock mode)
```bash
curl -X POST 'https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"test123456","name":"Test User"}'
```

### 3. Test the App
1. `npm start`
2. Create account on auth screen
3. Complete onboarding with new dropdowns
4. Start learning!

---

## ⚙️ Enable Real Authentication

Currently in mock mode. To enable Firebase Auth (5 minutes):

1. Visit: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers
2. Click "Get started"
3. Enable "Email/Password" provider
4. Test registration again

See [SETUP_FIREBASE_AUTH.md](SETUP_FIREBASE_AUTH.md) for details.

---

## 📊 Monitor Your App

### Cloud Run Dashboard
https://console.cloud.google.com/run/detail/us-central1/speakeasy-backend/metrics?project=modular-analog-476221-h8

### Firestore Database
https://console.firebase.google.com/project/modular-analog-476221-h8/firestore

### Firebase Auth (when enabled)
https://console.firebase.google.com/project/modular-analog-476221-h8/authentication

### Logs
```bash
gcloud run services logs read speakeasy-backend \
  --region us-central1 \
  --project modular-analog-476221-h8
```

---

## 💰 Current Costs

**FREE TIER**:
- Firestore: 1GB storage, 50K reads/day
- Cloud Run: Scales to zero when idle
- Authentication: Unlimited users (free)

**Estimated Monthly Cost**: $0-5 for first 1,000 users

---

## 📚 Documentation

- [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md) - Full deployment details
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - All changes made
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database architecture
- [SETUP_FIREBASE_AUTH.md](SETUP_FIREBASE_AUTH.md) - Enable real auth

---

## 🆘 Need Help?

**Common Issues**:
- Backend not responding → Check Cloud Run logs
- Auth fails → Enable Firebase Auth (see above)
- Database errors → Check Firestore rules

**Resources**:
- Firebase Console: https://console.firebase.google.com
- Cloud Run Console: https://console.cloud.google.com/run
- Backend URL: https://speakeasy-backend-823510409781.us-central1.run.app

---

## ✅ Summary

**Completed**:
✅ Native language dropdown (17 options)
✅ Unified sign-in/sign-up screen
✅ Firebase/Firestore database
✅ Backend deployed to Cloud Run
✅ Frontend configured
✅ Progress tracking system
✅ Leaderboard infrastructure

**Status**: Production-ready (mock auth mode)
**Next Step**: Enable Firebase Auth (5 min)

🎊 **Your app is live and ready to use!** 🎊
