/**
 * Simple Authentication Backend - No Token Verification
 *
 * This bypasses all Google/Apple token verification and just creates sessions.
 * Use this for testing to isolate whether the issue is token verification or data format.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const users = new Map();
const sessions = new Map();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Simple auth backend running' });
});

// Google OAuth endpoint - NO VERIFICATION
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('\n🔵 === GOOGLE AUTH REQUEST ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));

    const { idToken, credential, name, email, imageUrl } = req.body;

    // Accept ANY data - just create a session
    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const userId = `google_${Date.now()}`;

    const user = {
      id: userId,
      provider: 'google',
      name: name || email || 'Google User',
      email: email || 'test@gmail.com',
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString()
    };

    users.set(userId, user);
    sessions.set(sessionId, {
      userId,
      createdAt: new Date().toISOString()
    });

    console.log('✅ Google auth SUCCESS');
    console.log('Created user:', user);
    console.log('Session token:', sessionId);

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
    console.error('❌ Google auth error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Apple OAuth endpoint - NO VERIFICATION
app.post('/api/auth/apple', async (req, res) => {
  try {
    console.log('\n🍎 === APPLE AUTH REQUEST ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));

    const { idToken, authorizationCode, user, name, email, identityToken } = req.body;

    // Accept ANY data - just create a session
    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const userId = `apple_${user || Date.now()}`;

    const userData = {
      id: userId,
      provider: 'apple',
      name: name || email || 'Apple User',
      email: email || 'test@icloud.com',
      createdAt: new Date().toISOString()
    };

    users.set(userId, userData);
    sessions.set(sessionId, {
      userId,
      createdAt: new Date().toISOString()
    });

    console.log('✅ Apple auth SUCCESS');
    console.log('Created user:', userData);
    console.log('Session token:', sessionId);

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
    console.error('❌ Apple auth error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Token validation endpoint
app.get('/api/auth/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  const user = users.get(session.userId);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  res.json({
    success: true,
    data: user
  });
});

// Catch-all for other endpoints
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Simple Auth Backend running on port ${PORT}`);
  console.log(`📝 This backend accepts ANY auth data without verification`);
  console.log(`✅ Use this to test if your app can authenticate at all\n`);
});
