/**
 * Google Cloud Secret Manager Loader
 *
 * Loads secrets from Google Cloud Secret Manager for production deployment.
 * Falls back to environment variables for local development.
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SecretsLoader {
  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = process.env.FIREBASE_PROJECT_ID || 'modular-analog-476221-h8';
    this.cache = {};
  }

  /**
   * Access a secret from Secret Manager
   * @param {string} secretName - Name of the secret
   * @returns {Promise<string>} - Secret value
   */
  async accessSecret(secretName) {
    // Check cache first
    if (this.cache[secretName]) {
      return this.cache[secretName];
    }

    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await this.client.accessSecretVersion({ name });
      const payload = version.payload.data.toString('utf8');

      // Cache the secret
      this.cache[secretName] = payload;

      console.log(`✅ Loaded secret: ${secretName}`);
      return payload;
    } catch (error) {
      console.error(`❌ Failed to load secret ${secretName}:`, error.message);
      throw error;
    }
  }

  /**
   * Load all required secrets for the application
   * @returns {Promise<Object>} - Object containing all secrets
   */
  async loadAllSecrets() {
    console.log('🔐 Loading secrets from Secret Manager...');

    try {
      const [
        firebaseServiceAccount,
        jwtSecret,
        googleClientId,
        revenueCatApiKey,
        openaiApiKey,
        applePrivateKey
      ] = await Promise.all([
        this.accessSecret('firebase-service-account'),
        this.accessSecret('jwt-secret'),
        this.accessSecret('google-client-id'),
        this.accessSecret('revenuecat-api-key'),
        this.accessSecret('openai-api-key').catch(() => null), // Optional
        this.accessSecret('apple-private-key').catch(() => null) // Optional
      ]);

      const secrets = {
        firebaseServiceAccount: JSON.parse(firebaseServiceAccount),
        jwtSecret,
        googleClientId,
        revenueCatApiKey,
        openaiApiKey,
        applePrivateKey
      };

      console.log('✅ All secrets loaded successfully');
      return secrets;
    } catch (error) {
      console.error('❌ Failed to load secrets:', error.message);
      throw error;
    }
  }
}

// Singleton instance
const secretsLoader = new SecretsLoader();

module.exports = { secretsLoader, SecretsLoader };
