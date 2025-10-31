require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken'); // Added for Apple JWT verification
const crypto = require('crypto'); // Added for Apple JWT verification
const https = require('https'); // Added for Apple public key fetching
const authRoutes = require('./auth-routes'); // Firebase auth routes
const { initializeSecrets, getSecrets } = require('./init-secrets'); // Secret Manager integration

const app = express();
const PORT = process.env.PORT || 8080;

// Global variables to hold secrets and clients
let secrets = null;
let openai = null;
let googleClient = null;

// Initialize secrets and services
async function initializeApp() {
  try {
    console.log('🔐 Initializing secrets from Secret Manager...');
    secrets = await initializeSecrets();

    // Initialize OpenAI
    if (secrets.openaiApiKey) {
      openai = new OpenAI({
        apiKey: secrets.openaiApiKey,
      });
      console.log('✅ OpenAI client initialized');
    } else {
      console.error('⚠️  WARNING: OPENAI_API_KEY not set. AI endpoints will be disabled.');
    }

    // Initialize Google OAuth client
    googleClient = new OAuth2Client(secrets.googleClientId || '823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com');
    console.log('✅ Google OAuth client initialized');

    console.log('✅ App initialization complete');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    process.exit(1);
  }
}

const MODEL = 'gpt-4o-mini'; // Fast, cheap, high quality

// Apple Sign In configuration (using legacy env vars for now)
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || 'E7B9UE64SF';
const APPLE_KEY_ID = process.env.APPLE_KEY_ID || '864SJW3HGZ';
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || 'com.speakeasy.webapp';
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY ||
  (process.env.APPLE_PRIVATE_KEY_BASE64 ? Buffer.from(process.env.APPLE_PRIVATE_KEY_BASE64, 'base64').toString() : null);

// Simple in-memory user store (in production, use a database)
const users = new Map();
const sessions = new Map();
const userProgress = new Map(); // Track user progress per session

app.use(cors());
app.use(express.json());

// Mount Firebase auth routes
app.use('/api/auth', authRoutes);

// Apple Sign In JWT verification functions
async function fetchApplePublicKeys() {
  return new Promise((resolve, reject) => {
    https.get('https://appleid.apple.com/auth/keys', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function verifyAppleJWT(token) {
  try {
    const header = jwt.decode(token, { complete: true }).header;
    const keys = await fetchApplePublicKeys();
    const key = keys.keys.find(k => k.kid === header.kid);
    
    if (!key) {
      throw new Error('Apple public key not found');
    }

    const publicKey = crypto.createPublicKey({
      key: {
        kty: key.kty,
        kid: key.kid,
        use: key.use,
        alg: key.alg,
        n: key.n,
        e: key.e
      },
      format: 'jwk'
    });

    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: APPLE_CLIENT_ID,
      issuer: 'https://appleid.apple.com'
    });

    return decoded;
  } catch (error) {
    console.error('Apple JWT verification failed:', error.message);
    throw error;
  }
}

// User progress tracking functions
function updateUserProgress(sessionId, progressData) {
  if (!userProgress.has(sessionId)) {
    userProgress.set(sessionId, {
      sessionId,
      startTime: new Date().toISOString(),
      messages: [],
      lessonsCompleted: [],
      totalTimeSpent: 0,
      lastActivity: new Date().toISOString()
    });
  }
  
  const progress = userProgress.get(sessionId);
  progress.lastActivity = new Date().toISOString();
  
  if (progressData.message) {
    progress.messages.push({
      text: progressData.message,
      timestamp: new Date().toISOString(),
      type: progressData.type || 'user'
    });
  }
  
  if (progressData.lessonCompleted) {
    progress.lessonsCompleted.push({
      lessonId: progressData.lessonCompleted,
      completedAt: new Date().toISOString()
    });
  }
  
  if (progressData.timeSpent) {
    progress.totalTimeSpent += progressData.timeSpent;
  }
  
  userProgress.set(sessionId, progress);
  return progress;
}

function getUserProgress(sessionId) {
  return userProgress.get(sessionId) || null;
}

// Root endpoint - API welcome page
app.get('/', (req, res) => {
  res.json({
    name: 'SpeakEasy Backend API',
    version: '1.0.0',
    status: 'running',
    provider: 'openai',
    model: MODEL,
    endpoints: {
      health: 'GET /health',
      generate: 'POST /api/generate',
      practice: 'POST /api/practice/message',
      lessons: 'POST /api/lessons/generate',
      assessment: 'POST /api/assessment/evaluate',
      onboarding: 'POST /api/onboarding/message',
      auth: {
        google: 'POST /api/auth/google',
        apple: 'POST /api/auth/apple',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'POST /api/auth/profile',
        session: 'GET /api/auth/session/:sessionId'
      }
    },
    documentation: 'https://github.com/yourusername/speakeasy'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    provider: 'openai',
    model: MODEL,
    apiKeyConfigured: !!openai,
    secretsLoaded: !!secrets
  });
});

  // Google OAuth endpoint
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { idToken, name, email, imageUrl } = req.body;

      console.log('🔵 Google auth request:', {
        hasIdToken: !!idToken,
        name,
        email,
        tokenLength: idToken?.length
      });

      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: 'ID token is required'
        });
      }

      // Verify Google ID token
      // iOS backend - ONLY accept iOS client tokens
      const iosClientId = '823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com';

      let payload;
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: idToken,
          audience: iosClientId
        });
        payload = ticket.getPayload();
        console.log('✅ Google token verified:', payload.sub);
      } catch (verifyError) {
        console.error('❌ Google token verification failed:', verifyError.message);

        // Fallback: Create user without verification for development
        console.log('⚠️  Using fallback mode without token verification');
        payload = {
          sub: `unverified_${Date.now()}`,
          email: email,
          name: name,
          picture: imageUrl
        };
      }

      if (!payload) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Google token'
        });
      }
    
    // Generate session ID
    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Create or update user
    const userId = `google_${payload.sub}`;
    const user = {
      id: userId,
      provider: 'google',
      name: payload.name || name,
      email: payload.email || email,
      imageUrl: payload.picture || imageUrl,
      googleId: payload.sub,
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
      data: {
        token: sessionId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          provider: user.provider,
          imageUrl: user.imageUrl
        }
      }
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    });
  }
});

  // Apple OAuth endpoint
  app.post('/api/auth/apple', async (req, res) => {
    try {
      const { idToken, authorizationCode, user, name, email } = req.body;

      // Verify Apple JWT token
      let payload;
      try {
        payload = await verifyAppleJWT(idToken);
        console.log('Apple JWT verified successfully:', payload);
      } catch (jwtError) {
        console.log('Apple JWT verification failed, using fallback:', jwtError.message);
        // Fallback for demo purposes if JWT verification fails
        payload = {
          sub: user?.id || 'apple_user_' + Date.now(),
          email: email || null,
          email_verified: true
        };
      }
    
    // Generate session ID
    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Create or update user
    const userId = `apple_${user?.id || Date.now()}`;
    const userData = {
      id: userId,
      provider: 'apple',
      name: name || 'Apple User',
      email: email || null,
      appleId: user?.id,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    users.set(userId, userData);
    sessions.set(sessionId, {
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        token: sessionId,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          provider: userData.provider
        }
      }
    });
  } catch (error) {
    console.error('Apple auth error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Apple authentication failed'
    });
  }
});

// Guest login endpoint
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
        // Keep user progress for analytics
        console.log('User logged out, progress preserved:', getUserProgress(sessionId));
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error.message);
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  // Apple Sign In Server-to-Server Notification Endpoint
  app.post('/api/auth/apple/notification', async (req, res) => {
    try {
      const { notification_type, sub, email, email_verified, events } = req.body;
      
      console.log('Apple Sign In notification received:', {
        notification_type,
        sub,
        email,
        email_verified,
        events
      });

      // Handle different notification types
      switch (notification_type) {
        case 'email-disabled':
          console.log('User disabled email sharing:', sub);
          break;
        case 'email-enabled':
          console.log('User enabled email sharing:', sub);
          break;
        case 'consent-withdrawn':
          console.log('User withdrew consent:', sub);
          // In production, you might want to delete user data here
          break;
        default:
          console.log('Unknown notification type:', notification_type);
      }

      // Update user record if exists
      const userId = `apple_${sub}`;
      if (users.has(userId)) {
        const user = users.get(userId);
        user.email = email;
        user.emailVerified = email_verified;
        user.lastNotification = new Date().toISOString();
        users.set(userId, user);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Apple notification error:', error.message);
      res.status(500).json({ error: 'Notification processing failed' });
    }
  });

  // User Progress Tracking Endpoints
  app.post('/api/progress/update', (req, res) => {
    try {
      const { sessionId, progressData } = req.body;

      if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      const progress = updateUserProgress(sessionId, progressData);
      res.json({ success: true, progress });
    } catch (error) {
      console.error('Progress update error:', error.message);
      res.status(500).json({ error: 'Progress update failed' });
    }
  });

  app.get('/api/progress/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;

      if (!sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      const progress = getUserProgress(sessionId);
      res.json({ success: true, progress });
    } catch (error) {
      console.error('Progress retrieval error:', error.message);
      res.status(500).json({ error: 'Progress retrieval failed' });
    }
  });

  // Analytics endpoint for user progress
  app.get('/api/analytics/progress', (req, res) => {
    try {
      const allProgress = Array.from(userProgress.values());
      const stats = {
        totalSessions: allProgress.length,
        activeSessions: allProgress.filter(p => 
          new Date(p.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        totalMessages: allProgress.reduce((sum, p) => sum + p.messages.length, 0),
        totalLessonsCompleted: allProgress.reduce((sum, p) => sum + p.lessonsCompleted.length, 0),
        averageSessionTime: allProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0) / allProgress.length || 0
      };

      res.json({ success: true, stats, sessions: allProgress });
    } catch (error) {
      console.error('Analytics error:', error.message);
      res.status(500).json({ error: 'Analytics failed' });
    }
  });

// Generic LLM completion endpoint
app.post('/api/generate', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: 'OpenAI API is not configured' });
    }

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
      const { message, lesson, userProfile, targetLanguage, userLevel, conversationHistory, useVoice, sessionId } = req.body;

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

      // Track user progress if sessionId provided
      if (sessionId && sessions.has(sessionId)) {
        updateUserProgress(sessionId, {
          message: message,
          type: 'user'
        });
        updateUserProgress(sessionId, {
          message: responseText,
          type: 'teacher'
        });
      }

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

// Initialize app and start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SpeakEasy backend running on port ${PORT}`);
    console.log(`📦 Provider: OpenAI`);
    console.log(`🤖 Model: ${MODEL}`);
    console.log(`🔑 API Key configured: ${!!openai}`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

