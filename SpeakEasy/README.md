# SpeakEasy iOS - Native SwiftUI Version

A native iOS app for AI-powered adaptive language learning, built with SwiftUI.

## Overview

SpeakEasy helps users learn languages through:
- **Personalized Stories**: AI-generated content tailored to your level and interests
- **Interactive Reading**: Tap any word for instant translations and explanations
- **Conversation Practice**: Real-time AI chat in your target language
- **Adaptive Learning**: Content adjusts to your proficiency level

## Architecture

### Project Structure

```
SpeakEasy/
├── Models/
│   └── User.swift              # Data models (User, Story, Conversation, etc.)
├── ViewModels/
│   ├── AuthenticationManager.swift  # Authentication state management
│   └── AppManager.swift             # App-wide state (profile, stories)
├── Views/
│   ├── LoginView.swift         # User login
│   ├── SignUpView.swift        # User registration
│   ├── OnboardingView.swift    # First-time language/level setup
│   ├── HomeView.swift          # Story generation & library
│   ├── PracticeView.swift      # AI conversation practice
│   ├── ReaderView.swift        # Interactive story reading
│   └── SettingsView.swift      # Settings & account management
├── Services/
│   └── APIService.swift        # Backend API communication
├── Utilities/
│   ├── KeychainHelper.swift    # Secure token storage
│   └── UserDefaultsHelper.swift # Local data persistence
└── SpeakEasyApp.swift          # App entry point & navigation
```

### Key Features

#### 🔐 Authentication
- JWT-based authentication with secure keychain storage
- Email/password registration and login
- Automatic session validation on app launch

#### 🎯 Onboarding
- Interactive 4-step setup process
- Language selection from 10+ common languages
- Proficiency level assessment (A1-C2)
- Interest-based personalization

#### 📚 Story Learning
- AI-generated personalized stories via GPT-4o-mini
- Difficulty levels matched to user proficiency
- Topic-based filtering by interests
- Estimated reading time for each story

#### 📖 Interactive Reader
- Tap-to-translate any word in context
- Detailed explanations with:
  - Native translation
  - Definition in target language
  - Example sentences
  - Pronunciation guide
  - Part of speech

#### 💬 Conversation Practice
- Real-time AI chat in target language
- Natural conversation flow
- Message history persistence
- Typing indicators

#### ⚙️ Settings
- Profile management (language, level, interests)
- Backend health monitoring
- Account logout

## Backend Integration

The app connects to a production backend hosted on Google Cloud Run:

**Production URL**: `https://speakeasy-backend-823510409781.us-central1.run.app`

### API Endpoints

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate JWT token
- `POST /api/generate` - Generate personalized story
- `POST /api/practice/message` - Send conversation message
- `POST /api/explain-word` - Get word explanation
- `GET /health` - Backend health check

All authenticated requests include `Authorization: Bearer <token>` header.

## Data Models

### User & Profile
```swift
struct User {
    let id: String
    let email: String
    let name: String?
}

struct UserProfile {
    var nativeLanguage: String
    var targetLanguage: String
    var proficiencyLevel: ProficiencyLevel  // beginner to advanced
    var interests: [String]
    var preferredDifficulty: DifficultyPreference
}
```

### Content
```swift
struct Story {
    let id: String
    let title: String
    let content: String
    let language: String
    let difficultyLevel: String
    let topics: [String]
    let estimatedReadTime: Int
}

struct Conversation {
    let id: String
    var messages: [Message]
    let language: String
}
```

## State Management

### AuthenticationManager
- Singleton `@MainActor` class
- Manages authentication state and user session
- Automatic token validation on app launch
- Auto-logout on 401 responses

### AppManager
- Singleton `@MainActor` class
- Manages user profile and learning content
- Story generation and management
- Conversation handling
- Backend health monitoring

Both managers are injected as `@EnvironmentObject` throughout the app.

## Data Persistence

### Secure Storage (Keychain)
- JWT authentication tokens stored in iOS Keychain
- Service identifier: `com.speakeasy.app`

### Local Storage (UserDefaults)
- User profile preferences
- Story library (offline access)
- Conversation history
- Onboarding completion status

Keys are namespaced to avoid conflicts.

## Navigation Flow

```
App Launch
    ↓
[AuthenticationManager validates session]
    ↓
    ├─ Not Authenticated → LoginView
    │                         ↓
    │                      SignUpView (modal)
    ↓
    ├─ Authenticated + No Onboarding → OnboardingView
    │                                      ↓
    │                                   (Complete)
    ↓
    └─ Authenticated + Onboarding Complete → MainTabView
                                                ↓
                ┌──────────────────┬────────────────────┬──────────────┐
                ↓                  ↓                    ↓              ↓
            HomeView          PracticeView        SettingsView
                ↓
            ReaderView (sheet)
```

## Requirements

- **iOS**: 17.0+
- **Xcode**: 15.0+
- **Swift**: 5.9+

## Building & Running

1. **Open in Xcode**:
   ```bash
   open SpeakEasy.xcodeproj
   ```

2. **Select Target**: Choose a simulator or connected device

3. **Run**: Press `Cmd+R` or click the Run button

The app will automatically:
- Connect to the production backend
- Handle authentication flow
- Present the appropriate screen based on auth/onboarding state

## Configuration

### Backend URL
To change the backend URL, edit `Services/APIService.swift`:

```swift
private let baseURL = "https://speakeasy-backend-823510409781.us-central1.run.app"
```

### Supported Languages
Add or modify languages in `Models/User.swift`:

```swift
struct Language {
    static let commonLanguages: [Language] = [
        Language(code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸"),
        // Add more languages here
    ]
}
```

## Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Register new account
- [ ] Complete onboarding flow
- [ ] Generate a story
- [ ] Read story and tap words for explanations
- [ ] Start conversation in Practice tab
- [ ] Send messages and receive AI responses
- [ ] Change language/level in Settings
- [ ] Test backend health check
- [ ] Logout and verify auth cleared

### Backend Connection Test
Check Settings → Backend Connection → Test Connection

## Troubleshooting

### Authentication Issues
- Check that backend is running (test in Settings)
- Verify JWT token in Keychain hasn't expired
- Try logging out and back in

### Story Generation Fails
- Ensure user profile is complete (check Settings)
- Verify backend health
- Check console logs for API errors

### Word Explanations Not Working
- Check network connectivity
- Ensure story has valid content
- Verify backend `/api/explain-word` endpoint

## Future Enhancements

- [ ] Offline mode with cached stories
- [ ] Speech-to-text for conversation practice
- [ ] Text-to-speech for pronunciation
- [ ] Progress tracking and statistics
- [ ] Spaced repetition for vocabulary
- [ ] Social features (share stories, compete with friends)
- [ ] Apple Watch companion app
- [ ] iPad optimization with split view

## License

This project is part of the SpeakEasy language learning platform.

## Related Projects

- **Backend API**: `/speakeasy/backend/` - Node.js Express server with OpenAI integration
- **React Native App**: `/speakeasy/` - Cross-platform mobile app (iOS/Android/Web)
