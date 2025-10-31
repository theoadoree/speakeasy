# Google OAuth Setup - Step by Step

## ✅ Current Status

You're in the Google Identity Platform configuring the Google provider for the **Fluent** project (`modular-analog-476221-h8`).

**Google Provider**: ✅ Enabled
**Web Client ID**: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.gc`

---

## 🔧 Required Steps

### Step 1: Configure OAuth Consent Screen

1. **Click** the blue **"Configure screen"** button you see
2. **Fill in** the OAuth consent screen:

   **App information**:
   - App name: `SpeakEasy`
   - User support email: `shanchanatry@gmail.com` (or your email)
   - App logo: Upload from `assets/icon.png` (optional)

   **App domain** (optional):
   - Application home page: `https://speakeasy-ai.app`
   - Privacy policy: `https://speakeasy-ai.app/privacy` (if you have one)
   - Terms of service: `https://speakeasy-ai.app/terms` (if you have one)

   **Developer contact information**:
   - Email addresses: `shanchanatry@gmail.com`

3. **Click**: Save and Continue

4. **Add scopes**:
   - Click "Add or Remove Scopes"
   - Select: `email`, `profile`, `openid`
   - Click "Update"
   - Click "Save and Continue"

5. **Test users** (if app is in testing mode):
   - Add your email: `shanchanatry@gmail.com`
   - Click "Add"
   - Click "Save and Continue"

6. **Click**: Back to Dashboard

---

### Step 2: Add Authorized Domains

In the right panel "Authorized domains":

1. **Click**: Add domain
2. **Enter**: `speakeasy-ai.app`
3. **Click**: Add domain
4. **Enter**: `speakeasy-backend-823510409781.us-central1.run.app`
5. **Click**: Add domain
6. **Enter**: `speakeasy-web-823510409781.us-central1.run.app`

**Your authorized domains should be**:
- ✅ localhost
- ✅ modular-analog-476221-h8.firebaseapp.com
- ✅ modular-analog-476221-h8.web.app
- ➕ speakeasy-ai.app
- ➕ speakeasy-backend-823510409781.us-central1.run.app
- ➕ speakeasy-web-823510409781.us-central1.run.app

---

### Step 3: Save Configuration

1. **Click**: Save (at the bottom)
2. Wait for confirmation

---

### Step 4: Also Configure in Google Cloud Console

The Identity Platform configuration is good, but you also need to configure the OAuth 2.0 Client ID in Google Cloud Console:

1. **Go to**: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8

2. **Find**: OAuth 2.0 Client ID `823510409781-7am96n366leset271qt9c8djo265u24n`

3. **Click** on it to edit

4. **Add Authorized JavaScript origins**:
   ```
   https://modular-analog-476221-h8.firebaseapp.com
   https://speakeasy-ai.app
   https://speakeasy-backend-823510409781.us-central1.run.app
   https://speakeasy-web-823510409781.us-central1.run.app
   http://localhost:8081
   http://localhost:3000
   ```

5. **Add Authorized redirect URIs**:
   ```
   https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler
   https://speakeasy-ai.app
   https://speakeasy-ai.app/auth/callback
   https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/google/callback
   https://speakeasy-web-823510409781.us-central1.run.app
   http://localhost:8081
   http://localhost:3000/auth/callback
   ```

6. **Click**: Save

---

## 📋 Apple Provider (While You're Here)

Don't forget to also save your Apple configuration!

**Your Apple credentials**:
- Services ID: `com.speakeasy.webapp`
- Team ID: `7B9UE64SF`
- Key ID: `FD22H4T9UU`
- Private Key: (the content you pasted from the .p8 file)

**Make sure to**:
1. Go back to "Edit Apple provider"
2. Verify all fields are filled
3. Click "Save"

---

## ✅ Verification Checklist

After completing these steps:

- [ ] OAuth consent screen configured with app name "SpeakEasy"
- [ ] Scopes added: email, profile, openid
- [ ] All authorized domains added in Identity Platform
- [ ] OAuth 2.0 Client ID configured in Google Cloud Console
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added
- [ ] Apple provider saved with all credentials
- [ ] Google provider saved

---

## 🧪 Testing

Once configured, test Google OAuth:

```bash
# Run your app
npm run web

# Or
npm run ios
npm run android

# Click "Continue with Google"
# Should open popup and allow sign in
```

---

## 🔗 Quick Links

- **Identity Platform**: https://console.cloud.google.com/customer-identity/providers?project=modular-analog-476221-h8
- **OAuth Credentials**: https://console.cloud.google.com/apis/credentials?project=modular-analog-476221-h8
- **OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent?project=modular-analog-476221-h8

---

## 💡 Summary

**What you're doing**:
1. ✅ Configuring Google OAuth in Identity Platform (you're here now)
2. ⏳ Need to configure OAuth consent screen
3. ⏳ Need to add authorized domains
4. ⏳ Need to configure OAuth 2.0 Client ID in Google Cloud Console

**Total time**: ~10 minutes

Once complete, Google Sign In will work! 🎉
