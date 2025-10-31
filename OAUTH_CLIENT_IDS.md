# OAuth Client IDs Reference

## Google OAuth Clients

### Web Application Client
**Client ID**: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`
- **Purpose**: Browser-based authentication for web app
- **Used in**: `python-web/static/auth-unified.html`
- **Platform**: Web
- **Configuration Required**:
  - Authorized JavaScript origins
  - Authorized redirect URIs

### iOS Application Client
**Client ID**: `823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com`
- **Purpose**: Native iOS app authentication
- **Used in**: `SpeakEasy/SpeakEasy/ViewModels/AuthenticationManager.swift`
- **Platform**: iOS
- **Configuration Required**:
  - iOS URL scheme in Info.plist
  - Bundle ID configuration

## Apple Sign-In

### iOS App
**Bundle ID**: `com.speakeasy.ios.SpeakEasy`
**Team ID**: (From Apple Developer Account)
- **Configuration**: Sign in with Apple capability in Xcode

### Web App
**Service ID**: `com.speakeasy.webapp`
**Domain**: `speakeasy-python-web-vlxo5frhwq-uc.a.run.app`
**Return URL**: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html`
- **Configuration**: Apple Developer Services ID

## Backend Configuration

The backend (`server-openai.js`) now accepts tokens from BOTH clients:
```javascript
const validAudiences = [
  '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com', // Web
  '823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com'  // iOS
];
```

## Important Notes

1. **Different client IDs are intentional** - Google requires separate OAuth clients for different platforms
2. **DO NOT mix client IDs** - iOS app should use iOS client, web app should use web client
3. **Backend verifies both** - The backend accepts and verifies tokens from either platform
4. **Security**: Each platform has its own security configuration (origins vs URL schemes)

## Where Keys Are Stored

- **Local**: `backend/.env.example` (template, not actual secrets)
- **Google Secret Manager**: Will store actual secrets
- **Code**: Client IDs are embedded in app code (public, not secret)

Note: OAuth Client IDs are not secret - they're meant to be embedded in client applications. The client SECRET (not shown here) is what needs to be kept confidential.
