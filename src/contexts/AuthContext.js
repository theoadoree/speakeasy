import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Check initial auth status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is already authenticated
   */
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await AuthService.isAuthenticated();

      if (isAuth) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ User authenticated from storage');
      } else {
        console.log('❌ No stored auth data');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with email and password
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
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Register new user
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
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Request password reset
   */
  const requestPasswordReset = async (email) => {
    try {
      setAuthError(null);
      const result = await AuthService.requestPasswordReset(email);
      return result;
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      const result = await AuthService.logout();

      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
      }

      return result;
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    requestPasswordReset,
    logout,
    clearError: () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
