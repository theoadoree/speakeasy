import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

// Backend configuration
const BACKEND_URL = 'https://speakeasy-backend-823510409781.us-central1.run.app';

// Google OAuth configuration
const GOOGLE_WEB_CLIENT_ID = '823510409781-your-web-client-id.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '823510409781-your-ios-client-id.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '823510409781-your-android-client-id.apps.googleusercontent.com';

WebBrowser.maybeCompleteAuthSession();

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
  const [error, setError] = useState(null);

  // Google Sign In setup
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  // Check initial auth status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle Google response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleSuccess(googleResponse);
    }
  }, [googleResponse]);

  /**
   * Check if user is already authenticated
   */
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('@speakeasy:authToken');
      const userData = await AsyncStorage.getItem('@speakeasy:userData');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ User authenticated from storage');
      } else {
        console.log('❌ No stored auth data');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle successful Google authentication
   */
  const handleGoogleSuccess = async (response) => {
    try {
      console.log('🔵 Google auth success:', response.type);
      const { authentication } = response;

      if (!authentication) {
        throw new Error('No authentication data from Google');
      }

      // Send to backend
      const backendResponse = await axios.post(`${BACKEND_URL}/api/auth/google`, {
        accessToken: authentication.accessToken,
        idToken: authentication.idToken,
      });

      if (backendResponse.data.success) {
        const { token, user } = backendResponse.data.data;

        // Save to storage
        await AsyncStorage.setItem('@speakeasy:authToken', token);
        await AsyncStorage.setItem('@speakeasy:userData', JSON.stringify(user));

        // Update state
        setUser(user);
        setIsAuthenticated(true);
        setError(null);

        console.log('✅ Google Sign In successful');
      } else {
        throw new Error(backendResponse.data.error || 'Google authentication failed');
      }
    } catch (error) {
      console.error('❌ Google auth error:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      setError(null);
      console.log('🔵 Starting Google Sign In...');

      if (!googleRequest) {
        throw new Error('Google auth not initialized');
      }

      const result = await googlePromptAsync();

      if (result.type === 'cancel') {
        return { success: false, error: 'User cancelled' };
      }

      // Success case is handled by useEffect above
      return { success: true };
    } catch (error) {
      console.error('❌ Google Sign In error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Sign in with Apple (iOS only)
   */
  const signInWithApple = async () => {
    try {
      setError(null);
      console.log('🍎 Starting Apple Sign In...');

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('🍎 Apple credential received:', credential.user);

      // Send to backend
      const backendResponse = await axios.post(`${BACKEND_URL}/api/auth/apple`, {
        identityToken: credential.identityToken,
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      });

      if (backendResponse.data.success) {
        const { token, user } = backendResponse.data.data;

        // Save to storage
        await AsyncStorage.setItem('@speakeasy:authToken', token);
        await AsyncStorage.setItem('@speakeasy:userData', JSON.stringify(user));

        // Update state
        setUser(user);
        setIsAuthenticated(true);
        setError(null);

        console.log('✅ Apple Sign In successful');
        return { success: true };
      } else {
        throw new Error(backendResponse.data.error || 'Apple authentication failed');
      }
    } catch (error) {
      console.error('❌ Apple Sign In error:', error);

      if (error.code === 'ERR_CANCELED') {
        return { success: false, error: 'User cancelled' };
      }

      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Check if Apple Sign In is available
   */
  const isAppleSignInAvailable = async () => {
    if (Platform.OS !== 'ios') {
      return false;
    }
    return await AppleAuthentication.isAvailableAsync();
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      console.log('🚪 Logging out...');

      // Clear storage
      await AsyncStorage.removeItem('@speakeasy:authToken');
      await AsyncStorage.removeItem('@speakeasy:userData');

      // Clear state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    signInWithGoogle,
    signInWithApple,
    isAppleSignInAvailable,
    logout,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
