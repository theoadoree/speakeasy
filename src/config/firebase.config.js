/**
 * Firebase Configuration
 *
 * This file exports Firebase configuration based on the platform
 * - Web: Uses environment variables from .env
 * - iOS/Android: Uses GoogleService-Info.plist/google-services.json via @react-native-firebase
 */

import { Platform } from 'react-native';

// For web platform, use environment variables
export const firebaseConfig = Platform.select({
  web: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyAQKDl8VGUodzYe0Cq9sC3wzot6Hb4YVEI',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'modular-analog-476221-h8.firebaseapp.com',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'modular-analog-476221-h8',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'modular-analog-476221-h8.appspot.com',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  },
  // For iOS/Android, configuration is read from native files
  // GoogleService-Info.plist (iOS) and google-services.json (Android)
  default: null,
});

export default firebaseConfig;
