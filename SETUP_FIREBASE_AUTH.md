# Enable Firebase Authentication

## Quick Setup (5 minutes)

Your backend is currently running in **mock mode** for authentication. To enable real Firebase Authentication, follow these steps:

### Step 1: Go to Firebase Console

Visit: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/providers

### Step 2: Click "Get started"

If you see a "Get started" button, click it to initialize Firebase Authentication.

### Step 3: Enable Email/Password Provider

1. Click on "Email/Password" in the Sign-in providers list
2. Toggle "Enable" to ON
3. Click "Save"

### Step 4: Test the Setup

```bash
# Test registration endpoint
curl -X POST 'https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"test123456","name":"Test User"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "...",
      "email": "test@example.com",
      "name": "Test User"
    },
    "token": "..."
  }
}
```

### Step 5: Verify in Firebase Console

Go to: https://console.firebase.google.com/project/modular-analog-476221-h8/authentication/users

You should see your test user listed.

---

## Current Status

✅ Firebase project created
✅ Firestore database active
✅ Backend deployed to Cloud Run
⚠️ **Firebase Authentication needs to be enabled** (see steps above)

### Mock Mode

Until Firebase Authentication is enabled:
- The backend runs in **mock mode**
- Registration and login work locally but don't persist to Firebase
- Data is stored in Firestore, but auth tokens are temporary
- This allows you to test the app immediately

### After Enabling

Once Firebase Authentication is enabled:
- Real user accounts will be created
- JWT tokens will be managed by Firebase
- Users can sign in from any device
- Password reset functionality will work
- Secure authentication flow

---

## Optional: Add Social Sign-in

After enabling Email/Password authentication, you can also add:

### Google Sign-in
1. Click "Google" provider
2. Toggle "Enable"
3. Enter support email
4. Click "Save"

### Apple Sign-in
1. Click "Apple" provider
2. Toggle "Enable"
3. Enter your Apple Developer Team ID and Key ID
4. Upload your .p8 key file
5. Click "Save"

---

## Troubleshooting

**Q: I enabled Firebase Auth but still get errors**
- Wait 1-2 minutes for changes to propagate
- Check Cloud Run logs: `gcloud run services logs read speakeasy-backend --region us-central1`
- Verify the service account has `firebase.admin` role

**Q: How do I know if it's working?**
- Test the registration endpoint (see Step 4)
- Check for users in Firebase Console > Authentication
- Look for "Firebase Auth initialized" in Cloud Run logs

**Q: Can I use the app without enabling Firebase Auth?**
- Yes! Mock mode allows local testing
- Data is still saved to Firestore
- You can enable Firebase Auth anytime

---

## Summary

**Current Setup**:
- Backend: ✅ Deployed
- Firestore: ✅ Active
- Authentication: ⚠️ Mock mode (enable in 5 minutes)

**To Activate Real Auth**:
1. Visit Firebase Console
2. Enable Email/Password provider
3. Test registration endpoint
4. Done!

**Backend URL**: https://speakeasy-backend-823510409781.us-central1.run.app
**Firebase Console**: https://console.firebase.google.com/project/modular-analog-476221-h8
