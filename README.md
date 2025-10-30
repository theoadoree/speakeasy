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
cd FluentAI
npm install
```

### 2. Install Ollama (LLM Backend)

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai

### 3. Start Ollama Server

Open a terminal and run:
```bash
ollama serve
```

Keep this terminal open!

### 4. Download a Model

In another terminal:
```bash
# Recommended: Llama 2 (~4GB)
ollama pull llama2

# Or: Mistral (faster, ~4GB)
ollama pull mistral

# Or: Llama 3 (better quality, ~4.7GB)
ollama pull llama3
```

### 5. iOS Setup (Optional but Recommended)

For full notification support and native features:

```bash
# Install iOS pods
cd ios && pod install && cd ..
```

**See `IOS_SETUP.md` for complete iOS setup instructions.**

### 6. Start SpeakEasy

```bash
npm start
```

### 7. Open the App

- **iOS Simulator**: `npx expo run:ios` (requires iOS simulator runtime)
- **Android Emulator**: `npx expo run:android`
- **Web Browser**: Press `w` in terminal or `npm run web`
- **Physical Device**: Scan QR code with Expo Go app

## First Time Setup

1. **Welcome**: Enter your name
2. **Choose Language**: Select the language you want to learn
3. **Select Level**: Choose your proficiency level (A1-C2)
4. **Pick Interests**: Select at least 3 interests
5. **Complete Subscription**: Choose your plan
6. **Configure LLM**:
   - Go to More → Settings
   - API URL: `http://localhost:11434`
   - Model: `llama2` (or whichever you downloaded)
   - Tap "Test Connection" ✅
   - Tap "Save Config"
7. **Enable Notifications**:
   - Go to More → Settings → Notifications
   - Toggle Daily Reminders ON
   - Tap "Send Test Notification" to verify

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

### "LLM Not Connected"
- Make sure `ollama serve` is running in a terminal
- Go to Settings → Test Connection
- Verify model is downloaded: `ollama list`

### App Won't Start
```bash
# Clear cache
npm start -- --clear
```

### Slow Responses
- Normal on first use (model needs to load)
- Consider using `mistral` instead of `llama2` for faster responses

## Technology Stack

- **Frontend**: React Native (Expo)
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **LLM Backend**: Ollama (local, private)
- **AI Models**: Llama 2, Llama 3, Mistral (your choice)

## Privacy

✅ All data stays on your device  
✅ No cloud processing  
✅ Your conversations are private  
✅ No tracking or analytics  

## What Makes SpeakEasy Special

Unlike traditional language apps:
- 🎯 **Immersion First**: Use the language from day one through stories and conversations
- 🧠 **Adaptive Content**: Every lesson adjusts to your exact level
- 🎵 **Music Integration**: Learn through songs you actually want to listen to
- 🏆 **Gamified**: XP, leagues, and achievements keep you motivated
- 🔔 **Smart Reminders**: Daily notifications with 14 unique messages
- 📊 **Analytics**: Track what works best for your learning style
- 🤖 **AI-Powered**: Local AI for privacy-preserving personalization
- 🎤 **Accent Training**: Practice pronunciation with AI feedback

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
