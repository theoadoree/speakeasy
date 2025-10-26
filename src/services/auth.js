import axios from 'axios';
import StorageService from '../utils/storage';

// Configure your API base URL here
const API_BASE_URL = 'https://api.fluentai.app'; // Replace with your actual API URL

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
      // TODO: Replace with actual API call
      // const response = await this.apiClient.post('/auth/register', {
      //   email,
      //   password,
      //   name,
      // });

      // Mock implementation - remove this when integrating with real API
      await this.simulateNetworkDelay();

      // Simulate email already exists error (for demo purposes)
      if (email === 'test@test.com') {
        return {
          success: false,
          error: 'Email already registered',
        };
      }

      const mockUser = {
        id: Date.now().toString(),
        email,
        name,
        createdAt: new Date().toISOString(),
      };

      const mockToken = `mock_token_${Date.now()}`;

      await StorageService.saveAuthToken(mockToken);
      await StorageService.saveUserData(mockUser);

      return {
        success: true,
        data: {
          user: mockUser,
          token: mockToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed',
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
      // TODO: Replace with actual API call
      // const response = await this.apiClient.post('/auth/login', {
      //   email,
      //   password,
      // });

      // Mock implementation - remove this when integrating with real API
      await this.simulateNetworkDelay();

      // Simulate invalid credentials (for demo purposes)
      if (password.length < 6) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      const mockUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
      };

      const mockToken = `mock_token_${Date.now()}`;

      await StorageService.saveAuthToken(mockToken);
      await StorageService.saveUserData(mockUser);

      return {
        success: true,
        data: {
          user: mockUser,
          token: mockToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
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
      // TODO: Replace with actual API call
      // const response = await this.apiClient.get('/auth/validate');
      // return {
      //   valid: true,
      //   user: response.data.user,
      // };

      // Mock implementation
      const token = await StorageService.getAuthToken();
      if (!token) {
        return { valid: false };
      }

      const userData = await StorageService.getUserData();
      return {
        valid: true,
        user: userData,
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
      // TODO: Replace with actual API call
      // await this.apiClient.post('/auth/reset-password', { email });

      await this.simulateNetworkDelay();

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email',
      };
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
