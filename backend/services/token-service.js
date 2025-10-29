const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '30d'; // 30 days

class TokenService {
  /**
   * Generate JWT token
   * @param {Object} payload - Data to encode in token
   * @returns {string} JWT token
   */
  generateToken(payload) {
    try {
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRY,
      });

      return token;
    } catch (error) {
      logger.error('Error generating JWT token', error);
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded payload or null if invalid
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('JWT token expired');
      } else if (error.name === 'JsonWebTokenError') {
        logger.warn('Invalid JWT token');
      } else {
        logger.error('Error verifying JWT token', error);
      }
      return null;
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   * @param {string} token - JWT token to decode
   * @returns {Object} Decoded payload
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decoding JWT token', error);
      return null;
    }
  }

  /**
   * Generate refresh token (longer expiry)
   * @param {Object} payload - Data to encode in token
   * @returns {string} Refresh token
   */
  generateRefreshToken(payload) {
    try {
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '90d', // 90 days
      });

      return token;
    } catch (error) {
      logger.error('Error generating refresh token', error);
      throw new Error('Failed to generate refresh token');
    }
  }
}

module.exports = new TokenService();
