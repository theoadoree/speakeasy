# SpeakEasy iOS Implementation Status

## ✅ Completed Features

### 1. App Icon
- Fixed alpha channel issue (iOS requires no transparency)
- 1024x1024 PNG icon ready at `Assets.xcassets/AppIcon.appiconset/AppIcon.png`

### 2. Unified Auth Screen
- **File**: `Views/AuthView.swift`
- Combined login/signup in single screen
- Email/password authentication with auto-detection of existing users
- Apple Sign In integration (UI complete, needs capability in Xcode)
- Google Sign In integration (SDK installed via CocoaPods)
- Smart flow: checks email existence, then shows password field
- Shows name field only for new user registration

### 3. Expanded Data Models
**File**: `Models/User.swift`

Added comprehensive models for:

#### User Model Extensions
- `username` field
- `authProvider` (email, google, apple)
- `xp`, `currentStreak`, `longestStreak`
- `weeklyXP`, `leagueRank`
- `completedLessons[]`, `currentLessonId`
- `lastActivityDate`

#### Lesson System (30 Lessons)
- `Lesson` - Main lesson structure
- `LessonContent` - Sections, vocabulary, grammar
- `LessonSection` - Individual lesson parts with exercises
- `VocabularyItem` - Words with translations and audio
- `GrammarPoint` - Grammar explanations
- `Exercise` - Multiple choice, fill-in-blank, translation, listening, speaking
- `LessonProgress` - Track user progress through lessons

#### Quiz System
- `Quiz` - Quiz structure with questions
- `QuizQuestion` - Multiple types (MC, T/F, fill-in, matching, listening)
- `QuizResult` - Scores, XP earned, time taken

#### XP Leagues
- `XPLeague` - Weekly competition structure
- `League Tiers`: Bronze, Silver, Gold, Platinum, Diamond, Master
- `LeagueParticipant` - Individual rankings
- Weekly reset system

#### Music Learning
- `MusicTrack` - Songs with lyrics in target language
- `MusicPlaylist` - Curated playlists by language
- Integrated support for Apple Music & Spotify
- Lyrics + translations for learning

#### Level Assessment
- `LevelAssessment` - Adaptive testing system
- `AssessmentQuestion` - Questions across proficiency levels
- `AssessmentResult` - Estimated level with confidence score
- **Replaces manual level selection in onboarding**

### 4. API Service Enhancements
**File**: `Services/APIService.swift`

Added endpoints for:
- `signInWithApple()` - Apple ID authentication
- `signInWithGoogle()` - Google OAuth authentication
- `checkUserExists()` - Email existence check for smart auth flow
- `getLessons()` - Fetch lessons by language/level
- `getLesson()` - Get specific lesson
- `saveLessonProgress()` - Auto-save progress
- `submitQuiz()` - Quiz submission with scoring
- `getCurrentLeague()` - Get current week's league
- `getLeagueHistory()` - Past league performance
- `updateXP()` - Award XP for activities
- `searchMusicTracks()` - Find songs by language
- `getMusicPlaylists()` - Get curated playlists
- `getTrackLyrics()` - Get lyrics with translations
- `startAssessment()` - Begin level assessment
- `submitAssessment()` - Get estimated proficiency level

### 5. Authentication Manager Updates
**File**: `ViewModels/AuthenticationManager.swift`

- `signInWithApple()` - Handle Apple ID credentials
- `signInWithGoogle()` - Handle Google OAuth flow with GIDSignIn SDK
- `checkUserExists()` - Pre-flight email check
- Google Client ID: `823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com`

### 6. CocoaPods Integration
- **File**: `Podfile`
- Installed `GoogleSignIn` v7.0
- Dependencies: AppAuth, GTMAppAuth, GTMSessionFetcher
- Workspace now uses `SpeakEasy.xcworkspace`

## ✅ RESOLVED: CocoaPods Removed

### Switched to Swift Package Manager (SPM)

**Status**: ✅ CocoaPods completely removed, ready for SPM setup in Xcode

**What was done**:
- Removed all CocoaPods files (Pods/, Podfile, Podfile.lock, .xcworkspace)
- Commented out GoogleSignIn import and implementation
- App now uses only `.xcodeproj` file
- Created comprehensive SPM setup guide

**Next Steps** (requires Xcode GUI):
1. Open `SpeakEasy.xcodeproj` in Xcode
2. Add GoogleSignIn via Swift Package Manager
3. Add "Sign in with Apple" capability
4. Configure Google URL scheme
5. Uncomment Google Sign-In code

**See**: `SPM_SETUP_GUIDE.md` for complete step-by-step instructions (5-10 minutes)

## 📋 TODO: Backend Implementation

The following backend endpoints need to be implemented in `backend/server-openai.js`:

### Authentication Endpoints
```
POST /api/auth/apple
  Body: { userId, email?, fullName? }
  Response: { success, data: { token, user } }
  Action: Create/login user with Apple ID, log email, generate unique username

POST /api/auth/google
  Body: { idToken }
  Response: { success, data: { token, user } }
  Action: Verify Google token, create/login user, log email, generate unique username

POST /api/auth/check-email
  Body: { email }
  Response: { exists: boolean }
  Action: Check if email exists in database

POST /api/auth/register
  Enhancement: Log email, generate unique username, check uniqueness

POST /api/auth/login
  Enhancement: Auto-register if email doesn't exist
```

### Username Generation
- Generate unique usernames (e.g., "user_12345", or AI-generated based on name)
- Check uniqueness before assigning
- Return warning if username taken
- Store in user record

### Lesson Endpoints
```
POST /api/lessons
  Body: { language, level }
  Response: { success, data: [Lesson] }
  Action: Return 30 lessons for language/level

GET /api/lessons/:id
  Response: { success, data: Lesson }
  Action: Return specific lesson with content, vocab, grammar, exercises, quiz

POST /api/lessons/progress
  Body: { lessonId, progress: LessonProgress }
  Action: Save lesson progress, auto-resume functionality
```

### Quiz Endpoints
```
POST /api/quizzes/submit
  Body: { quizId, answers: {} }
  Response: { success, data: QuizResult }
  Action: Grade quiz, calculate score, award XP
```

### XP League Endpoints
```
GET /api/leagues/current
  Response: { success, data: XPLeague }
  Action: Return current week's league with rankings

GET /api/leagues/history
  Response: { success, data: [XPLeague] }
  Action: Return past league results

POST /api/xp/update
  Body: { amount, activityType }
  Action: Add XP to user, update weekly totals, update league rankings
```

### Music Endpoints
```
POST /api/music/search
  Body: { language, query?, provider? }
  Response: { success, data: [MusicTrack] }
  Action: Search Apple Music/Spotify for songs in target language

POST /api/music/playlists
  Body: { language }
  Response: { success, data: [MusicPlaylist] }
  Action: Return curated playlists for language learning

GET /api/music/lyrics/:trackId
  Response: { success, data: MusicTrack }
  Action: Return lyrics + translations
```

### Assessment Endpoints
```
POST /api/assessment/start
  Body: { targetLanguage }
  Response: { success, data: LevelAssessment }
  Action: Generate adaptive level assessment questions

POST /api/assessment/submit
  Body: { answers: {}, targetLanguage }
  Response: { success, data: AssessmentResult }
  Action: Evaluate answers, estimate proficiency level with confidence score
```

## 📱 TODO: UI Implementation

### Level Assessment Flow
- Replace manual level selection in `OnboardingView.swift`
- Create `AssessmentView.swift` with question UI
- Show estimated level after assessment
- Auto-set user profile based on results

### Lessons UI
- Create `LessonsView.swift` - Browse 30 lessons
- Create `LessonDetailView.swift` - Show lesson content
- Create `ExerciseView.swift` - Interactive exercises
- Auto-save progress to backend
- Resume from last lesson

### Quiz UI
- Create `QuizView.swift` - Take quiz after lesson
- Show timer if quiz has time limit
- Display results with XP earned
- Show correct answers and explanations

### XP Leagues UI
- Create `LeagueView.swift` - Show weekly rankings
- Display user's rank and XP
- Show tier badges (Bronze → Master)
- Leaderboard with top participants

### Music UI
- Create `MusicView.swift` - Browse songs/playlists
- Create `LyricsView.swift` - Interactive lyrics reading
- Tap words for translations
- Integrate Apple Music/Spotify playback

## 🔧 Next Steps

1. **Resolve CocoaPods Issue**
   - Recommended: Switch to Swift Package Manager
   - Alternative: Manual framework integration

2. **Add Apple Sign In Capability**
   - Open Xcode
   - Select SpeakEasy target
   - Go to "Signing & Capabilities"
   - Click "+ Capability"
   - Add "Sign in with Apple"

3. **Configure URL Schemes**
   - Add Google Sign In URL scheme to Info.plist
   - Add reversed client ID

4. **Implement Backend**
   - Add all new endpoints to `backend/server-openai.js`
   - Set up Firebase/database for user management
   - Implement username generation
   - Create 30 lesson templates per language
   - Set up XP league cron job (weekly reset)

5. **Build & Deploy**
   - Fix CocoaPods issue
   - Build app
   - Deploy to iPhone
   - Test social auth flows
   - Test lesson progression
   - Test XP leagues
   - Test music integration

## 📊 Feature Completion Status

| Feature | Models | API | Backend | UI | Status |
|---------|--------|-----|---------|----|---------|
| Unified Auth | ✅ | ✅ | ⏳ | ✅ | 80% |
| Apple Sign In | ✅ | ✅ | ⏳ | ✅ | 70% |
| Google Sign In | ✅ | ✅ | ⏳ | ✅ | 70% |
| Auto Register/Login | ✅ | ✅ | ⏳ | ✅ | 70% |
| Username Generation | ✅ | ✅ | ⏳ | N/A | 60% |
| Level Assessment | ✅ | ✅ | ⏳ | ⏳ | 50% |
| 30 Lessons | ✅ | ✅ | ⏳ | ⏳ | 50% |
| Quizzes | ✅ | ✅ | ⏳ | ⏳ | 50% |
| XP Leagues | ✅ | ✅ | ⏳ | ⏳ | 50% |
| Music Learning | ✅ | ✅ | ⏳ | ⏳ | 50% |
| Auto-Save Progress | ✅ | ✅ | ⏳ | N/A | 60% |
| App Icon | ✅ | N/A | N/A | ✅ | 100% |

**Legend**: ✅ Complete | ⏳ In Progress | ❌ Not Started | N/A Not Applicable

## 🎯 Architecture Highlights

### Smart Auth Flow
1. User enters email
2. App checks if email exists (no password shown yet)
3. If exists: Show password field for login
4. If new: Show password + name fields for registration
5. Social auth (Apple/Google) bypasses email check

### Auto-Save System
- Every lesson interaction saved to backend
- User can close app and resume exactly where they left off
- Progress includes: completed sections, exercise answers, time spent

### XP League System
- Weekly competitions (Monday-Sunday)
- Users ranked by XP earned that week
- Tiers based on historical performance
- Promotes engagement through gamification

### Music-Based Learning
- Learn through songs in target language
- Tap lyrics for instant translations
- Difficulty rating per track
- Curated playlists by proficiency level

## 🔐 Security Notes

- JWT tokens stored in Keychain (secure)
- Google Client ID is public (OAuth requires it)
- Apple Sign In uses cryptographic user IDs
- Backend must validate all OAuth tokens server-side
- Never trust client-side level/XP data - always verify on backend
