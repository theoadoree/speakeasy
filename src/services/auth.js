import axios from 'axios';
import StorageService from '../utils/storage';

// Configure your API base URL here
const API_BASE_URL = 'http://localhost:8080';

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
      const response = await this.apiClient.post('/auth/register', {
        email,
        password,
        name,
      });
      if (response.data?.verificationRequired) {
        return {
          success: true,
          verificationRequired: true,
          email: response.data.email,
        };
      }
      // In case backend returns token directly (should not for email flow)
      if (response.data?.data?.token) {
        await StorageService.saveAuthToken(response.data.data.token);
        await StorageService.saveUserData(response.data.data.user);
        return { success: true };
      }
      return { success: true };
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
      const response = await this.apiClient.post('/auth/login', { email, password });
      if (response.data?.success) {
        const { token, user } = response.data.data || {};
        if (token && user) {
          await StorageService.saveAuthToken(token);
          await StorageService.saveUserData(user);
        }
        return { success: true };
      }
      if (response.data?.verificationRequired) {
        return {
          success: false,
          verificationRequired: true,
          email: response.data.email || email,
          error: response.data.error,
        };
      }
      return {
        success: false,
        error: 'Login failed',
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
      // TODO: If your API requires logout endpoint, call it here
      // await this.apiClient.post('/auth/logout');

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
      const response = await this.apiClient.get('/auth/validate');
      return {
        valid: !!response.data?.valid,
        user: response.data?.user,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Request password reset
   * @param {string} email - User's email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async requestPasswordReset(email) {
    try {
      // Not implemented on backend; simulate success UI for now
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send reset email',
      };
    }
  }

  async verifyEmail(email, code) {
    try {
      const response = await this.apiClient.post('/auth/verify-email', { email, code });
      if (response.data?.success) {
        const { token, user } = response.data.data || {};
        if (token && user) {
          await StorageService.saveAuthToken(token);
          await StorageService.saveUserData(user);
        }
        return { success: true };
      }
      return { success: false, error: 'Verification failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Verification failed' };
    }
  }

  async resendVerification(email) {
    try {
      await this.apiClient.post('/auth/resend', { email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to resend code' };
    }
  }

  async signInWithGoogle(idToken, email, name) {
    try {
      const response = await this.apiClient.post('/auth/oauth/google', { idToken, email, name });
      if (response.data?.success) {
        const { token, user } = response.data.data || {};
        if (token && user) {
          await StorageService.saveAuthToken(token);
          await StorageService.saveUserData(user);
        }
        return { success: true };
      }
      return { success: false, error: 'Google sign-in failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Google sign-in failed' };
    }
  }

  async signInWithApple(idToken, email, name) {
    try {
      const response = await this.apiClient.post('/auth/oauth/apple', { idToken, email, name });
      if (response.data?.success) {
        const { token, user } = response.data.data || {};
        if (token && user) {
          await StorageService.saveAuthToken(token);
          await StorageService.saveUserData(user);
        }
        return { success: true };
      }
      return { success: false, error: 'Apple sign-in failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Apple sign-in failed' };
    }
  }

  /**
   * Simulate network delay for mock API calls
   * @private
   */
  async simulateNetworkDelay() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export default new AuthService();
