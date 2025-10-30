# SpeakEasy - Quick Start Guide ⚡

Get up and running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- macOS (for iOS development) or Windows/Linux (for Android)
- 10GB free disk space (for dependencies and models)

---

## Step-by-Step Setup

### 1️⃣ Install Dependencies (2 min)

```bash
cd /Users/scott/dev/speakeasy
npm install
```

---

### 2️⃣ Install Ollama (3 min)

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [https://ollama.ai](https://ollama.ai)

---

### 3️⃣ Start Ollama & Download Model (5 min)

```bash
# Terminal 1: Start Ollama server
ollama serve

# Terminal 2: Download a model
ollama pull llama2
```

Keep Terminal 1 open!

---

### 4️⃣ Start the App (30 seconds)

```bash
# In Terminal 2 (or new terminal)
npm start
```

Then press:
- **\`w\`** for Web Browser (fastest)
- **\`i\`** for iOS Simulator (requires setup - see below)
- **\`a\`** for Android Emulator

---

### 5️⃣ Complete Onboarding (2 min)

1. Enter your name
2. Choose your target language (Spanish, French, etc.)
3. Select your level (Beginner → Advanced)
4. Pick 3+ interests
5. Choose subscription plan

---

### 6️⃣ Configure LLM (1 min)

1. Tap **More** tab (bottom right)
2. Tap **Settings**
3. In the **LLM Configuration** section:
   - API URL: \`http://localhost:11434\` (already filled)
   - Model: \`llama2\` (or your downloaded model)
4. Tap **Test Connection** ✅
5. Tap **Save Configuration**

---

### 7️⃣ Enable Notifications (Optional, 30 seconds)

1. Still in Settings, scroll to **Notifications 🔔**
2. Toggle **Daily Reminders** ON
3. Tap **Send Test Notification** to verify
4. Check your notification center!

---

## You're Ready! 🎉

### Try These Features:

#### 📚 Learn Tab
- **Stories**: Tap "Generate Story" for AI content
- **Curriculum**: Follow structured lessons
- **Custom**: Create your own lesson

#### 💬 Practice Tab
- **AI Chat**: Start a conversation in your target language
- **Accent Tutor**: Practice pronunciation

#### 🎵 Music Tab
- Search for your favorite songs
- Learn through lyrics

#### 🏆 Leagues Tab
- View your XP and league rank
- Check achievements

---

## Quick Troubleshooting

### "LLM Not Connected"
```bash
# Check if Ollama is running
curl http://localhost:11434

# If not running, start it:
ollama serve
```

### "App Won't Start"
```bash
# Clear cache
npm start -- --clear

# Or reinstall
rm -rf node_modules
npm install
```

### Port 8081 Busy
```bash
# Kill the process
lsof -ti:8081 | xargs kill -9

# Or use different port
npm start -- --port 8082
```

---

## Documentation

- **README.md** - Full feature documentation
- **IOS_SETUP.md** - iOS deployment guide
- **NOTIFICATIONS.md** - Notification system details
- **PROJECT_COMPLETION_SUMMARY.md** - Complete feature overview

---

**🎉 Ready to learn!** The app will remind you twice daily to practice.

**Time to complete:** ~14 minutes total
