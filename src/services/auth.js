import axios from 'axios';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import StorageService from '../utils/storage';

// Configure your API base URL here
// Production Cloud Run URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://speakeasy-backend-823510409781.us-central1.run.app';

// Configure Google Sign In
GoogleSignin.configure({
  webClientId: '823510409781-s5d3hrffelmjcl8kjvchcv3tlbp0shbo.apps.googleusercontent.com',
  offlineAccess: true,
});

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
      // Check if Apple Authentication is available
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
   * Sign in with Google
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async signInWithGoogle() {
    try {
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
