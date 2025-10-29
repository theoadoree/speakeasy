import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import StorageService from '../utils/storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Light theme colors
const lightTheme = {
  primary: '#007AFF',
  primaryDark: '#0051D5',
  accent: '#10b981',
  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  userBubble: '#007AFF',
  teacherBubble: '#F1F5F9',
};

// Dark theme colors
const darkTheme = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  accent: '#34D399',
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  error: '#F87171',
  success: '#34D399',
  warning: '#FCD34D',
  userBubble: '#3B82F6',
  teacherBubble: '#334155',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', or 'system'
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await StorageService.getThemeMode();
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine active theme based on mode and system preference
  const getActiveTheme = () => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const isDarkMode = () => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  };

  const setTheme = async (mode) => {
    try {
      await StorageService.saveThemeMode(mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = isDarkMode() ? 'light' : 'dark';
    await setTheme(newMode);
  };

  const theme = getActiveTheme();

  const value = {
    theme,
    themeMode,
    isDark: isDarkMode(),
    setTheme,
    toggleTheme,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
