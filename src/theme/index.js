/**
 * SpeakEasy Design System
 * Professional production-ready theme
 */

export const colors = {
  // Primary brand colors
  primary: {
    main: '#6366F1',      // Vibrant indigo
    light: '#818CF8',     // Light indigo
    dark: '#4F46E5',      // Dark indigo
    contrast: '#FFFFFF',   // White text on primary
  },

  // Secondary accent colors
  secondary: {
    main: '#EC4899',      // Pink accent
    light: '#F472B6',     // Light pink
    dark: '#DB2777',      // Dark pink
    contrast: '#FFFFFF',   // White text on secondary
  },

  // Success/progress colors
  success: {
    main: '#10B981',      // Emerald green
    light: '#34D399',     // Light green
    dark: '#059669',      // Dark green
    background: '#D1FAE5', // Very light green
  },

  // Warning colors
  warning: {
    main: '#F59E0B',      // Amber
    light: '#FBB F6B',     // Light amber
    dark: '#D97706',      // Dark amber
    background: '#FEF3C7', // Very light amber
  },

  // Error colors
  error: {
    main: '#EF4444',      // Red
    light: '#F87171',     // Light red
    dark: '#DC2626',      // Dark red
    background: '#FEE2E2', // Very light red
  },

  // Neutral/gray scale
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    elevated: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Voice-specific colors
  voice: {
    listening: '#6366F1',
    speaking: '#EC4899',
    processing: '#8B5CF6',
    idle: '#D1D5DB',
  },

  // Level colors
  level: {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
    native: '#6366F1',
  },
};

export const typography = {
  // Font families
  fontFamily: {
    primary: 'System',      // SF Pro on iOS, Roboto on Android
    monospace: 'Courier',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
};

// Utility function to get shadow styles
export const getShadow = (size = 'md') => shadows[size];

// Utility function to get spacing
export const getSpacing = (...multipliers) => {
  return multipliers.map((m) => spacing.md * m);
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  getShadow,
  getSpacing,
};
