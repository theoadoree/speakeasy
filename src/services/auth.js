import axios from 'axios';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import StorageService from '../utils/storage';

// Configure your API base URL here with sane fallbacks
const resolvedApiUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  process.env.REACT_APP_API_URL ||
  'https://speakeasy-backend-823510409781.us-central1.run.app';

export const API_BASE_URL = resolvedApiUrl;

// Configure Google Sign In (only on native platforms)
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com',
    iosClientId: '768424738821-gb3i7pl82qm5r70q73nh6gg33i1f3tv0.apps.googleusercontent.com',
    offlineAccess: true,
  });
}

class AuthService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await StorageService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear auth data
          await StorageService.clearAuthData();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Register a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} name - User's full name
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async register(email, password, name) {
    try {
      const response = await this.apiClient.post('/api/auth/register', {
        email,
        password,
        name,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        await StorageService.saveAuthToken(token);
        await StorageService.saveUserData(user);

        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.error || 'Registration failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Registration failed',
      };
    }
  }

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async login(email, password) {
    try {
      const response = await this.apiClient.post('/api/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        await StorageService.saveAuthToken(token);
        await StorageService.saveUserData(user);

        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.error || 'Login failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed',
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async logout() {
    try {
      await StorageService.clearAuthData();

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  }

  /**
   * Get current user from storage
   * @returns {Promise<any>}
   */
  async getCurrentUser() {
    try {
      const userData = await StorageService.getUserData();
      return userData;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const token = await StorageService.getAuthToken();
    return !!token;
  }

  /**
   * Validate current token with backend
   * @returns {Promise<{valid: boolean, user?: any}>}
   */
  async validateToken() {
    try {
      const response = await this.apiClient.get('/api/auth/validate');

      if (response.data.valid) {
        // Update local user data with server data
        await StorageService.saveUserData(response.data.user);
        return {
          valid: true,
          user: response.data.user,
        };
      }

      return { valid: false };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Sign in with Apple
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async signInWithApple() {
    try {
      if (Platform.OS === 'web') {
        // Web implementation using Firebase Auth
        return await this.signInWithAppleWeb();
      }

      // Native implementation
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Apple Sign In is not available on this device',
        };
      }

      // Request Apple credentials
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Send credential to backend for verification and user creation/login
      const response = await this.apiClient.post('/api/auth/apple', {
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        user: credential.user,
        fullName: credential.fullName,
        email: credential.email,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        await StorageService.saveAuthToken(token);
        await StorageService.saveUserData(user);

        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.error || 'Apple Sign In failed',
      };
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return {
          success: false,
          error: 'User cancelled',
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Apple Sign In failed',
      };
    }
  }

  /**
   * Sign in with Apple on Web using Firebase Auth
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async signInWithAppleWeb() {
    try {
      // Dynamic import of Firebase
      const firebase = await import('firebase/app');
      const { getAuth, signInWithPopup, OAuthProvider } = await import('firebase/auth');

      // Initialize Firebase if not already initialized
      if (!firebase.getApps || firebase.getApps().length === 0) {
        firebase.initializeApp({
          apiKey: 'AIzaSyDOlqd0tEWZ5X5YpN7oLHQMQhQg7rQ7qJo',
          authDomain: 'speakeasy-app.firebaseapp.com',
          projectId: 'modular-analog-476221-h8',
        });
      }

      const auth = getAuth();
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      const credential = OAuthProvider.credentialFromResult(result);

      if (!credential?.idToken) {
        throw new Error('Apple identity token not returned by provider');
      }

      // Send credential to backend
      const response = await this.apiClient.post('/api/auth/apple', {
        identityToken: credential.idToken,
        user: result.user.uid,
        email: result.user.email,
        fullName: {
          givenName: result.user.displayName?.split(' ')[0] || '',
          familyName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
        },
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        await StorageService.saveAuthToken(token);
        await StorageService.saveUserData(user);

        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.error || 'Apple Sign In failed',
      };
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: 'User cancelled',
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Apple Sign In failed',
      };
    }
  }

  /**
   * Sign in with Google
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async signInWithGoogle() {
    try {
      if (Platform.OS === 'web') {
        // Web implementation using Firebase Auth
        return await this.signInWithGoogleWeb();
      }

      // Native implementation
      // Check Google Play Services availability
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      // Get ID token
      const tokens = await GoogleSignin.getTokens();

      // Send token to backend for verification and user creation/login
      const response = await this.apiClient.post('/api/auth/google', {
        idToken: tokens.idToken,
        user: {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name,
          photo: userInfo.user.photo,
        },
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        await StorageService.saveAuthToken(token);
        await StorageService.saveUserData(user);

        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.error || 'Google Sign In failed',
      };
    } catch (error) {
      if (error.code === 'SIGN_IN_CANCELLED') {
        return {
          success: false,
          error: 'User cancelled',
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Google Sign In failed',
      };
    }
  }

  /**
   * Sign in with Google on Web using Firebase Auth
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async signInWithGoogleWeb() {
    try {
      // Dynamic import of Firebase
      const firebase = await import('firebase/app');
      const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');

      // Initialize Firebase if not already initialized
      if (!firebase.getApps || firebase.getApps().length === 0) {
        firebase.initializeApp({
          apiKey: 'AIzaSyDOlqd0tEWZ5X5YpN7oLHQMQhQg7rQ7qJo',
          authDomain: 'speakeasy-app.firebaseapp.com',
          projectId: 'modular-analog-476221-h8',
        });
      }

      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.idToken) {
        throw new Error('Google ID token not returned by provider');
      }

      // Send credential to backend
      const response = await this.apiClient.post('/api/auth/google', {
        idToken: credential.idToken,
        user: {
          id: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          photo: result.user.photoURL,
        },
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        await StorageService.saveAuthToken(token);
        await StorageService.saveUserData(user);

        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.error || 'Google Sign In failed',
      };
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: 'User cancelled',
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Google Sign In failed',
      };
    }
  }

  /**
   * Check if Apple Sign In is available
   * @returns {Promise<boolean>}
   */
  async isAppleSignInAvailable() {
    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch (error) {
      return false;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User's email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async requestPasswordReset(email) {
    try {
      const response = await this.apiClient.post('/api/auth/reset-password', { email });

      return {
        success: response.data.success,
        error: response.data.error
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send reset email',
      };
    }
  }

  /**
   * Update user profile
   * @param {object} profile - User profile data
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async updateProfile(profile) {
    try {
      const response = await this.apiClient.put('/api/auth/profile', { profile });

      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update profile',
      };
    }
  }

  /**
   * Update user progress
   * @param {object} progressData - Progress data (xpGained, lessonCompleted, etc.)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async updateProgress(progressData) {
    try {
      const response = await this.apiClient.post('/api/auth/progress', progressData);

      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update progress',
      };
    }
  }

  /**
   * Get leaderboard for a specific league
   * @param {string} league - League name (bronze, silver, gold, etc.)
   * @param {number} limit - Number of results to return
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async getLeaderboard(league, limit = 50) {
    try {
      const response = await this.apiClient.get(`/api/auth/leaderboard/${league}?limit=${limit}`);

      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch leaderboard',
      };
    }
  }
}

export default new AuthService();
