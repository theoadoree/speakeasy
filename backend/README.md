# SpeakEasy Backend API

Express.js backend for SpeakEasy language learning app with LLM integration.

## Local Development

```bash
# Install dependencies
npm install

# Start server (requires Ollama running locally)
npm start

# Server runs on http://localhost:8080
```

## API Endpoints

### Health Check
```
GET /health
```

### Generate LLM Response
```
POST /api/generate
Body: {
  "prompt": "string",
  "model": "qwen" | "llama",
  "temperature": 0.7,
  "maxTokens": 2048
}
```

### Onboarding Conversation
```
POST /api/onboarding/message
Body: {
  "message": "string",
  "conversationHistory": "string",
  "userName": "string",
  "targetLanguage": "string"
}
```

### Practice Conversation
```
POST /api/practice/message
Body: {
  "message": "string",
  "lesson": { "topic": "string" },
  "userProfile": {
    "targetLanguage": "string",
    "level": "string"
  }
}
```

### Generate Lessons
```
POST /api/lessons/generate
Body: {
  "userProfile": {
    "level": "string",
    "targetLanguage": "string",
    "interests": ["string"],
    "goals": ["string"]
  },
  "count": 5
}
```

### Evaluate Assessment
```
POST /api/assessment/evaluate
Body: {
  "responses": [{}],
  "targetLanguage": "string"
}
```

## Deploy to Cloud Run

```bash
# Deploy with Ollama URL
gcloud run deploy speakeasy-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OLLAMA_URL=https://your-ollama-instance.com \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

## Environment Variables

- `PORT` - Server port (default: 8080)
- `OLLAMA_URL` - Ollama API base URL (default: http://localhost:11434)
- `NODE_ENV` - Environment (production/development)

## Models

- **Qwen 2.5 72B** - Complex tasks (onboarding, assessment, lesson generation)
- **Llama 3.1 8B** - Fast responses (practice conversations)
