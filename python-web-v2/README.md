# SpeakEasy Python Web v2 - Full Feature Set

Complete rewrite with:
- ✅ Firebase Authentication (Google + Apple OAuth)
- ✅ PostgreSQL database with user management
- ✅ 30-lesson curriculum with quizzes
- ✅ Weekly XP leagues and leaderboards
- ✅ Spotify music integration
- ✅ Auto-save progress
- ✅ Automated level assessment
- ✅ Light/Dark mode
- ✅ Text-only logo

## Setup

See SETUP.md for complete installation instructions.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Initialize database
python init_db.py

# Run app
python app.py
```

## Environment Variables Required

- OPENAI_API_KEY
- FIREBASE_CREDENTIALS (path to JSON)
- DATABASE_URL
- JWT_SECRET
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- APPLE_CLIENT_ID
- APPLE_CLIENT_SECRET
