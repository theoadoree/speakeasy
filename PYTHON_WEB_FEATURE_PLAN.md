# SpeakEasy Python Web - Comprehensive Feature Implementation Plan

## ✅ FIXED: Story Generation Error

**Issue**: OpenAI API was using deprecated syntax (openai<1.0.0)
**Solution**: Updated to openai>=1.0.0 syntax with `client.chat.completions.create()`
**Status**: ✅ Deployed and working - Test at https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app

---

## 📋 Requested Features Breakdown

### 1. Branding & UI Updates

#### ✅ Already Implemented:
- Logo and favicon added
- Animated teacher with expressions

#### 🔧 To Implement:
- [ ] **Text-only logo** for header (replace current graphic logo)
- [ ] **Settings icon** in upper right corner
- [ ] **Light/Dark mode** toggle in settings
- [ ] **Simplified icon** for browser tab and signin screen

**Estimated Time**: 2-3 hours
**Files to Modify**: `static/index.html`, `static/assets/`

---

### 2. Authentication System

#### Current State:
- Mock authentication (no real users)
- No signin/signup screens

#### To Implement:
- [ ] **Combined Signin/Signup Screen**
  - Single screen that registers new users or logs in existing
  - Check if email exists in database
  - If exists → login and load progress
  - If new → register and prompt for username

- [ ] **OAuth Integration**
  - Google Sign-In
  - Apple Sign-In
  - Redirect to username creation after OAuth

- [ ] **Backend User Management**
  - PostgreSQL or Firebase database
  - User table: email, username, password_hash, created_at
  - Email logging for each new user
  - Session management with JWT tokens

- [ ] **Username System**
  - Prompt for unique username after signup
  - Check availability against database
  - Warn if username taken
  - Suggest alternatives

**Estimated Time**: 8-12 hours
**Technologies Needed**:
- Firebase Auth or Auth0 for OAuth
- PostgreSQL + SQLAlchemy OR Firestore
- JWT for session tokens
- Password hashing (bcrypt)

---

### 3. Automatic Progress Saving

#### To Implement:
- [ ] **Auto-save on every action**
  - Story completion
  - Lesson progress
  - Quiz scores
  - XP earned
  - Current position in curriculum

- [ ] **Load saved progress on login**
  - Resume where user left off
  - Show progress dashboard

- [ ] **Database Schema**
  ```sql
  CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    current_lesson INTEGER DEFAULT 1,
    lessons_completed INTEGER[] DEFAULT '{}',
    total_xp INTEGER DEFAULT 0,
    weekly_xp INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT NOW(),
    settings JSONB DEFAULT '{}'
  );
  ```

**Estimated Time**: 4-6 hours

---

### 4. Level Assessment (No Prompting)

#### Current State:
- User selects level (beginner/intermediate/advanced)

#### To Implement:
- [ ] **Automated Placement Test**
  - 10-15 question quiz on first signup
  - Mix of vocabulary, grammar, listening
  - AI-powered assessment using OpenAI
  - Automatically assign level based on score

- [ ] **Adaptive Difficulty**
  - Track user performance
  - Auto-adjust level as they progress
  - No manual level selection needed

**Estimated Time**: 6-8 hours

---

### 5. 30-Lesson Curriculum with Quizzes

#### To Implement:
- [ ] **Lesson Structure**
  ```json
  {
    "lesson_id": 1,
    "title": "Greetings and Introductions",
    "level": "beginner",
    "content": {
      "story": "...",
      "vocabulary": [...],
      "grammar_points": [...],
      "practice_exercises": [...]
    },
    "quiz": {
      "questions": [...],
      "passing_score": 70
    },
    "xp_reward": 50
  }
  ```

- [ ] **Lesson Types**
  1. Story-based lessons (current system)
  2. Vocabulary lessons
  3. Grammar lessons
  4. Listening comprehension
  5. Speaking practice

- [ ] **Quiz System**
  - Multiple choice
  - Fill in the blank
  - Translation exercises
  - Audio matching
  - Must pass to unlock next lesson

- [ ] **Progress Tracking**
  - Lessons completed
  - Quiz scores
  - Stars/badges earned

**Estimated Time**: 20-30 hours (creating content + implementing system)

---

### 6. Weekly XP Leagues

#### To Implement:
- [ ] **League System**
  - Bronze, Silver, Gold, Diamond, Master leagues
  - Users compete within their league
  - Top performers promote, bottom demote
  - Weekly reset (Sunday/Monday)

- [ ] **XP Calculation**
  - Lesson completion: 50 XP
  - Quiz perfect score: +20 bonus XP
  - Daily streak: +10 XP
  - Story completion: 30 XP
  - Chat practice (10 min): 15 XP

- [ ] **Leaderboard**
  - Show top 10 in user's league
  - User's current rank
  - XP progress bar
  - Time remaining in week

- [ ] **Database Schema**
  ```sql
  CREATE TABLE leagues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    min_xp INTEGER,
    max_xp INTEGER,
    icon VARCHAR(100)
  );

  CREATE TABLE league_participants (
    user_id INTEGER,
    league_id INTEGER,
    week_start DATE,
    weekly_xp INTEGER DEFAULT 0,
    rank INTEGER
  );
  ```

**Estimated Time**: 10-15 hours

---

### 7. Music Integration

#### To Implement:
- [ ] **Spotify Integration**
  - Spotify Web Playback SDK
  - Play language-learning playlists
  - Background music during lessons
  - User's personal playlists

- [ ] **Apple Music Integration**
  - MusicKit JS
  - Similar functionality to Spotify
  - Requires Apple Developer account

- [ ] **Features**
  - Music player widget in corner
  - Volume control
  - Play/pause
  - Skip tracks
  - Genre selection (lo-fi, classical, ambient)
  - "Study mode" with focus music

- [ ] **API Requirements**
  - Spotify: Client ID + Secret (free)
  - Apple Music: Developer token ($99/year)

**Estimated Time**: 12-16 hours
**Note**: Requires external API accounts and approval

---

## 🏗️ Implementation Priority

### Phase 1: Critical Fixes (Week 1)
1. ✅ Fix story generation API ← DONE
2. Update logo to text-only version
3. Add settings icon with light/dark mode
4. Create combined signin/signup screen

### Phase 2: Authentication (Week 2)
1. Set up database (PostgreSQL or Firestore)
2. Implement email/password authentication
3. Add Google OAuth
4. Add Apple OAuth (requires Apple Developer account)
5. Implement username system with availability check
6. Add JWT session management

### Phase 3: Core Learning Features (Weeks 3-4)
1. Create 30-lesson curriculum content
2. Implement lesson progression system
3. Build quiz system
4. Add XP tracking
5. Implement auto-save functionality
6. Build level assessment quiz

### Phase 4: Gamification (Week 5)
1. Implement weekly XP leagues
2. Create leaderboard UI
3. Add promotion/demotion system
4. Build progress dashboard

### Phase 5: Music Integration (Week 6)
1. Apply for Spotify API access
2. Integrate Spotify Web Playback SDK
3. (Optional) Add Apple Music if budget allows
4. Build music player UI

---

## 🗄️ Database Schema (Complete)

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  target_language VARCHAR(50),
  native_language VARCHAR(50) DEFAULT 'English',
  level VARCHAR(20), -- auto-assessed
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- User progress table
CREATE TABLE user_progress (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  current_lesson INTEGER DEFAULT 1,
  lessons_completed INTEGER[] DEFAULT '{}',
  quiz_scores JSONB DEFAULT '{}',
  total_xp INTEGER DEFAULT 0,
  weekly_xp INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_activity DATE,
  settings JSONB DEFAULT '{"theme": "light", "music_enabled": false}'
);

-- Lessons table
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  lesson_number INTEGER UNIQUE,
  title VARCHAR(255),
  level VARCHAR(20),
  language VARCHAR(50),
  content JSONB, -- story, vocab, grammar
  quiz JSONB, -- questions array
  xp_reward INTEGER DEFAULT 50
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lesson_id INTEGER REFERENCES lessons(id),
  score INTEGER,
  answers JSONB,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Leagues table
CREATE TABLE leagues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  rank_order INTEGER,
  min_xp INTEGER,
  max_xp INTEGER,
  icon VARCHAR(100)
);

-- League participants table
CREATE TABLE league_participants (
  user_id INTEGER REFERENCES users(id),
  league_id INTEGER REFERENCES leagues(id),
  week_start DATE,
  weekly_xp INTEGER DEFAULT 0,
  rank INTEGER,
  PRIMARY KEY (user_id, week_start)
);

-- Conversation history table
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  language VARCHAR(50),
  messages JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 UI Mockups Needed

### Signin/Signup Screen
```
┌─────────────────────────────────────┐
│   [SpeakEasy AI Text Logo]          │
│   AI-Powered Language Teacher        │
│                                      │
│   ┌───────────────────────────┐    │
│   │  Email                     │    │
│   └───────────────────────────┘    │
│                                      │
│   ┌───────────────────────────┐    │
│   │  Password (optional)       │    │
│   └───────────────────────────┘    │
│                                      │
│   [ Continue with Email ]           │
│                                      │
│   ───────── or ─────────            │
│                                      │
│   [ 🍎 Continue with Apple ]        │
│   [ 🔵 Continue with Google ]       │
│                                      │
└─────────────────────────────────────┘
```

### Settings Menu (Upper Right)
```
┌──────────────────┐
│ ⚙️ Settings       │
├──────────────────┤
│ 🌙 Dark Mode      │ [Toggle]
│ 🎵 Music          │ [Toggle]
│ 📊 Progress       │
│ 🏆 Leaderboard    │
│ 👤 Profile        │
│ 🚪 Logout         │
└──────────────────┘
```

### XP League Display
```
┌─────────────────────────────────────┐
│  🏆 Gold League                     │
│  Week ends in: 3 days 14:23         │
├─────────────────────────────────────┤
│  1. 🥇 Alex_123      2,450 XP      │
│  2. 🥈 Maria_learn   2,320 XP      │
│  3. 🥉 John_poly     2,180 XP      │
│  ...                                 │
│  12. YOU: username   1,850 XP       │
│  ...                                 │
│  ▲ Top 5 promote to Diamond         │
│  ▼ Bottom 5 demote to Silver        │
└─────────────────────────────────────┘
```

---

## 📦 Technology Stack Updates

### Current:
- FastAPI
- OpenAI API
- Static HTML/JS/CSS

### Needed Additions:
- **Database**: PostgreSQL (Cloud SQL) or Firestore
- **Auth**: Firebase Auth or Auth0
- **ORM**: SQLAlchemy (if PostgreSQL)
- **Session**: JWT tokens (python-jose)
- **Password**: bcrypt
- **OAuth**: google-auth, apple-signin
- **Music**: Spotify Web API, Apple MusicKit JS
- **Cache**: Redis (optional, for leaderboards)

---

## 💰 Cost Estimates

### Monthly Operating Costs:
- Google Cloud Run: ~$5-10 (within free tier for <10k users)
- Cloud SQL (PostgreSQL): $10-30/month for db-f1-micro
  - OR Firestore: Free tier covers ~50k reads/20k writes per day
- OpenAI API: ~$20-50/month (depends on usage)
- Spotify API: FREE
- Apple Music API: $99/year Apple Developer Program
- Total: **$35-90/month** (or $43-98/month with Apple Music)

### Alternative (Lowest Cost):
- Use Firestore instead of Cloud SQL: FREE tier
- Skip Apple Music initially: Save $99/year
- Total: **$25-60/month**

---

## 🚀 Quick Start Recommendations

### Option 1: MVP (Minimum Viable Product)
**Focus on core value, skip music for now**
1. ✅ Fix API (done!)
2. Add text logo + settings icon
3. Basic email auth (no OAuth yet)
4. 10 lessons instead of 30
5. Simple XP system (no leagues yet)
6. Auto-save progress

**Time**: 2-3 weeks
**Cost**: ~$25-30/month

### Option 2: Full Feature Set
**Everything you requested**
1. All UI updates
2. Full OAuth (Google + Apple)
3. 30 lessons with quizzes
4. Weekly XP leagues
5. Music integration (Spotify)
6. Level assessment

**Time**: 6-8 weeks
**Cost**: ~$50-90/month

### Option 3: Hybrid Approach
**Core features now, add-ons later**
1. Week 1-2: UI + Auth (Google only)
2. Week 3-4: 15 lessons + quizzes
3. Week 5: XP leagues
4. Later: Apple auth, more lessons, music

**Time**: 4-5 weeks initial, ongoing improvements
**Cost**: ~$35-60/month

---

## 🛠️ Immediate Next Steps

1. **Decide on scope**: MVP, Full, or Hybrid?
2. **Set up database**: Cloud SQL or Firestore?
3. **Get API keys**:
   - Firebase project (free)
   - Google OAuth Client ID (free)
   - Apple Developer account ($99/year)
   - Spotify API (free)

4. **Start with**:
   - Create text-only logo
   - Add settings icon
   - Implement dark mode

Would you like me to:
- **A) Start with MVP** (quickest path to usable product)
- **B) Begin full implementation** (all features, takes longer)
- **C) Focus on specific feature first** (e.g., just auth, or just lessons)

Let me know your priority and I'll begin implementation!

---

**Current Status**:
- ✅ Story generation: FIXED and deployed
- ⏳ All other features: Planned and documented
- 🎯 Ready to implement based on your priorities
