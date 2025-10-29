# SpeakEasy Authentication API

Complete authentication backend for SpeakEasy with OAuth (Apple & Google), JWT tokens, and RevenueCat subscription webhooks.

## Features

- **Apple Sign In**: Full OAuth verification
- **Google Sign In**: OAuth 2.0 token verification
- **JWT Authentication**: Secure token-based auth
- **Firebase Integration**: User data stored in Firestore
- **RevenueCat Webhooks**: Automatic subscription status sync
- **Email/Password Fallback**: Traditional authentication (optional)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install --save express cors dotenv jsonwebtoken bcrypt google-auth-library apple-signin-auth firebase-admin axios express-validator helmet morgan winston
npm install --save-dev nodemon jest
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `GOOGLE_CLIENT_ID` ✅ Already configured
- `REVENUECAT_API_KEY` ✅ Already configured
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `JWT_SECRET` - Random secret string (change in production!)
- `APPLE_BUNDLE_ID` - Your iOS app bundle identifier
- `APPLE_TEAM_ID` - Apple Developer Team ID
- `APPLE_KEY_ID` - Apple Sign In Key ID
- `APPLE_PRIVATE_KEY` - Apple Sign In private key (.p8 file)

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file and extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### 4. Configure Firebase Firestore

1. In Firebase Console, go to Firestore Database
2. Create database in production mode
3. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow users to read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      // Allow server to write
      allow write: if false;
    }
  }
}
```

### 5. Configure Apple Sign In (iOS)

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID with Sign in with Apple capability
3. Create a Key for Sign in with Apple:
   - Keys → Create a new key
   - Enable "Sign in with Apple"
   - Download the .p8 file
   - Note the Key ID and Team ID
4. Update `.env`:
   - `APPLE_BUNDLE_ID` = your app's bundle identifier
   - `APPLE_TEAM_ID` = your Team ID
   - `APPLE_KEY_ID` = your Key ID
   - `APPLE_PRIVATE_KEY` = contents of .p8 file

### 6. Configure RevenueCat Webhooks

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Navigate to your project → Integrations → Webhooks
3. Add webhook URL: `https://your-api-domain.com/webhooks/revenuecat`
4. Select events to send (select all)
5. Copy the webhook authorization header (optional)

### 7. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:8080`

## API Endpoints

### Authentication

#### POST `/api/auth/apple`
Authenticate with Apple Sign In

**Request Body:**
```json
{
  "identityToken": "apple_identity_token",
  "authorizationCode": "apple_auth_code",
  "user": "unique_user_id",
  "fullName": {
    "givenName": "John",
    "familyName": "Doe"
  },
  "email": "user@privaterelay.appleid.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "authProvider": "apple"
    }
  }
}
```

#### POST `/api/auth/google`
Authenticate with Google Sign In

**Request Body:**
```json
{
  "idToken": "google_id_token",
  "user": {
    "id": "google_user_id",
    "email": "user@gmail.com",
    "name": "John Doe",
    "photo": "https://..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@gmail.com",
      "name": "John Doe",
      "photo": "https://...",
      "authProvider": "google"
    }
  }
}
```

#### GET `/api/auth/validate`
Validate JWT token

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "authProvider": "google"
  }
}
```

#### POST `/api/auth/register`
Register with email/password (optional fallback)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### POST `/api/auth/login`
Login with email/password (optional fallback)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### PUT `/api/auth/profile`
Update user profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "profile": {
    "name": "Updated Name",
    "targetLanguage": "Spanish",
    "level": "intermediate"
  }
}
```

### Webhooks

#### POST `/webhooks/revenuecat`
RevenueCat webhook endpoint

Automatically handles:
- `INITIAL_PURCHASE` - User makes first purchase
- `RENEWAL` - Subscription renews
- `CANCELLATION` - User cancels subscription
- `UNCANCELLATION` - User reactivates subscription
- `BILLING_ISSUE` - Payment failed
- `PRODUCT_CHANGE` - User changes plan
- `EXPIRATION` - Subscription expires
- `TRIAL_STARTED` - Free trial begins
- `TRIAL_CONVERTED` - Trial converts to paid
- `TRIAL_CANCELLED` - Trial cancelled

**Webhook Payload Example:**
```json
{
  "type": "INITIAL_PURCHASE",
  "app_user_id": "user_firebase_id",
  "product_id": "essential_annual",
  "purchased_at_ms": 1234567890000,
  "expiration_at_ms": 1234567890000,
  "is_trial_period": true
}
```

## File Structure

```
backend/
├── auth-server.js                 # Main server entry point
├── auth-api-package.json          # Package dependencies
├── routes/
│   ├── auth-routes.js             # Authentication endpoints
│   └── webhook-routes.js          # RevenueCat webhooks
├── services/
│   ├── apple-auth-service.js      # Apple OAuth verification
│   ├── google-auth-service.js     # Google OAuth verification
│   ├── token-service.js           # JWT token management
│   ├── user-service.js            # User CRUD operations
│   └── subscription-service.js    # Subscription management
├── middleware/
│   ├── auth-middleware.js         # JWT verification middleware
│   └── error-handler.js           # Global error handler
├── utils/
│   └── logger.js                  # Winston logger
└── .env.example                   # Environment template
```

## User Data Schema (Firestore)

```javascript
{
  id: "firebase_user_id",
  email: "user@example.com",
  name: "John Doe",
  photo: "https://...",
  authProvider: "google" | "apple" | "email",
  appleId: "apple_unique_id",        // If Apple Sign In
  googleId: "google_unique_id",      // If Google Sign In
  password: "hashed_password",       // If email/password
  subscription: {
    status: "active" | "cancelled" | "expired" | "billing_issue" | "none",
    plan: "essential" | "power",
    productId: "essential_annual",
    purchaseDate: Timestamp,
    expiresDate: Timestamp,
    isTrialPeriod: boolean,
    trialEndsAt: Timestamp,
    revenueCatId: "revenuecat_transaction_id"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Deployment

### Option 1: Google Cloud Run (Recommended)

1. Install Google Cloud SDK
2. Build and deploy:

```bash
gcloud run deploy speakeasy-auth-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. Set environment variables in Cloud Run console
4. Update `API_BASE_URL` in mobile app to Cloud Run URL

### Option 2: Heroku

1. Create Heroku app:
```bash
heroku create speakeasy-auth-api
```

2. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set GOOGLE_CLIENT_ID=...
# Set all other env vars
```

3. Deploy:
```bash
git push heroku main
```

### Option 3: AWS Lambda + API Gateway

1. Use Serverless Framework or AWS SAM
2. Configure Lambda function with Node.js runtime
3. Set up API Gateway endpoints
4. Configure environment variables in Lambda console

## Security Considerations

1. **JWT Secret**: Use a strong, random secret in production (at least 32 characters)
2. **HTTPS Only**: Always use HTTPS in production
3. **Rate Limiting**: Add rate limiting middleware (e.g., `express-rate-limit`)
4. **CORS**: Configure CORS to only allow your app domains
5. **Firebase Rules**: Restrict Firestore access properly
6. **Webhook Verification**: Verify RevenueCat webhook signatures
7. **Environment Variables**: Never commit `.env` to version control

## Testing

### Test Apple OAuth Endpoint

```bash
curl -X POST http://localhost:8080/api/auth/apple \
  -H "Content-Type: application/json" \
  -d '{
    "identityToken": "test_token",
    "email": "test@example.com"
  }'
```

### Test Google OAuth Endpoint

```bash
curl -X POST http://localhost:8080/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "test_token",
    "user": {
      "id": "123",
      "email": "test@gmail.com",
      "name": "Test User"
    }
  }'
```

### Test Token Validation

```bash
curl -X GET http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test RevenueCat Webhook

```bash
curl -X POST http://localhost:8080/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INITIAL_PURCHASE",
    "app_user_id": "test_user_id",
    "product_id": "essential_annual",
    "purchased_at_ms": 1234567890000,
    "is_trial_period": true
  }'
```

## Monitoring & Logs

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output (development)

Log levels: error, warn, info, http, debug

## Troubleshooting

### Issue: Apple token verification fails
- **Solution**: Check `APPLE_BUNDLE_ID` matches your iOS app
- Verify Apple Key ID and Team ID are correct
- Ensure .p8 private key is properly formatted

### Issue: Google token verification fails
- **Solution**: Verify `GOOGLE_CLIENT_ID` is correct
- Check that Web Client ID is used (not iOS Client ID)
- Ensure token is fresh (not expired)

### Issue: Firebase connection fails
- **Solution**: Verify Firebase credentials are correct
- Check that private key newlines are properly escaped (`\n`)
- Ensure Firebase project ID matches

### Issue: RevenueCat webhooks not received
- **Solution**: Check webhook URL is publicly accessible
- Verify HTTPS is configured (required by RevenueCat)
- Check RevenueCat dashboard for webhook delivery errors

## Support

For issues with:
- **Apple Sign In**: https://developer.apple.com/documentation/sign_in_with_apple
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Firebase**: https://firebase.google.com/support
- **RevenueCat**: https://docs.revenuecat.com/docs/webhooks

## License

Proprietary - SpeakEasy App
