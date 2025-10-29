# 🎉 START HERE

Your SpeakEasy app is ready! Here's how to use it.

---

## ⚡ Quick Test (30 seconds)

```bash
npm test
```

This checks if everything is working. You should see:
```
✅ All tests passed (2/2)
🎉 Your backend is ready to use!
```

---

## 🚀 Start the App (1 minute)

```bash
npm start
```

Then press `w` for web (fastest for testing).

The app will open in your browser and you'll see:
1. **New unified auth screen** (sign in or sign up in one place)
2. **Language dropdowns** (tap to select, no typing!)
3. Your progress syncs to the cloud automatically

---

## 📱 What You Can Do Now

### Test the New Features

1. **Unified Auth**
   - Create account (or sign in if you have one)
   - Toggle between sign-in/sign-up modes
   - Notice: no separate screens to navigate!

2. **Language Dropdowns**
   - During onboarding, select native language
   - Choose 17 options (English, Spanish, French, etc.)
   - Select target language from 15 options
   - One tap selection (no typos!)

3. **Cloud Sync**
   - Complete a lesson
   - Your XP and progress save to Firestore
   - Check the leaderboard (League tab)
   - Your data persists across devices

---

## 🔗 Your URLs

**Backend API**:
```
https://speakeasy-backend-823510409781.us-central1.run.app
```

**Firebase Console**:
```
https://console.firebase.google.com/project/modular-analog-476221-h8
```

**Cloud Run Dashboard**:
```
https://console.cloud.google.com/run?project=modular-analog-476221-h8
```

---

## 📚 Need More Info?

Pick the guide you need:

- **[README_EASY.md](README_EASY.md)** ← All commands in one place
- **[QUICK_START.md](QUICK_START.md)** ← Step-by-step guide
- **[DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)** ← Full deployment details
- **[SETUP_FIREBASE_AUTH.md](SETUP_FIREBASE_AUTH.md)** ← Enable real Firebase Auth (optional)

---

## ✅ What's Done

✅ Native language dropdown (17 options)
✅ Target language dropdown (15 options)
✅ Unified sign-in/sign-up screen
✅ Firebase/Firestore database
✅ Backend deployed to Cloud Run
✅ Progress & XP tracking
✅ Leaderboards infrastructure
✅ Real-time sync across devices

---

## 🎯 Common Commands

| What you want | Command to run |
|---------------|----------------|
| Test backend | `npm test` |
| Start app | `npm start` |
| iOS simulator | `npm run ios` |
| Android emulator | `npm run android` |
| Web browser | `npm run web` |
| Deploy backend | `npm run backend:deploy` |

---

## 💡 Pro Tips

1. **Use web for fastest testing**: `npm start` then press `w`
2. **Test backend first**: `npm test` before starting app
3. **Mock auth mode**: Backend works without Firebase Auth enabled (for testing)
4. **Enable real auth**: Takes 5 min, see [SETUP_FIREBASE_AUTH.md](SETUP_FIREBASE_AUTH.md)

---

## 🆘 Having Issues?

### Backend not responding?
```bash
curl https://speakeasy-backend-823510409781.us-central1.run.app/health
```

### App won't start?
```bash
npm start -- --clear
```

### Auth errors?
Backend is in mock mode. Enable Firebase Auth:
https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers

---

## 🎊 You're Ready!

**Just run these two commands:**

```bash
npm test     # Check everything works
npm start    # Start the app
```

That's it! 🚀
