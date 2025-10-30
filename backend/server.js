const express = require('express');
const cors = require('cors');
const axios = require('axios');
const authRoutes = require('./auth-routes');
const leagueRoutes = require('./league-routes');
const { loadSecrets } = require('./secret-manager');

const app = express();
const PORT = process.env.PORT || 8080;

// Store secrets globally (loaded on startup)
global.secrets = {};

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const QWEN_MODEL = process.env.QWEN_MODEL || 'llama2:latest';
const LLAMA_MODEL = process.env.LLAMA_MODEL || 'llama2:latest';

app.use(cors());
app.use(express.json());

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount league routes
app.use('/api/leagues', leagueRoutes);

// Root endpoint - API welcome page
app.get('/', (req, res) => {
  res.json({
    name: 'SpeakEasy Backend API',
    version: '1.0.0',
    status: 'running',
    provider: 'ollama',
    models: {
      qwen: QWEN_MODEL,
      llama: LLAMA_MODEL
    },
    endpoints: {
      health: 'GET /health',
      generate: 'POST /api/generate',
      practice: 'POST /api/practice/message',
      lessons: 'POST /api/lessons/generate',
      assessment: 'POST /api/assessment/evaluate',
      onboarding: 'POST /api/onboarding/message',
      auth: 'POST /api/auth/*',
      leagues: 'GET /api/leagues/*'
    },
    documentation: 'https://github.com/yourusername/speakeasy'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    models: {
      qwen: QWEN_MODEL,
      llama: LLAMA_MODEL
    }
  });
});

// Generic LLM completion endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model = 'llama', temperature = 0.7, maxTokens = 2048 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const selectedModel = model === 'qwen' ? QWEN_MODEL : LLAMA_MODEL;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: selectedModel,
      prompt: prompt,
      stream: false,
      options: {
        temperature: temperature,
        num_predict: maxTokens
      }
    });

    res.json({
      response: response.data.response,
      model: selectedModel,
      done: response.data.done
    });
  } catch (error) {
    console.error('LLM generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate response',
      details: error.message
    });
  }
});

// Onboarding conversation endpoint
app.post('/api/onboarding/message', async (req, res) => {
  try {
    const { message, conversationHistory, userName, targetLanguage } = req.body;

    const systemPrompt = `You are a friendly AI language tutor helping ${userName} learn ${targetLanguage}.
You're conducting an onboarding conversation to understand their language level, goals, and preferences.
Keep responses conversational, encouraging, and under 3 sentences.`;

    const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${conversationHistory || ''}\n\nUser: ${message}\n\nAssistant:`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: QWEN_MODEL,
      prompt: fullPrompt,
      stream: false,
      options: {
        temperature: 0.8,
        num_predict: 150
      }
    });

    res.json({
      response: response.data.response.trim(),
      model: QWEN_MODEL
    });
  } catch (error) {
    console.error('Onboarding error:', error.message);
    res.status(500).json({
      error: 'Failed to process onboarding message',
      details: error.message
    });
  }
});

// Practice conversation endpoint
app.post('/api/practice/message', async (req, res) => {
  try {
    const { message, lesson, userProfile, targetLanguage, userLevel, conversationHistory } = req.body;

    // Support both mobile app format (userProfile) and web format (targetLanguage + userLevel)
    const lang = userProfile?.targetLanguage || targetLanguage || 'Spanish';
    const level = userProfile?.level || userLevel || 'beginner';
    const topic = lesson?.topic || 'general conversation';

    const systemPrompt = `You are a ${lang} language practice partner.
The user is practicing: ${topic}
Their level: ${level}
Keep responses natural, correcting errors gently, and staying on topic.`;

    const fullPrompt = `${systemPrompt}\n\nUser said: ${message}\n\nRespond naturally in ${lang}:`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: LLAMA_MODEL,
      prompt: fullPrompt,
      stream: false,
      options: {
        temperature: 0.8,
        num_predict: 200
      }
    });

    res.json({
      response: response.data.response.trim(),
      model: LLAMA_MODEL
    });
  } catch (error) {
    console.error('Practice error:', error.message);
    res.status(500).json({
      error: 'Failed to process practice message',
      details: error.message
    });
  }
});

// Generate lesson plan endpoint
app.post('/api/lessons/generate', async (req, res) => {
  try {
    const { userProfile, count = 5 } = req.body;

    const prompt = `Generate ${count} language learning lessons for a ${userProfile.level} level student learning ${userProfile.targetLanguage}.
Student interests: ${userProfile.interests.join(', ')}
Student goals: ${userProfile.goals.join(', ')}

Format each lesson as JSON with: title, description, difficulty, estimatedMinutes, topics[]

Return only valid JSON array.`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: QWEN_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 2000
      }
    });

    // Try to parse JSON response
    let lessons;
    try {
      lessons = JSON.parse(response.data.response);
    } catch {
      // Fallback if JSON parsing fails
      lessons = [{
        id: Date.now().toString(),
        title: 'Introductory Lesson',
        description: `Practice basic ${userProfile.targetLanguage} conversation`,
        difficulty: userProfile.level,
        estimatedMinutes: 15,
        topics: ['greetings', 'introductions']
      }];
    }

    res.json({ lessons, model: QWEN_MODEL });
  } catch (error) {
    console.error('Lesson generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate lessons',
      details: error.message
    });
  }
});

// Assessment endpoint
app.post('/api/assessment/evaluate', async (req, res) => {
  try {
    const { responses, targetLanguage } = req.body;

    const prompt = `Evaluate this language learner's ${targetLanguage} proficiency based on their responses:
${JSON.stringify(responses, null, 2)}

Determine their level (beginner/intermediate/advanced) and provide brief feedback.
Return as JSON: { level: string, feedback: string, strengths: string[], areasToImprove: string[] }`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: QWEN_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.5,
        num_predict: 500
      }
    });

    let assessment;
    try {
      assessment = JSON.parse(response.data.response);
    } catch {
      assessment = {
        level: 'beginner',
        feedback: 'Based on your responses, we recommend starting with beginner lessons.',
        strengths: ['Enthusiasm to learn'],
        areasToImprove: ['Vocabulary', 'Grammar']
      };
    }

    res.json({ assessment, model: QWEN_MODEL });
  } catch (error) {
    console.error('Assessment error:', error.message);
    res.status(500).json({
      error: 'Failed to evaluate assessment',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server with secret loading
async function startServer() {
  try {
    console.log('🚀 Starting SpeakEasy backend...\n');

    // Load secrets from Secret Manager
    global.secrets = await loadSecrets();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`✅ SpeakEasy backend running on port ${PORT}`);
      console.log(`   Ollama URL: ${OLLAMA_BASE_URL}`);
      console.log(`   Models: ${QWEN_MODEL}, ${LLAMA_MODEL}`);
      console.log(`\n📡 Server ready to accept requests\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
