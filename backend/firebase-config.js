const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// For local development, set GOOGLE_APPLICATION_CREDENTIALS environment variable
// For production, use service account key file or Cloud Run default credentials

let firebaseApp;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Use service account from environment variable (for Cloud Run)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use service account file (for local development)
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } else {
    // Use default credentials (Cloud Run environment)
    firebaseApp = admin.initializeApp();
  }

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  // Initialize with mock for development without Firebase
  console.warn('Running in mock mode without Firebase');
}

const db = firebaseApp ? admin.firestore() : null;
const auth = firebaseApp ? admin.auth() : null;

module.exports = {
  admin,
  db,
  auth,
  isConfigured: !!firebaseApp
};
