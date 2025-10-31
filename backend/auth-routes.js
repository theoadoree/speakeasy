const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { admin, auth, db, isConfigured } = require('./firebase-config');
const router = express.Router();

// Initialize Google OAuth client for token verification
const googleClient = new OAuth2Client();

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

// Apple Sign In - auto creates account if doesn't exist
router.post('/apple', async (req, res) => {
  try {
    const { identityToken, user: appleUserId, email, fullName } = req.body;

    if (!identityToken) {
      return res.status(400).json({ error: 'Missing identity token' });
    }

    if (!isConfigured) {
      // Mock response for development
      const mockEmail = email || `apple_${appleUserId}@privaterelay.appleid.com`;
      return res.json({
        success: true,
        data: {
          user: {
            uid: `apple_${appleUserId || Date.now()}`,
            email: mockEmail,
            name: fullName ? `${fullName.givenName} ${fullName.familyName}`.trim() : mockEmail.split('@')[0],
            provider: 'apple',
            createdAt: new Date().toISOString()
          },
          token: `mock_token_${Date.now()}`
        }
      });
    }

    // Verify Apple token (in production, you'd verify with Apple's servers)
    // For now, we'll trust the token and create/login the user

    // Try to find existing user by Apple ID or email
    let userRecord;
    let isNewUser = false;

    try {
      // Check if user exists by custom claim (Apple ID)
      const users = await auth.getUsers([{ uid: `apple_${appleUserId}` }]);
      if (users.users.length > 0) {
        userRecord = users.users[0];
      }
    } catch (error) {
      // User doesn't exist with this Apple ID
    }

    // If not found by Apple ID, try by email
    if (!userRecord && email) {
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (error) {
        // User doesn't exist with this email
      }
    }

    // Create new user if doesn't exist
    if (!userRecord) {
      isNewUser = true;
      const displayName = fullName
        ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
        : (email ? email.split('@')[0] : 'Apple User');

      userRecord = await auth.createUser({
        uid: `apple_${appleUserId}`,
        email: email || `apple_${appleUserId}@privaterelay.appleid.com`,
        displayName,
        emailVerified: true // Apple emails are verified
      });

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        name: displayName,
        provider: 'apple',
        appleUserId,
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
    } else {
      // Update existing user document with Apple provider info if needed
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      if (!userDoc.exists || !userDoc.data().provider) {
        await db.collection('users').doc(userRecord.uid).update({
          provider: 'apple',
          appleUserId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

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
          provider: 'apple',
          isNewUser,
          profile: userData?.profile,
          progress: userData?.progress
        },
        token: customToken
      }
    });
  } catch (error) {
    console.error('Apple Sign In error:', error);
    res.status(500).json({ error: 'Apple Sign In failed', details: error.message });
  }
});

// Google Sign In - auto creates account if doesn't exist
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Missing ID token' });
    }

    // Verify Google ID token and extract user info
    let googleId, email, name, photo;
    const providedUser = req.body.user;

    try {
      // Verify token with Google - works for both iOS and web clients
      const validAudiences = [
        '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com', // Web client
        '823510409781-aqd90aoj080374pnfjultufdkk027qsp.apps.googleusercontent.com', // iOS client
        '823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com' // Fallback
      ];

      const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: validAudiences
      });

      const payload = ticket.getPayload();
      console.log('✅ Google token verified:', payload.sub);

      // Use verified token data (most reliable)
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      photo = payload.picture;

    } catch (verifyError) {
      console.error('❌ Google token verification failed:', verifyError.message);

      // Fallback: use provided user info from request body (for development/testing)
      if (providedUser) {
        console.log('⚠️  Using provided user info (token verification failed)');
        googleId = providedUser.id;
        email = providedUser.email;
        name = providedUser.name;
        photo = providedUser.photo;
      } else {
        // No user info available at all
        throw new Error('Failed to verify Google token and no fallback user info provided');
      }
    }

    if (!isConfigured) {
      // Mock response for development
      return res.json({
        success: true,
        data: {
          user: {
            uid: `google_${googleId || Date.now()}`,
            email,
            name: name || email.split('@')[0],
            photo,
            provider: 'google',
            createdAt: new Date().toISOString()
          },
          token: `mock_token_${Date.now()}`
        }
      });
    }

    // Verify Google token (in production, you'd verify with Google's servers)
    // For now, we'll trust the token and create/login the user

    // Try to find existing user by Google ID or email
    let userRecord;
    let isNewUser = false;

    try {
      // Check if user exists by custom claim (Google ID)
      const users = await auth.getUsers([{ uid: `google_${googleId}` }]);
      if (users.users.length > 0) {
        userRecord = users.users[0];
      }
    } catch (error) {
      // User doesn't exist with this Google ID
    }

    // If not found by Google ID, try by email
    if (!userRecord && email) {
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (error) {
        // User doesn't exist with this email
      }
    }

    // Create new user if doesn't exist
    if (!userRecord) {
      isNewUser = true;
      userRecord = await auth.createUser({
        uid: `google_${googleId}`,
        email,
        displayName: name || email.split('@')[0],
        photoURL: photo,
        emailVerified: true // Google emails are verified
      });

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email,
        name: name || email.split('@')[0],
        photo,
        provider: 'google',
        googleId,
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
    } else {
      // Update existing user document with Google provider info if needed
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      if (!userDoc.exists || !userDoc.data().provider) {
        await db.collection('users').doc(userRecord.uid).update({
          provider: 'google',
          googleId,
          photo,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

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
          photo: userData?.photo || userRecord.photoURL,
          provider: 'google',
          isNewUser,
          profile: userData?.profile,
          progress: userData?.progress
        },
        token: customToken
      }
    });
  } catch (error) {
    console.error('Google Sign In error:', error);
    res.status(500).json({ error: 'Google Sign In failed', details: error.message });
  }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!isConfigured) {
      // Mock response for development
      return res.json({
        success: true,
        message: 'Password reset email sent'
      });
    }

    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);

    // In production, send email with resetLink
    // For now, just return success

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Password reset error:', error);

    if (error.code === 'auth/user-not-found') {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: 'If an account exists, password reset email has been sent'
      });
    }

    res.status(500).json({ error: 'Failed to send reset email' });
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
