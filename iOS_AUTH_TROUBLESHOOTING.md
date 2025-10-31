# iOS App Authentication Troubleshooting

## Current Status

✅ **App rebuilt and reinstalled** - Latest version with both Apple and Google Sign-In
✅ **Production backend deployed** - With token verification for both platforms
✅ **OAuth client IDs configured** - Both web and iOS clients

## You Should See Both Buttons

The iOS app has TWO sign-in options:

1. **Sign in with Apple** - Black button at the top
2. **Continue with Google** - White button below it

**If you only see one button**, try:
1. Force close the app (swipe up from app switcher)
2. Reopen the app
3. The buttons should both appear

## Test Authentication

### Google Sign-In
1. Tap "Continue with Google"
2. Select your Google account
3. You should see the orange debug message change
4. App should navigate to onboarding or main screen

**If you see "Google auth error":**
- Check the debug message (orange text below button)
- Let me know the exact error message

### Apple Sign-In
1. Tap "Sign in with Apple"
2. Authenticate with Face ID/Touch ID
3. You should see the orange debug message change
4. App should navigate to onboarding or main screen

## Debug Messages

The app shows authentication state in orange text below the buttons:

- `"Auth: false Loading: false"` - Not authenticated, ready to sign in
- `"Google Sign In started..."` - Google auth in progress
- `"Apple Sign In started..."` - Apple auth in progress
- `"Got Apple credentials, calling backend..."` - Sending to backend
- `"✅ Authenticated! Should navigate now..."` - SUCCESS!
- `"Backend error"` - Error from backend

## Check Backend Logs

If authentication fails, check what the backend received:

```bash
gcloud run services logs read speakeasy-backend \
  --region us-central1 \
  --limit 50 \
  --format="value(textPayload)"
```

Look for:
- `🔵 === GOOGLE AUTH REQUEST ===` - Google auth attempt
- `🍎 === APPLE AUTH REQUEST ===` - Apple auth attempt
- `❌ Google token verification failed` - Token error
- `✅ Google auth SUCCESS` - Successful auth

## Common Issues

### Issue 1: "Google auth error"
**Cause**: Token verification failed
**Fix**: Backend logs will show the exact error

### Issue 2: Apple button not showing
**Cause**: App not rebuilt with latest code
**Fix**: I just rebuilt and reinstalled - should be there now

### Issue 3: "Auth: false Loading: false" - doesn't change
**Cause**: App not reaching backend
**Fix**: Check internet connection, backend logs

### Issue 4: Authentication works but app doesn't navigate
**Cause**: `isAuthenticated` flag not being set
**Fix**: Check debug message - if it says "Backend error" there's an issue

## Production Backend Details

**URL**: `https://speakeasy-backend-823510409781.us-central1.run.app`

**Accepts tokens from**:
- Web client: `823510409781-7am96n366leset271qt9c8djo265u24n`
- iOS client: `823510409781-aqd90aoj080374pnfjultufdkk027qsp`

**Features**:
- ✅ Google token verification enabled
- ✅ Apple token verification enabled
- ✅ Proper error logging
- ✅ OpenAI GPT-4o-mini for LLM

## What To Do Now

1. **Open the SpeakEasy app on your iPhone**
2. **Look for BOTH buttons** (Apple and Google)
3. **Try signing in** with either one
4. **Watch the debug message** (orange text)
5. **Tell me**:
   - Do you see both buttons?
   - Which one did you try?
   - What was the exact error message?
   - Did the app navigate or stay on login screen?

I'll then check the backend logs to see what happened and fix any issues!
