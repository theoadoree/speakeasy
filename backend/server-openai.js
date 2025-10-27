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

// Simple in-memory user store (in production, use a database)
const users = new Map();
const sessions = new Map();

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

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  try {
    const { provider, token, name, email } = req.body;
    
    // Generate session ID
    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Create or update user
    const userId = `${provider}_${email || Date.now()}`;
    const user = {
      id: userId,
      provider,
      name: name || 'User',
      email: email || null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    users.set(userId, user);
    sessions.set(sessionId, {
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    });
    
    res.json({
      success: true,
      sessionId,
      user: {
        id: user.id,
        name: user.name,
        provider: user.provider
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/profile', (req, res) => {
  try {
    const { sessionId, profile } = req.body;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    const session = sessions.get(sessionId);
    const user = users.get(session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user profile
    user.profile = {
      ...profile,
      updatedAt: new Date().toISOString()
    };
    
    users.set(session.userId, user);
    session.lastActivity = new Date().toISOString();
    sessions.set(sessionId, session);
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

app.get('/api/auth/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessions.has(sessionId)) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    const session = sessions.get(sessionId);
    const user = users.get(session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    session.lastActivity = new Date().toISOString();
    sessions.set(sessionId, session);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        provider: user.provider,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Session check error:', error.message);
    res.status(500).json({ error: 'Session check failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ error: 'Logout failed' });
  }
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
      const { message, lesson, userProfile, targetLanguage, userLevel, conversationHistory, useVoice } = req.body;

      // Support both mobile app format (userProfile) and web format (targetLanguage + userLevel)
      const lang = userProfile?.targetLanguage || targetLanguage || 'Spanish';
      const level = userProfile?.level || userLevel || 'beginner';
      const topic = lesson?.topic || 'general conversation';

      // Optimized system prompt for faster, more natural responses
      const systemPrompt = `You are Maria, a warm female ${lang} tutor. Level: ${level}. Keep responses conversational, encouraging, and concise (1-2 sentences). Respond naturally in ${lang}.`;

      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7, // Reduced for faster, more consistent responses
        max_tokens: 100, // Reduced for faster generation
        stream: false, // We'll implement streaming separately
      });

      const responseText = completion.choices[0].message.content.trim();

      // Generate audio with OpenAI TTS for natural voice
      let audioBuffer = null;
      if (useVoice) {
        try {
          const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova", // Female voice - warm and natural
            input: responseText,
            speed: 1.0, // Natural speed
            response_format: "mp3"
          });
          
          // Convert to base64 for immediate playback
          const buffer = await mp3.arrayBuffer();
          audioBuffer = Buffer.from(buffer).toString('base64');
        } catch (audioError) {
          console.error('TTS error:', audioError.message);
        }
      }

      res.json({
        response: responseText,
        model: MODEL,
        audioBuffer: audioBuffer, // Base64 encoded audio
        audioFormat: 'mp3'
      });
    } catch (error) {
      console.error('Practice error:', error.message);
      res.status(500).json({
        error: 'Failed to process practice message',
        details: error.message
      });
    }
  });

  // Streaming endpoint for instant feedback
  app.post('/api/practice/stream', async (req, res) => {
    try {
      const { message, targetLanguage, userLevel } = req.body;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const systemPrompt = `You are Maria, a warm female ${targetLanguage} tutor. Level: ${userLevel}. Keep responses conversational, encouraging, and concise (1-2 sentences). Respond naturally in ${targetLanguage}.`;

      const stream = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(content);
        }
      }
      
      res.end();
    } catch (error) {
      console.error('Streaming error:', error.message);
      res.status(500).end('Error generating response');
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

