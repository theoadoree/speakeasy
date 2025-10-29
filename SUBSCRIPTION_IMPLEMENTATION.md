# Subscription & Authentication Implementation Guide

## Overview

This document outlines the comprehensive subscription and authentication system implemented for SpeakEasy. The system enforces OAuth-based authentication (Apple Sign In and Google Sign In) and requires users to subscribe to a paid plan after a 3-day free trial.

## System Architecture

### Authentication Flow
1. **Force OAuth Authentication** - Users must sign in with Apple or Google (no bypass)
2. **Onboarding** - After authentication, users complete profile setup
3. **Subscription Required** - Users must select a subscription plan (Essential or Power)
4. **3-Day Free Trial** - All plans start with a 3-day free trial
5. **Token Tracking** - Essential users are limited to ~20-30 minutes of daily study

### Navigation Flow
```
App Launch
    ↓
Not Authenticated → NewAuthScreen (Apple/Google OAuth)
    ↓
Authenticated + No Onboarding → OnboardingScreen
    ↓
Authenticated + Onboarding + No Subscription → SubscriptionScreen
    ↓
Authenticated + Onboarding + Active Subscription → Main App
```

## Subscription Plans

### Essential Plan
- **Annual**: $100/year ($8.33/month equivalent)
- **Monthly**: ~$17/month ($200/year equivalent)
- **Features**:
  - 20-30 minutes daily study time
  - Core features
  - All languages
  - 50% savings on annual plan
- **Token Limit**: 50,000 tokens per day (~20-30 mins of study)

### Power Plan
- **Annual**: $200/year ($16.67/month equivalent)
- **Monthly**: ~$33/month ($400/year equivalent)
- **Features**:
  - **Unlimited daily usage**
  - Fluency in 30 days program
  - Priority support
  - Advanced features
  - 50% savings on annual plan
- **Token Limit**: Unlimited

### Key Highlights
- **Annual plans are 50% off** compared to monthly plans
- Annual plans are shown by default (first tab)
- Graphical 50% savings badge prominently displayed
- 3-day free trial for all plans
- Cancel anytime before trial ends

## Files Created/Modified

### New Files Created

1. **`/src/contexts/SubscriptionContext.js`**
   - Manages subscription state and token usage
   - Integrates with RevenueCat for in-app purchases
   - Handles free trial management
   - Tracks daily token usage and limits
   - Provides subscription status checks

2. **`/src/screens/SubscriptionScreen.js`**
   - Beautiful subscription selection UI
   - Annual/Monthly toggle with 50% savings badge
   - Essential vs Power plan comparison
   - Free trial information
   - Integrated with SubscriptionContext

3. **`/src/screens/NewAuthScreen.js`**
   - Modern OAuth authentication UI
   - Apple Sign In button (iOS only)
   - Google Sign In button
   - Clean, minimal design

4. **`/src/components/TokenLimitModal.js`**
   - Modal shown when Essential users exceed daily limit
   - Shows usage statistics and progress
   - Upgrade prompt with pricing comparison
   - Graphical representation of 50% savings

### Modified Files

1. **`/src/services/auth.js`**
   - Added `signInWithApple()` method
   - Added `signInWithGoogle()` method
   - Added `isAppleSignInAvailable()` helper
   - Configured Google Sign In client

2. **`/src/contexts/AuthContext.js`**
   - Added OAuth authentication methods
   - Integrated with AuthService OAuth functions

3. **`/src/services/llm.js`**
   - Added token estimation logic
   - Integrated subscription context for token tracking
   - Checks token limits before LLM requests
   - Tracks token usage after each generation
   - Returns limit exceeded status

4. **`/src/contexts/AppContext.js`**
   - Integrated with SubscriptionContext
   - Sets subscription context in LLMService
   - Enables token tracking throughout app

5. **`/App.js`**
   - Wrapped app in SubscriptionProvider
   - Updated navigation flow to enforce subscription
   - Added subscription checks in AppNavigator
   - Replaced old AuthScreen with NewAuthScreen

## Configuration Required

### 1. Google OAuth Setup

**File**: `/src/services/auth.js` (lines 11-15)

```javascript
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // TODO: Replace
  iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID', // TODO: Replace (optional)
  offlineAccess: true,
});
```

**Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sign In API
4. Create OAuth 2.0 credentials:
   - **Web Client ID**: For general use
   - **iOS Client ID**: For iOS-specific (optional)
5. Add your bundle identifier to iOS OAuth client
6. Replace the placeholder values in the code

### 2. Apple Sign In Setup

**File**: `app.json` - Add to Expo config

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.speakeasy",
      "usesAppleSignIn": true
    }
  }
}
```

**Steps**:
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign In with Apple capability must be enabled for your App ID
3. In Xcode (if building native):
   - Select your target
   - Go to "Signing & Capabilities"
   - Add "Sign in with Apple" capability
4. For Expo:
   - Set `usesAppleSignIn: true` in app.json
   - Build with EAS Build

### 3. RevenueCat Setup

**File**: `/src/contexts/SubscriptionContext.js` (lines 115-122)

```javascript
if (Platform.OS === 'ios') {
  await Purchases.configure({
    apiKey: 'YOUR_REVENUECAT_IOS_API_KEY', // TODO: Replace
  });
} else if (Platform.OS === 'android') {
  await Purchases.configure({
    apiKey: 'YOUR_REVENUECAT_ANDROID_API_KEY', // TODO: Replace
  });
}
```

**Steps**:
1. Sign up at [RevenueCat](https://www.revenuecat.com/)
2. Create a new project
3. Add iOS app (App Store Connect)
   - Connect to App Store Connect API
   - Create subscription products in App Store Connect
   - Configure products in RevenueCat dashboard
4. Add Android app (Google Play Store)
   - Connect to Google Play Console
   - Create subscription products in Play Console
   - Configure products in RevenueCat dashboard
5. Get API keys from RevenueCat dashboard:
   - Navigate to Project Settings → API Keys
   - Copy iOS Public API Key
   - Copy Android Public API Key
6. Replace placeholder values in code

**Product IDs to create in App Store Connect & Play Console**:
- `essential_monthly`
- `essential_annual`
- `power_monthly`
- `power_annual`

### 4. Backend API Setup

**File**: `/src/services/auth.js` (line 8)

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

**Required Backend Endpoints**:

1. **POST `/api/auth/apple`**
   - Verifies Apple identity token
   - Creates/logs in user
   - Returns JWT token and user data
   - Request body:
     ```json
     {
       "identityToken": "...",
       "authorizationCode": "...",
       "user": "...",
       "fullName": { "givenName": "...", "familyName": "..." },
       "email": "..."
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "data": {
         "token": "jwt_token_here",
         "user": { "id": "...", "email": "...", "name": "..." }
       }
     }
     ```

2. **POST `/api/auth/google`**
   - Verifies Google ID token
   - Creates/logs in user
   - Returns JWT token and user data
   - Request body:
     ```json
     {
       "idToken": "...",
       "user": {
         "id": "...",
         "email": "...",
         "name": "...",
         "photo": "..."
       }
     }
     ```
   - Response: Same as Apple endpoint

3. **GET `/api/auth/validate`**
   - Validates JWT token
   - Returns user data if valid
   - Requires Authorization header: `Bearer <token>`

### 5. Stripe Setup (Web Only - Future Implementation)

**File**: `/src/contexts/SubscriptionContext.js` (method `handleStripePayment`)

For web-based subscriptions, you'll need to:
1. Create Stripe account
2. Create subscription products matching the plans
3. Implement Stripe checkout flow
4. Handle webhooks for subscription status

**Note**: Currently marked as TODO in the code.

## Usage in Screens

### Checking Subscription Status

```javascript
import { useSubscription } from '../contexts/SubscriptionContext';

function MyScreen() {
  const {
    hasActiveSubscription,
    isPowerUser,
    canUseService,
    getRemainingTokens,
    getUsagePercentage
  } = useSubscription();

  // Check if user has active subscription
  if (!hasActiveSubscription()) {
    // Redirect to subscription screen
  }

  // Check if user is Power user (unlimited)
  const isUnlimited = isPowerUser();

  // Check if user can still use service today
  const canStudy = canUseService();

  // Get remaining tokens for Essential users
  const remaining = getRemainingTokens(); // null for Power users

  // Get usage percentage
  const usage = getUsagePercentage(); // 0-100
}
```

### Showing Token Limit Modal

```javascript
import TokenLimitModal from '../components/TokenLimitModal';
import { useSubscription } from '../contexts/SubscriptionContext';

function HomeScreen({ navigation }) {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { canUseService } = useSubscription();

  const handleGenerateContent = async () => {
    // Check if user can use service
    if (!canUseService()) {
      setShowLimitModal(true);
      return;
    }

    // Proceed with content generation
    // Token tracking happens automatically in LLMService
  };

  return (
    <View>
      {/* Your screen content */}

      <TokenLimitModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          navigation.navigate('Subscription');
        }}
      />
    </View>
  );
}
```

### Navigating to Subscription Screen

```javascript
// From any screen
navigation.navigate('Subscription');

// Or from main app to allow upgrades
<TouchableOpacity onPress={() => navigation.navigate('Subscription')}>
  <Text>Upgrade to Power Plan</Text>
</TouchableOpacity>
```

## Token Tracking System

### How It Works

1. **Token Estimation**:
   - Uses simple heuristic: ~4 characters = 1 token
   - Estimates tokens for both prompt and response
   - Implemented in `LLMService.estimateTokens()`

2. **Usage Tracking**:
   - Every LLM generation call tracks tokens
   - Updates daily token count in SubscriptionContext
   - Resets automatically at midnight

3. **Limit Enforcement**:
   - Before each LLM call, checks if user can use service
   - Essential users: limited to 50,000 tokens/day
   - Power users: unlimited
   - Returns `limitExceeded: true` when limit is reached

4. **Daily Reset**:
   - Token usage resets daily at midnight
   - Tracked by date in AsyncStorage
   - Automatic reset on new day

### Token Calculation

Approximate study time calculation:
- 50,000 tokens = ~12,500 words
- Average reading speed: 200-300 words per minute
- Estimated: 20-30 minutes of study per day for Essential users

## Testing Checklist

### Authentication Testing

- [ ] Apple Sign In works on iOS device/simulator
- [ ] Google Sign In works on iOS device
- [ ] Google Sign In works on Android device
- [ ] User data is correctly stored after OAuth
- [ ] JWT token is saved and used in API calls
- [ ] Token validation works with backend
- [ ] Logout clears all authentication data

### Subscription Flow Testing

- [ ] Onboarding screen shows after first login
- [ ] Subscription screen shows after onboarding
- [ ] Annual tab is selected by default
- [ ] 50% savings badge displays correctly
- [ ] Monthly/Annual toggle works
- [ ] Plan selection highlights correctly
- [ ] Free trial starts when plan is selected
- [ ] Trial end date is calculated correctly (3 days)
- [ ] User can access app during free trial
- [ ] App blocks access after trial expires (if not subscribed)

### Token Tracking Testing

- [ ] Essential user token usage is tracked
- [ ] Token limit modal shows when limit exceeded
- [ ] Power user has unlimited usage
- [ ] Token count resets at midnight
- [ ] Usage percentage displays correctly
- [ ] LLM requests are blocked when limit exceeded
- [ ] Upgrade prompt shows correct pricing

### In-App Purchase Testing (RevenueCat)

- [ ] iOS sandbox account works for testing
- [ ] Android test account works for testing
- [ ] Essential annual purchase works
- [ ] Essential monthly purchase works
- [ ] Power annual purchase works
- [ ] Power monthly purchase works
- [ ] Subscription status updates after purchase
- [ ] Restore purchases works
- [ ] Subscription auto-renewal works
- [ ] Cancellation works correctly

## Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API
REACT_APP_API_URL=https://your-backend.com

# Google OAuth (from Google Cloud Console)
GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com

# RevenueCat (from RevenueCat Dashboard)
REVENUECAT_IOS_API_KEY=appl_xxx
REVENUECAT_ANDROID_API_KEY=goog_xxx

# Stripe (for web payments - future)
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## Common Issues & Solutions

### Issue: Google Sign In Not Working
- **Solution**: Ensure Google Web Client ID is correctly configured
- Check bundle identifier matches Google OAuth client
- Enable Google Sign In API in Google Cloud Console

### Issue: Apple Sign In Button Not Showing
- **Solution**: Check iOS simulator/device is iOS 13+
- Ensure `usesAppleSignIn: true` in app.json
- Verify Sign in with Apple capability is enabled

### Issue: RevenueCat Purchases Failing
- **Solution**: Check API keys are correct
- Ensure products are created in App Store Connect/Play Console
- Verify products are configured in RevenueCat dashboard
- Check product IDs match exactly

### Issue: Token Limit Not Resetting
- **Solution**: Check device date/time is correct
- Verify AsyncStorage is persisting correctly
- Check `lastResetDate` in storage

## Next Steps

1. **Complete OAuth Configuration**
   - Set up Google OAuth credentials
   - Configure Apple Sign In
   - Test both on real devices

2. **Set Up RevenueCat**
   - Create account
   - Configure products
   - Add API keys
   - Test with sandbox accounts

3. **Implement Backend API**
   - Create OAuth verification endpoints
   - Implement JWT token generation
   - Set up user database
   - Handle subscription webhooks from RevenueCat

4. **Configure App Store & Play Console**
   - Create subscription products
   - Set up pricing
   - Configure subscription groups
   - Set up promotional offers

5. **Test Thoroughly**
   - Test OAuth on multiple devices
   - Test subscription flow end-to-end
   - Test token tracking with real usage
   - Test edge cases (trial expiry, cancellation, etc.)

6. **Production Deployment**
   - Switch to production API keys
   - Configure production OAuth credentials
   - Set up production RevenueCat environment
   - Submit app for review

## Support & Resources

- **RevenueCat Docs**: https://docs.revenuecat.com/
- **Google OAuth Setup**: https://developers.google.com/identity/sign-in/ios
- **Apple Sign In**: https://developer.apple.com/sign-in-with-apple/
- **Expo Apple Auth**: https://docs.expo.dev/versions/latest/sdk/apple-authentication/
- **React Native Google Sign In**: https://github.com/react-native-google-signin/google-signin

## License & Attribution

This implementation uses:
- `expo-apple-authentication` for Apple Sign In
- `@react-native-google-signin/google-signin` for Google Sign In
- `react-native-purchases` for in-app purchases (RevenueCat)
- `@stripe/stripe-react-native` for web payments (future)
