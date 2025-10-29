/**
 * Google Cloud Secret Manager Service
 *
 * Provides centralized access to secrets stored in Google Cloud Secret Manager.
 * Includes caching for performance and fallback to environment variables.
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SecretManager {
  constructor() {
    this.client = new SecretManagerServiceClient();
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;

    if (!this.projectId) {
      console.warn('⚠️  GCP_PROJECT_ID not set. Secret Manager will fall back to environment variables.');
    }
  }

  /**
   * Get a secret from Secret Manager with caching
   * Falls back to environment variables if Secret Manager is unavailable
   *
   * @param {string} secretName - Name of the secret
   * @param {string} version - Version of the secret (default: 'latest')
   * @returns {Promise<string>} - Secret value
   */
  async getSecret(secretName, version = 'latest') {
    // Check cache first
    const cacheKey = `${secretName}:${version}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.value;
    }

    try {
      // Try to get from Secret Manager
      if (this.projectId) {
        const secretValue = await this._getFromSecretManager(secretName, version);

        // Cache the result
        this.cache.set(cacheKey, {
          value: secretValue,
          timestamp: Date.now()
        });

        return secretValue;
      }
    } catch (error) {
      console.warn(`⚠️  Failed to get secret ${secretName} from Secret Manager:`, error.message);
      console.warn(`   Falling back to environment variable...`);
    }

    // Fallback to environment variable
    const envValue = process.env[secretName];
    if (!envValue) {
      throw new Error(`Secret ${secretName} not found in Secret Manager or environment variables`);
    }

    return envValue;
  }

  /**
   * Internal method to fetch from Secret Manager
   */
  async _getFromSecretManager(secretName, version) {
    const name = `projects/${this.projectId}/secrets/${secretName}/versions/${version}`;

    try {
      const [response] = await this.client.accessSecretVersion({ name });
      const secretValue = response.payload.data.toString('utf8');
      return secretValue;
    } catch (error) {
      if (error.code === 5) { // NOT_FOUND
        throw new Error(`Secret ${secretName} not found in Secret Manager`);
      }
      throw error;
    }
  }

  /**
   * Get multiple secrets at once
   *
   * @param {string[]} secretNames - Array of secret names
   * @returns {Promise<Object>} - Object with secret names as keys
   */
  async getSecrets(secretNames) {
    const secrets = {};

    await Promise.all(
      secretNames.map(async (name) => {
        try {
          secrets[name] = await this.getSecret(name);
        } catch (error) {
          console.error(`Failed to get secret ${name}:`, error.message);
          secrets[name] = null;
        }
      })
    );

    return secrets;
  }

  /**
   * Clear the cache (useful for testing or forcing refresh)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Check if Secret Manager is available
   */
  async healthCheck() {
    if (!this.projectId) {
      return { available: false, reason: 'Project ID not configured' };
    }

    try {
      // Try to list secrets (requires secretmanager.secrets.list permission)
      const parent = `projects/${this.projectId}`;
      await this.client.listSecrets({ parent, pageSize: 1 });
      return { available: true };
    } catch (error) {
      return { available: false, reason: error.message };
    }
  }
}

// Export singleton instance
const secretManager = new SecretManager();

/**
 * Load secrets on app startup
 * Returns an object with all required secrets
 */
async function loadSecrets() {
  const requiredSecrets = [
    'OPENAI_API_KEY',
    'APPLE_PRIVATE_KEY_BASE64',
    'STRIPE_SECRET_KEY',
    'JWT_SECRET'
  ];

  const optionalSecrets = [
    'GOOGLE_CLIENT_SECRET',
    'FIREBASE_SERVICE_ACCOUNT'
  ];

  console.log('📦 Loading secrets from Secret Manager...');

  const secrets = {};

  // Load required secrets
  for (const secretName of requiredSecrets) {
    try {
      secrets[secretName] = await secretManager.getSecret(secretName);
      console.log(`   ✅ Loaded: ${secretName}`);
    } catch (error) {
      console.error(`   ❌ Failed to load required secret: ${secretName}`);
      console.error(`      ${error.message}`);
      // Don't throw - let the app start but warn about missing secrets
    }
  }

  // Load optional secrets (don't log errors)
  for (const secretName of optionalSecrets) {
    try {
      secrets[secretName] = await secretManager.getSecret(secretName);
      console.log(`   ✅ Loaded: ${secretName}`);
    } catch (error) {
      console.log(`   ⚠️  Optional secret not found: ${secretName}`);
    }
  }

  // Public configuration (not secrets)
  secrets.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  secrets.APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
  secrets.APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
  secrets.APPLE_KEY_ID = process.env.APPLE_KEY_ID;

  console.log('📦 Secrets loaded successfully\n');

  return secrets;
}

module.exports = {
  secretManager,
  loadSecrets
};
