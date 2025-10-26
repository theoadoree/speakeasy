# FluentAI - Adaptive Language Learning 🚀

An AI-powered language learning app that adapts to your level and interests!

## Features ✨

- **Contextual Immersion Engine**: Learn through personalized, AI-generated stories
- **Interactive Reading**: Tap any word for instant explanations
- **Adaptive Layers**: Slide between difficulty levels in real-time
- **Content Import**: Turn songs, articles, and texts into learning modules
- **AI Conversation Practice**: Chat with an intelligent language tutor
- **Smart Analysis**: Automatically analyze imported content for vocabulary, grammar, and culture

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

### 5. Start FluentAI

```bash
npm start
```

### 6. Open the App

- **iOS**: Scan QR code with Camera app (requires Expo Go)
- **Android**: Scan QR code with Expo Go app
- **Web**: Press `w` in terminal
- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal

## First Time Setup

1. **Welcome**: Enter your name
2. **Choose Language**: Select the language you want to learn
3. **Select Level**: Choose your proficiency level (A1-C2)
4. **Pick Interests**: Select at least 3 interests
5. **Configure LLM**: 
   - Go to Settings tab
   - API URL: `http://localhost:11434`
   - Model: `llama2` (or whichever you downloaded)
   - Tap "Test Connection" ✅
   - Tap "Save Config"

## Usage

### Generate Stories
- Tap "✨ Generate Story" on the Home screen
- AI creates personalized content based on your interests and level
- Tap any word for instant explanations

### Import Content
- Tap "📄 Import Content"
- Choose type: article, lyrics, or text
- Paste your content
- AI analyzes and creates a full learning module

### Practice Conversations
- Go to Practice tab
- Chat in your target language
- Get natural responses and gentle corrections

### Interactive Reading
- Open any content from your library
- Tap words for definitions and explanations
- Use the difficulty slider to see the same text at different levels
- Learn how natives express the same ideas

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

## What Makes FluentAI Special

Unlike traditional language apps that teach rules first:
- 🎯 **Immersion from Day 1**: Use the language immediately
- 🧠 **Adaptive Learning**: Content adjusts to your exact level
- 💡 **Comprehensible Input**: Always challenging but never overwhelming
- 🎭 **Context-Rich**: Learn through stories, not flashcards
- 🤖 **AI-Powered**: Every interaction is personalized

## Project Structure

```
FluentAI/
├── App.js                      # Main app entry with navigation
├── src/
│   ├── contexts/
│   │   └── AppContext.js       # Global state management
│   ├── screens/
│   │   ├── OnboardingScreen.js # First-time setup
│   │   ├── HomeScreen.js       # Story generation & library
│   │   ├── PracticeScreen.js   # AI conversation practice
│   │   ├── SettingsScreen.js   # LLM configuration
│   │   └── ReaderScreen.js     # Interactive reading
│   ├── services/
│   │   └── llm.js              # Ollama integration
│   └── utils/
│       └── storage.js          # Data persistence
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
