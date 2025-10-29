const tokenService = require('../services/token-service');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT token in Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = tokenService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Attach user data to request
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

module.exports = authMiddleware;
