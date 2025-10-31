# SpeakEasy Android - Python/Kivy Version

A native Python Android app for language learning built with Kivy.

## Features

- 📚 Generate personalized language learning stories
- 💬 Practice conversations with AI
- 🌍 Support for 8+ languages
- 📱 Native Android UI with Kivy
- 🔄 Real-time API integration with cloud backend

## Requirements

- Python 3.8+
- Kivy 2.2.1
- Buildozer (for Android builds)

## Installation

### Desktop Testing

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
python main.py
```

### Building for Android

```bash
# Install buildozer
pip install buildozer

# Install Android dependencies (Ubuntu/Debian)
sudo apt-get install -y \
    python3-pip \
    build-essential \
    git \
    ffmpeg \
    libsdl2-dev \
    libsdl2-image-dev \
    libsdl2-mixer-dev \
    libsdl2-ttf-dev \
    libportmidi-dev \
    libswscale-dev \
    libavformat-dev \
    libavcodec-dev \
    zlib1g-dev

# Build APK
buildozer android debug

# Build and deploy to connected device
buildozer android debug deploy run
```

## Configuration

Set the API base URL in `main.py`:

```python
API_BASE_URL = "https://your-backend-url.run.app"
```

## Project Structure

```
python-android/
├── main.py              # Main application code
├── requirements.txt     # Python dependencies
├── buildozer.spec       # Android build configuration
└── README.md           # This file
```

## Supported Languages

- Spanish (Español)
- French (Français)
- German (Deutsch)
- Italian (Italiano)
- Portuguese (Português)
- Japanese (日本語)
- Korean (한국어)
- Chinese (中文)

## Usage

### Generate Stories

1. Select your target language
2. Choose your skill level (Beginner, Intermediate, Advanced)
3. Tap "Generate Story"
4. Read and learn from your personalized content

### Practice Conversations

1. Tap "Practice Chat"
2. Select your practice language
3. Type messages in your target language
4. Get real-time responses from the AI tutor

## Building Release APK

```bash
# Build release APK
buildozer android release

# Sign the APK (optional, for Play Store)
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
    -keystore my-release-key.keystore \
    bin/*.apk my_alias_name
```

## Troubleshooting

### Buildozer fails

- Make sure you have all system dependencies installed
- Check Android SDK/NDK versions in `buildozer.spec`
- Clear cache: `buildozer android clean`

### App crashes on startup

- Check logcat: `adb logcat | grep python`
- Verify API URL is correct
- Ensure internet permission is granted

### Kivy UI issues

- Test on desktop first: `python main.py`
- Check Kivy version compatibility
- Update graphics drivers

## License

MIT License
