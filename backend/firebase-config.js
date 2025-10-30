/**
 * Firebase Config - Proxies to init-secrets for Firebase services
 *
 * This file maintains backwards compatibility with code that imports
 * firebase-config.js while using the new Secret Manager integration.
 */

const { getFirebase } = require('./init-secrets');

// Export Firebase services from init-secrets
module.exports = getFirebase();
