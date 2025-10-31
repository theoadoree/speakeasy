# Social Authentication - Quick Start Guide

## ✅ What's Already Done

The entire authentication system has been implemented and deployed:

- ✅ Backend deployed to Cloud Run
- ✅ Apple & Google auth endpoints working
- ✅ Login screen updated with social buttons
- ✅ Signup screen updated with social buttons
- ✅ Platform detection (iOS/Android/Web)
- ✅ Auto account creation on first sign-in

## 🚀 Quick Commands

### Test Backend
```bash
node scripts/test-social-auth.js
```

### Run App
```bash
# iOS
npm run ios

# Android  
npm run android

# Web
npm run web
```

### View Logs
```bash
gcloud run logs read speakeasy-backend --project=modular-analog-476221-h8 --limit=20
```

### Redeploy Backend
```bash
npm run backend:deploy
```

## 🔧 What You Need to Do

### 1. Enable Firebase Providers (5 minutes)

1. Go to: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers
2. Click **Google** → Enable → Save
3. Click **Apple** → Enable → Add your Apple credentials → Save

### 2. Configure Apple Developer (10 minutes)

**Only if you want Apple Sign-In to work in production**

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Create App ID for `com.scott.speakeasy` with Sign In with Apple
3. Create Service ID for `com.speakeasy.webapp`
4. Create Sign In Key and download .p8 file
5. Upload to Secret Manager:
   ```bash
   cat AuthKey_*.p8 | base64 | gcloud secrets create APPLE_PRIVATE_KEY_BASE64 \
     --data-file=- --project=modular-analog-476221-h8
   ```

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed steps.

## 📱 How to Test

### iOS (Apple Sign-In)
1. Run `npm run ios`
2. Tap "🍎 Continue with Apple"
3. Authenticate with Apple ID
4. You're logged in!

### Android (Google Sign-In)
1. Run `npm run android`
2. Tap "G Continue with Google"
3. Select Google account
4. You're logged in!

### Web (Both)
1. Run `npm run web`
2. Try either Apple or Google button
3. Complete auth in popup
4. You're logged in!

## 🐛 Troubleshooting

### "Apple Sign In not available"
- Normal on Android (not supported)
- On iOS: Make sure app.json has `usesAppleSignIn: true`
- On Web: Make sure Firebase providers are enabled

### "Google Sign In failed"
- Check Firebase Console has Google provider enabled
- Verify client IDs in src/services/auth.js match your project

### "Backend error"
- Check backend logs: `gcloud run logs read speakeasy-backend --project=modular-analog-476221-h8`
- Test health: `curl https://speakeasy-backend-823510409781.us-central1.run.app/health`

## 📚 Documentation

- **Setup Guide**: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **Deployment Details**: [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- **Main README**: [README.md](README.md)

## 🔗 Quick Links

- **Backend**: https://speakeasy-backend-823510409781.us-central1.run.app
- **Firebase Console**: https://console.firebase.google.com/project/modular-analog-476221-h8
- **Apple Developer**: https://developer.apple.com/account/resources
- **Cloud Console**: https://console.cloud.google.com/run?project=modular-analog-476221-h8

## 💡 Key Features

✅ **One-Tap Sign-In**: Users can sign in with one tap
✅ **Auto Account Creation**: No separate signup needed
✅ **Cross-Platform**: Works on iOS, Android, and Web
✅ **Secure**: Uses provider tokens + JWT
✅ **Email Linking**: Same email = same account across providers

## 🎯 Status

- Backend: ✅ Deployed and tested
- Frontend: ✅ Updated and ready
- Firebase: ⏳ Needs provider enablement
- Apple Developer: ⏳ Optional (for production)

**Ready to use with email/password immediately!**
**Ready for social auth once Firebase providers are enabled!**
