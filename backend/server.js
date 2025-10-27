const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const QWEN_MODEL = 'qwen2.5:72b';
const LLAMA_MODEL = 'llama3.1:8b';

app.use(cors());
app.use(express.json());

// Data storage (file-based)
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(CONVERSATIONS_FILE)) {
    fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify({}));
  }
}

function readUsers() {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureDataFiles();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readConversations() {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(CONVERSATIONS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeConversations(conversations) {
  ensureDataFiles();
  fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2));
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      provider: user.provider,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL_SECONDS }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Auth endpoints
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    const users = readUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const user = {
      id: uuidv4(),
      email,
      name,
      provider: 'email',
      passwordHash,
      verified: false,
      verificationCode,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    writeUsers(users);

    // In real system, send verification email with the code. For now, log it.
    console.log(`[auth] Verification code for ${email}: ${verificationCode}`);

    return res.json({ success: true, verificationRequired: true, email });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/verify-email', (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }
    const users = readUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[idx];
    if (user.verified) {
      const token = signToken(user);
      return res.json({ success: true, data: { user: sanitizeUser(user), token } });
    }
    if (user.verificationCode !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    user.verified = true;
    user.verificationCode = null;
    users[idx] = user;
    writeUsers(users);
    const token = signToken(user);
    return res.json({ success: true, data: { user: sanitizeUser(user), token } });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/auth/resend', (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const users = readUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[idx];
    if (user.verified) {
      return res.json({ success: true, alreadyVerified: true });
    }
    const code = generateVerificationCode();
    user.verificationCode = code;
    users[idx] = user;
    writeUsers(users);
    console.log(`[auth] Resent verification code for ${email}: ${code}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to resend code' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.provider === 'email');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.verified) {
      return res.status(200).json({ success: false, verificationRequired: true, email: user.email, error: 'Email not verified' });
    }
    const token = signToken(user);
    return res.json({ success: true, data: { user: sanitizeUser(user), token } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/auth/validate', authMiddleware, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find((u) => u.id === req.user.sub);
    if (!user) {
      return res.status(401).json({ valid: false });
    }
    return res.json({ valid: true, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(401).json({ valid: false });
  }
});

app.post('/auth/oauth/google', (req, res) => {
  try {
    const { idToken, email, name } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const users = readUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: uuidv4(),
        email,
        name: name || email.split('@')[0],
        provider: 'google',
        verified: true,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      writeUsers(users);
    }
    const token = signToken(user);
    return res.json({ success: true, data: { user: sanitizeUser(user), token } });
  } catch (err) {
    console.error('Google OAuth error:', err);
    return res.status(500).json({ error: 'OAuth failed' });
  }
});

app.post('/auth/oauth/apple', (req, res) => {
  try {
    const { idToken, email, name } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const users = readUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: uuidv4(),
        email,
        name: name || email.split('@')[0],
        provider: 'apple',
        verified: true,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      writeUsers(users);
    }
    const token = signToken(user);
    return res.json({ success: true, data: { user: sanitizeUser(user), token } });
  } catch (err) {
    console.error('Apple OAuth error:', err);
    return res.status(500).json({ error: 'OAuth failed' });
  }
});

function sanitizeUser(user) {
  const { passwordHash, verificationCode, ...rest } = user;
  return rest;
}

// Conversation persistence endpoints
app.get('/api/conversations/history', authMiddleware, (req, res) => {
  const conversations = readConversations();
  const userId = req.user.sub;
  const history = conversations[userId] || [];
  return res.json({ success: true, history });
});

app.post('/api/conversations/history', authMiddleware, (req, res) => {
  const { messages, message } = req.body || {};
  const conversations = readConversations();
  const userId = req.user.sub;
  if (!conversations[userId]) conversations[userId] = [];
  if (Array.isArray(messages)) {
    conversations[userId] = messages;
  } else if (message && typeof message === 'object') {
    conversations[userId].push({ ...message, timestamp: message.timestamp || new Date().toISOString() });
  }
  writeConversations(conversations);
  return res.json({ success: true });
});

app.delete('/api/conversations/history', authMiddleware, (req, res) => {
  const conversations = readConversations();
  const userId = req.user.sub;
  conversations[userId] = [];
  writeConversations(conversations);
  return res.json({ success: true });
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
    const { message, lesson, userProfile } = req.body;

    const systemPrompt = `You are a ${userProfile.targetLanguage} language practice partner.
The user is practicing: ${lesson.topic}
Their level: ${userProfile.level}
Keep responses natural, correcting errors gently, and staying on topic.`;

    const fullPrompt = `${systemPrompt}\n\nUser said: ${message}\n\nRespond naturally in ${userProfile.targetLanguage}:`;

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

app.listen(PORT, () => {
  console.log(`SpeakEasy backend running on port ${PORT}`);
  console.log(`Ollama URL: ${OLLAMA_BASE_URL}`);
  console.log(`Models: ${QWEN_MODEL}, ${LLAMA_MODEL}`);
});
