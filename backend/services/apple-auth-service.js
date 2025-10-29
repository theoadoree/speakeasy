const appleSignin = require('apple-signin-auth');
const logger = require('../utils/logger');

class AppleAuthService {
  /**
   * Verify Apple identity token
   * @param {string} identityToken - Apple identity token from client
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyToken(identityToken) {
    try {
      // Verify the identity token with Apple
      const appleData = await appleSignin.verifyIdToken(identityToken, {
        // Your Apple Service ID (iOS App Bundle ID)
        audience: process.env.APPLE_BUNDLE_ID || 'com.speakeasy.app',
        // Optional: Verify nonce if you sent one
        // nonce: 'nonce_from_request',
      });

      logger.info('Apple token verified successfully', {
        sub: appleData.sub,
        email: appleData.email,
      });

      return {
        valid: true,
        sub: appleData.sub, // Unique user identifier
        email: appleData.email,
        email_verified: appleData.email_verified,
        is_private_email: appleData.is_private_email,
        auth_time: appleData.auth_time,
      };
    } catch (error) {
      logger.error('Apple token verification failed', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Revoke Apple refresh token (for user deletion)
   * @param {string} refreshToken - Apple refresh token
   */
  async revokeToken(refreshToken) {
    try {
      await appleSignin.revokeToken(refreshToken, {
        clientId: process.env.APPLE_BUNDLE_ID,
        clientSecret: await this.generateClientSecret(),
      });

      logger.info('Apple token revoked successfully');
      return { success: true };
    } catch (error) {
      logger.error('Failed to revoke Apple token', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate Apple client secret (JWT)
   * Required for certain Apple Sign In operations
   */
  async generateClientSecret() {
    // This requires:
    // - Team ID
    // - Key ID
    // - Private key (.p8 file)
    // See: https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens

    const clientSecret = appleSignin.getClientSecret({
      clientID: process.env.APPLE_BUNDLE_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyIdentifier: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY, // .p8 file content
      expAfter: 15777000, // 6 months in seconds
    });

    return clientSecret;
  }
}

module.exports = new AppleAuthService();
