const { OAuth2Client } = require('google-auth-library');
const logger = require('../utils/logger');

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID || '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com'
    );
  }

  /**
   * Verify Google ID token
   * @param {string} idToken - Google ID token from client
   * @returns {Promise<Object>} Verified token payload
   */
  async verifyToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID || '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com',
      });

      const payload = ticket.getPayload();

      logger.info('Google token verified successfully', {
        sub: payload.sub,
        email: payload.email,
      });

      return {
        valid: true,
        sub: payload.sub, // Unique user identifier
        email: payload.email,
        email_verified: payload.email_verified,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
        locale: payload.locale,
      };
    } catch (error) {
      logger.error('Google token verification failed', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Google refresh token
   * @returns {Promise<Object>} New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      this.client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.client.refreshAccessToken();

      return {
        success: true,
        accessToken: credentials.access_token,
        expiryDate: credentials.expiry_date,
      };
    } catch (error) {
      logger.error('Failed to refresh Google access token', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new GoogleAuthService();
