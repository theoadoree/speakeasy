# Apple Sign In Credentials - What You Need

## 📋 Values to Enter in Google Cloud Identity Platform

You're configuring Apple Sign In in the **Fluent** project (`modular-analog-476221-h8`), which is CORRECT since your SpeakEasy app uses this Firebase project.

---

## 1️⃣ Services ID (Web Client ID)

**Value to enter**:
```
com.speakeasy.webapp
```

**What it is**: Your Apple Service ID for web-based Sign In with Apple

---

## 2️⃣ Apple Team ID

**Where to find it**:
1. Go to: https://developer.apple.com/account
2. Click **Membership** (left sidebar)
3. Look for **Team ID**

**Format**: 10 characters (e.g., `ABC123XYZ4` or `E7B9UE64SF`)

**Value to enter**: `[YOUR_TEAM_ID_FROM_APPLE]`

---

## 3️⃣ Key ID

**Where to get it**:
1. Go to: https://developer.apple.com/account/resources/authkeys/list
2. Click **+** to create a new key
3. **Key Name**: `SpeakEasy Sign In Key`
4. **Enable**: Sign in with Apple
5. Click **Configure**
6. **Primary App ID**: Select your app ID (or create one if needed)
7. Click **Continue** → **Register**
8. **Download** the `.p8` file (⚠️ **ONE-TIME DOWNLOAD - SAVE IT!**)
9. **Note the Key ID** displayed (10 characters, e.g., `ABC123DEF4`)

**Format**: 10 characters (e.g., `ABC123DEF4`)

**Value to enter**: `[YOUR_KEY_ID_FROM_APPLE]`

---

## 4️⃣ Private Key

**Where to get it**:
1. Open the `.p8` file you downloaded in Step 3
2. Copy the **entire contents** including the header and footer lines

**Format**:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
(multiple lines of encoded key)
...
-----END PRIVATE KEY-----
```

**Value to enter**: Paste the entire contents of the `.p8` file

---

## 📱 Bundle IDs (Already Configured)

I can see from your screenshot you already have:
- **Bundle ID 1**: `com.speakeasy.webapp` ✅

This is correct for web-based Apple Sign In.

---

## 🌐 Authorized Domains (Right Side Panel)

I can see you already have:
- `localhost` ✅
- `modular-analog-476221-h8.firebaseapp.com` ✅
- `modular-analog-476221-h8.web.app` ✅

**You should also add**:
```
speakeasy-ai.app
speakeasy-backend-823510409781.us-central1.run.app
speakeasy-web-823510409781.us-central1.run.app
```

Click **Add domain** to add each one.

---

## ✅ Step-by-Step Action Plan

### If you DON'T have an Apple Developer account yet:

1. **Sign up**: https://developer.apple.com/programs/
2. **Cost**: $99/year
3. **Wait**: Approval can take 24-48 hours

### If you DO have an Apple Developer account:

**Step 1: Get Team ID** (1 minute)
```
1. Visit: https://developer.apple.com/account
2. Click: Membership
3. Copy your Team ID (10 characters)
```

**Step 2: Create App ID** (2 minutes)
```
1. Visit: https://developer.apple.com/account/resources/identifiers/list
2. Click: + (Add)
3. Select: App IDs → Continue
4. Type: App → Continue
5. Description: SpeakEasy iOS
6. Bundle ID: com.scott.speakeasy (matches your app.json)
7. Capabilities: Check "Sign In with Apple"
8. Click: Continue → Register
```

**Step 3: Create Service ID** (3 minutes)
```
1. Visit: https://developer.apple.com/account/resources/identifiers/list
2. Click: + (Add)
3. Select: Services IDs → Continue
4. Description: SpeakEasy Web
5. Identifier: com.speakeasy.webapp
6. Check: Sign In with Apple
7. Click: Configure
8. Primary App ID: Select com.scott.speakeasy
9. Domains and Subdomains:
   - modular-analog-476221-h8.firebaseapp.com
   - speakeasy-ai.app
10. Return URLs:
   - https://modular-analog-476221-h8.firebaseapp.com/__/auth/handler
11. Click: Save → Continue → Register
```

**Step 4: Create Private Key** (2 minutes)
```
1. Visit: https://developer.apple.com/account/resources/authkeys/list
2. Click: + (Add)
3. Key Name: SpeakEasy Sign In Key
4. Check: Sign in with Apple
5. Click: Configure
6. Primary App ID: Select com.speakeasy.webapp
7. Click: Save → Continue → Register
8. Click: Download (⚠️ ONE-TIME DOWNLOAD!)
9. Save the .p8 file safely
10. Note the Key ID (shown on screen)
```

**Step 5: Enter Values in Google Cloud Console**
```
1. You're already there! (Identity Platform → Apple provider)
2. Services ID: com.speakeasy.webapp
3. Apple Team ID: [paste from Step 1]
4. Key ID: [paste from Step 4]
5. Private Key: [paste contents of .p8 file from Step 4]
6. Click: Save
```

**Step 6: Add Authorized Domains**
```
In the right panel "Authorized domains":
1. Click: Add domain
2. Enter: speakeasy-ai.app
3. Click: Add domain
4. Enter: speakeasy-backend-823510409781.us-central1.run.app
5. Click: Add domain
6. Enter: speakeasy-web-823510409781.us-central1.run.app
7. Configuration auto-saves
```

---

## ⏱️ Total Time Estimate

- **If you have Apple Developer account**: 10 minutes
- **If you need to create account**: 24-48 hours (for approval) + 10 minutes

---

## 🚨 Important Notes

1. **The .p8 file can only be downloaded ONCE** - Save it securely!
2. **Team ID is NOT your Apple ID** - It's a 10-character identifier for your developer account
3. **Service ID must match** what's in your code: `com.speakeasy.webapp`
4. **Don't share** your private key - it authenticates your app to Apple

---

## 💡 Quick Check

Before you start, verify you have:
- [ ] Apple Developer account (paid membership, $99/year)
- [ ] Access to https://developer.apple.com/account
- [ ] About 10 minutes to complete the setup

---

## 📞 Need Help?

If you get stuck:
1. Check if you're logged into the correct Apple Developer account
2. Make sure your membership is active (paid)
3. Verify you have the "Account Holder" or "Admin" role

---

Once you enter these values and click Save, Apple Sign In will work on your web app! 🎉
