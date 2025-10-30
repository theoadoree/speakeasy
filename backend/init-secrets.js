/**
 * Initialize secrets and Firebase with Secret Manager
 *
 * This module loads all secrets from Google Cloud Secret Manager
 * and initializes Firebase Admin SDK with the service account.
 */

const admin = require('firebase-admin');
const { secretsLoader } = require('./secrets-loader');

let secrets = null;
let firebaseApp = null;
let initPromise = null;

/**
 * Initialize secrets and Firebase (called once on server startup)
 * @returns {Promise<Object>} - Initialized secrets object
 */
async function initializeSecrets() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    console.log('🚀 Initializing secrets and Firebase...');

    try {
      // Check if running in production (Cloud Run)
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        // Load secrets from Secret Manager
        secrets = await secretsLoader.loadAllSecrets();

        // Initialize Firebase with service account from Secret Manager
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(secrets.firebaseServiceAccount),
          projectId: secrets.firebaseServiceAccount.project_id
        });

        console.log('✅ Firebase Admin initialized with Secret Manager credentials');
      } else {
        // Local development - use environment variables
        console.log('🔧 Development mode - using local credentials');

        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          firebaseApp = admin.initializeApp({
            credential: admin.credential.applicationDefault()
          });
        } else {
          console.warn('⚠️  No Firebase credentials found - running in mock mode');
        }

        // Load secrets from environment variables for local dev
        secrets = {
          jwtSecret: process.env.JWT_SECRET,
          googleClientId: process.env.GOOGLE_CLIENT_ID,
          revenueCatApiKey: process.env.REVENUECAT_API_KEY,
          openaiApiKey: process.env.OPENAI_API_KEY,
          applePrivateKey: process.env.APPLE_PRIVATE_KEY
        };
      }

      return secrets;
    } catch (error) {
      console.error('❌ Failed to initialize secrets:', error);
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Get the secrets object (must call initializeSecrets first)
 * @returns {Object} - Secrets object
 */
function getSecrets() {
  if (!secrets) {
    throw new Error('Secrets not initialized. Call initializeSecrets() first.');
  }
  return secrets;
}

/**
 * Get Firebase services
 * @returns {Object} - { admin, db, auth, isConfigured }
 */
function getFirebase() {
  return {
    admin,
    db: firebaseApp ? admin.firestore() : null,
    auth: firebaseApp ? admin.auth() : null,
    isConfigured: !!firebaseApp
  };
}

module.exports = {
  initializeSecrets,
  getSecrets,
  getFirebase
};
