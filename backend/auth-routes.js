const express = require('express');
const { auth, db, isConfigured } = require('./firebase-config');
const router = express.Router();

// Middleware to verify Firebase auth token
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!isConfigured) {
      // Mock verification for development
      req.user = { uid: 'mock-user-id', email: 'mock@example.com' };
      return next();
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!isConfigured) {
      // Mock response for development
      return res.json({
        success: true,
        data: {
          user: {
            uid: `mock-${Date.now()}`,
            email,
            name,
            createdAt: new Date().toISOString()
          },
          token: `mock_token_${Date.now()}`
        }
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      profile: {
        targetLanguage: null,
        nativeLanguage: 'English',
        level: null,
        interests: []
      },
      progress: {
        xp: 0,
        streak: 0,
        lessonsCompleted: 0,
        wordsLearned: 0,
        timeSpent: 0
      }
    });

    // Generate custom token
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
          createdAt: userRecord.metadata.creationTime
        },
        token: customToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already registered' });
    }

    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    if (!isConfigured) {
      // Mock response for development
      return res.json({
        success: true,
        data: {
          user: {
            uid: `mock-${Date.now()}`,
            email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
          },
          token: `mock_token_${Date.now()}`
        }
      });
    }

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    // Generate custom token
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userData?.name || userRecord.displayName,
          profile: userData?.profile,
          progress: userData?.progress
        },
        token: customToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Validate token
router.get('/validate', verifyToken, async (req, res) => {
  try {
    if (!isConfigured) {
      return res.json({
        valid: true,
        user: {
          uid: req.user.uid,
          email: req.user.email
        }
      });
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    res.json({
      valid: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: userData?.name,
        profile: userData?.profile,
        progress: userData?.progress
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { profile } = req.body;

    if (!isConfigured) {
      return res.json({
        success: true,
        data: { profile }
      });
    }

    await db.collection('users').doc(req.user.uid).update({
      profile,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update user progress
router.post('/progress', verifyToken, async (req, res) => {
  try {
    const { xpGained, lessonCompleted, wordsLearned, timeSpent } = req.body;

    if (!isConfigured) {
      return res.json({
        success: true,
        data: {
          xp: xpGained || 0,
          lessonsCompleted: lessonCompleted ? 1 : 0
        }
      });
    }

    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const currentProgress = userData?.progress || {};

    const updatedProgress = {
      xp: (currentProgress.xp || 0) + (xpGained || 0),
      lessonsCompleted: (currentProgress.lessonsCompleted || 0) + (lessonCompleted ? 1 : 0),
      wordsLearned: (currentProgress.wordsLearned || 0) + (wordsLearned || 0),
      timeSpent: (currentProgress.timeSpent || 0) + (timeSpent || 0)
    };

    await userRef.update({
      progress: updatedProgress,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update leaderboard
    const league = getLeagueForXP(updatedProgress.xp);
    await db.collection('leaderboards').doc(league).collection('users').doc(req.user.uid).set({
      userId: req.user.uid,
      name: userData?.name,
      xp: updatedProgress.xp,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      data: updatedProgress
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get leaderboard
router.get('/leaderboard/:league', async (req, res) => {
  try {
    const { league } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (!isConfigured) {
      // Mock leaderboard
      return res.json({
        success: true,
        data: []
      });
    }

    const snapshot = await db
      .collection('leaderboards')
      .doc(league)
      .collection('users')
      .orderBy('xp', 'desc')
      .limit(limit)
      .get();

    const leaderboard = snapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Helper function to determine league based on XP
function getLeagueForXP(xp) {
  if (xp >= 10000) return 'legendary';
  if (xp >= 5000) return 'diamond';
  if (xp >= 3000) return 'platinum';
  if (xp >= 1500) return 'gold';
  if (xp >= 500) return 'silver';
  return 'bronze';
}

module.exports = router;
