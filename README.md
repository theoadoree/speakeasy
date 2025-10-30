# SpeakEasy - AI Language Learning 🚀

An AI-powered language learning app with gamification, music lessons, and daily reminders!

## Features ✨

### 📚 Learning Modes
- **Personalized Stories**: AI-generated content based on your interests
- **Structured Curriculum**: Progressive lessons with quizzes
- **Custom Lessons**: Create your own vocabulary, grammar, and culture lessons
- **Interactive Reading**: Tap any word for instant explanations with adaptive difficulty

### 🎵 Music Lessons
- **Search Songs**: Browse Spotify and Apple Music catalogs
- **Learn Through Lyrics**: Turn your favorite songs into language lessons
- **Interactive Exercises**: Vocabulary quizzes, fill-in-the-blanks, listening comprehension

### 💬 Practice Tools
- **AI Chat**: Converse with an intelligent language tutor
- **Accent Tutor**: Practice pronunciation with AI feedback (0-10 scoring)

### 🏆 Gamification
- **XP System**: Earn points for all learning activities
- **6 League Tiers**: Progress from Bronze to Legendary
- **Leaderboard**: Compete with other learners
- **Achievements**: Unlock badges for milestones

### 🔔 Smart Reminders
- **Daily Notifications**: Get reminded at noon and 6pm (customizable)
- **14 Unique Messages**: Varied reminders to keep you engaged
- **Analytics Dashboard**: Track which messages work best
- **Smart Scheduling**: Only reminds you if you haven't practiced that day

## Quick Start

### 1. Install Dependencies

```bash
cd speakeasy
npm install
```

### 2. iOS Setup (Optional but Recommended)

For full notification support and native features:

```bash
# Install iOS pods
cd ios && pod install && cd ..
```

**See `IOS_SETUP.md` for complete iOS setup instructions.**

### 3. Start SpeakEasy

```bash
npm start
```

### 4. Open the App

- **iOS Simulator**: `npx expo run:ios` (requires iOS simulator runtime)
- **Android Emulator**: `npx expo run:android`
- **Web Browser**: Press `w` in terminal or `npm run web`
- **Physical Device**: Scan QR code with Expo Go app

## Production Setup (No Local LLM Required!)

**Good news!** The app now uses a cloud-hosted backend - you don't need to run Ollama locally!

The mobile app automatically connects to our production backend at:
```
https://speakeasy-backend-823510409781.us-central1.run.app
```

This means:
- ✅ No need to install Ollama
- ✅ No need to download 4GB+ models
- ✅ Works on any device without local AI processing
- ✅ Faster responses from cloud infrastructure

### For Developers: Local Ollama (Optional)

If you want to run Ollama locally for development:

1. **Install Ollama**
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh

   # Windows: Download from https://ollama.ai
   ```

2. **Start Ollama**
   ```bash
   ollama serve
   ```

3. **Download Models**
   ```bash
   ollama pull llama2        # Recommended
   ollama pull qwen2.5:72b   # Advanced (requires 40GB+ RAM)
   ```

4. **Configure for Local Development**

   Edit `src/config/llm.config.js` and set `mode: 'direct'` in the development config, or set `NODE_ENV=development` in your environment.

## First Time Setup

1. **Welcome**: Enter your name
2. **Choose Language**: Select the language you want to learn
3. **Select Level**: Choose your proficiency level (A1-C2)
4. **Pick Interests**: Select at least 3 interests
5. **Complete Subscription**: Choose your plan
6. **Enable Notifications** (Optional):
   - Go to More → Settings → Notifications
   - Toggle Daily Reminders ON
   - Tap "Send Test Notification" to verify

The app automatically connects to our cloud backend - no LLM configuration needed!

## Usage

### 📚 Learn Tab
- **Stories**: Generate AI-powered stories based on your interests
- **Curriculum**: Follow structured lessons with quizzes
- **Custom**: Create personalized vocabulary and grammar lessons

### 💬 Practice Tab
- **AI Chat**: Converse with your AI tutor in the target language
- **Accent Tutor**: Practice pronunciation with 4 focus areas (Vowels, Consonants, Intonation, Speed)

### 🎵 Music Tab
- Search for songs on Spotify or Apple Music
- View lyrics and translations
- Complete interactive exercises
- Save favorite songs to your library

### 🏆 Leagues Tab
- View your current league (Bronze → Legendary)
- Check leaderboard rankings
- Browse unlocked achievements
- Track learning statistics

### ⋯ More Tab
- **Review**: Practice words you've learned with spaced repetition
- **Settings**: Configure app preferences, LLM, notifications, and theme

## Troubleshooting

### "LLM Not Connected" or API Errors
- The app uses our cloud backend by default
- Check your internet connection
- Verify the backend is running: https://speakeasy-backend-823510409781.us-central1.run.app/health
- If you're developing locally with Ollama, make sure `ollama serve` is running

### App Won't Start
```bash
# Clear cache
npm start -- --clear
```

### Slow Responses
- First response may be slower as the cloud model initializes
- Subsequent responses should be faster
- If using local Ollama: Normal on first use (model needs to load)

## Technology Stack

- **Frontend**: React Native (Expo)
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Backend**: Node.js/Express (Google Cloud Run)
- **LLM**: OpenAI GPT-4o-mini (cloud) or Ollama (local development)
- **Deployment**: Google Cloud Run with auto-scaling

## Privacy

✅ Conversations processed through secure cloud backend
✅ No long-term conversation storage
✅ User data stored locally on device
✅ No third-party tracking or analytics

For maximum privacy, developers can run the backend locally with Ollama.  

## What Makes SpeakEasy Special

Unlike traditional language apps:
- 🎯 **Immersion First**: Use the language from day one through stories and conversations
- 🧠 **Adaptive Content**: Every lesson adjusts to your exact level
- 🎵 **Music Integration**: Learn through songs you actually want to listen to
- 🏆 **Gamified**: XP, leagues, and achievements keep you motivated
- 🔔 **Smart Reminders**: Daily notifications with 14 unique messages
- 📊 **Analytics**: Track what works best for your learning style
- 🤖 **AI-Powered**: Cloud-hosted AI with no local setup required
- 🎤 **Accent Training**: Practice pronunciation with AI feedback
- ☁️ **No Setup Required**: Works out of the box without installing models or running local servers

## Project Structure

```
speakeasy/
├── App.js                           # Main app entry with 5-tab navigation
├── ios/                             # Native iOS project
├── src/
│   ├── contexts/
│   │   ├── AppContext.js            # App state management
│   │   ├── AuthContext.js           # Authentication state
│   │   ├── SubscriptionContext.js   # Subscription management
│   │   └── ThemeContext.js          # Theme state
│   ├── screens/
│   │   ├── LearnNavigatorScreen.js  # Learn tab with sub-navigation
│   │   ├── PracticeNavigatorScreen.js # Practice tab with sub-navigation
│   │   ├── MusicScreen.js           # Music lessons
│   │   ├── LeaguesScreen.js         # Gamification
│   │   ├── MoreScreen.js            # More hub
│   │   ├── SettingsScreen.js        # Settings & notifications
│   │   ├── AccentTutorScreen.js     # Pronunciation practice
│   │   └── LyricsLessonScreen.js    # Music-based learning
│   ├── services/
│   │   ├── llm.js                   # Ollama integration
│   │   ├── notifications.js         # Push notification system
│   │   ├── analytics.js             # Notification analytics
│   │   └── music.js                 # Spotify/Apple Music API
│   ├── utils/
│   │   ├── storage.js               # AsyncStorage wrapper
│   │   └── xp.js                    # XP calculation system
│   └── components/
│       └── XPReward.js              # XP animation component
├── NOTIFICATIONS.md                  # Notification documentation
├── IOS_SETUP.md                     # iOS setup guide
└── PROJECT_COMPLETION_SUMMARY.md    # Feature summary
```

## Development

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## License

MIT

---

Made with ❤️ for language learners worldwide 🌍
