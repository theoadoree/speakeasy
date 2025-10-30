# 🗣️ SpeakEasy - Easy Commands

Quick reference for all the commands you need.

---

## 🚀 Quick Start

### Test Everything Works
```bash
npm test
```
This checks your backend is working correctly.

### Start the App
```bash
npm start
```
Then press:
- `i` for iOS
- `a` for Android
- `w` for Web

### Interactive Menu
```bash
./scripts/start-easy.sh
```
Shows a menu with all options.

---

## 📱 App Commands

| Command | What it does |
|---------|--------------|
| `npm start` | Start app (choose platform after) |
| `npm run ios` | Start on iOS directly |
| `npm run android` | Start on Android directly |
| `npm run web` | Start on Web directly |

---

## 🧪 Testing Commands

| Command | What it does |
|---------|--------------|
| `npm test` | Test backend health & auth |
| `npm run test:backend` | Same as above |

---

## 🔧 Backend Commands

| Command | What it does |
|---------|--------------|
| `npm run backend:local` | Run backend on localhost |
| `npm run backend:deploy` | Deploy backend to Cloud Run |

---

## 📊 Monitoring Commands

### View Backend Logs
```bash
gcloud run services logs read speakeasy-backend \
  --region us-central1 \
  --project modular-analog-476221-h8
```

### Check Backend Health
```bash
curl https://speakeasy-backend-823510409781.us-central1.run.app/health
```

---

## 🎯 Most Common Workflow

### 1. Test Backend
```bash
npm test
```

### 2. Start App
```bash
npm start
# Press 'w' for web (easiest for testing)
```

### 3. Create Account
- App opens to auth screen
- Fill in name, email, password
- Complete onboarding with language dropdowns
- Start learning!

---

## 🆘 If Something Breaks

### Backend Not Responding
```bash
# Check if backend is healthy
curl https://speakeasy-backend-823510409781.us-central1.run.app/health

# View logs
gcloud run services logs read speakeasy-backend --region us-central1
```

### App Won't Start
```bash
# Clear cache and restart
npm start -- --clear
```

### Auth Not Working
Enable Firebase Auth: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers

---

## 📚 More Info

- **Full deployment guide**: [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)
- **All changes made**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Database setup**: [DATABASE_SETUP.md](DATABASE_SETUP.md)
- **Enable real auth**: [SETUP_FIREBASE_AUTH.md](SETUP_FIREBASE_AUTH.md)
- **Quick start**: [QUICK_START.md](QUICK_START.md)

---

## ✨ What's New

✅ **Unified Auth Screen** - One screen for sign-in and sign-up
✅ **Language Dropdowns** - 17 native languages, 15 target languages
✅ **Cloud Database** - Firestore with real-time sync
✅ **Progress Tracking** - XP, streaks, achievements, leaderboards
✅ **Production Ready** - Deployed to Cloud Run

---

## 🎊 You're All Set!

Live Web App: https://speakeasy-ai.app (SSL certificate provisioning)
Backend: https://speakeasy-backend-823510409781.us-central1.run.app
Status: ✅ Healthy
Cost: FREE tier (1000+ users)

**Just run**: `npm test` then `npm start`

Or visit the live web app at **https://speakeasy-ai.app** (give it 5-15 minutes for SSL certificate to provision)
