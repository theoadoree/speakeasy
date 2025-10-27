const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 8080;

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = 'gpt-4o-mini'; // Fast, cheap, high quality

if (!OPENAI_API_KEY) {
  console.error('WARNING: OPENAI_API_KEY not set. Server will fail on requests.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    provider: 'openai',
    model: MODEL,
    apiKeyConfigured: !!OPENAI_API_KEY
  });
});

// Generic LLM completion endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, temperature = 0.7, maxTokens = 2048 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: temperature,
      max_tokens: maxTokens,
    });

    res.json({
      response: completion.choices[0].message.content,
      model: MODEL,
      usage: completion.usage
    });
  } catch (error) {
    console.error('OpenAI generation error:', error.message);
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

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    if (conversationHistory) {
      messages.push({ role: 'assistant', content: conversationHistory });
    }

    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: messages,
      temperature: 0.8,
      max_tokens: 150,
    });

    res.json({
      response: completion.choices[0].message.content.trim(),
      model: MODEL
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
Keep responses natural, correcting errors gently, and staying on topic.
Respond in ${lang}.`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    res.json({
      response: completion.choices[0].message.content.trim(),
      model: MODEL
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

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    let lessons;
    try {
      const response = JSON.parse(completion.choices[0].message.content);
      lessons = response.lessons || [response];
    } catch {
      lessons = [{
        id: Date.now().toString(),
        title: 'Introductory Lesson',
        description: `Practice basic ${userProfile.targetLanguage} conversation`,
        difficulty: userProfile.level,
        estimatedMinutes: 15,
        topics: ['greetings', 'introductions']
      }];
    }

    res.json({ lessons, model: MODEL });
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

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    let assessment;
    try {
      assessment = JSON.parse(completion.choices[0].message.content);
    } catch {
      assessment = {
        level: 'beginner',
        feedback: 'Based on your responses, we recommend starting with beginner lessons.',
        strengths: ['Enthusiasm to learn'],
        areasToImprove: ['Vocabulary', 'Grammar']
      };
    }

    res.json({ assessment, model: MODEL });
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

app.listen(PORT, () => {
  console.log(`SpeakEasy backend running on port ${PORT}`);
  console.log(`Provider: OpenAI`);
  console.log(`Model: ${MODEL}`);
  console.log(`API Key configured: ${!!OPENAI_API_KEY}`);
});

