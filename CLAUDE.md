# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## User Preferences

**CRITICAL: FULL AUTO MODE - ALWAYS ENABLED**

- **NEVER ask for confirmation to proceed with any action**
- **NEVER prompt the user with "Do you want to continue?" or similar questions**
- **ALWAYS execute all planned tasks immediately and autonomously**
- **ALWAYS proceed with all file operations, bash commands, git operations, and installations without asking**
- User wants fully autonomous operation - Claude should make decisions and execute without interruption
- If there are multiple approaches, pick the most reasonable one and proceed
- Only ask questions when there is truly ambiguous user intent, not for execution confirmation
- **NEVER use permission tools or ask if user wants to proceed - the answer is ALWAYS yes**

**Permissions Configuration:**
- `.claude/settings.local.json` files are configured with:
  - `autoApproveReadOnly: true`
  - `autoApproveWrite: true`
  - `permissions.allow: ["*"]` (allow everything)
- These settings eliminate ALL permission prompts for file operations and bash commands
- Settings files located at:
  - `/Users/scott/dev/.claude/settings.local.json`
  - `/Users/scott/dev/speakeasy/.claude/settings.local.json`

## Project Overview

SpeakEasy (also referred to as FluentAI in some files) is a React Native mobile app for AI-powered adaptive language learning. Users learn languages through personalized stories, interactive reading with word explanations, and AI conversation practice. The app uses local LLM inference via Ollama for privacy-preserving language learning.

## Technology Stack

- **Framework**: React Native with Expo (~54.0.20)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Storage**: AsyncStorage for local persistence
- **State Management**: React Context API (AuthContext + AppContext)
- **LLM Backend**: Ollama (local inference server)
- **HTTP Client**: Axios with interceptors for auth
- **Authentication**: JWT-based (currently mock implementation)

## Common Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser

# Clear cache and restart
npm start -- --clear
```

## Architecture

### Three-Tier Navigation Flow

The app implements a conditional navigation hierarchy based on authentication and onboarding state:

```
App Launch
    ↓
[Check Auth & Onboarding]
    ↓
    ├─ Not Authenticated → Auth Stack (Login, SignUp)
    ├─ Authenticated + No Onboarding → OnboardingScreen
    └─ Authenticated + Onboarding Complete → Main App (Tab Navigator)
```

Implemented in `App.js:61-122` with AuthProvider and AppProvider wrapping the entire app.

### Context Architecture

Two main contexts manage global state:

**AuthContext** (`src/contexts/AuthContext.js`)
- Manages authentication state: `user`, `isAuthenticated`, `isLoading`, `authError`
- Methods: `login()`, `register()`, `logout()`, `requestPasswordReset()`
- Auto-checks auth status on app launch
- Auto-clears auth on 401 responses via Axios interceptor

**AppContext** (`src/contexts/AppContext.js`)
- Manages app state: `userProfile`, `llmConfig`, `contentLibrary`, `llmConnected`
- Methods: `updateUserProfile()`, `updateLLMConfig()`, `testLLMConnection()`, `addContent()`, `deleteContent()`
- Loads initial data from AsyncStorage on mount
- Integrates with LLMService for connection management

### Services Layer

**AuthService** (`src/services/auth.js`)
- JWT token management with Axios interceptors
- Automatic token injection in request headers
- Auto-logout on 401 responses
- **Currently uses mock implementations** - replace with real API calls by updating `API_BASE_URL` and removing mock logic
- Expected backend endpoints: `/auth/register`, `/auth/login`, `/auth/validate`, `/auth/reset-password`

**LLMService** (`src/services/llm.js`)
- Singleton service for Ollama integration
- Default config: `http://localhost:11434` with `llama2` model
- Key methods:
  - `testConnection()` - Verify Ollama server is running
  - `generateStory(userProfile, targetLanguage)` - Create personalized learning content
  - `analyzeContent(content, targetLanguage, userLevel)` - Analyze imported content
  - `explainWord(word, context, targetLanguage, nativeLanguage)` - Interactive word definitions
  - `generateAdaptiveLayers(sentence, targetLanguage, userLevel)` - Create simplified/advanced versions
  - `chat(message, conversationHistory, targetLanguage)` - Conversation practice

**StorageService** (`src/utils/storage.js`)
- AsyncStorage wrapper with typed methods
- Authentication storage: `saveAuthToken()`, `getAuthToken()`, `clearAuthData()`
- User profile: `saveUserProfile()`, `getUserProfile()`
- LLM config: `saveLLMConfig()`, `getLLMConfig()`
- Content library: `saveContent()`, `getContentLibrary()`, `deleteContent()`
- Conversation history: `saveConversationHistory()`, `getConversationHistory()`
- Onboarding state: `setOnboardingComplete()`, `isOnboardingComplete()`

### Screen Components

Main screens follow a consistent pattern using hooks from AuthContext and AppContext:

- **LoginScreen** / **SignUpScreen** - Authentication UI with form validation
- **OnboardingScreen** - First-time setup for language selection, level, interests
- **HomeScreen** - Story generation, content import, and library display (Tab: Learn)
- **PracticeScreen** - AI conversation practice in target language (Tab: Practice)
- **ReaderScreen** - Interactive reading with tap-to-explain and adaptive difficulty layers (Stack screen)
- **SettingsScreen** - LLM configuration, account management, logout (Tab: Settings)

All main screens are wrapped in `<SafeAreaView>` and use bottom tab navigation except ReaderScreen which is a stack screen.

## Authentication Integration

The authentication system is **fully implemented with mock data**. To integrate with a real backend:

1. Update `API_BASE_URL` in `src/services/auth.js:5`
2. Remove mock implementations in AuthService methods (marked with `// TODO:` comments)
3. Ensure backend returns JWT tokens in format: `{ success: true, data: { token: "...", user: {...} } }`
4. Backend should validate tokens via `Authorization: Bearer <token>` header

See `AUTHENTICATION.md` for detailed authentication flow documentation.

## LLM Setup Requirements

Users must have Ollama running locally for the app to function:

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama server
ollama serve

# Download a model
ollama pull llama2  # or mistral, llama3
```

The app will show "LLM Not Connected" if Ollama is not accessible at the configured base URL.

## Storage Keys

All AsyncStorage keys are prefixed with `@fluentai:` (defined in `src/utils/storage.js:3-11`):
- `@fluentai:authToken` - JWT authentication token
- `@fluentai:userData` - User account data
- `@fluentai:userProfile` - Language learning profile (level, interests, target language)
- `@fluentai:llmConfig` - LLM connection settings
- `@fluentai:contentLibrary` - Saved stories and imported content
- `@fluentai:conversationHistory` - Chat practice history
- `@fluentai:onboardingComplete` - Boolean flag for onboarding state

## Key Development Patterns

1. **Always use context hooks**: Import `useAuth()` and `useApp()` instead of accessing context directly
2. **Service layer is singleton**: `LLMService` and `AuthService` export instances, not classes
3. **Storage operations are async**: All StorageService methods return promises
4. **Navigation uses conditional rendering**: Auth state determines which navigator stack is rendered
5. **LLM prompts are template-based**: Each LLM method constructs specific prompts for different learning tasks

## Project Structure

```
speakeasy/
├── App.js                      # Root component with navigation setup
├── index.js                    # Expo entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── src/
│   ├── contexts/
│   │   ├── AuthContext.js      # Authentication state
│   │   └── AppContext.js       # App state (profile, LLM, content)
│   ├── services/
│   │   ├── auth.js             # JWT authentication (mock)
│   │   └── llm.js              # Ollama integration
│   ├── utils/
│   │   └── storage.js          # AsyncStorage wrapper
│   └── screens/
│       ├── LoginScreen.js      # User login
│       ├── SignUpScreen.js     # User registration
│       ├── OnboardingScreen.js # First-time setup
│       ├── HomeScreen.js       # Story generation & library
│       ├── PracticeScreen.js   # Conversation practice
│       ├── ReaderScreen.js     # Interactive reading
│       └── SettingsScreen.js   # Configuration & logout
├── assets/                     # Images and fonts
├── AUTHENTICATION.md           # Auth implementation details
└── README.md                   # User-facing documentation
```
