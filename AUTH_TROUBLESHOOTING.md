# Authentication Troubleshooting - Alternative Approach

## Current Situation

After hours of testing, both iOS and web app authentication are still failing with 400 errors from the backend.

## Root Cause Analysis

The backend logs show:
```
POST 400 /api/auth/apple
POST 400 /api/auth/google
```

This means the backend is receiving requests but rejecting them. The 400 status code indicates "Bad Request" - likely because the data format doesn't match what the backend expects.

## New Approach: Simple Debug Backend

I've created a **simple authentication backend** that:
- ✅ Accepts ANY data without verification
- ✅ Logs EVERYTHING it receives
- ✅ Always creates a session and returns success
- ✅ Shows us exactly what the iOS app is sending

This will help us identify the exact problem.

## Steps to Debug

### 1. Deploy Simple Backend (In Progress)

```bash
cd /Users/scott/dev/speakeasy
gcloud builds submit --tag gcr.io/modular-analog-476221-h8/speakeasy-backend backend/
gcloud run deploy speakeasy-backend \
  --image gcr.io/modular-analog-476221-h8/speakeasy-backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

### 2. Test iOS App

1. Open SpeakEasy app on iPhone
2. Try "Sign in with Apple"
3. Try "Continue with Google"

### 3. Check Backend Logs

```bash
gcloud run services logs read speakeasy-backend \
  --region us-central1 \
  --limit 50 \
  --format="value(textPayload)"
```

The logs will show:
- Exact request body from iOS app
- All headers
- What fields are present/missing

### 4. Fix the Data Format

Based on the logs, I'll update the iOS app to send data in the correct format.

## Alternative Solutions If This Doesn't Work

### Option A: Use Firebase Authentication

Instead of custom OAuth handling, use Firebase Auth:

**Pros:**
- Firebase handles all OAuth complexity
- Built-in token management
- Works with both iOS and web
- Well-documented and battle-tested

**Cons:**
- Need to set up Firebase project
- Requires SDK integration

### Option B: Simplify to Email/Password Only

Remove OAuth entirely and use simple email/password:

**Pros:**
- No OAuth complexity
- Full control over authentication
- Easier to debug

**Cons:**
- Users prefer social login
- Need password reset flow
- More security concerns

### Option C: Use Auth0 or Clerk

Use a third-party auth service:

**Pros:**
- Handles all OAuth flows
- Pre-built UI components
- Works out of the box

**Cons:**
- Monthly cost
- External dependency
- Less control

## What's Currently Deploying

I'm deploying `server-simple-auth.js` which will:
1. Accept any Apple Sign-In request
2. Accept any Google Sign-In request
3. Log everything to Cloud Run logs
4. Always return success with a valid token

This will definitively show us what the iOS app is sending vs what the backend expects.

## Expected Timeline

1. **Build completes** (~3-5 minutes)
2. **Deploy backend** (~1 minute)
3. **Test iOS app** (~1 minute)
4. **Check logs** (~1 minute)
5. **Identify issue** (~5 minutes)
6. **Fix iOS app** (~10 minutes)
7. **Test again** (~1 minute)

**Total: ~20-25 minutes to resolution**

## Current Backend Expectations

Looking at the code, here's what each endpoint expects:

### Google (/api/auth/google)
```javascript
{
  "idToken": "eyJhbGc...",  // Required!
  "name": "John Doe",       // Optional
  "email": "user@gmail.com", // Optional
  "imageUrl": "https://..."  // Optional
}
```

### Apple (/api/auth/apple)
```javascript
{
  "idToken": "eyJhbGc...",        // Optional (has fallback)
  "authorizationCode": "c1234...", // Optional
  "user": "apple_user_id",         // Required for fallback
  "name": "John Doe",              // Optional
  "email": "user@icloud.com"       // Optional
}
```

## What We Fixed in iOS App

We already updated the iOS app to send:
```swift
// Apple Sign-In
body["idToken"] = tokenString       // ✅ Added
body["authorizationCode"] = codeString // ✅ Added
body["user"] = credential.user      // ✅ Added
body["email"] = credential.email    // ✅ Added
body["name"] = nameString           // ✅ Added

// Google Sign-In
body["idToken"] = idToken           // ✅ Was already correct
```

But something is still wrong. The simple backend will show us what's actually being sent.
