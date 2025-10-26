import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

/**
 * Professional Card Component
 * Reusable card with consistent styling
 */
export default function Card({
  children,
  variant = 'elevated', // 'elevated' | 'outlined' | 'filled'
  padding = 'md', // 'none' | 'sm' | 'md' | 'lg'
  style,
}) {
  const paddingValues = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  const variantStyles = {
    elevated: {
      backgroundColor: colors.background.elevated,
      ...shadows.md,
    },
    outlined: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    filled: {
      backgroundColor: colors.background.secondary,
    },
  };

  return (
    <View
      style={[
        styles.card,
        variantStyles[variant],
        { padding: paddingValues[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
});
