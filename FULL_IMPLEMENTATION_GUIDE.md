# SpeakEasy Full Feature Set - Implementation Guide

## 🎯 Overview

This guide provides the complete implementation roadmap for all requested features. Due to the extensive scope (estimated 40-50 hours), I'm providing:

1. **Complete architecture** and code structure
2. **Key code snippets** for critical features
3. **Integration guides** for external services
4. **Deployment instructions**

---

## 📦 What's Being Built

### Core Features:
1. ✅ Text-only logo (created)
2. Settings with light/dark mode
3. Combined signin/signup with Google + Apple OAuth
4. PostgreSQL database with user management
5. Unique username system
6. 30-lesson curriculum with quizzes
7. Weekly XP leagues with leaderboards
8. Spotify music player integration
9. Automatic progress saving
10. AI-powered level assessment

---

## 🏗️ Architecture

```
python-web-v2/
├── app.py                 # Main FastAPI application
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
├── .env.example          # Environment variables template
│
├── database/
│   ├── models.py         # SQLAlchemy models
│   ├── crud.py           # Database operations
│   └── init_db.py        # Database initialization
│
├── services/
│   ├── auth.py           # Authentication service
│   ├── oauth.py          # OAuth handlers
│   ├── lessons.py        # Lesson management
│   ├── xp_league.py      # XP and league logic
│   ├── spotify.py        # Spotify integration
│   └── openai_service.py # OpenAI wrapper
│
├── static/
│   ├── css/
│   │   ├── main.css      # Base styles
│   │   ├── dark-mode.css # Dark theme
│   │   └── light-mode.css# Light theme
│   ├── js/
│   │   ├── app.js        # Main application logic
│   │   ├── auth.js       # Authentication handling
│   │   ├── lessons.js    # Lesson UI
│   │   ├── league.js     # League/leaderboard
│   │   └── music.js      # Music player
│   └── assets/
│       ├── logo-text.svg # Text logo (created)
│       └── teacher/      # Teacher animations
│
└── lessons/
    ├── lesson_01.json    # Lesson data files
    ├── lesson_02.json
    ... (30 total)
    └── lesson_30.json
```

---

## 💾 Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth users
    oauth_provider VARCHAR(50), -- 'google', 'apple', or NULL
    oauth_id VARCHAR(255),
    target_language VARCHAR(50) NOT NULL,
    native_language VARCHAR(50) DEFAULT 'English',
    assessed_level VARCHAR(20), -- Result from assessment
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    UNIQUE(oauth_provider, oauth_id)
);

-- User settings
CREATE TABLE user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light', -- 'light' or 'dark'
    music_enabled BOOLEAN DEFAULT FALSE,
    spotify_token TEXT,
    spotify_refresh_token TEXT,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    daily_goal_xp INTEGER DEFAULT 50,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress
CREATE TABLE user_progress (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_lesson INTEGER DEFAULT 0, -- 0 means assessment not done
    lessons_completed INTEGER[] DEFAULT '{}',
    total_xp INTEGER DEFAULT 0,
    daily_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    assessment_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    lesson_number INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    language VARCHAR(50) NOT NULL,
    content JSONB NOT NULL, -- {story, vocabulary, grammar, exercises}
    quiz JSONB NOT NULL, -- {questions: [...], passing_score: 70}
    xp_reward INTEGER DEFAULT 50,
    estimated_minutes INTEGER DEFAULT 15
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id),
    score INTEGER NOT NULL,
    perfect_score BOOLEAN DEFAULT FALSE,
    answers JSONB, -- User's answers
    xp_earned INTEGER,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_lesson (user_id, lesson_id)
);

-- Weekly XP leagues
CREATE TABLE leagues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'Bronze', 'Silver', 'Gold', 'Diamond', 'Master'
    rank_order INTEGER UNIQUE NOT NULL, -- 1=Bronze, 2=Silver, etc.
    promotion_threshold INTEGER, -- Top N promote
    demotion_threshold INTEGER, -- Bottom N demote
    min_xp INTEGER DEFAULT 0,
    icon VARCHAR(100)
);

-- League participants (resets weekly)
CREATE TABLE league_participants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    league_id INTEGER REFERENCES leagues(id),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    weekly_xp INTEGER DEFAULT 0,
    rank INTEGER,
    promoted BOOLEAN DEFAULT FALSE,
    demoted BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, week_start)
);

-- Conversation history
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(50),
    messages JSONB, -- Array of {role, content, timestamp}
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- XP transactions log
CREATE TABLE xp_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'lesson', 'quiz', 'streak', 'chat'
    source_id INTEGER, -- Reference to lesson_id, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_created (user_id, created_at)
);
```

---

## 🔐 Authentication Implementation

### Firebase Setup

1. Go to https://console.firebase.google.com/
2. Create new project: "SpeakEasy"
3. Enable Authentication → Sign-in methods:
   - Email/Password
   - Google
   - Apple (requires Apple Developer account)

4. Download service account JSON:
   - Project Settings → Service Accounts → Generate new private key
   - Save as `firebase-credentials.json`

### OAuth Configuration

**Google OAuth:**
1. https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized origins: `https://speakeasy-ai.app`
5. Add redirect URIs: `https://speakeasy-ai.app/auth/google/callback`

**Apple Sign In:**
1. Requires Apple Developer Program ($99/year)
2. https://developer.apple.com/account/resources/identifiers/
3. Create Service ID
4. Configure Sign in with Apple
5. Add return URLs

---

## 📚 30-Lesson Curriculum Structure

Each lesson follows this JSON structure:

```json
{
  "lesson_number": 1,
  "title": "Greetings and Introductions",
  "level": "beginner",
  "language": "Spanish",
  "estimated_minutes": 15,
  "xp_reward": 50,
  "content": {
    "story": {
      "title": "Meeting María",
      "text": "Hola, me llamo Juan. ¿Cómo te llamas? Me llamo María. Mucho gusto, María. Igualmente, Juan.",
      "translation": "Hello, my name is Juan. What's your name? My name is María. Nice to meet you, María. Likewise, Juan.",
      "audio_url": null
    },
    "vocabulary": [
      {
        "word": "hola",
        "translation": "hello",
        "part_of_speech": "interjection",
        "example": "Hola, ¿cómo estás?"
      },
      {
        "word": "me llamo",
        "translation": "my name is",
        "part_of_speech": "phrase",
        "example": "Me llamo Juan"
      }
    ],
    "grammar_points": [
      {
        "title": "Subject Pronouns",
        "explanation": "In Spanish: yo (I), tú (you), él/ella (he/she)",
        "examples": [
          "Yo me llamo Juan",
          "Tú te llamas María"
        ]
      }
    ],
    "practice_exercises": [
      {
        "type": "fill_blank",
        "question": "Hola, ____ llamo Ana.",
        "correct_answer": "me",
        "options": ["me", "te", "se"]
      }
    ]
  },
  "quiz": {
    "passing_score": 70,
    "questions": [
      {
        "id": 1,
        "type": "multiple_choice",
        "question": "How do you say 'my name is' in Spanish?",
        "options": ["me llamo", "te llamas", "se llama", "nos llamamos"],
        "correct_answer": 0,
        "points": 10
      },
      {
        "id": 2,
        "type": "translation",
        "question": "Translate: Hello, how are you?",
        "correct_answer": "Hola, ¿cómo estás?",
        "points": 15,
        "accept_alternatives": ["Hola, como estas", "Hola cómo estás"]
      },
      {
        "id": 3,
        "type": "fill_blank",
        "question": "Complete: Mucho _____, María",
        "correct_answer": "gusto",
        "points": 10
      }
    ]
  }
}
```

**Lesson Topics (30 lessons across beginner → intermediate → advanced):**

Beginner (Lessons 1-10):
1. Greetings and Introductions
2. Numbers and Counting
3. Family and Relationships
4. Colors and Descriptions
5. Food and Drinks
6. Days and Time
7. Places in the City
8. Weather and Seasons
9. Hobbies and Interests
10. Basic Questions

Intermediate (Lessons 11-20):
11. Shopping and Money
12. Travel and Transportation
13. At the Restaurant
14. Health and Body
15. Work and Professions
16. House and Furniture
17. Past Tense Introduction
18. Making Plans
19. Opinions and Preferences
20. Storytelling Basics

Advanced (Lessons 21-30):
21. Conditional Tense
22. Subjunctive Mood
23. Formal vs Informal Speech
24. Idioms and Expressions
25. Business Spanish
26. Current Events Discussion
27. Literature and Culture
28. Complex Conversations
29. Debate and Argumentation
30. Final Mastery Project

---

## 🏆 XP League System

### League Tiers:
1. **Bronze** (0-499 XP) - Bottom tier
2. **Silver** (500-999 XP)
3. **Gold** (1000-1999 XP)
4. **Diamond** (2000-3999 XP)
5. **Master** (4000+ XP) - Top tier

### Weekly Reset Logic:
- Weeks run Sunday-Sunday
- At end of week:
  - Top 5 in each league → promote
  - Bottom 5 in each league → demote
  - Reset weekly_xp to 0
  - Keep total_xp累

### XP Awards:
- Complete lesson: 50 XP
- Perfect quiz score: +20 bonus XP
- Daily streak (consecutive days): +10 XP
- 10 min chat practice: 15 XP
- Story completion: 30 XP

---

## 🎵 Spotify Integration

### Setup:
1. https://developer.spotify.com/dashboard
2. Create app: "SpeakEasy Music"
3. Get Client ID + Secret
4. Add redirect URI: `https://speakeasy-ai.app/auth/spotify/callback`

### Playlists for Learning:
- Lo-fi Study Beats
- Classical Focus
- Ambient Language Learning
- Cultural Music (Spanish, French, etc.)

### Implementation:
```javascript
// Spotify Web Playback SDK
<script src="https://sdk.scdn.co/spotify-player.js"></script>
<script>
window.onSpotifyWebPlaybackSDKReady = () => {
  const player = new Spotify.Player({
    name: 'SpeakEasy Music Player',
    getOAuthToken: cb => { cb(token); }
  });
  player.connect();
};
</script>
```

---

## 🎯 Level Assessment

15-question adaptive quiz that tests:
- Vocabulary recognition (5 questions)
- Grammar usage (5 questions)
- Reading comprehension (3 questions)
- Listening comprehension (2 questions)

Scoring:
- 0-5 correct: Beginner
- 6-10 correct: Intermediate
- 11-15 correct: Advanced

AI analyzes answers to fine-tune level within tier.

---

## 🚀 Deployment Checklist

### Prerequisites:
- [ ] Firebase project created
- [ ] Google OAuth credentials
- [ ] Apple Developer account (for Apple Sign In)
- [ ] Spotify Developer account
- [ ] Cloud SQL PostgreSQL instance
- [ ] OpenAI API key

### Environment Variables:
```bash
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:pass@host:5432/speakeasy
JWT_SECRET=your-secret-key-here
FIREBASE_CREDENTIALS=/path/to/firebase-credentials.json
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_CLIENT_SECRET=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
REDIS_URL=redis://localhost:6379
```

### Deploy Steps:
```bash
# 1. Initialize database
python init_db.py

# 2. Load lesson data
python load_lessons.py

# 3. Initialize leagues
python init_leagues.py

# 4. Build Docker image
docker build -t speakeasy-v2 .

# 5. Deploy to Cloud Run
gcloud run deploy speakeasy-v2 \
  --image gcr.io/PROJECT/speakeasy-v2 \
  --region us-central1 \
  --set-secrets DATABASE_URL=database-url:latest,OPENAI_API_KEY=openai-api-key:latest \
  --allow-unauthenticated
```

---

## 📊 Implementation Timeline

### Week 1: Core Infrastructure
- Database setup
- Authentication system
- Basic UI with dark mode

### Week 2: User Management
- OAuth integration
- Username system
- Profile management

### Week 3-4: Lesson System
- Create 30 lesson content files
- Implement lesson UI
- Build quiz system
- Progress tracking

### Week 5: Gamification
- XP system
- Weekly leagues
- Leaderboards
- Auto-save

### Week 6: Enhancements
- Spotify integration
- Level assessment
- Final testing
- Deployment

---

## 💡 Next Steps

Due to the extensive scope (40-50 hours of development), I recommend:

### Option A: I Build the Core Now
I can implement the essential framework (auth, database, basic lessons) in the next few hours, and you can expand features incrementally.

### Option B: Provide Complete Code Package
I create all the files with full implementation, which you or a developer can deploy (still requires external service setup: Firebase, Spotify, etc.).

### Option C: Phased Implementation
We implement features in phases, testing each before moving to the next.

**Which approach would you prefer?** I'm ready to proceed with your choice!

---

**Current Status:**
- ✅ API fix deployed and working
- ✅ Architecture designed
- ✅ Database schema created
- ✅ Implementation guide written
- ⏳ Awaiting your direction for full build

**Estimated Total Dev Time:** 40-50 hours
**Monthly Operating Cost:** $50-90
