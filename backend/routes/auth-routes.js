const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const appleAuthService = require('../services/apple-auth-service');
const googleAuthService = require('../services/google-auth-service');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const authMiddleware = require('../middleware/auth-middleware');

/**
 * POST /api/auth/apple
 * Authenticate user with Apple Sign In
 */
router.post('/apple', [
  body('identityToken').notEmpty().withMessage('Identity token is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { identityToken, authorizationCode, user, fullName, email } = req.body;

    // Verify Apple identity token
    const appleData = await appleAuthService.verifyToken(identityToken);

    if (!appleData.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Apple identity token',
      });
    }

    // Get or create user
    const userData = {
      appleId: appleData.sub,
      email: email || appleData.email,
      name: fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : null,
      authProvider: 'apple',
    };

    const dbUser = await userService.findOrCreateUser(userData);

    // Generate JWT token
    const token = tokenService.generateToken({
      userId: dbUser.id,
      email: dbUser.email,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          authProvider: dbUser.authProvider,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/google
 * Authenticate user with Google Sign In
 */
router.post('/google', [
  body('idToken').notEmpty().withMessage('ID token is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { idToken, user } = req.body;

    // Verify Google ID token
    const googleData = await googleAuthService.verifyToken(idToken);

    if (!googleData.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Google ID token',
      });
    }

    // Get or create user
    const userData = {
      googleId: googleData.sub,
      email: googleData.email,
      name: googleData.name,
      photo: googleData.picture,
      authProvider: 'google',
    };

    const dbUser = await userService.findOrCreateUser(userData);

    // Generate JWT token
    const token = tokenService.generateToken({
      userId: dbUser.id,
      email: dbUser.email,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          photo: dbUser.photo,
          authProvider: dbUser.authProvider,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/validate
 * Validate JWT token and return user data
 */
router.get('/validate', authMiddleware, async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    const user = await userService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/register
 * Register new user (fallback for email/password if needed)
 */
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().withMessage('Name is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Create user
    const user = await userService.createUser({
      email,
      password,
      name,
      authProvider: 'email',
    });

    // Generate JWT token
    const token = tokenService.generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          authProvider: user.authProvider,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login with email/password (fallback if needed)
 */
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Authenticate user
    const user = await userService.authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = tokenService.generateToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          authProvider: user.authProvider,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, [
  body('profile').isObject().withMessage('Profile object is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const userId = req.user.userId;
    const { profile } = req.body;

    const updatedUser = await userService.updateUserProfile(userId, profile);

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
