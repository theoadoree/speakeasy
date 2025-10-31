# SpeakEasy Python Web App

A standalone Python web application for AI-powered language learning. Built with FastAPI and vanilla JavaScript - no React Native or Expo dependencies.

## 🌟 Features

- **Story Generation**: Create personalized language learning stories tailored to your level and interests
- **Interactive Reading**: Click any word to get instant explanations and translations
- **Conversation Practice**: Chat with an AI tutor in your target language
- **8+ Languages**: Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese
- **Responsive Design**: Beautiful gradient UI that works on all devices
- **Cloud-Powered**: Uses OpenAI GPT-4o-mini for fast, high-quality responses

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Run the app
python app.py
```

Visit `http://localhost:8080`

### Docker

```bash
# Build
docker build -t speakeasy-web .

# Run
docker run -p 8080:8080 -e OPENAI_API_KEY="your-key" speakeasy-web
```

## ☁️ Deploy to Google Cloud Run

### Prerequisites

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Store OpenAI API Key in Secret Manager

```bash
# Create secret
echo -n "your-openai-api-key" | gcloud secrets create OPENAI_API_KEY --data-file=-

# Grant Cloud Run access to secret
gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
    --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Deploy with Cloud Build

```bash
# Submit build and deploy
gcloud builds submit --config cloudbuild.yaml

# Or deploy directly with gcloud
gcloud run deploy speakeasy-python-web \
    --source . \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest
```

### Get Your URL

```bash
gcloud run services describe speakeasy-python-web \
    --region us-central1 \
    --format 'value(status.url)'
```

## 📱 API Endpoints

### Core Endpoints

- `GET /` - Main web interface
- `GET /health` - Health check
- `GET /api/languages` - List supported languages

### Learning Endpoints

- `POST /api/stories/generate` - Generate personalized story
  ```json
  {
    "target_language": "Spanish",
    "level": "beginner",
    "interests": ["travel", "food"]
  }
  ```

- `POST /api/words/explain` - Explain a word in context
  ```json
  {
    "word": "hola",
    "context": "Hola, ¿cómo estás?",
    "target_language": "Spanish",
    "native_language": "English"
  }
  ```

- `POST /api/practice/chat` - Conversation practice
  ```json
  {
    "message": "Hola, me llamo Juan",
    "target_language": "Spanish",
    "conversation_history": []
  }
  ```

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

## 🏗️ Architecture

```
python-web/
├── app.py                 # FastAPI backend
├── static/
│   └── index.html        # Single-page frontend
├── requirements.txt      # Python dependencies
├── Dockerfile           # Container configuration
├── cloudbuild.yaml      # Cloud Build config
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables

- `OPENAI_API_KEY` - OpenAI API key (required)
- `PORT` - Server port (default: 8080)

### Customization

Edit `app.py` to customize:
- AI prompt templates
- Supported languages
- API rate limiting
- CORS settings

Edit `static/index.html` to customize:
- UI colors and styling
- Available interests
- Language options

## 🌐 Tech Stack

- **Backend**: FastAPI (Python 3.11)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Google Cloud Run
- **Container**: Docker

## 📊 Performance

- Cold start: ~2-3 seconds
- Story generation: ~5-10 seconds
- Chat response: ~1-3 seconds
- Concurrent users: Auto-scales on Cloud Run

## 🔒 Security

- CORS enabled for all origins (customize in production)
- HTTPS enforced on Cloud Run
- API keys stored in Secret Manager
- No user data persistence (add database for production)

## 📈 Scaling

Cloud Run auto-scales based on traffic:
- Min instances: 0 (pay only when used)
- Max instances: 100 (configurable)
- Concurrency: 80 requests per container

## 🐛 Troubleshooting

### Local development issues

```bash
# Check Python version
python --version  # Should be 3.8+

# Install dependencies with pip
pip install --upgrade pip
pip install -r requirements.txt
```

### Deployment issues

```bash
# Check Cloud Run logs
gcloud run services logs read speakeasy-python-web --region us-central1

# Check build logs
gcloud builds log $(gcloud builds list --limit 1 --format 'value(id)')
```

### API errors

- Verify OpenAI API key is set correctly
- Check Secret Manager permissions
- Ensure sufficient OpenAI credits

## 📝 License

MIT License

## 🤝 Contributing

This is a standalone Python version of SpeakEasy - no React Native or Expo code!

For the full React Native version, see the parent directory.
