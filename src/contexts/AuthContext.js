import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is authenticated on app start
   */
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authenticated = await AuthService.isAuthenticated();

      if (authenticated) {
        // Validate token with backend
        const validation = await AuthService.validateToken();

        if (validation.valid) {
          setUser(validation.user);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear auth data
          await AuthService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (email, password) => {
    try {
      setAuthError(null);
      const result = await AuthService.login(email, password);

      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setAuthError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Register new user
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const register = async (email, password, name) => {
    try {
      setAuthError(null);
      const result = await AuthService.register(email, password, name);

      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setAuthError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const logout = async () => {
    try {
      const result = await AuthService.logout();

      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Logout failed' };
    }
  };

  /**
   * Request password reset
   * @param {string} email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const requestPasswordReset = async (email) => {
    try {
      setAuthError(null);
      const result = await AuthService.requestPasswordReset(email);

      if (!result.success) {
        setAuthError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to request password reset';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Clear authentication error
   */
  const clearError = () => {
    setAuthError(null);
  };

  /**
   * Update user data
   * @param {object} userData
   */
  const updateUser = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    logout,
    requestPasswordReset,
    clearError,
    updateUser,
    refreshAuth: checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
